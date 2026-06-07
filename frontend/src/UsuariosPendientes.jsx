import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

function UsuariosPendientes({ volverDashboard }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API}/usuarios-pendientes`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const aprobarUsuario = async (id) => {
    try {
      const res = await fetch(`${API}/aprobar/${id}`);

      if (res.ok) {
        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          👥 Usuarios Pendientes
        </h1>

        <button
          onClick={volverDashboard}
          style={{
            background: "#0f172a",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Volver
        </button>
      </div>

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,.05)",
          }}
        >
          ✅ No hay usuarios pendientes
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#1e293b",
                  }}
                >
                  {usuario.nombre}
                </h3>

                <small style={{ color: "#64748b" }}>ID: {usuario.id}</small>
              </div>

              <button
                onClick={() => aprobarUsuario(usuario.id)}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ✓ Aprobar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsuariosPendientes;
