# Checklist de seguridad

Estado del proyecto al día de hoy. **[x]** = ya implementado en el código · **[ ]** = pendiente.
Los ítems pendientes marcados como **(antes de producción)** deben cerrarse antes de usar el sistema fuera del equipo de desarrollo o con personas reales.

> Contexto: hoy corre en local (XAMPP) con datos clínicos **ficticios**. Las cuentas (nombre y correo de estudiantes y docentes) sí son datos personales reales.

## 1. Autenticación y sesiones
- [x] Contraseñas guardadas con hash bcrypt (`password_hash` / `password_verify`); nunca en texto plano.
- [x] Contraseña de la cuenta de jefatura generada al azar durante la instalación (no hay clave por defecto).
- [x] Mensaje de error genérico al fallar el login (no revela si el correo existe).
- [x] Sesión con cookie `httponly` y `SameSite=Lax`.
- [x] `session_regenerate_id` al iniciar sesión (evita fijación de sesión) y destrucción de la sesión al salir.
- [ ] **(antes de producción)** Cookie de sesión con `secure` (requiere HTTPS). Hay un comentario en `api/config.php`.
- [ ] **(antes de producción)** Límite de intentos de login por correo e IP, con bloqueo temporal.
- [ ] Política de contraseñas más exigente: hoy el mínimo es 6 caracteres; recomendado 10 o más.
- [ ] Permitir que cada usuario cambie su contraseña y forzar el cambio en el primer ingreso (hoy la define quien crea la cuenta).
- [ ] Recuperación de contraseña segura (hoy se resuelve contactando a la jefatura o al docente).
- [ ] Expiración de sesión por inactividad (ajustar `session.gc_maxlifetime` y la duración de la cookie).
- [ ] Igualar el tiempo de respuesta cuando el correo no existe (evita enumerar cuentas por tiempo).
- [ ] Evaluar doble factor de autenticación para la jefatura.

## 2. Autorización y control de acceso
- [x] Cada ruta de la API verifica sesión, rol y permiso **en el servidor**; ocultar botones en pantalla es solo comodidad.
- [x] Permisos por usuario (ver fichas, ingresar pacientes, retroalimentar, gestionar estudiantes, registrar fichas), con lista cerrada de valores permitidos.
- [x] El docente solo puede gestionar estudiantes; nadie puede eliminarse a sí mismo ni eliminar a la jefatura.
- [x] Solo la jefatura asigna permisos y elimina fichas.
- [x] La ficha archivada es de solo lectura para el estudiante, validado en el servidor.
- [x] El correo del creador de la ficha solo se envía a roles distintos de estudiante.
- [x] El estudiante solo puede ver, editar y archivar las fichas que él creó; docentes y jefatura ven todas. Validado en el servidor (una ficha ajena responde «no encontrada»).
- [ ] El aviso «RUN ya existente» confirma a un estudiante que ese paciente ya tiene ficha aunque no sea suya; evaluar si es aceptable con datos ficticios.
- [ ] Revisar periódicamente quién tiene qué permisos.

## 3. Validación de datos e inyecciones
- [x] Consultas SQL preparadas con PDO (`ATTR_EMULATE_PREPARES` desactivado): protege contra inyección SQL.
- [x] Búsquedas con `LIKE` con caracteres comodín escapados.
- [x] Validación en el servidor: formato de correo, largo de contraseña, formato de RUN, fechas, longitudes máximas y unicidad.
- [x] El JSON de la ficha se valida como JSON y tiene tope de 400 KB.
- [x] Las peticiones POST, PUT y DELETE exigen `Content-Type: application/json`.
- [x] Escape de todo texto dinámico al mostrarlo en pantalla (función `esc`) para evitar XSS.
- [ ] Validar en el servidor la estructura interna del JSON de la ficha (hoy se confía en el cliente y se escapa al mostrarlo).
- [ ] Token CSRF explícito (hoy se apoya en `SameSite` y en el tipo de contenido JSON).
- [ ] Limitar la tasa de peticiones a la API (no solo al login).

## 4. Protección de los datos
- [x] Los datos clínicos del sistema son ficticios, y no se suben archivos.
- [x] Al eliminar un usuario se conservan las fichas (no se pierde información clínica por error).
- [x] El control de versiones evita sobrescribir cambios de otra persona.
- [ ] **(antes de producción)** Todo el tráfico por HTTPS (TLS) con certificado válido y redirección desde HTTP.
- [ ] Cifrado de disco o de la base de datos en el servidor.
- [ ] Si la base de datos queda en otra máquina, conexión cifrada (TLS) entre ambas.
- [ ] Definir cuánto tiempo se conservan las fichas y cómo se eliminan al finalizar el período.
- [ ] Mantener los datos de pruebas fuera del sistema real.

## 5. Servidor web y PHP
- [x] `api/install.php` solo responde desde `localhost`.
- [x] Errores de base de datos no se muestran al usuario (se registran en el log del servidor y se responde un mensaje genérico).
- [ ] **(antes de producción)** Eliminar `api/install.php` (y recordar que `?reset=1` borra todo). Ya se borró en tu equipo local.
- [ ] **(antes de producción)** `display_errors = Off` y `expose_php = Off` en `php.ini`.
- [ ] **(antes de producción)** Usar un servidor Linux actualizado en lugar de XAMPP; mantener Apache/Nginx y PHP al día.
- [ ] Mover `api/config.php` fuera de la carpeta pública (o bloquear su acceso directo).
- [ ] Desactivar el listado de directorios y no exponer phpMyAdmin a internet.
- [ ] Cabeceras de seguridad: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` o `frame-ancestors`, `Referrer-Policy` y `Strict-Transport-Security`.
- [ ] Alojar las tipografías localmente (hoy se piden a Google Fonts), para cerrar la política de contenido y evitar peticiones a terceros.
- [ ] Firewall: solo el puerto 443 (y 22 restringido) abiertos hacia el exterior.

## 6. Base de datos
- [x] Integridad referencial (claves foráneas), `rut` y `email` únicos, y estado restringido por ENUM.
- [x] Codificación `utf8mb4`.
- [ ] **(antes de producción)** Dejar de usar `root`: crear un usuario exclusivo de la aplicación con solo `SELECT, INSERT, UPDATE, DELETE` sobre `ficha_tens`.
- [ ] **(antes de producción)** Clave fuerte para MariaDB y acceso solo desde el servidor de la aplicación (puerto 3306 cerrado al exterior).
- [ ] Eliminar usuarios y bases de ejemplo que trae la instalación.

## 7. Auditoría y monitoreo
- [ ] Registro de auditoría: quién inicia sesión, quién abre, edita, archiva o elimina una ficha y quién cambia permisos, con fecha y hora.
- [ ] Registro de intentos de login fallidos y alertas ante patrones sospechosos.
- [ ] Revisión periódica de los logs de Apache, PHP y MariaDB.

## 8. Respaldos y continuidad
- [ ] **(antes de producción)** Respaldos automáticos diarios de la base de datos, guardados cifrados y fuera del servidor.
- [ ] Prueba de restauración al menos una vez por semestre.
- [ ] Plan para recuperar el acceso de la jefatura si pierde su cuenta (procedimiento documentado).
- [ ] Documentar quién administra el servidor y cómo se aplican las actualizaciones.

## 9. Cumplimiento legal (revisar con asesoría jurídica de la institución)
- [ ] Ley 19.628 sobre protección de la vida privada: vigente hoy. La **Ley 21.719** de protección de datos personales la reemplaza con nuevas obligaciones y una agencia fiscalizadora; está publicada con vigencia desde el 1 de diciembre de 2026, aunque hay un proyecto en trámite que la posterga (verificar el estado antes de planificar).
- [ ] Ley 20.584 sobre derechos y deberes de los pacientes (reserva de la ficha clínica): aplica si algún día se usaran datos de pacientes reales. Hoy los datos son simulados.
- [ ] Informar a estudiantes y docentes qué datos personales se guardan (nombre, correo) y con qué fin.
- [ ] Definir quién es el responsable del tratamiento de los datos dentro de la institución.
- [ ] Procedimiento para atender solicitudes de acceso, corrección o eliminación de datos.
- [ ] Procedimiento de aviso si ocurre una filtración o acceso indebido.

## 10. Lista final antes de salir a producción
- [ ] HTTPS activo y cookie de sesión `secure`.
- [ ] `install.php` eliminado.
- [ ] `config.php` con credenciales reales y fuera del acceso público.
- [ ] Usuario de base de datos con privilegios mínimos y sin `root`.
- [ ] Contraseña de jefatura cambiada y guardada en un lugar seguro.
- [ ] Límite de intentos de login funcionando.
- [ ] Cabeceras de seguridad configuradas.
- [ ] Respaldos programados y restauración probada.
- [ ] Auditoría mínima de accesos a fichas.
- [ ] Cuentas de prueba eliminadas.
- [ ] Revisión legal realizada.
- [ ] Prueba completa de los tres roles (jefa, docente, estudiante) en el servidor final.
