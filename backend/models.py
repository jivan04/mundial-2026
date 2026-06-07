
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    contraseña = Column(String, nullable=False)
    puntos = Column(Integer, default=0)
    aprobado = Column(Boolean, default=False)

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(Integer, primary_key=True, index=True)

    equipo_1 = Column(String(50), nullable=False)
    equipo_2 = Column(String(50), nullable=False)

    fecha_partido = Column(DateTime, nullable=False)

    # EQUIPO_1, EQUIPO_2 o EMPATE
    resultado_real = Column(String(20), nullable=True)

    estado = Column(String(20), default="pendiente")


class Prediccion(Base):
    __tablename__ = "predicciones"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    partido_id = Column(Integer, ForeignKey("partidos.id"))

    # EQUIPO_1, EQUIPO_2 o EMPATE
    resultado_predicho = Column(String(20), nullable=False)

    puntos_obtenidos = Column(Integer, default=0)