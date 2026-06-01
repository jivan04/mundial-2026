import { useState } from 'react';

const Registro = ({ alCambiarDeVista }) => {
  const [nombre, setNombre] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    // Validación básica en el frontend
    if (!nombre || !contraseña) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      // ⚠️ IMPORTANTE: Aquí llamamos a /usuarios SIN la barra al final
      const respuesta = await fetch('http://127.0.0.1:8000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          contraseña: contraseña
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // Si el backend responde con un error (ej: usuario ya existe), lo mostramos
        throw new Error(datos.detail || 'Error al registrar usuario');
      }

      // Si todo sale bien
      setMensaje('¡Usuario creado correctamente! Volviendo al Login...');
      setTimeout(() => {
        alCambiarDeVista('login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Registrarse ⚽</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>{error}</div>}
      {mensaje && <div style={{ color: 'green', marginBottom: '10px', fontWeight: 'bold' }}>{mensaje}</div>}

      <form onSubmit={manejarRegistro}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Usuario:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Crea tu nombre de usuario"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Crea tu contraseña"
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Registrarse
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        ¿Ya tienes cuenta?{' '}
        <button onClick={() => alCambiarDeVista('login')} style={{ background: 'none', border: 'none', color: '#28a745', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};

export default Registro;