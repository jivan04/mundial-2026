import { useState } from "react";

const Registro = ({ alCambiarDeVista }) => {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const manejarRegistro = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!nombre || !contraseña) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          contraseña,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.detail || "Error al registrar usuario");
      }

      setMensaje("¡Usuario creado correctamente!");

      setTimeout(() => {
        alCambiarDeVista("login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Registrarse ⚽</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {mensaje && <div style={{ color: "green" }}>{mensaje}</div>}

      <form onSubmit={manejarRegistro}>
        <div>
          <label>Usuario:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
        </div>

        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes cuenta?
        <button type="button" onClick={() => alCambiarDeVista("login")}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};

export default Registro;
