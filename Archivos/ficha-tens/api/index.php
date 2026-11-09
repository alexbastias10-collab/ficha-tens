<?php
require __DIR__ . '/config.php';

$r = $_GET['r'] ?? '';
$m = $_SERVER['REQUEST_METHOD'];
$in = [];
if ($m !== 'GET') {
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail(415, 'Formato no válido.');
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
}

function run(string $sql, array $a = []): PDOStatement { $s = db()->prepare($sql); $s->execute($a); return $s; }
function one(string $sql, array $a = []) { return run($sql, $a)->fetch() ?: null; }
function allow(array $u, string $col): bool { return $u['rol'] === 'admin' || (bool)$u[$col]; }
function pub(array $u): array {
    return ['id' => (string)$u['id'], 'nombre' => $u['nombre'], 'email' => $u['email'], 'rol' => $u['rol'], 'permisos' => [
        'verFichas' => (bool)$u['ver_fichas'], 'ingresarPacientes' => (bool)$u['ingresar_pacientes'], 'retroalimentar' => (bool)$u['retroalimentar'],
        'gestionarAlumnos' => (bool)$u['gestionar_alumnos'], 'registrarFichas' => (bool)$u['registrar_fichas']]];
}
function manageable(array $me, ?array $t): bool {
    return $t && $t['id'] != $me['id'] && $t['rol'] !== 'admin'
        && ($me['rol'] === 'admin' || ($me['rol'] === 'docente' && $me['gestionar_alumnos'] && $t['rol'] === 'alumno'));
}
function canView(array $u): bool { return $u['rol'] !== 'docente' || $u['ver_fichas']; }
function canCreate(array $u): bool { return $u['rol'] === 'admin' || ($u['rol'] === 'docente' && $u['ingresar_pacientes']) || ($u['rol'] === 'alumno' && $u['registrar_fichas']); }
function canEditF(array $u, array $f): bool {
    return $u['rol'] === 'admin' || ($u['rol'] === 'docente' && $u['ingresar_pacientes']) || ($u['rol'] === 'alumno' && $u['registrar_fichas'] && $f['estado'] === 'abierta' && $f['creado_por'] == $u['id']);
}
function canRetro(array $u): bool { return $u['rol'] === 'admin' || ($u['rol'] === 'docente' && $u['retroalimentar']); }
function rutNorm($x): ?string {
    $x = strtoupper(preg_replace('/[^0-9Kk]/', '', (string)$x));
    $x = strlen($x) > 1 ? substr($x, 0, -1) . '-' . substr($x, -1) : '';
    return preg_match('/^\d{7,8}-[\dK]$/', $x) ? $x : null;
}
function jsonStr($v): string {
    $s = (string)($v ?? '{}');
    if (strlen($s) > 400000 || !is_array(json_decode($s, true))) fail(422, 'Datos no válidos.');
    return $s;
}
function fmt(array $f): array {
    return ['id' => (string)$f['id'], 'rut' => $f['rut'], 'nombre' => $f['nombre'], 'asignatura' => $f['asignatura'], 'estado' => $f['estado'],
        'version' => (int)$f['version'], 'creadoPor' => isset($f['creado_por']) ? (string)$f['creado_por'] : null, 'creador' => $f['creador'] ?? null, 'creadorEmail' => $GLOBALS['me']['rol'] !== 'alumno' ? ($f['creador_email'] ?? null) : null, 'actualizada' => date('c', strtotime($f['actualizada'])),
        'datos' => $f['datos'] ?? null, 'evaluacion' => $f['evaluacion'] ?? null];
}

if ($r === 'login' && $m === 'POST') {
    $u = one('SELECT * FROM users WHERE email=?', [strtolower(trim($in['email'] ?? ''))]);
    if (!$u || !password_verify((string)($in['pass'] ?? ''), $u['pass_hash'])) fail(401, 'Correo o contraseña incorrectos.');
    session_regenerate_id(true);
    $_SESSION['uid'] = $u['id'];
    out(['user' => pub($u)]);
}

$me = !empty($_SESSION['uid']) ? one('SELECT * FROM users WHERE id=?', [$_SESSION['uid']]) : null;
if (!$me) fail(401, 'Sesión no iniciada.');
$id = (int)($_GET['id'] ?? 0);

if ($r === 'me') out(['user' => pub($me)]);
if ($r === 'logout') { session_destroy(); out(['ok' => true]); }

/* ---------- Usuarios ---------- */
if ($r === 'users' && $m === 'GET') {
    if ($me['rol'] === 'admin') $rows = db()->query('SELECT * FROM users ORDER BY nombre')->fetchAll();
    elseif ($me['rol'] === 'docente' && ($me['ver_fichas'] || $me['gestionar_alumnos'])) $rows = db()->query("SELECT * FROM users WHERE rol='alumno' ORDER BY nombre")->fetchAll();
    else $rows = [$me];
    out(['users' => array_map('pub', $rows)]);
}

if ($r === 'users' && ($m === 'POST' || $m === 'PUT')) {
    $nombre = trim($in['nombre'] ?? '');
    $email = strtolower(trim($in['email'] ?? ''));
    $pass = (string)($in['pass'] ?? '');
    if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail(422, 'Revisa el nombre y el correo.');
    if ($pass !== '' && strlen($pass) < 6) fail(422, 'La contraseña debe tener al menos 6 caracteres.');
    if (one('SELECT id FROM users WHERE email=? AND id<>?', [$email, $id])) fail(409, 'Ese correo ya está registrado.');
    if ($m === 'POST') {
        if ($me['rol'] === 'alumno' || !allow($me, 'gestionar_alumnos')) fail(403, 'Sin permiso.');
        if ($pass === '') fail(422, 'Ingresa una contraseña.');
        $rol = $me['rol'] === 'admin' && in_array($in['rol'] ?? '', ['docente', 'alumno'], true) ? $in['rol'] : 'alumno';
        $d = (int)($rol === 'docente');
        run('INSERT INTO users (nombre,email,pass_hash,rol,ver_fichas,ingresar_pacientes,retroalimentar,gestionar_alumnos,registrar_fichas) VALUES (?,?,?,?,?,?,?,?,?)',
            [$nombre, $email, password_hash($pass, PASSWORD_DEFAULT), $rol, $d, $d, $d, $d, (int)($rol === 'alumno')]);
        out(['ok' => true]);
    }
    if (!manageable($me, one('SELECT * FROM users WHERE id=?', [$id]))) fail(403, 'Sin permiso.');
    run('UPDATE users SET nombre=?, email=? WHERE id=?', [$nombre, $email, $id]);
    if ($pass !== '') run('UPDATE users SET pass_hash=? WHERE id=?', [password_hash($pass, PASSWORD_DEFAULT), $id]);
    out(['ok' => true]);
}

if ($r === 'users' && $m === 'DELETE') {
    if (!manageable($me, one('SELECT * FROM users WHERE id=?', [$id]))) fail(403, 'Sin permiso.');
    run('DELETE FROM users WHERE id=?', [$id]); // las fichas se conservan (creado_por pasa a NULL)
    out(['ok' => true]);
}

if ($r === 'permisos' && $m === 'PUT') {
    if ($me['rol'] !== 'admin') fail(403, 'Solo la jefatura puede cambiar permisos.');
    $t = one('SELECT * FROM users WHERE id=?', [$id]);
    if (!$t || $t['rol'] === 'admin') fail(404, 'Usuario no encontrado.');
    $cols = ['docente' => ['verFichas' => 'ver_fichas', 'ingresarPacientes' => 'ingresar_pacientes', 'retroalimentar' => 'retroalimentar', 'gestionarAlumnos' => 'gestionar_alumnos'],
             'alumno' => ['registrarFichas' => 'registrar_fichas']];
    $col = $cols[$t['rol']][$in['k'] ?? ''] ?? null;
    if (!$col) fail(422, 'Permiso no válido.');
    run("UPDATE users SET $col=? WHERE id=?", [(int)!empty($in['v']), $id]);
    out(['ok' => true]);
}

/* ---------- Fichas (una por paciente) ---------- */
if ($r === 'fichas' && $m === 'GET') {
    if (!canView($me)) out(['fichas' => []]);
    $w = []; $a = [];
    $q = trim($_GET['q'] ?? '');
    if ($q !== '') {
        $w[] = '(f.nombre LIKE ? OR REPLACE(f.rut,"-","") LIKE ?)';
        $a[] = '%' . addcslashes($q, '%_') . '%';
        $a[] = '%' . addcslashes(preg_replace('/[^0-9Kk]/', '', $q) ?: '#', '%_') . '%';
    }
    if (in_array($_GET['estado'] ?? '', ['abierta', 'archivada'], true)) { $w[] = 'f.estado=?'; $a[] = $_GET['estado']; }
    if ($me['rol'] === 'alumno') { $w[] = 'f.creado_por=?'; $a[] = $me['id']; } // el estudiante solo ve lo que creó
    elseif ((int)($_GET['creador'] ?? 0) > 0) { $w[] = 'f.creado_por=?'; $a[] = (int)$_GET['creador']; }
    $sql = 'SELECT f.id,f.rut,f.nombre,f.asignatura,f.estado,f.version,f.creado_por,f.actualizada,u.nombre AS creador,u.email AS creador_email FROM fichas f LEFT JOIN users u ON u.id=f.creado_por'
        . ($w ? ' WHERE ' . implode(' AND ', $w) : '') . ' ORDER BY f.actualizada DESC LIMIT 300';
    out(['fichas' => array_map('fmt', run($sql, $a)->fetchAll())]);
}

if ($r === 'creadores' && $m === 'GET') {
    if ($me['rol'] === 'alumno' || !canView($me)) out(['creadores' => []]);
    $rows = db()->query('SELECT DISTINCT u.id,u.nombre,u.email FROM fichas f JOIN users u ON u.id=f.creado_por ORDER BY u.nombre')->fetchAll();
    out(['creadores' => array_map(fn($u) => ['id' => (string)$u['id'], 'nombre' => $u['nombre'], 'email' => $u['email']], $rows)]);
}

if ($r === 'ficha' && $m === 'GET') {
    if (!canView($me)) fail(403, 'Sin permiso.');
    $f = one('SELECT f.*,u.nombre AS creador,u.email AS creador_email FROM fichas f LEFT JOIN users u ON u.id=f.creado_por WHERE f.id=?', [$id]);
    if (!$f || ($me['rol'] === 'alumno' && $f['creado_por'] != $me['id'])) fail(404, 'Ficha no encontrada.');
    out(['ficha' => fmt($f), 'retro' => run('SELECT id,autor_id,autor,texto,creado FROM retro WHERE ficha_id=? ORDER BY id', [$id])->fetchAll()]);
}

if ($r === 'ficha' && $m === 'POST') {
    if (!canCreate($me)) fail(403, 'Sin permiso para ingresar pacientes.');
    $nombre = mb_substr(trim($in['nombre'] ?? ''), 0, 120);
    $asig = mb_substr(trim($in['asignatura'] ?? ''), 0, 120);
    $rut = rutNorm($in['rut'] ?? '');
    if ($nombre === '' || $asig === '') fail(422, 'Completa el nombre y la asignatura.');
    if (!$rut) fail(422, 'El RUN no es válido. Ejemplo: 12.345.678-9');
    if (one('SELECT id FROM fichas WHERE rut=?', [$rut])) fail(409, 'Ya existe una ficha para ese RUN: la ficha clínica es única por paciente.');
    run('INSERT INTO fichas (rut,nombre,asignatura,datos,evaluacion,creado_por) VALUES (?,?,?,?,?,?)', [$rut, $nombre, $asig, '{}', '{}', $me['id']]);
    out(['id' => (string)db()->lastInsertId()]);
}

if ($r === 'ficha' && $m === 'PUT') {
    $f = one('SELECT * FROM fichas WHERE id=?', [$id]);
    if (!$f) fail(404, 'Ficha no encontrada.');
    if (!canEditF($me, $f)) fail(403, $f['estado'] === 'archivada' ? 'La ficha está archivada.' : 'Sin permiso para editar.');
    $nombre = mb_substr(trim($in['nombre'] ?? ''), 0, 120);
    $asig = mb_substr(trim($in['asignatura'] ?? ''), 0, 120);
    $rut = rutNorm($in['rut'] ?? '');
    if ($nombre === '' || $asig === '') fail(422, 'El nombre y la asignatura no pueden quedar vacíos.');
    if (!$rut) fail(422, 'El RUN no es válido.');
    if (one('SELECT id FROM fichas WHERE rut=? AND id<>?', [$rut, $id])) fail(409, 'Ese RUN ya tiene otra ficha.');
    $n = run('UPDATE fichas SET nombre=?,rut=?,asignatura=?,datos=?,version=version+1 WHERE id=? AND version=?',
        [$nombre, $rut, $asig, jsonStr($in['datos'] ?? null), $id, (int)($in['version'] ?? 0)])->rowCount();
    if ($n === 0) fail(409, 'Otra persona modificó esta ficha. Ciérrala y ábrela de nuevo para ver los cambios.');
    out(['version' => (int)$f['version'] + 1, 'rut' => $rut]);
}

if ($r === 'ficha' && $m === 'DELETE') {
    if ($me['rol'] !== 'admin') fail(403, 'Solo la jefatura puede eliminar fichas.');
    run('DELETE FROM fichas WHERE id=?', [$id]);
    out(['ok' => true]);
}

if ($r === 'estado' && $m === 'PUT') {
    $f = one('SELECT * FROM fichas WHERE id=?', [$id]);
    $e = $in['estado'] ?? '';
    if (!$f || !in_array($e, ['abierta', 'archivada'], true)) fail(422, 'Solicitud no válida.');
    $ok = $me['rol'] === 'alumno' ? ($me['registrar_fichas'] && $f['estado'] === 'abierta' && $e === 'archivada' && $f['creado_por'] == $me['id'])
        : ($me['rol'] === 'admin' || ($me['rol'] === 'docente' && ($me['ingresar_pacientes'] || $me['retroalimentar'])));
    if (!$ok) fail(403, 'Sin permiso.');
    run('UPDATE fichas SET estado=? WHERE id=?', [$e, $id]);
    out(['ok' => true]);
}

/* ---------- Retroalimentación y rúbrica ---------- */
if ($r === 'retro' && $m === 'POST') {
    if (!canRetro($me)) fail(403, 'Sin permiso.');
    $t = mb_substr(trim($in['texto'] ?? ''), 0, 2000);
    if ($t === '' || !one('SELECT id FROM fichas WHERE id=?', [$id])) fail(422, 'Escribe un comentario.');
    run('INSERT INTO retro (ficha_id,autor_id,autor,texto) VALUES (?,?,?,?)', [$id, $me['id'], $me['nombre'], $t]);
    out(['ok' => true]);
}
if ($r === 'retro' && $m === 'DELETE') {
    $c = one('SELECT * FROM retro WHERE id=?', [$id]);
    if (!$c || !canRetro($me) || ($me['rol'] !== 'admin' && $c['autor_id'] != $me['id'])) fail(403, 'Sin permiso.');
    run('DELETE FROM retro WHERE id=?', [$id]);
    out(['ok' => true]);
}
if ($r === 'evaluacion' && $m === 'PUT') {
    if (!canRetro($me)) fail(403, 'Sin permiso.');
    run('UPDATE fichas SET evaluacion=? WHERE id=?', [jsonStr($in['evaluacion'] ?? null), $id]);
    out(['ok' => true]);
}

fail(404, 'Ruta no encontrada.');