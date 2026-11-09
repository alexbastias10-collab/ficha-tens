/* Editor de la ficha clínica (una por paciente). Estructura basada en la planilla "Ficha_Clinica_Simulacion_TNS". */
const CONC = ['Alerta', 'Somnoliento', 'Estupor', 'Coma'];
const SI = ['Sí', 'No'];
const RANGOS = { pas: [90, 140, 'PAS'], pad: [60, 90, 'PAD'], fc: [60, 100, 'FC'], fr: [12, 20, 'FR'], temp: [36, 37.4, 'T°'], sat: [94, 100, 'SatO₂'], hgt: [70, 140, 'HGT'], eva: [0, 3, 'EVA'] };
const SEGMENTOS = ['Estado general', 'Piel y mucosas', 'Cabeza y cuello', 'Tórax y respiración', 'Cardiovascular', 'Abdomen', 'Genitourinario', 'Extremidades y movilidad', 'Neurológico'];
const DISPOS = ['Vía venosa periférica', 'Oxígeno suplementario', 'Sonda nasogástrica', 'Sonda Foley', 'Drenaje / ostomía', 'Otro'];
const CRITERIOS = ['Se presenta e identifica correctamente al usuario (al menos dos identificadores)', 'Aplica higiene de manos y precauciones estándar', 'Explica el procedimiento y obtiene la colaboración del usuario', 'Mide los signos vitales con técnica correcta', 'Registra los signos vitales y reconoce valores fuera de rango', 'Comunica oportunamente los hallazgos relevantes al profesional a cargo', 'Verifica los 5 correctos antes de administrar un medicamento', 'Ejecuta el procedimiento técnico con seguridad', 'Resguarda confort, privacidad y seguridad del usuario (prevención de caídas y lesiones por presión)', 'Registra en la ficha de forma clara, completa y oportuna', 'Se comunica de manera respetuosa y empática con el usuario y su familia', 'Trabaja en equipo y mantiene una actitud profesional'];
const GL = { ocular: ['Apertura ocular', [[4, '4 · Espontánea'], [3, '3 · A la voz'], [2, '2 · Al dolor'], [1, '1 · Ninguna']]],
    verbal: ['Respuesta verbal', [[5, '5 · Orientada'], [4, '4 · Confusa'], [3, '3 · Palabras inapropiadas'], [2, '2 · Sonidos incomprensibles'], [1, '1 · Ninguna']]],
    motora: ['Respuesta motora', [[6, '6 · Obedece órdenes'], [5, '5 · Localiza el dolor'], [4, '4 · Retira al dolor'], [3, '3 · Flexión anormal'], [2, '2 · Extensión anormal'], [1, '1 · Ninguna']]] };
const BR = { sens: ['Percepción sensorial', [[1, '1 · Completamente limitada'], [2, '2 · Muy limitada'], [3, '3 · Ligeramente limitada'], [4, '4 · Sin limitaciones']]],
    hum: ['Exposición a la humedad', [[1, '1 · Constantemente húmeda'], [2, '2 · A menudo húmeda'], [3, '3 · Ocasionalmente húmeda'], [4, '4 · Raramente húmeda']]],
    act: ['Actividad', [[1, '1 · En cama'], [2, '2 · En silla'], [3, '3 · Camina ocasionalmente'], [4, '4 · Camina frecuentemente']]],
    mov: ['Movilidad', [[1, '1 · Completamente inmóvil'], [2, '2 · Muy limitada'], [3, '3 · Ligeramente limitada'], [4, '4 · Sin limitaciones']]],
    nut: ['Nutrición', [[1, '1 · Muy pobre'], [2, '2 · Probablemente inadecuada'], [3, '3 · Adecuada'], [4, '4 · Excelente']]],
    roce: ['Roce y peligro de lesiones cutáneas', [[1, '1 · Problema'], [2, '2 · Problema potencial'], [3, '3 · Sin problema aparente']]] };
const DW = [['caidas', 'Ha sufrido caídas previas'], ['m1', 'Medicamentos: tranquilizantes / sedantes'], ['m2', 'Medicamentos: diuréticos'], ['m3', 'Medicamentos: hipotensores (no diuréticos)'], ['m4', 'Medicamentos: antiparkinsonianos'], ['m5', 'Medicamentos: antidepresivos'], ['m6', 'Medicamentos: otros'], ['d1', 'Déficit sensorial: alteraciones visuales'], ['d2', 'Déficit sensorial: alteraciones auditivas'], ['d3', 'Déficit sensorial: alteraciones en extremidades'], ['mental', 'Estado mental: confusión / desorientación'], ['a1', 'Deambulación segura con ayuda'], ['a2', 'Deambulación insegura, con o sin ayuda'], ['a3', 'Deambulación imposible']];

const ING = [
    ['A. Datos de la actividad', [['asignatura', 'Asignatura / experiencia de simulación'], ['datos.caso', 'Escenario / caso N°'], ['datos.fecha', 'Fecha', 'date'], ['datos.hora', 'Hora de inicio', 'time'], ['datos.estudiantes', 'Estudiante(s)'], ['datos.docente', 'Docente facilitador/a'], ['datos.grupo', 'Grupo / sección'], ['datos.rol', 'Rol de enfermera/o a cargo (simulado)']]],
    ['B. Identificación del usuario simulado (datos ficticios)', [['nombre', 'Nombre (ficticio)'], ['rut', 'RUN (ficticio)'], ['datos.nacimiento', 'Fecha de nacimiento', 'date'], ['@edad', 'Edad (años)', 'calc'], ['datos.sexo', 'Sexo', 'select', ['Femenino', 'Masculino', 'Otro']], ['datos.civil', 'Estado civil'], ['datos.prevision', 'Previsión'], ['datos.ocupacion', 'Ocupación'], ['datos.educacion', 'Nivel educacional'], ['datos.domicilio', 'Domicilio / comuna'], ['datos.contacto', 'Persona de contacto / red de apoyo'], ['datos.telefono', 'Teléfono de contacto (ficticio)']]],
    ['C. Motivo de consulta e ingreso', [['datos.ingreso', 'Fecha y hora de ingreso', 'datetime-local'], ['datos.via', 'Vía de ingreso'], ['datos.unidad', 'Unidad / servicio'], ['datos.diagnostico', 'Diagnóstico médico (ficticio)'], ['datos.motivo', 'Motivo de consulta (relato del usuario)', 'area']]],
    ['D. Antecedentes y hábitos', [['datos.morbidos', 'Antecedentes mórbidos', 'area'], ['datos.quirurgicos', 'Antecedentes quirúrgicos y hospitalizaciones', 'area'], ['datos.alergias', 'Alergias (medicamentos, alimentos, látex)', 'area'], ['datos.medhab', 'Medicamentos de uso habitual', 'area'], ['datos.familiares', 'Antecedentes familiares', 'area'], ['datos.tabaco', 'Tabaco'], ['datos.alcohol', 'Alcohol'], ['datos.sustancias', 'Otras sustancias'], ['datos.actividad', 'Actividad física'], ['datos.alimentacion', 'Alimentación'], ['datos.sueno', 'Sueño / descanso'], ['datos.urinaria', 'Eliminación urinaria'], ['datos.intestinal', 'Eliminación intestinal'], ['datos.vacunas', 'Esquema de vacunación'], ['datos.autovalencia', 'Autovalencia']]],
    ['E. Antropometría y nivel de conciencia', [['datos.peso', 'Peso (kg)', 'number'], ['datos.talla', 'Talla (m)', 'number'], ['@imc', 'IMC (kg/m²)', 'calc'], ['@imcc', 'Clasificación IMC', 'calc'], ['datos.cintura', 'Circunferencia de cintura (cm)', 'number'], ['datos.conciencia', 'Nivel de conciencia al ingreso', 'select', CONC]]]
];
const ING2 = [['I. Problemas detectados y cuidados de enfermería', [['datos.problemas', 'Problemas / necesidades detectadas', 'area'], ['datos.cuidados', 'Cuidados a ejecutar (bajo supervisión de enfermera/o)', 'area']]],
    ['J. Firmas', [['datos.firmaEst', 'Estudiante'], ['datos.firmaDoc', 'Docente facilitador/a']]]];

const S = {
    vitales: { t: 'Registro de signos vitales', cols: [['fecha', 'Fecha', 'date'], ['hora', 'Hora', 'time'], ['pas', 'PAS (mmHg)', 'number'], ['pad', 'PAD (mmHg)', 'number'], ['pam', 'PAM', 'calc'], ['fc', 'FC (lpm)', 'number'], ['fr', 'FR (rpm)', 'number'], ['temp', 'T° (°C)', 'number'], ['sat', 'SatO₂ (%)', 'number'], ['hgt', 'HGT (mg/dL)', 'number'], ['eva', 'EVA (0–10)', 'number'], ['conc', 'Nivel de conciencia', 'select', CONC], ['alertas', 'Alertas', 'calc'], ['resp', 'Responsable']] },
    meds: { t: 'Indicaciones médicas y registro de administración (ficticias)', cols: [['med', 'Medicamento (genérico)'], ['dosis', 'Dosis'], ['via', 'Vía'], ['frec', 'Frecuencia'], ['prog', 'Horario programado', 'time'], ['real', 'Hora real', 'time'], ['u', 'Usuario correcto', 'select', SI], ['m', 'Medicamento correcto', 'select', SI], ['d', 'Dosis correcta', 'select', SI], ['v', 'Vía correcta', 'select', SI], ['h', 'Hora correcta', 'select', SI], ['c5', '5 correctos', 'calc'], ['estado', 'Estado', 'select', ['Pendiente', 'Administrado', 'No administrado']], ['obs', 'Observaciones / reacciones'], ['resp', 'Responsable']] },
    notas: { t: 'Observaciones y notas de enfermería', cols: [['fecha', 'Fecha', 'date'], ['hora', 'Hora', 'time'], ['cat', 'Categoría', 'select', ['Observación', 'Cuidado realizado', 'Comunicación a profesional', 'Educación al usuario', 'Otro']], ['obs', 'Observación / cuidado realizado', 'area'], ['resp_u', 'Respuesta del usuario / evolución', 'area'], ['resp', 'Responsable'], ['vb', 'V°B° docente', 'check']] },
    balance: { t: 'Balance hídrico (ml)', foot: 1, cols: [['hora', 'Hora', 'time'], ['oral', 'Oral', 'number'], ['ev', 'Fleboclisis (EV)', 'number'], ['med', 'Medicación diluida', 'number'], ['oi', 'Otros ingresos', 'number'], ['ti', 'TOTAL INGRESOS', 'calc'], ['diu', 'Diuresis', 'number'], ['vom', 'Vómitos / residuo', 'number'], ['dre', 'Drenajes', 'number'], ['oe', 'Otros egresos', 'number'], ['te', 'TOTAL EGRESOS', 'calc'], ['bp', 'Balance parcial', 'calc'], ['ba', 'Balance acumulado', 'calc']] }
};
const TABS = [['ing', 'Ingreso'], ['vitales', 'Signos vitales'], ['meds', 'Medicamentos'], ['notas', 'Notas de enfermería'], ['balance', 'Balance hídrico'], ['esc', 'Escalas'], ['ret', 'Retroalimentación']];

let M, RETRO = [], EDIT = false, TAB = 'ing', dirty = false, dirtyE = false, tS, tE;
const getP = (p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), M);
function setP(p, v) {
    const ks = p.split('.');
    let o = M;
    for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] ?? (o[ks[i]] = {});
    o[ks[ks.length - 1]] = v;
}
const N = (v) => (v === '' || v == null || isNaN(v) ? null : Number(v));

function inp(p, type = 'text', opts, off) {
    const v = getP(p), a = `data-p="${p}"${off ? ' disabled' : ''}`;
    if (type === 'calc') return `<span class="calc" data-calc="${p}"></span>`;
    if (type === 'area') return `<textarea ${a} rows="2">${esc(v)}</textarea>`;
    if (type === 'check') return `<input type="checkbox" ${a}${v ? ' checked' : ''}>`;
    if (type === 'select') return `<select ${a}><option value=""></option>${opts.map((o) => { const [x, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(x)}"${String(x) === String(v ?? '') ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    return `<input type="${type}" ${a} value="${esc(v)}"${type === 'number' ? ' step="any"' : ''}>`;
}
const grid = (list) => `<div class="grid">${list.map(([p, l, t, o]) => `<label class="${t === 'area' ? 'full' : ''}">${l}${inp(p, t, o, !EDIT)}</label>`).join('')}</div>`;

function serie(n) {
    const s = S[n], rows = M.datos[n] || (M.datos[n] = []), vbOff = !(EDIT && me.rol !== 'alumno');
    return `<h3>${s.t}</h3><div class="wrap"><table class="serie"><thead><tr><th>N°</th>${s.cols.map((c) => `<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${s.cols.map((c) => `<td>${inp(`datos.${n}.${i}.${c[0]}`, c[2], c[3], c[2] === 'check' ? vbOff : !EDIT)}</td>`).join('')}<td>${EDIT ? `<button class="link danger" data-del="${n}.${i}" aria-label="Quitar fila">✕</button>` : ''}</td></tr>`).join('')}</tbody>${s.foot ? `<tfoot><tr><td></td>${s.cols.map((c) => c[0] === 'hora' ? '<td>TOTAL</td>' : c[0] === 'ba' ? '<td></td>' : `<td data-calc="datos.${n}.tot.${c[0]}"></td>`).join('')}<td></td></tr></tfoot>` : ''}</table></div>${EDIT ? `<button class="btn sm" data-add="${n}">Agregar registro</button>` : ''}`;
}

function paneIng() {
    const off = !EDIT;
    return ING.map(([t, l]) => `<h3>${t}</h3>${grid(l)}`).join('') + `<h3>F. Examen físico segmentario</h3><div class="wrap"><table><thead><tr><th>Segmento</th><th>Estado</th><th>Observaciones</th></tr></thead><tbody>${SEGMENTOS.map((s, i) => `<tr><td>${s}</td><td>${inp(`datos.exam.${i}.estado`, 'select', ['Normal', 'Alterado'], off)}</td><td>${inp(`datos.exam.${i}.obs`, 'text', 0, off)}</td></tr>`).join('')}</tbody></table></div>`
        + `<h3>G. Dispositivos y vías</h3><div class="wrap"><table><thead><tr><th>Dispositivo</th><th>¿Presente?</th><th>Ubicación / calibre / flujo</th><th>Fecha de instalación</th></tr></thead><tbody>${DISPOS.map((s, i) => `<tr><td>${s}</td><td>${inp(`datos.disp.${i}.pres`, 'select', SI, off)}</td><td>${inp(`datos.disp.${i}.ubic`, 'text', 0, off)}</td><td>${inp(`datos.disp.${i}.fecha`, 'date', 0, off)}</td></tr>`).join('')}</tbody></table></div>`
        + `<h3>H. Resumen de escalas (se completan en la pestaña Escalas)</h3><div class="grid"><label>Glasgow<span class="calc" data-calc="@gl"></span></label><label>Interpretación<span class="calc" data-calc="@glI"></span></label><label>Braden<span class="calc" data-calc="@br"></span></label><label>Interpretación<span class="calc" data-calc="@brI"></span></label><label>Downton<span class="calc" data-calc="@dw"></span></label><label>Interpretación<span class="calc" data-calc="@dwI"></span></label></div>`
        + ING2.map(([t, l]) => `<h3>${t}</h3>${grid(l)}`).join('');
}

function paneEsc() {
    const off = !EDIT, sel = (grp, base) => Object.entries(grp).map(([k, [l, o]]) => `<label>${l}${inp(`datos.esc.${base}.${k}`, 'select', o, off)}</label>`).join('');
    return `<h3>Escala de coma de Glasgow</h3><div class="grid">${sel(GL, 'gl')}<label>TOTAL (3–15)<span class="calc" data-calc="@gl"></span></label><label>Interpretación<span class="calc" data-calc="@glI"></span></label></div>`
        + `<h3>Escala de Braden (riesgo de lesiones por presión)</h3><div class="grid">${sel(BR, 'br')}<label>TOTAL (6–23)<span class="calc" data-calc="@br"></span></label><label>Interpretación<span class="calc" data-calc="@brI"></span></label></div>`
        + `<h3>Escala de Downton (riesgo de caídas)</h3><div class="checks">${DW.map(([k, l]) => `<label class="check">${inp(`datos.esc.dw.${k}`, 'check', 0, off)} ${l}</label>`).join('')}</div><div class="grid"><label>TOTAL (≥ 3 = riesgo alto)<span class="calc" data-calc="@dw"></span></label><label>Interpretación<span class="calc" data-calc="@dwI"></span></label></div>`;
}

function paneRet() {
    const off = !canRetro();
    return `<h3>Comentarios del docente</h3><div>${RETRO.length ? RETRO.map((c) => `<article class="cm"><strong>${esc(c.autor)}</strong> <span class="muted">${new Date(String(c.creado).replace(' ', 'T')).toLocaleString('es-CL')}</span>${canRetro() && (me.rol === 'admin' || String(c.autor_id) === me.id) ? ` <button class="link danger" data-act="delRetro" data-id="${c.id}">Eliminar</button>` : ''}<p>${esc(c.texto)}</p></article>`).join('') : '<p class="muted">Aún no hay comentarios.</p>'}</div>`
        + (canRetro() ? `<label class="full">Nuevo comentario<textarea id="nc" rows="3"></textarea></label><button class="btn sm" data-act="addRetro">Publicar comentario</button>` : '')
        + `<h3>Rúbrica de desempeño en simulación</h3><p class="muted">Puntúe cada criterio de 0 a 3: 0 = no realiza · 1 = insuficiente · 2 = suficiente · 3 = logrado. Exigencia 60 % para la nota 4,0.</p><div class="grid"><label>Estudiante evaluado/a${inp('eval.estudiante', 'text', 0, off)}</label><label>Docente evaluador/a${inp('eval.docente', 'text', 0, off)}</label><label>Fecha${inp('eval.fecha', 'date', 0, off)}</label></div>`
        + `<div class="wrap"><table><thead><tr><th>N°</th><th>Criterio</th><th>Puntaje (0–3)</th><th>Observaciones</th></tr></thead><tbody>${CRITERIOS.map((c, i) => `<tr><td>${i + 1}</td><td>${c}</td><td>${inp(`eval.p.${i}`, 'select', [0, 1, 2, 3], off)}</td><td>${inp(`eval.o.${i}`, 'text', 0, off)}</td></tr>`).join('')}</tbody></table></div>`
        + `<div class="grid"><label>Puntaje (máx. 36)<span class="calc" data-calc="@rt"></span></label><label>% de logro<span class="calc" data-calc="@rp"></span></label><label>Nota (1,0–7,0)<span class="calc" data-calc="@rn"></span></label><label>Resultado<span class="calc" data-calc="@rr"></span></label></div>`
        + `<label class="full">Retroalimentación general del docente${inp('eval.texto', 'area', 0, off)}</label>`;
}

function renderFicha() {
    const pane = { ing: paneIng, esc: paneEsc, ret: paneRet };
    $('#fv').innerHTML = `<header class="fv-top"><div><h2>${esc(M.nombre)}</h2><span class="muted">RUN ${esc(fmtRut(M.rut))} · ${esc(M.asignatura)} · <span class="badge ${M.estado}">${M.estado}</span>${me.rol !== 'alumno' ? ` · Creada por ${esc(M.creador || '—')}${M.creadorEmail ? ' (' + esc(M.creadorEmail) + ')' : ''}` : ''}</span></div>
        <span id="fvs" class="muted" role="status"></span>
        <button class="btn sm ghost" data-act="print">Descargar PDF</button>
        ${EDIT && me.rol === 'alumno' && M.estado === 'abierta' ? '<button class="btn sm" data-act="archivar">Archivar para revisión</button>' : ''}
        ${me.rol !== 'alumno' && (me.rol === 'admin' || can(me, 'ingresarPacientes') || can(me, 'retroalimentar')) ? `<button class="btn sm ghost" data-act="estado">${M.estado === 'abierta' ? 'Archivar' : 'Reabrir'}</button>` : ''}
        <button class="btn sm" data-act="close">Cerrar</button></header>
        ${M.estado === 'archivada' && !EDIT ? '<p class="note">Ficha archivada: solo lectura.</p>' : ''}
        <nav class="tabs ftabs">${TABS.map(([k, l]) => `<button data-tab="${k}" aria-selected="${k === TAB}">${l}</button>`).join('')}</nav>
        <div class="fv-body">${TABS.map(([k]) => `<section class="pane${k === TAB ? ' on' : ''}" id="p-${k}">${pane[k] ? pane[k]() : serie(k)}</section>`).join('')}</div>`;
    calcAll();
}

function calcAll() {
    const D = M.datos, set = (k, v) => document.querySelectorAll(`[data-calc="${k}"]`).forEach((e) => (e.textContent = v ?? '')), f1 = (x) => Math.round(x * 10) / 10;
    let edad = '';
    if (D.nacimiento) { const b = new Date(D.nacimiento), t = new Date(); edad = t.getFullYear() - b.getFullYear() - (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate()) ? 1 : 0); if (isNaN(edad) || edad < 0) edad = ''; }
    set('@edad', edad);
    const pe = N(D.peso), ta = N(D.talla), imc = pe && ta ? pe / (ta * ta) : null;
    set('@imc', imc ? f1(imc) : ''); set('@imcc', imc ? (imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad') : '');
    const esc_ = D.esc || {}, sum = (o, ks) => { const v = ks.map((k) => N((o || {})[k])); return v.every((x) => x != null) ? v.reduce((a, b) => a + b) : null; };
    const gl = sum(esc_.gl, Object.keys(GL)), br = sum(esc_.br, Object.keys(BR)), dw = DW.filter(([k]) => (esc_.dw || {})[k]).length;
    set('@gl', gl ?? ''); set('@glI', gl == null ? '' : gl >= 13 ? 'Leve' : gl >= 9 ? 'Moderado' : 'Grave');
    set('@br', br ?? ''); set('@brI', br == null ? '' : br >= 19 ? 'Sin riesgo' : br >= 15 ? 'Riesgo bajo' : br >= 13 ? 'Riesgo moderado' : br >= 10 ? 'Riesgo alto' : 'Riesgo muy alto');
    set('@dw', dw); set('@dwI', dw >= 3 ? 'Riesgo alto de caídas' : 'Riesgo bajo');
    (D.vitales || []).forEach((r, i) => {
        const k = `datos.vitales.${i}.`, s = N(r.pas), d = N(r.pad), al = [];
        set(k + 'pam', s != null && d != null ? Math.round((s + 2 * d) / 3) : '');
        for (const c in RANGOS) { const v = N(r[c]), [lo, hi, nm] = RANGOS[c], bad = v != null && (c === 'eva' ? v > hi : v < lo || v > hi); document.querySelector(`[data-p="${k + c}"]`)?.classList.toggle('bad', bad); if (bad) al.push(nm); }
        set(k + 'alertas', al.length ? 'Revisar: ' + al.join(', ') : Object.keys(RANGOS).some((c) => N(r[c]) != null) ? 'Sin alertas' : '');
    });
    (D.meds || []).forEach((r, i) => { const v = ['u', 'm', 'd', 'v', 'h'].map((c) => r[c]); set(`datos.meds.${i}.c5`, v.includes('No') ? 'No cumple' : v.every((x) => x === 'Sí') ? 'Cumple' : ''); });
    let acc = 0; const tot = { oral: 0, ev: 0, med: 0, oi: 0, ti: 0, diu: 0, vom: 0, dre: 0, oe: 0, te: 0, bp: 0 };
    (D.balance || []).forEach((r, i) => {
        const k = `datos.balance.${i}.`, a = ['oral', 'ev', 'med', 'oi'].map((c) => N(r[c]) || 0), b = ['diu', 'vom', 'dre', 'oe'].map((c) => N(r[c]) || 0);
        const ti = a.reduce((x, y) => x + y), te = b.reduce((x, y) => x + y), has = [...a, ...b].some((x) => x);
        acc += ti - te; set(k + 'ti', has ? ti : ''); set(k + 'te', has ? te : ''); set(k + 'bp', has ? ti - te : ''); set(k + 'ba', has ? acc : '');
        ['oral', 'ev', 'med', 'oi', 'diu', 'vom', 'dre', 'oe'].forEach((c) => (tot[c] += N(r[c]) || 0)); tot.ti += ti; tot.te += te; tot.bp += ti - te;
    });
    for (const c in tot) set(`datos.balance.tot.${c}`, tot[c]);
    const p = (M.eval || {}).p || {}, rv = CRITERIOS.map((_, i) => N(p[i])), rt = rv.reduce((a, b) => a + (b || 0), 0), any = rv.some((x) => x != null), pct = rt / 36;
    const nota = pct >= 0.6 ? 4 + (3 * (pct - 0.6)) / 0.4 : 1 + (3 * pct) / 0.6;
    set('@rt', any ? rt : ''); set('@rp', any ? Math.round(pct * 100) + ' %' : ''); set('@rn', any ? f1(nota).toFixed(1) : ''); set('@rr', any ? (nota >= 4 ? 'Aprobado' : 'Reprobado') : '');
}

const fvStatus = (t, bad) => { const e = $('#fvs'); if (e) { e.textContent = t; e.classList.toggle('bad', !!bad); } };
const touch = () => { dirty = true; fvStatus('Sin guardar…'); clearTimeout(tS); tS = setTimeout(saveF, 1500); };
const touchE = () => { dirtyE = true; fvStatus('Sin guardar…'); clearTimeout(tE); tE = setTimeout(saveE, 1500); };

async function saveF() {
    if (!dirty || !EDIT) return;
    dirty = false; fvStatus('Guardando…');
    try {
        const r = await api('ficha&id=' + M.id, 'PUT', { nombre: M.nombre, rut: M.rut, asignatura: M.asignatura, datos: JSON.stringify(M.datos), version: M.version });
        M.version = r.version; M.rut = r.rut; fvStatus('Guardado ✓');
    } catch (e) { dirty = true; fvStatus(e.message, true); }
}
async function saveE() {
    if (!dirtyE || !canRetro()) return;
    dirtyE = false; fvStatus('Guardando…');
    try { await api('evaluacion&id=' + M.id, 'PUT', { evaluacion: JSON.stringify(M.eval) }); fvStatus('Guardado ✓'); }
    catch (e) { dirtyE = true; fvStatus(e.message, true); }
}

const parse = (s) => { try { const o = JSON.parse(s || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; } };

async function openFicha(id) {
    try {
        const r = await api('ficha&id=' + id);
        M = r.ficha; M.datos = parse(M.datos); M.eval = parse(M.evaluacion); RETRO = r.retro;
        ['vitales', 'meds', 'notas', 'balance'].forEach((k) => { if (!Array.isArray(M.datos[k])) M.datos[k] = []; });
        EDIT = canEditFicha(M); TAB = 'ing'; dirty = dirtyE = false;
        $('#fv').hidden = false; document.body.classList.add('fv-open'); renderFicha();
    } catch (e) { alert(e.message); }
}
async function closeFicha() {
    clearTimeout(tS); clearTimeout(tE); await saveF(); await saveE();
    if (dirty || dirtyE) { if (!confirm('Hay cambios sin guardar. ¿Cerrar de todos modos?')) return; }
    $('#fv').hidden = true; document.body.classList.remove('fv-open');
    await load(); render();
}

function newRow(n) {
    const t = new Date(), row = { resp: me.nombre };
    if (['vitales', 'notas'].includes(n)) row.fecha = t.toISOString().slice(0, 10);
    if (['vitales', 'notas', 'balance'].includes(n)) row.hora = t.toTimeString().slice(0, 5);
    return row;
}

const fv = $('#fv');
fv.addEventListener('input', (e) => {
    const t = e.target, p = t.dataset.p;
    if (!p) return;
    setP(p, t.type === 'checkbox' ? t.checked : t.value);
    calcAll();
    p.startsWith('eval.') ? touchE() : touch();
});
fv.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tab) { TAB = b.dataset.tab; fv.querySelectorAll('.pane').forEach((x) => x.classList.toggle('on', x.id === 'p-' + TAB)); fv.querySelectorAll('.ftabs button').forEach((x) => x.setAttribute('aria-selected', x.dataset.tab === TAB)); }
    else if (b.dataset.add) { M.datos[b.dataset.add].push(newRow(b.dataset.add)); renderFicha(); touch(); }
    else if (b.dataset.del) { const [n, i] = b.dataset.del.split('.'); M.datos[n].splice(+i, 1); renderFicha(); touch(); }
    else if (b.dataset.act === 'close') closeFicha();
    else if (b.dataset.act === 'print') window.print();
    else if (b.dataset.act === 'archivar' || b.dataset.act === 'estado') {
        const nuevo = M.estado === 'abierta' ? 'archivada' : 'abierta';
        if (b.dataset.act === 'archivar' && !confirm('Al archivar, la ficha queda lista para revisión del docente y no podrás editarla. ¿Continuar?')) return;
        await saveF();
        try { await api('estado&id=' + M.id, 'PUT', { estado: nuevo }); M.estado = nuevo; EDIT = canEditFicha(M); renderFicha(); } catch (err) { alert(err.message); }
    } else if (b.dataset.act === 'addRetro') {
        const texto = $('#nc').value.trim(); if (!texto) return;
        try { await api('retro&id=' + M.id, 'POST', { texto }); RETRO = (await api('ficha&id=' + M.id)).retro; renderFicha(); } catch (err) { alert(err.message); }
    } else if (b.dataset.act === 'delRetro') {
        try { await api('retro&id=' + b.dataset.id, 'DELETE'); RETRO = (await api('ficha&id=' + M.id)).retro; renderFicha(); } catch (err) { alert(err.message); }
    }
});