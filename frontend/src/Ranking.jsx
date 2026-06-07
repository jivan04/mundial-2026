import { useEffect, useState } from "react";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarRanking();
  }, []);

  const cargarRanking = async () => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/ranking");

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar el ranking");
      }

      const datos = await respuesta.json();
      setRanking(datos);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Ranking General</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Posición</th>
              <th style={styles.th}>Usuario</th>
              <th style={styles.th}>Puntos</th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((jugador, index) => (
              <tr
                key={jugador.usuario}
                style={{
                  ...styles.tr,
                  backgroundColor:
                    index === 0
                      ? "#fff7d6" // oro
                      : index === 1
                      ? "#f1f5f9"
                      : index === 2
                      ? "#fef3c7"
                      : "white",
                }}
              >
                <td style={styles.td}>
                  <span style={styles.position}>
                    #{jugador.posicion}
                  </span>
                </td>

                <td style={styles.td}>
                  <strong>{jugador.usuario}</strong>
                </td>

                <td style={styles.td}>
                  <span style={styles.points}>
                    {jugador.puntos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "40px",
    padding: "25px",
    background: "linear-gradient(135deg, #f8fafc, #eef2f7)",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  th: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: "14px",
    fontSize: "14px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  tr: {
    transition: "all 0.2s ease-in-out",
  },

  td: {
    padding: "14px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
  },

  position: {
    backgroundColor: "#0ea5e9",
    color: "white",
    padding: "6px 10px",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  points: {
    fontWeight: "bold",
    color: "#16a34a",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    textAlign: "center",
  },
};

export default Ranking;