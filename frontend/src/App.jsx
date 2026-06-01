import { useState } from 'react';
import Login from "./Login.jsx";
import Registro from "./Registro.jsx";
import Dashboard from './Dashboard'; // 👈 Importamos tu nuevo Dashboard

function App() {
  // Dejamos un solo estado limpio para la vista y el usuario
  const [vista, setVista] = useState('login');
  const [usuario, setUsuario] = useState(null);

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
  };

  const manejarInicioSesion = (datosUsuario) => {
    setUsuario(datosUsuario);
    setVista('dashboard'); // Al loguearse, saltamos automáticamente al dashboard
  };

  const manejarCerrarSesion = () => {
    setUsuario(null);
    setVista('login'); // Al cerrar sesión, volvemos al login
  };

  // 1. SI EL USUARIO YA INICIÓ SESIÓN Y ESTÁ EN EL DASHBOARD
  if (vista === 'dashboard' && usuario) {
    return (
      <Dashboard 
        usuario={usuario} 
        alCerrarSesion={manejarCerrarSesion} 
      />
    );
  }

  // 2. SI NO HA INICIADO SESIÓN (VISTAS PÚBLICAS: LOGIN O REGISTRO)
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginTop: '40px' }}>🏆 PRONÓSTICOS MUNDIAL 2026</h1>
      
      {vista === 'login' && (
        <Login alCambiarDeVista={cambiarVista} alIniciarSesion={manejarInicioSesion} />
      )}
      
      {vista === 'registro' && (
        <Registro alCambiarDeVista={cambiarVista} />
      )}

      {/* Mensaje salvavidas por si la variable toma otro valor */}
      {vista !== 'login' && vista !== 'registro' && vista !== 'dashboard' && (
        <p style={{ textAlign: 'center', color: 'red' }}>
          Error de ruta: la vista actual es "{vista}"
        </p>
      )}
    </div>
  );
}

export default App;