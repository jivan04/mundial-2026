import { useState } from "react";

  const Login = ({ alCambiarDeVista, alIniciarSesion }) => {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const manejarLogin = async (e) => {
    e.preventDefault();

    console.log("USUARIO:", nombre);
    console.log("CONTRASEÑA:", contraseña);

    try {
      console.log("INTENTANDO LOGIN...");
      console.log("URL:", "http://127.0.0.1:8000/login");

      const respuesta = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre,
          contraseña: contraseña,
        }),
      });

      const datos = await respuesta.json();

      console.log("STATUS:", respuesta.status);
      console.log("RESPUESTA BACKEND:", datos);

      if (!respuesta.ok) {
        throw new Error(datos.detail || "Error al iniciar sesión");
      }

      alIniciarSesion({
        id: datos.usuario_id,
        nombre: datos.usuario,
        puntos: datos.puntos,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Iniciar Sesión ⚽</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Ingresa para gestionar tus apuestas del Mundial
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}>
          {error}
        </div>
      )}

      <form onSubmit={manejarLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Usuario:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            placeholder="Tu usuario registrado"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Contraseña:
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Ingresar
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
        ¿No tienes cuenta aún?{" "}
        <button
          onClick={() => alCambiarDeVista("registro")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};

export default Login;
