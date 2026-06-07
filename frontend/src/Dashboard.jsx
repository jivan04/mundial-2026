import { useState, useEffect } from 'react';
import Ranking from "./Ranking";

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const POR_PAGINA = 12;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

const formatFecha = (iso, mobile = false) => {
  const d = new Date(iso);
  if (mobile)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
      + ' · '
      + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  return d.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9 !important; color: #1e293b !important; }

@keyframes spin     { to { transform: rotate(360deg); } }
@keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes toastIn  { from { opacity:0; transform:translate(-50%,10px) scale(.96); } to { opacity:1; transform:translate(-50%,0) scale(1); } }

.wc-header { background: #1e3a5f; padding: 0 20px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(30,58,95,.2); }
@media(min-width:640px){ .wc-header { padding: 0 36px; } }
.wc-logo-icon { width: 34px; height: 34px; background: #f59e0b; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.wc-logo-txt  { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -.2px; }
.wc-user-sub  { font-size: 11px; color: rgba(255,255,255,.5); }
.wc-user-name { font-size: 14px; font-weight: 700; color: #fff; }
.wc-pill { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 9px; padding: 6px 12px; }
.wc-pill-num { font-weight: 800; color: #fde68a; font-size: 15px; }
.wc-pill-lbl { color: rgba(255,255,255,.5); font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
.wc-btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all .15s; white-space: nowrap; }
.wc-btn-admin  { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.25); }
.wc-btn-admin:hover { background: rgba(255,255,255,.25); }
.wc-btn-logout { background: transparent; border: 1px solid rgba(255,255,255,.3); color: rgba(255,255,255,.85); }
.wc-btn-logout:hover { background: rgba(255,255,255,.1); color: #fff; }

.wc-filtros { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 10px 20px; display: flex; align-items: center; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.wc-filtros::-webkit-scrollbar { display: none; }
@media(min-width:640px){ .wc-filtros { padding: 10px 36px; } }
.wc-filtro { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap; transition: all .15s; flex-shrink: 0; }
.wc-filtro:hover  { border-color: #94a3b8; color: #334155; }
.wc-filtro.activo { background: #1e3a5f; color: #fff; border-color: #1e3a5f; font-weight: 700; }
.wc-btn-refresh { margin-left: auto; flex-shrink: 0; background: #f8fafc; border: 1.5px solid #e2e8f0; color: #94a3b8; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-family: inherit; cursor: pointer; transition: all .15s; }
.wc-btn-refresh:hover { color: #475569; border-color: #94a3b8; }

.wc-grid { display: grid; gap: 14px; padding: 20px; }
@media(min-width:480px)  { .wc-grid { grid-template-columns: repeat(2,1fr); } }
@media(min-width:860px)  { .wc-grid { grid-template-columns: repeat(3,1fr); padding: 24px 36px; } }
@media(min-width:1200px) { .wc-grid { grid-template-columns: repeat(4,1fr); } }

.wc-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: transform .2s, box-shadow .2s, border-color .2s; animation: fadeInUp .3s ease both; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.wc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.1); border-color: #94a3b8; }
.wc-card.acierto { border-color: #34d399; background: #f0fdf4; }
.wc-card.fallo   { border-color: #f87171; background: #fff5f5; }
.wc-card-header { display: flex; justify-content: space-between; align-items: center; }
.wc-fecha { font-size: 11px; color: #94a3b8; font-weight: 500; }
.wc-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: .5px; flex-shrink: 0; }
.wc-badge-proximo { background: #dbeafe; color: #1d4ed8; }
.wc-badge-final   { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.wc-versus { display: flex; align-items: center; gap: 8px; }
.wc-equipo { flex: 1; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.35; }
.wc-equipo.right { text-align: right; }
.wc-vs { font-size: 10px; font-weight: 800; color: #cbd5e1; letter-spacing: 1px; flex-shrink: 0; }
.wc-resultado { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-left: 3px solid #e2e8f0; border-radius: 0 8px 8px 0; padding: 7px 11px; font-size: 12px; color: #64748b; gap: 6px; }
.wc-resultado strong { color: #1e293b; }
.wc-acierto-tag { font-weight: 700; font-size: 11px; flex-shrink: 0; }
.wc-acierto-tag.ok { color: #059669; }
.wc-acierto-tag.ko { color: #dc2626; }
.wc-apuestas { display: flex; gap: 6px; }
.wc-btn-pred { flex: 1; padding: 9px 4px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all .15s; text-align: center; line-height: 1.3; }
.wc-btn-pred:not(:disabled):hover { border-color: #94a3b8; color: #334155; }
.wc-btn-pred:disabled { opacity: .4; cursor: not-allowed; }
.wc-btn-pred.sel-1 { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; font-weight: 700; }
.wc-btn-pred.sel-e { border-color: #64748b; color: #334155; background: #f1f5f9; font-weight: 700; }
.wc-btn-pred.sel-2 { border-color: #10b981; color: #065f46; background: #ecfdf5; font-weight: 700; }

.wc-paginacion { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 20px; }
.wc-btn-pag { padding: 8px 20px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all .15s; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.wc-btn-pag:not(:disabled):hover { background: #f1f5f9; border-color: #94a3b8; color: #1e293b; }
.wc-btn-pag:disabled { opacity: .35; cursor: not-allowed; }
.wc-pag-info { font-size: 13px; color: #94a3b8; }

.wc-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1e3a5f; border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto; }

.wc-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; font-family: inherit; animation: toastIn .2s ease; white-space: nowrap; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.12); }
.wc-toast.ok    { background: #f0fdf4; color: #065f46; border: 1.5px solid #34d399; }
.wc-toast.error { background: #fff5f5; color: #991b1b; border: 1.5px solid #f87171; }

.wc-ranking { padding: 20px; }
@media(min-width:640px){ .wc-ranking { padding: 24px 36px 48px; } }
.wc-ranking-box { background: #fff; border-radius: 14px; border: 1.5px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,.05); overflow: hidden; }
.wc-ranking-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #0f172a; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #fff; }
.wc-ranking-title::before { content: ''; display: block; width: 4px; height: 18px; background: #f59e0b; border-radius: 2px; }
.wc-empty { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 15px; }
`;

const ADMIN = "admi1234";

const Dashboard = ({ usuario, alCerrarSesion, cambiarVistaUsuarios, sinHeader = false }) => {
  const isMobile = useIsMobile();
  const [partidos, setPartidos]         = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [listo, setListo]               = useState(false);
  const [cargando, setCargando]         = useState(true);
  const [enviando, setEnviando]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [filtro, setFiltro]             = useState('todos');
  const [pagina, setPagina]             = useState(1);

  const esAdmin = usuario?.nombre === ADMIN;

  // Inyectar CSS
  useEffect(() => {
    let tag = document.getElementById('wc-css');
    if (!tag) { tag = document.createElement('style'); tag.id = 'wc-css'; document.head.appendChild(tag); }
    tag.textContent = GLOBAL_CSS;
    document.body.style.background = '#f1f5f9';
    document.body.style.color = '#1e293b';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, []);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPartidos = async () => {
    try {
      const res = await fetch(`${API}/partidos`);
      if (!res.ok) throw new Error('No se pudieron cargar los partidos');
      return await res.json();
    } catch (err) {
      mostrarToast(err.message, 'error');
      return [];
    }
  };

  const fetchPredicciones = async (usuarioId) => {
    if (!usuarioId) return {};
    try {
      const res = await fetch(`${API}/predicciones/${usuarioId}`);
      if (!res.ok) return {};
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapa = {};
        data.forEach(p => { mapa[p.partido_id] = p.resultado_predicho; });
        return mapa;
      }
      return typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  };

  useEffect(() => {
    if (!usuario?.id) return;
    const init = async () => {
      setListo(false);
      setCargando(true);
      const [p, preds] = await Promise.all([fetchPartidos(), fetchPredicciones(usuario.id)]);
      setPartidos(p);
      setPredicciones(preds);
      setCargando(false);
      setListo(true);
    };
    init();
  }, [usuario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refrescar = async () => {
    if (!usuario?.id) return;
    setCargando(true);
    const [p, preds] = await Promise.all([fetchPartidos(), fetchPredicciones(usuario.id)]);
    setPartidos(p);
    setPredicciones(preds);
    setCargando(false);
  };

  const guardarPrediccion = async (partidoId, resultado) => {
    if (enviando || !usuario?.id) return;
    if (predicciones[partidoId] !== undefined) {
      mostrarToast('Ya realizaste tu predicción para este partido', 'error');
      return;
    }
    setEnviando(partidoId + resultado);
    try {
      const res = await fetch(`${API}/predicciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partido_id: partidoId,
          resultado_predicho: resultado,
        }),
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

  /* cómputos */
  const conteos = {
    todos:      partidos.length,
    programado: partidos.filter(p => p.estado === 'programado').length,
    finalizado: partidos.filter(p => p.estado === 'finalizado').length,
  };
  const filtrados    = filtro === 'todos' ? partidos : partidos.filter(p => p.estado === filtro);
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA) || 1;
  const paginaSegura = pagina > totalPaginas ? totalPaginas : pagina;
  const pagActual    = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);
  const cambiarFiltro = f => { setFiltro(f); setPagina(1); };

  const totalPredichos = Object.keys(predicciones).length;
  const misAciertos    = Object.entries(predicciones).filter(([pid, pred]) => {
    const p = partidos.find(x => x.id === Number(pid));
    return p?.resultado_real && p.resultado_real === pred;
  }).length;
  const pctAcierto = totalPredichos > 0 ? Math.round((misAciertos / totalPredichos) * 100) : 0;

  // Spinner inicial hasta que todo esté listo
  if (!listo) {
    return (
      <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="wc-spinner" />
          <p style={{ color: '#94a3b8', marginTop: 20, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
            Cargando…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#f1f5f9', minHeight: '100vh', color: '#1e293b' }}>

      {toast && (
        <div className={`wc-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {!sinHeader && (
        <header className="wc-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div className="wc-logo-icon">⚽</div>
              {!isMobile && <span className="wc-logo-txt">MUNDIAL 2026</span>}
            </div>
            {!isMobile && (
              <div style={{ paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,.15)' }}>
                <div className="wc-user-sub">Bienvenido</div>
                <div className="wc-user-name">{usuario?.nombre}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div className="wc-pill">
              <span className="wc-pill-num">{usuario?.puntos || 0}</span>
              <span className="wc-pill-lbl">pts</span>
            </div>
            {!isMobile && totalPredichos > 0 && (
              <div className="wc-pill">
                <span className="wc-pill-num">{pctAcierto}%</span>
                <span className="wc-pill-lbl">aciertos</span>
              </div>
            )}
            {esAdmin && (
              <button className="wc-btn wc-btn-admin" onClick={cambiarVistaUsuarios}>
                👥{!isMobile && ' Usuarios'}
              </button>
            )}
            <button className="wc-btn wc-btn-logout" onClick={alCerrarSesion}>
              🚪{!isMobile && ' Salir'}
            </button>
          </div>
        </header>
      )}

      <div className="wc-filtros">
        {[
          { key: 'todos',      label: `Todos (${conteos.todos})` },
          { key: 'programado', label: `Próximos (${conteos.programado})` },
          { key: 'finalizado', label: `Finalizados (${conteos.finalizado})` },
        ].map(f => (
          <button
            key={f.key}
            className={`wc-filtro${filtro === f.key ? ' activo' : ''}`}
            onClick={() => cambiarFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
        <button className="wc-btn-refresh" onClick={refrescar}>
          ↻{!isMobile && ' Actualizar'}
        </button>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="wc-spinner" />
          <p style={{ color: '#94a3b8', marginTop: 20, fontSize: 14 }}>Actualizando…</p>
        </div>
      ) : pagActual.length === 0 ? (
        <div className="wc-empty">No hay partidos en esta categoría.</div>
      ) : (
        <div className="wc-grid">
          {pagActual.map((partido, i) => {
            const finalizado   = partido.estado === 'finalizado';
            const miPrediccion = predicciones[partido.id];
            const yaPredicho   = miPrediccion !== undefined;
            const acierto      = yaPredicho && finalizado && miPrediccion === partido.resultado_real;
            const fallo        = yaPredicho && finalizado && miPrediccion !== partido.resultado_real;
            const nombreGanador =
              partido.resultado_real === 'EQUIPO_1' ? partido.equipo_1 :
              partido.resultado_real === 'EQUIPO_2' ? partido.equipo_2 : 'Empate';

            return (
              <div
                key={partido.id}
                className={`wc-card${acierto ? ' acierto' : fallo ? ' fallo' : ''}`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="wc-card-header">
                  <span className="wc-fecha">{formatFecha(partido.fecha_partido, isMobile)}</span>
                  <span className={`wc-badge ${finalizado ? 'wc-badge-final' : 'wc-badge-proximo'}`}>
                    {finalizado ? 'Final' : 'Próximo'}
                  </span>
                </div>

                <div className="wc-versus">
                  <div className="wc-equipo">{partido.equipo_1}</div>
                  <div className="wc-vs">VS</div>
                  <div className="wc-equipo right">{partido.equipo_2}</div>
                </div>

                {finalizado && partido.resultado_real && (
                  <div className="wc-resultado">
                    <span>Ganó: <strong>{nombreGanador}</strong></span>
                    {yaPredicho && (
                      <span className={`wc-acierto-tag ${acierto ? 'ok' : 'ko'}`}>
                        {acierto ? '✓ Acertaste' : '✗ Fallaste'}
                      </span>
                    )}
                  </div>
                )}

                <div className="wc-apuestas">
                  {[
                    { opcion: 'EQUIPO_1', label: partido.equipo_1, cls: 'sel-1' },
                    { opcion: 'EMPATE',   label: 'Empate',         cls: 'sel-e' },
                    { opcion: 'EQUIPO_2', label: partido.equipo_2, cls: 'sel-2' },
                  ].map(({ opcion, label, cls }) => {
                    const seleccionado = miPrediccion === opcion;
                    const bloqueado    = finalizado || yaPredicho;
                    return (
                      <button
                        key={opcion}
                        disabled={bloqueado || !!enviando}
                        onClick={() => guardarPrediccion(partido.id, opcion)}
                        className={`wc-btn-pred${seleccionado ? ` ${cls}` : ''}`}
                        title={yaPredicho && !finalizado ? 'Ya realizaste tu predicción' : label}
                      >
                        {enviando === partido.id + opcion ? '…' : label}
                      </button>
                    );
                  })}
                </div>

                {yaPredicho && !finalizado && (
                  <div style={{
                    fontSize: 11, color: '#64748b', textAlign: 'center',
                    background: '#f8fafc', borderRadius: 6, padding: '5px 8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    ✓ Predicción registrada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="wc-paginacion">
          <button className="wc-btn-pag" disabled={paginaSegura === 1} onClick={() => setPagina(p => p - 1)}>← Ant.</button>
          <span className="wc-pag-info">{paginaSegura} / {totalPaginas}</span>
          <button className="wc-btn-pag" disabled={paginaSegura === totalPaginas} onClick={() => setPagina(p => p + 1)}>Sig. →</button>
        </div>
      )}

      <div className="wc-ranking">
        <div className="wc-ranking-box">
          <div className="wc-ranking-title">🏅 Tabla de posiciones</div>
          <Ranking />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;