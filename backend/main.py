from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import httpx

from database import engine, Base, SessionLocal
from models import Usuario, Prediccion, Partido
from schemas import (
    UsuarioCrear,
    UsuarioLogin,
    PrediccionCrear,
    PartidoMostrar,
    PartidoCrear,
    PartidoActualizar,
)

app = FastAPI(title="Sistema Mundial 2026 API")

RESULTADOS_VALIDOS = ["EQUIPO_1", "EQUIPO_2", "EMPATE"]

# ──────────────────────────────────────────────
# Fuente gratuita de partidos: openfootball
# Repositorio: https://github.com/openfootball/worldcup.json
# Sin API key, sin límites de peticiones, dominio público (CC0).
# Los resultados se actualizan en el JSON a medida que avanza
# el torneo (puede tardar algunos minutos/horas tras cada partido).
# ──────────────────────────────────────────────
OPENFOOTBALL_URL = (
    "https://raw.githubusercontent.com/openfootball/worldcup.json"
    "/master/2026/worldcup.json"
)

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Base de Datos
# ──────────────────────────────────────────────
def obtener_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)


@app.get("/")
def inicio():
    return {"mensaje": "MUNDIAL DE FÚTBOL 2026⚽"}


# ══════════════════════════════════════════════
# USUARIOS
# ══════════════════════════════════════════════

@app.post("/usuarios", status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: UsuarioCrear, db: Session = Depends(obtener_db)):
    if db.query(Usuario).filter(Usuario.nombre == usuario.nombre).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe",
        )
    nuevo = Usuario(nombre=usuario.nombre, contraseña=usuario.contraseña)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"mensaje": "Usuario creado correctamente", "usuario": nuevo.nombre}


@app.post("/login")
def login(usuario: UsuarioLogin, db: Session = Depends(obtener_db)):
    usuario_db = db.query(Usuario).filter(
        Usuario.nombre == usuario.nombre
    ).first()

    if not usuario_db:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if usuario_db.contraseña != usuario.contraseña:
        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta"
        )

    # Verificar aprobación
    if not usuario_db.aprobado:
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta está pendiente de aprobación"
        )

    return {
        "mensaje": "Login exitoso",
        "usuario": usuario_db.nombre,
        "usuario_id": usuario_db.id,
        "puntos": usuario_db.puntos,
    }


# ══════════════════════════════════════════════
# PREDICCIONES
# ══════════════════════════════════════════════

@app.post("/predicciones", status_code=status.HTTP_201_CREATED)
def crear_prediccion(prediccion: PrediccionCrear, db: Session = Depends(obtener_db)):

    print("Datos recibidos:", prediccion)

    # 1. Validar que el usuario exista
    if not db.query(Usuario).filter(Usuario.id == prediccion.usuario_id).first():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 2. Validar que el partido exista
    partido = db.query(Partido).filter(Partido.id == prediccion.partido_id).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    # 3. Validar si ya existe una predicción previa
    existente = db.query(Prediccion).filter(
        Prediccion.usuario_id == prediccion.usuario_id,
        Prediccion.partido_id == prediccion.partido_id,
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Ya realizaste una predicción para este partido"
        )

    # 4. Validar el formato del resultado
    if prediccion.resultado_predicho not in RESULTADOS_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail="Resultado inválido"
        )

    # 🛠️ LA SOLUCIÓN: Crear el objeto de la base de datos y guardarlo de verdad
    nueva_prediccion = Prediccion(
        usuario_id=prediccion.usuario_id,
        partido_id=prediccion.partido_id,
        resultado_predicho=prediccion.resultado_predicho,
        puntos_obtenidos=0  # Se inicializa en 0 hasta que corra /calcular-puntos
    )
    
    db.add(nueva_prediccion)
    db.commit()
    db.refresh(nueva_prediccion)

    return {
        "status": "success",
        "mensaje": "Predicción guardada correctamente",
        "prediccion_id": nueva_prediccion.id
    }



# ══════════════════════════════════════════════
# PUNTOS Y RANKING
# ══════════════════════════════════════════════

@app.post("/calcular-puntos")
def calcular_puntos(db: Session = Depends(obtener_db)):
    predicciones = db.query(Prediccion).all()
    puntos_repartidos = 0
    for prediccion in predicciones:
        partido = db.query(Partido).filter(Partido.id == prediccion.partido_id).first()
        if partido and partido.resultado_real and prediccion.puntos_obtenidos == 0:
            if prediccion.resultado_predicho == partido.resultado_real:
                prediccion.puntos_obtenidos = 3
                usuario = db.query(Usuario).filter(Usuario.id == prediccion.usuario_id).first()
                if usuario:
                    usuario.puntos += 3
                    puntos_repartidos += 3
    db.commit()
    return {
        "mensaje": "Puntos calculados correctamente",
        "puntos_totales_asignados": puntos_repartidos,
    }


@app.get("/ranking")
def obtener_ranking(db: Session = Depends(obtener_db)):
    usuarios = db.query(Usuario).order_by(Usuario.puntos.desc()).all()
    return [
        {"posicion": i + 1, "usuario": u.nombre, "puntos": u.puntos}
        for i, u in enumerate(usuarios)
    ]


# ══════════════════════════════════════════════
# PARTIDOS (CRUD)
# ══════════════════════════════════════════════

@app.get("/partidos", response_model=list[PartidoMostrar])
def obtener_partidos(db: Session = Depends(obtener_db)):
    return db.query(Partido).all()


@app.post("/partidos", status_code=status.HTTP_201_CREATED)
def crear_partido(partido: PartidoCrear, db: Session = Depends(obtener_db)):
    nuevo = Partido(
        equipo_1=partido.equipo_1,
        equipo_2=partido.equipo_2,
        fecha_partido=partido.fecha_partido,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"mensaje": "Partido creado correctamente"}


@app.put("/partidos/{partido_id}")
def actualizar_resultado(
    partido_id: int, datos: PartidoActualizar, db: Session = Depends(obtener_db)
):
    partido = db.query(Partido).filter(Partido.id == partido_id).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    if datos.resultado_real not in RESULTADOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Resultado inválido")
    partido.resultado_real = datos.resultado_real
    partido.estado = "finalizado"
    db.commit()
    db.refresh(partido)
    return {"mensaje": "Resultado actualizado", "resultado": partido.resultado_real}


# ══════════════════════════════════════════════
# HELPERS INTERNOS
# ══════════════════════════════════════════════

def _mapear_resultado(score1: int, score2: int) -> str:
    """Convierte marcador numérico al formato interno EQUIPO_1 / EQUIPO_2 / EMPATE."""
    if score1 > score2:
        return "EQUIPO_1"
    if score2 > score1:
        return "EQUIPO_2"
    return "EMPATE"


def _parsear_fecha(fecha_str: str, hora_str: str) -> datetime:
    """
    Convierte 'YYYY-MM-DD' + 'HH:MM UTC±X' en un objeto datetime con zona horaria UTC.
    Si el formato de hora no se reconoce, usa medianoche UTC.
    """
    import re

    fecha_base = datetime.strptime(fecha_str, "%Y-%m-%d")

    # Intentamos extraer la parte HH:MM y el offset (p. ej. "13:00 UTC-6")
    match = re.match(r"(\d{1,2}):(\d{2})(?:\s+UTC([+-]\d+))?", hora_str or "")
    if not match:
        return fecha_base.replace(tzinfo=timezone.utc)

    hora = int(match.group(1))
    minuto = int(match.group(2))
    offset_h = int(match.group(3)) if match.group(3) else 0

    # Construimos datetime en UTC
    dt_local = fecha_base.replace(hour=hora, minute=minuto)
    dt_utc = dt_local.replace(tzinfo=timezone.utc)
    # Restamos el offset para convertir a UTC puro
    from datetime import timedelta
    dt_utc = dt_utc - timedelta(hours=offset_h)
    return dt_utc


# ══════════════════════════════════════════════
# ADMIN: SINCRONIZAR PARTIDOS  (openfootball)
# ══════════════════════════════════════════════

@app.post("/admin/sincronizar-partidos")
def sincronizar_partidos(db: Session = Depends(obtener_db)):
    """
    Descarga el calendario del Mundial 2026 desde openfootball (GitHub, dominio público).
    Borra los partidos y predicciones anteriores y los reemplaza con los datos frescos.

    Estructura del JSON de openfootball 2026:
    {
      "name": "World Cup 2026",
      "matches": [
        {
          "round": "Matchday 1",
          "date": "2026-06-11",
          "time": "13:00 UTC-6",
          "team1": "Mexico",
          "team2": "South Africa",
          "group": "Group A",
          "ground": "Mexico City",
          "score": { "ft": [2, 1] }   ← aparece solo si el partido ya terminó
        },
        ...
      ]
    }
    """
    try:
        with httpx.Client(timeout=20.0) as client:
            respuesta = client.get(OPENFOOTBALL_URL)

        if respuesta.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"No se pudo descargar el calendario de openfootball (HTTP {respuesta.status_code})",
            )

        datos = respuesta.json()
        partidos_json = datos.get("matches", [])

        if not partidos_json:
            return {
                "status": "error",
                "mensaje": "El JSON de openfootball no contiene partidos todavía. Intenta de nuevo más tarde.",
            }

        # Limpiamos la base de datos
        db.query(Prediccion).delete()
        db.query(Partido).delete()
        db.commit()

        guardados = 0
        for item in partidos_json:
            fecha_partido = _parsear_fecha(
                item.get("date", "2026-06-11"),
                item.get("time", "00:00"),
            )

            # Determinamos el resultado si el partido ya terminó.
            # Condiciones para marcarlo como finalizado:
            #   1. El JSON trae score.ft con dos valores
            #   2. La fecha del partido ya pasó (evita placeholders futuros)
            #   3. El marcador no es [0, 0] (openfootball usa 0-0 como placeholder
            #      en partidos que aún no se han jugado)
            resultado_real = None
            estado = "programado"
            score = item.get("score", {})
            ahora = datetime.now(timezone.utc)

            ft = score.get("ft") if isinstance(score, dict) else None
            if (
                ft
                and len(ft) == 2
                and fecha_partido < ahora          # el partido ya ocurrió
                and not (ft[0] == 0 and ft[1] == 0)  # no es placeholder 0-0
            ):
                resultado_real = _mapear_resultado(ft[0], ft[1])
                estado = "finalizado"

            nuevo_partido = Partido(
                equipo_1=item.get("team1", "Equipo 1"),
                equipo_2=item.get("team2", "Equipo 2"),
                fecha_partido=fecha_partido,
                estado=estado,
                resultado_real=resultado_real,
            )
            db.add(nuevo_partido)
            guardados += 1

        db.commit()
        finalizados = sum(
            1 for item in partidos_json
            if isinstance(item.get("score"), dict) and item["score"].get("ft")
        )
        return {
            "status": "success",
            "mensaje": f"Se importaron {guardados} partidos del Mundial 2026 (openfootball).",
            "partidos_programados": guardados - finalizados,
            "partidos_finalizados": finalizados,
        }

    except httpx.RequestError as e:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Error de red al conectar con openfootball: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")


# ══════════════════════════════════════════════
# ADMIN: ACTUALIZAR RESULTADOS  (openfootball)
# ══════════════════════════════════════════════

@app.post("/admin/actualizar-resultados-api")
def actualizar_resultados_desde_api(db: Session = Depends(obtener_db)):
    """
    Vuelve a descargar el JSON de openfootball y actualiza solo los partidos
    que ya tienen resultado (score.ft) pero siguen marcados como 'programado'
    en la base de datos. Luego recalcula los puntos automáticamente.

    Llama a este endpoint periódicamente (p. ej. cada hora durante el torneo)
    mediante un cron-job o un scheduler de tu plataforma de despliegue.
    """
    try:
        with httpx.Client(timeout=20.0) as client:
            respuesta = client.get(OPENFOOTBALL_URL)

        if respuesta.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"No se pudo descargar el calendario de openfootball (HTTP {respuesta.status_code})",
            )

        datos = respuesta.json()
        partidos_json = datos.get("matches", [])

        if not partidos_json:
            return {"mensaje": "El JSON de openfootball aún no tiene partidos."}

        # Construimos un índice por (equipo1, equipo2) → resultado
        resultados_api: dict[tuple, str] = {}
        for item in partidos_json:
            score = item.get("score", {})
            ft = score.get("ft") if isinstance(score, dict) else None
            if ft and len(ft) == 2:
                clave = (item.get("team1", ""), item.get("team2", ""))
                resultados_api[clave] = _mapear_resultado(ft[0], ft[1])

        if not resultados_api:
            return {"mensaje": "Ningún partido tiene resultado definitivo todavía en openfootball."}

        # Actualizamos solo partidos que la BD tiene como 'programado'
        partidos_db = db.query(Partido).filter(Partido.estado == "programado").all()
        actualizados = 0

        for partido in partidos_db:
            clave = (partido.equipo_1, partido.equipo_2)
            if clave in resultados_api:
                partido.resultado_real = resultados_api[clave]
                partido.estado = "finalizado"
                actualizados += 1

        db.commit()

        if actualizados > 0:
            # Recalculamos puntos tras la actualización
            calcular_puntos(db)
            return {
                "mensaje": f"Se actualizaron {actualizados} partido(s) y se recalcularon los puntos."
            }

        return {"mensaje": "No hay partidos nuevos finalizados desde la última actualización."}

    except httpx.RequestError as e:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Error de red: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
    
@app.get("/aprobar/{usuario_id}")
def aprobar_usuario(usuario_id: int, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.aprobado = True
    db.commit()

    return {
        "mensaje": f"Usuario {usuario.nombre} aprobado correctamente"
    }
    
@app.get("/usuarios-pendientes")
def usuarios_pendientes(db: Session = Depends(obtener_db)):
    usuarios = db.query(Usuario).filter(
        Usuario.aprobado == False
    ).all()

    return usuarios


@app.get("/predicciones/{usuario_id}")
def obtener_predicciones(usuario_id: int, db: Session = Depends(obtener_db)):
    predicciones = (
        db.query(Prediccion)
        .filter(Prediccion.usuario_id == usuario_id)
        .all()
    )

    return {
        p.partido_id: p.resultado_predicho
        for p in predicciones
    }
    
    
