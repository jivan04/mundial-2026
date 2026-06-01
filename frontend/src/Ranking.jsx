import { useEffect, useState } from "react";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarRanking();
  }, []);

  const cargarRanking = async () => {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/ranking"
      );

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
      <h2 style={styles.titulo}>
        🏆 Ranking General
      </h2>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <table style={styles.tabla}>
        <thead>
          <tr>
            <th style={styles.th}>Posición</th>
            <th style={styles.th}>Usuario</th>
            <th style={styles.th}>Puntos</th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((jugador) => (
            <tr key={jugador.usuario}>
              <td style={styles.td}>
                {jugador.posicion}
              </td>

              <td style={styles.td}>
                {jugador.usuario}
              </td>

              <td style={styles.td}>
                {jugador.puntos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "40px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
  },

  titulo: {
    marginBottom: "20px",
    color: "#2c3e50"
  },

  tabla: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "12px",
    textAlign: "center"
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "center"
  },

  error: {
    backgroundColor: "#fadbd8",
    color: "#78281f",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px"
  }
};

export default Ranking;