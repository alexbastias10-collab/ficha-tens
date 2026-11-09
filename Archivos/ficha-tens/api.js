async function api(r, method = 'GET', body) {
    const res = await fetch('api/index.php?r=' + r, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'GET' ? undefined : JSON.stringify(body || {}),
        credentials: 'same-origin'
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || 'No se pudo conectar con el servidor.');
    return data;
}

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ROL = { admin: 'Jefa de carrera', docente: 'Docente', alumno: 'Estudiante' };
const PERMS = {
    docente: [['verFichas', 'Ver fichas'], ['ingresarPacientes', 'Ingresar pacientes y editar fichas'], ['retroalimentar', 'Dejar retroalimentación y evaluar'], ['gestionarAlumnos', 'Crear, editar y eliminar estudiantes']],
    alumno: [['registrarFichas', 'Ingresar pacientes y registrar en las fichas']]
};
const can = (u, p) => u.rol === 'admin' || !!(u.permisos && u.permisos[p]);
const fmtRut = (r) => { const [b, d] = String(r).split('-'); return b.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + d; };