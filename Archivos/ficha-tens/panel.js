let me, USERS = [], FICHAS = [], tab = 'fichas', Q = '', EST = '', CR = '', CREADORES = [], qt;
const users = () => USERS;
const canView = () => me.rol !== 'docente' || can(me, 'verFichas');
const canCreate = () => me.rol === 'admin' || (me.rol === 'docente' && can(me, 'ingresarPacientes')) || (me.rol === 'alumno' && can(me, 'registrarFichas'));
const canEditFicha = (f) => me.rol === 'admin' || (me.rol === 'docente' && can(me, 'ingresarPacientes')) || (me.rol === 'alumno' && can(me, 'registrarFichas') && f.estado === 'abierta' && f.creadoPor === me.id);
const canRetro = () => me.rol === 'admin' || (me.rol === 'docente' && can(me, 'retroalimentar'));
const canUsers = () => me.rol === 'admin' || (me.rol === 'docente' && can(me, 'gestionarAlumnos'));
async function send(m, r, body) { try { await api(r, m, body); } catch (e) { return e.message; } }

async function loadF() { FICHAS = (await api('fichas&q=' + encodeURIComponent(Q) + '&estado=' + EST + '&creador=' + CR)).fichas; }
async function load() {
    USERS = (await api('users')).users;
    CREADORES = me.rol === 'alumno' ? [] : (await api('creadores')).creadores;
    await loadF();
}

async function render() {
    $('#who').textContent = `${me.nombre} · ${ROL[me.rol]}`;
    $('#perm').hidden = me.rol !== 'admin';
    $('#tabUsers').hidden = !canUsers();
    $('#tabRep').hidden = me.rol === 'alumno' || !canView();
    if ((tab === 'usuarios' && !canUsers()) || (tab === 'reporte' && $('#tabRep').hidden)) tab = 'fichas';
    document.querySelectorAll('#mainTabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
    if (tab === 'fichas') renderFichas(); else if (tab === 'reporte') await renderReporte(); else renderUsers();
}

function renderFichas() {
    $('#main').innerHTML = `<div class="bar"><h1>${me.rol === 'alumno' ? 'Mis fichas clínicas' : 'Pacientes y fichas clínicas'}</h1>${canCreate() ? '<button class="btn sm" data-a="newP">Ingresar paciente</button>' : ''}</div>
    <div class="filters"><input id="q" type="search" placeholder="Buscar por nombre o RUN…" value="${esc(Q)}" aria-label="Buscar paciente">
    <select id="est" aria-label="Estado"><option value="">Todos los estados</option><option value="abierta"${EST === 'abierta' ? ' selected' : ''}>Abiertas</option><option value="archivada"${EST === 'archivada' ? ' selected' : ''}>Archivadas</option></select>${me.rol !== 'alumno' ? `<select id="cr" aria-label="Creada por"><option value="">Todos los creadores</option>${CREADORES.map((c) => `<option value="${c.id}"${CR === c.id ? ' selected' : ''}>${esc(c.nombre)} (${esc(c.email)})</option>`).join('')}</select>` : ''}</div>
    <div id="lista"></div>`;
    paintLista();
}

function paintLista() {
    const rows = FICHAS.map((f) => `<tr><td>${esc(f.nombre)}</td><td>${esc(fmtRut(f.rut))}</td><td>${esc(f.asignatura)}</td><td><span class="badge ${f.estado}">${f.estado}</span></td><td>${new Date(f.actualizada).toLocaleDateString('es-CL')}</td>${me.rol !== 'alumno' ? `<td>${esc(f.creador || '—')}<br><span class="muted">${esc(f.creadorEmail || '')}</span></td>` : ''}
        <td class="acts"><button class="link" data-a="open" data-id="${f.id}">Abrir ficha</button>${me.rol === 'admin' ? `<button class="link danger" data-a="delF" data-id="${f.id}">Eliminar</button>` : ''}</td></tr>`).join('');
    const empty = !canView() ? 'No tienes permiso para ver fichas. Pídelo a la jefatura.' : Q || EST || CR ? 'No hay pacientes que coincidan con la búsqueda.' : me.rol === 'alumno' ? 'Aún no has ingresado pacientes. Usa «Ingresar paciente».' : 'Aún no hay pacientes ingresados.';
    $('#lista').innerHTML = FICHAS.length ? `<div class="wrap"><table><thead><tr><th>Paciente</th><th>RUN</th><th>Asignatura</th><th>Estado</th><th>Actualizada</th>${me.rol !== 'alumno' ? '<th>Creada por</th>' : ''}<th></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="muted">${empty}</p>`;
}

async function renderReporte() {
    const all = (await api('fichas')).fichas, g = {};
    all.forEach((f) => (g[f.asignatura] ||= []).push(f));
    const names = Object.keys(g).sort((a, b) => a.localeCompare(b, 'es'));
    $('#main').innerHTML = `<div class="bar"><h1>Listado por asignatura</h1><button class="btn sm ghost" data-a="print">Imprimir / PDF</button></div>`
        + (names.length ? names.map((n) => { const l = g[n], ar = l.filter((f) => f.estado === 'archivada').length;
            return `<h3>${esc(n)} <span class="muted">· ${l.length} paciente(s) · ${l.length - ar} abiertas · ${ar} archivadas</span></h3><div class="wrap"><table><thead><tr><th>Paciente</th><th>RUN</th><th>Estado</th><th>Ingresado por</th><th>Actualizada</th></tr></thead><tbody>${l.map((f) => `<tr><td>${esc(f.nombre)}</td><td>${esc(fmtRut(f.rut))}</td><td><span class="badge ${f.estado}">${f.estado}</span></td><td>${esc(f.creador || '—')}<br><span class="muted">${esc(f.creadorEmail || '')}</span></td><td>${new Date(f.actualizada).toLocaleDateString('es-CL')}</td></tr>`).join('')}</tbody></table></div>`; }).join('') : '<p class="muted">Aún no hay fichas.</p>');
}

function renderUsers() {
    const list = users().filter((u) => (me.rol === 'admin' ? u.id !== me.id : u.rol === 'alumno'));
    const rows = list.map((u) => `<tr><td>${esc(u.nombre)}</td><td>${esc(u.email)}</td><td>${ROL[u.rol]}</td><td class="acts"><button class="link" data-a="editU" data-id="${u.id}">Editar</button><button class="link danger" data-a="delU" data-id="${u.id}">Eliminar</button></td></tr>`).join('');
    $('#main').innerHTML = `<div class="bar"><h1>${me.rol === 'admin' ? 'Usuarios' : 'Estudiantes'}</h1><button class="btn sm" data-a="newU">${me.rol === 'admin' ? 'Nuevo usuario' : 'Nuevo estudiante'}</button></div>
    ${list.length ? `<div class="wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="muted">Aún no hay usuarios. Crea el primero.</p>'}`;
}

function openForm(title, fields, vals, save, done) {
    const d = $('#dlg');
    d.innerHTML = `<form class="dform"><h2>${esc(title)}</h2>${fields.map(([n, l, t, o, req]) => `<label>${l}${
        t === 'select' ? `<select name="${n}">${o.map((x) => `<option ${x === vals[n] ? 'selected' : ''}>${x}</option>`).join('')}</select>`
        : `<input name="${n}" type="${t}" value="${esc(vals[n])}" ${req ? 'required' : ''}${o && t === 'text' ? ` list="dl-${n}"` : ''}>${o && t === 'text' ? `<datalist id="dl-${n}">${o.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`}</label>`).join('')}
        <p class="err" id="ferr" role="alert"></p><div class="acts"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Guardar</button></div></form>`;
    d.querySelector('form').onsubmit = async (e) => {
        e.preventDefault();
        const err = await save(Object.fromEntries(new FormData(e.target)));
        if (err) $('#ferr').textContent = err; else { d.close(); await load(); await render(); done && done(); }
    };
    d.querySelector('[data-close]').onclick = () => d.close();
    d.showModal();
}

function newPaciente() {
    if (!canCreate()) return;
    let nid;
    openForm('Ingresar paciente', [['nombre', 'Nombre del paciente (ficticio)', 'text', 0, 1], ['rut', 'RUN (ficticio). Ej: 12.345.678-9', 'text', 0, 1], ['asignatura', 'Asignatura / experiencia de simulación', 'text', [...new Set(FICHAS.map((f) => f.asignatura))], 1]], {},
        async (v) => { try { nid = (await api('ficha', 'POST', v)).id; } catch (e) { return e.message; } }, () => nid && openFicha(nid));
}

function userForm(id) {
    if (!canUsers()) return;
    const u = users().find((x) => x.id === id) || { rol: 'alumno' };
    if (id && (!u.id || u.id === me.id || (me.rol !== 'admin' && u.rol !== 'alumno'))) return;
    const fields = [['nombre', 'Nombre completo', 'text', 0, 1], ['email', 'Correo (ej. maria@tens.cftohiggins.cl)', 'email', 0, 1], ['pass', id ? 'Nueva contraseña (opcional)' : 'Contraseña', 'password', 0, !id]];
    if (me.rol === 'admin' && !id) fields.push(['rol', 'Rol', 'select', ['alumno', 'docente']]);
    openForm(id ? 'Editar usuario' : 'Nuevo usuario', fields, { ...u, pass: '' }, (v) => send(id ? 'PUT' : 'POST', 'users' + (id ? '&id=' + id : ''), v));
}

async function delUser(id) {
    const u = users().find((x) => x.id === id);
    if (!canUsers() || !u || u.id === me.id || u.rol === 'admin' || !confirm(`¿Eliminar a ${u.nombre}? Las fichas de pacientes se conservan.`)) return;
    const err = await send('DELETE', 'users&id=' + id);
    if (err) alert(err);
    await load(); render();
}

async function delFicha(id) {
    const f = FICHAS.find((x) => x.id === id);
    if (me.rol !== 'admin' || !f || !confirm(`¿Eliminar la ficha de ${f.nombre}? No se puede deshacer.`)) return;
    const err = await send('DELETE', 'ficha&id=' + id);
    if (err) alert(err);
    await loadF(); paintLista();
}

$('#main').addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const id = b.dataset.id;
    ({ newP: newPaciente, open: () => openFicha(id), delF: () => delFicha(id), print: () => window.print(), newU: () => userForm(), editU: () => userForm(id), delU: () => delUser(id) })[b.dataset.a]();
});
$('#main').addEventListener('input', (e) => {
    if (e.target.id !== 'q') return;
    Q = e.target.value.trim(); clearTimeout(qt);
    qt = setTimeout(async () => { await loadF(); paintLista(); }, 250);
});
$('#main').addEventListener('change', async (e) => { if (e.target.id === 'est') EST = e.target.value; else if (e.target.id === 'cr') CR = e.target.value; else return; await loadF(); paintLista(); });
document.querySelectorAll('#mainTabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
$('#logout').onclick = async () => { await send('POST', 'logout'); location.replace('index.html'); };

$('#perm').onclick = () => {
    if (me.rol !== 'admin') return;
    const d = $('#dlg'), us = users();
    d.innerHTML = `<div class="dform"><h2>Permisos</h2><p class="muted">Los cambios se guardan al marcar cada casilla. La jefatura de carrera tiene acceso a todo.</p>
    ${['docente', 'alumno'].map((r) => `<h3>${ROL[r]}s</h3>${us.filter((u) => u.rol === r).map((u) => `<div class="prow"><strong>${esc(u.nombre)}</strong><span class="muted">${esc(u.email)}</span>
        ${PERMS[r].map(([k, l]) => `<label class="check"><input type="checkbox" data-u="${u.id}" data-k="${k}" ${u.permisos?.[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div>`).join('') || '<p class="muted">Sin usuarios todavía.</p>'}`).join('')}
    <div class="acts"><button class="btn" data-close>Cerrar</button></div></div>`;
    d.onchange = async (e) => {
        const c = e.target;
        if (!c.dataset.u) return;
        const err = await send('PUT', 'permisos&id=' + c.dataset.u, { k: c.dataset.k, v: c.checked });
        if (err) { alert(err); c.checked = !c.checked; }
    };
    d.querySelector('[data-close]').onclick = () => d.close();
    d.showModal();
};

(async () => {
    try { me = (await api('me')).user; await load(); await render(); }
    catch (e) { location.replace('index.html'); }
})();