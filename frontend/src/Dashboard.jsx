import { useState, useEffect, useCallback } from 'react';
import Ranking from "./Ranking";

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const POR_PAGINA = 12;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const formatFecha = (iso, mobile = false) => {
  const d = new Date(iso);
  if (mobile) {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
      + ' · '
      + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }
  return d.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',system-ui,sans-serif;background:#f0f4f8}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideUp{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

.wc-header{background:#0f172a;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px}
@media(min-width:640px){.wc-header{padding:18px 32px}}

.wc-logo{font-size:18px;color:#f8fafc;font-weight:800;flex-shrink:0}
@media(min-width:640px){.wc-logo{font-size:20px}}

.wc-bienvenida{font-size:14px;color:#f8fafc;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
@media(min-width:640px){.wc-bienvenida{font-size:16px;max-width:none}}

.wc-stat-pill{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:5px 10px;display:flex;align-items:baseline;gap:4px}
.wc-stat-num{font-size:16px;font-weight:700;color:#facc15}
.wc-stat-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
@media(min-width:640px){.wc-stat-num{font-size:18px}.wc-stat-lbl{font-size:11px}}

.wc-btn-salir{background:transparent;border:1.5px solid #ef4444;color:#ef4444;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;font-family:'Outfit',system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:all .15s}
.wc-btn-salir:hover{background:#ef4444;color:#fff}

.wc-filtros-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:#fff;border-bottom:1px solid #e2e8f0;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}
@media(min-width:640px){.wc-filtros-bar{padding:14px 32px}}

.wc-filtro-btn{padding:7px 12px;border-radius:20px;border:1px solid #e2e8f0;background:transparent;color:#475569;font-size:12px;font-weight:500;font-family:'Outfit',system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0}
@media(min-width:640px){.wc-filtro-btn{font-size:13px;padding:7px 14px}}
.wc-filtro-btn.activo{background:#0f172a;color:#f8fafc;border-color:#0f172a}
.wc-filtro-btn:not(.activo):hover{background:#f1f5f9}

.wc-btn-refresh{padding:7px 10px;border-radius:8px;border:1px solid #e2e8f0;background:transparent;color:#64748b;font-size:13px;font-family:'Outfit',system-ui,sans-serif;cursor:pointer;flex-shrink:0;transition:background .15s}
.wc-btn-refresh:hover{background:#f1f5f9}

.wc-grid{display:grid;gap:14px;padding:16px}
@media(min-width:480px){.wc-grid{grid-template-columns:repeat(2,1fr);padding:20px}}
@media(min-width:860px){.wc-grid{grid-template-columns:repeat(3,1fr);padding:24px 32px}}
@media(min-width:1200px){.wc-grid{grid-template-columns:repeat(4,1fr)}}

.wc-card{background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;padding:14px;display:flex;flex-direction:column;gap:12px;transition:box-shadow .2s,transform .15s}
.wc-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.08);transform:translateY(-2px)}
.wc-card.acierto{border-color:#10b981;background:#f0fdf4}
.wc-card.fallo{border-color:#f87171;background:#fff5f5}

.wc-equipo-nombre{font-size:13px;font-weight:700;color:#1a202c;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
@media(min-width:860px){.wc-equipo-nombre{font-size:14px}}

.wc-btn-apuesta{flex:1;padding:9px 4px;border-radius:8px;border:1.5px solid #e2e8f0;background:transparent;color:#475569;font-size:11px;font-weight:600;font-family:'Outfit',system-ui,sans-serif;cursor:pointer;transition:all .15s;text-align:center;line-height:1.2}
@media(min-width:640px){.wc-btn-apuesta{font-size:12px}}
.wc-btn-apuesta:disabled{opacity:.4;cursor:not-allowed}
.wc-btn-apuesta:not(:disabled):hover{background:#f8fafc}
.wc-btn-apuesta.sel-1{border-color:#3b82f6;color:#3b82f6;background:#eff6ff}
.wc-btn-apuesta.sel-e{border-color:#6b7280;color:#6b7280;background:#f9fafb}
.wc-btn-apuesta.sel-2{border-color:#10b981;color:#10b981;background:#f0fdf4}

.wc-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;font-family:'Outfit',system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:slideUp .2s ease;white-space:nowrap}
.wc-toast.ok{background:#d1fae5;color:#065f46}
.wc-toast.error{background:#fee2e2;color:#7f1d1d}

.wc-spinner{width:32px;height:32px;border:3px solid #e2e8f0;border-top:3px solid #0f172a;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}

.wc-btn-pag{padding:8px 16px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#1a202c;font-size:13px;font-weight:600;font-family:'Outfit',system-ui,sans-serif;cursor:pointer;transition:background .15s}
.wc-btn-pag:disabled{opacity:.4;cursor:not-allowed}
.wc-btn-pag:not(:disabled):hover{background:#f1f5f9}

.wc-ranking-section{padding:0 16px;margin-top:40px}
@media(min-width:640px){.wc-ranking-section{padding:0 32px}}
`;

const Dashboard = ({ usuario, alCerrarSesion }) => {
  const isMobile = useIsMobile();
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (!document.getElementById('wc-global-css')) {
      const tag = document.createElement('style');
      tag.id = 'wc-global-css';
      tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarPartidos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/partidos`);
      if (!res.ok) throw new Error('No se pudieron cargar los partidos');
      setPartidos(await res.json());
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarPartidos(); }, [cargarPartidos]);

  const guardarPrediccion = async (partidoId, resultado) => {
    if (enviando) return;
    setEnviando(partidoId + resultado);
    try {
      const res = await fetch(`${API}/predicciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, partido_id: partidoId, resultado_predicho: resultado }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.detail || 'Error al guardar');
      setPredicciones(prev => ({ ...prev, [partidoId]: resultado }));
      mostrarToast('¡Predicción guardada!');
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setEnviando(null);
    }
  };

  const conteos = {
    todos: partidos.length,
    programado: partidos.filter(p => p.estado === 'programado').length,
    finalizado: partidos.filter(p => p.estado === 'finalizado').length,
  };
  const filtrados = filtroEstado === 'todos' ? partidos : partidos.filter(p => p.estado === filtroEstado);
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const pagActual = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const cambiarFiltro = f => { setFiltroEstado(f); setPagina(1); };

  const misAciertos = Object.entries(predicciones).filter(([pid, pred]) => {
    const p = partidos.find(x => x.id === Number(pid));
    return p?.resultado_real && p.resultado_real === pred;
  }).length;

  return (
    <div style={{ fontFamily: "'Outfit',system-ui,sans-serif", backgroundColor: '#f0f4f8', minHeight: '100vh', paddingBottom: 60 }}>

      {toast && <div className={`wc-toast ${toast.tipo}`}>{toast.tipo === 'ok' ? '✓' : '⚠'} {toast.msg}</div>}

      {/* Header */}
      <header className="wc-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span className="wc-logo">⚽ Mundial 2026</span>
          <div style={{ minWidth: 0 }}>
            <div className="wc-bienvenida">Hola, <strong>{usuario.nombre}</strong></div>
            {!isMobile && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Pronósticos del torneo</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="wc-stat-pill">
            <span className="wc-stat-num">{usuario.puntos}</span>
            <span className="wc-stat-lbl">pts</span>
          </div>
          {!isMobile && (
            <div className="wc-stat-pill">
              <span className="wc-stat-num">{misAciertos}/{Object.keys(predicciones).length}</span>
              <span className="wc-stat-lbl">aciertos</span>
            </div>
          )}
          <button className="wc-btn-salir" onClick={alCerrarSesion}>Salir</button>
        </div>
      </header>

      {/* Filtros */}
      <div className="wc-filtros-bar">
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[
            { key: 'todos',      label: `Todos (${conteos.todos})` },
            { key: 'programado', label: `Próximos (${conteos.programado})` },
            { key: 'finalizado', label: `Final (${conteos.finalizado})` },
          ].map(f => (
            <button key={f.key} className={`wc-filtro-btn${filtroEstado === f.key ? ' activo' : ''}`} onClick={() => cambiarFiltro(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <button className="wc-btn-refresh" onClick={cargarPartidos}>
          {isMobile ? '↻' : '↻ Actualizar'}
        </button>
      </div>

      {/* Grid de partidos */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="wc-spinner" />
          <p style={{ color: '#94a3b8', marginTop: 16, fontSize: 15 }}>Cargando partidos…</p>
        </div>
      ) : pagActual.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px', fontSize: 15 }}>
          No hay partidos en esta categoría.
        </p>
      ) : (
        <div className="wc-grid">
          {pagActual.map(partido => {
            const finalizado = partido.estado === 'finalizado';
            const miPrediccion = predicciones[partido.id];
            const acierto = miPrediccion && finalizado && miPrediccion === partido.resultado_real;
            const fallo   = miPrediccion && finalizado && miPrediccion !== partido.resultado_real;
            const nombreResultado =
              partido.resultado_real === 'EQUIPO_1' ? partido.equipo_1 :
              partido.resultado_real === 'EQUIPO_2' ? partido.equipo_2 : 'Empate';

            return (
              <div key={partido.id} className={`wc-card${acierto ? ' acierto' : fallo ? ' fallo' : ''}`}>

                {/* Cabecera */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                    {formatFecha(partido.fecha_partido, isMobile)}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    textTransform: 'uppercase', letterSpacing: '.5px', flexShrink: 0,
                    background: finalizado ? '#e2e8f0' : '#dbeafe',
                    color: finalizado ? '#475569' : '#1e40af',
                  }}>
                    {finalizado ? 'Final' : 'Próximo'}
                  </span>
                </div>

                {/* Versus */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <span className="wc-equipo-nombre">{partido.equipo_1}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', padding: '0 4px', flexShrink: 0 }}>VS</div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="wc-equipo-nombre" style={{ textAlign: 'right' }}>{partido.equipo_2}</span>
                  </div>
                </div>

                {/* Resultado real */}
                {finalizado && partido.resultado_real && (
                  <div style={{
                    fontSize: 12, color: '#475569', fontWeight: 500,
                    padding: '7px 10px', background: '#f8fafc',
                    borderRadius: 8, borderLeft: '3px solid #94a3b8',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                  }}>
                    <span>Ganó: <strong>{nombreResultado}</strong></span>
                    {miPrediccion && (
                      <span style={{ fontWeight: 700, color: acierto ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                        {acierto ? '✓ Acertaste' : '✗ Fallaste'}
                      </span>
                    )}
                  </div>
                )}

                {/* Botones predicción */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { opcion: 'EQUIPO_1', label: partido.equipo_1, cls: 'sel-1' },
                    { opcion: 'EMPATE',   label: 'Empate',          cls: 'sel-e' },
                    { opcion: 'EQUIPO_2', label: partido.equipo_2,  cls: 'sel-2' },
                  ].map(({ opcion, label, cls }) => {
                    const seleccionado = miPrediccion === opcion;
                    const bloqueado = finalizado || (!!miPrediccion && !seleccionado);
                    return (
                      <button
                        key={opcion}
                        disabled={bloqueado || !!enviando}
                        onClick={() => guardarPrediccion(partido.id, opcion)}
                        className={`wc-btn-apuesta${seleccionado ? ` ${cls}` : ''}`}
                      >
                        {enviando === partido.id + opcion ? '…' : label}
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px' }}>
          <button className="wc-btn-pag" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Ant.</button>
          <span style={{ fontSize: 13, color: '#64748b' }}>{pagina} / {totalPaginas}</span>
          <button className="wc-btn-pag" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>Sig. →</button>
        </div>
      )}

      {/* Ranking */}
      <div className="wc-ranking-section">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 16, borderLeft: '4px solid #facc15', paddingLeft: 12 }}>
          🏅 Tabla de posiciones
        </h3>
        <Ranking />
      </div>

    </div>
  );
};

export default Dashboard;