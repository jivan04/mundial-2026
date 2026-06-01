from pydantic import BaseModel
from datetime import datetime
from typing import Literal


# ==========================
# USUARIOS
# ==========================

class UsuarioCrear(BaseModel):
    nombre: str
    contraseña: str


class UsuarioLogin(BaseModel):
    nombre: str
    contraseña: str


# ==========================
# PREDICCIONES
# ==========================

class PrediccionCrear(BaseModel):
    usuario_id: int
    partido_id: int

    resultado_predicho: Literal[
        "EQUIPO_1",
        "EQUIPO_2",
        "EMPATE"
    ]


# ==========================
# PARTIDOS
# ==========================

class PartidoCrear(BaseModel):
    equipo_1: str
    equipo_2: str
    fecha_partido: datetime


class PartidoActualizar(BaseModel):
    resultado_real: Literal[
        "EQUIPO_1",
        "EQUIPO_2",
        "EMPATE"
    ]


class PartidoMostrar(BaseModel):
    id: int
    equipo_1: str
    equipo_2: str
    fecha_partido: datetime
    resultado_real: str | None = None
    estado: str

    class Config:
        from_attributes = True