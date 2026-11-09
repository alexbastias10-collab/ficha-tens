# Casos de prueba

Plan de pruebas funcionales y de seguridad del sistema de ficha clínica TENS · CFT O'Higgins. Los casos están ligados a los casos de uso de [`casos-de-uso.md`](casos-de-uso.md) y a las medidas de [`checklist-seguridad.md`](checklist-seguridad.md).

## 1. Alcance y entorno

| Ítem | Detalle |
|---|---|
| Qué se prueba | Login, usuarios, permisos, pacientes y fichas, cálculos automáticos, archivado, retroalimentación, rúbrica, reportes, PDF y control de acceso. |
| Entorno | XAMPP local: `http://localhost/ficha-tens/` (Apache + PHP 8.x + MariaDB). |
| Navegadores | Chrome o Edge (versión actual); repetir los casos críticos en Firefox. |
| Pantalla | Escritorio o notebook (por ejemplo 1366×768). |
| Base de datos | Recién instalada con `api/install.php` (sin datos previos). |
| Herramientas | Navegador con F12 (Consola y Network), phpMyAdmin y una ventana de incógnito para segunda sesión. |

Convención de la columna **Res.**: ☐ sin ejecutar · ✅ aprobado · ❌ falló (anotar en la sección 12).

## 2. Datos de prueba

Crear estas cuentas desde la jefatura antes de empezar (contraseña `Prueba123` para todas, excepto la jefa):

| Alias | Rol | Correo | Notas |
|---|---|---|---|
| **JEFA** | Jefa de carrera | `admin@cftohiggins.cl` | Contraseña entregada por `install.php`. |
| **DOC1** | Docente | `doc1@tens.cftohiggins.cl` | Permisos por defecto (los 4 activos). |
| **DOC2** | Docente | `doc2@tens.cftohiggins.cl` | Para pruebas de permisos. |
| **EST1** | Estudiante | `est1@tens.cftohiggins.cl` | Permiso por defecto. |
| **EST2** | Estudiante | `est2@tens.cftohiggins.cl` | Compañero de EST1. |

Pacientes ficticios:

| Alias | Nombre | RUN | Asignatura | Lo crea |
|---|---|---|---|---|
| **P1** | Juan Pérez | 11.111.111-1 | Enfermería Básica | EST1 |
| **P2** | Ana Soto | 22.222.222-2 | Enfermería Básica | EST2 |
| **P3** | Luis Rojas | 33.333.333-3 | Podología | DOC1 |

## 3. Autenticación (CU-01, CU-02)

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| AUT-01 | 01 | Iniciar sesión con credenciales válidas de cada rol (JEFA, DOC1, EST1). | Entra al panel. El encabezado muestra nombre y rol. Solo la jefa ve el botón **Permisos**. | ☐ |
| AUT-02 | 01 | Contraseña incorrecta con un correo válido. | Mensaje «Correo o contraseña incorrectos.» No se entra. | ☐ |
| AUT-03 | 01 | Correo que no existe. | El **mismo** mensaje del caso anterior (no revela si el correo existe). | ☐ |
| AUT-04 | 01 | Correo sin formato válido (`abc`). | «Escribe un correo válido.» No se envía la petición. | ☐ |
| AUT-05 | 01 | Dejar la contraseña vacía. | «Ingresa tu contraseña.» | ☐ |
| AUT-06 | 01 | Botón **Mostrar / Ocultar** de la contraseña. | Alterna entre texto visible y oculto. | ☐ |
| AUT-07 | 01 | Marcar «Recordar mi correo», iniciar sesión, salir y volver al login. | El correo queda escrito en el campo; la contraseña no. | ☐ |
| AUT-08 | 01 | Con sesión activa, abrir `index.html`. | Redirige directo al panel. | ☐ |
| AUT-09 | 02 | Pulsar **Salir**. | Vuelve al login. | ☐ |
| AUT-10 | 02 | Tras salir, pulsar «Atrás» del navegador o abrir `panel.html`. | Redirige al login; no se ve información. | ☐ |
| AUT-11 | 01 | Abrir `panel.html` sin haber iniciado sesión. | Redirige al login. | ☐ |
| AUT-12 | 01 | Pulsar «¿Olvidaste tu contraseña?». | Mensaje indicando contactar a su docente o a la jefatura. | ☐ |

## 4. Usuarios (CU-03)

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| USR-01 | 03 | JEFA: **Usuarios → Nuevo usuario**, rol docente, datos válidos. | Aparece en la lista. En **Permisos** tiene sus 4 casillas activas. | ☐ |
| USR-02 | 03 | JEFA: crear un estudiante. | Aparece en la lista. En **Permisos** tiene solo «Ingresar pacientes y registrar». | ☐ |
| USR-03 | 03 | Iniciar sesión con la cuenta recién creada. | Entra correctamente (la contraseña se guardó bien). | ☐ |
| USR-04 | 03 | Crear un usuario con un correo ya registrado. | «Ese correo ya está registrado.» | ☐ |
| USR-05 | 03 | Crear un usuario con contraseña de 5 caracteres. | «La contraseña debe tener al menos 6 caracteres.» | ☐ |
| USR-06 | 03 | Crear un usuario con correo inválido o nombre vacío. | Rechazo con mensaje; no se crea. | ☐ |
| USR-07 | 03 | JEFA: editar el nombre y correo de un usuario, dejando la contraseña vacía. | Se actualizan los datos; la contraseña anterior sigue funcionando. | ☐ |
| USR-08 | 03 | JEFA: editar escribiendo una nueva contraseña. | La contraseña antigua deja de servir; la nueva sí. | ☐ |
| USR-09 | 03 | DOC1 (con «gestionar estudiantes»): abrir **Estudiantes → Nuevo estudiante**. | Crea estudiantes; el formulario **no** pide rol. | ☐ |
| USR-10 | 03 | DOC1: revisar la lista. | Solo ve estudiantes (no docentes ni la jefa). | ☐ |
| USR-11 | 03 | DOC1: editar y eliminar un estudiante. | Funciona con confirmación al eliminar. | ☐ |
| USR-12 | 03 | JEFA: eliminar un docente. | Desaparece de la lista tras confirmar. | ☐ |
| USR-13 | 03 | Eliminar un estudiante que había creado fichas. Luego entrar como DOC1. | Las fichas siguen existiendo y en «Creada por» aparece «—». | ☐ |
| USR-14 | 03 | EST1: buscar el apartado de usuarios. | No existe la pestaña **Usuarios**. | ☐ |
| USR-15 | 03 | JEFA: revisar que su propia cuenta no aparezca en la lista de usuarios. | No aparece (no puede eliminarse a sí misma). | ☐ |

## 5. Permisos (CU-04)

Los cambios de permisos se aplican en el servidor de inmediato; la pantalla del usuario afectado los refleja al **recargar la página** (F5).

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| PER-01 | 04 | JEFA: abrir **Permisos**. | Lista docentes y estudiantes con sus casillas. | ☐ |
| PER-02 | 04 | Desmarcar y volver a marcar una casilla. | Se guarda al marcar; al cerrar y reabrir el diálogo se mantiene. | ☐ |
| PER-03 | 04 | Quitar a DOC2 «Ver fichas». Entrar como DOC2. | Mensaje «No tienes permiso para ver fichas». No hay pestaña **Listado por asignatura**. | ☐ |
| PER-04 | 04 | Quitar a DOC2 «Ingresar pacientes y editar fichas». | No ve **Ingresar paciente**; las fichas se abren en solo lectura. | ☐ |
| PER-05 | 04 | Quitar a DOC2 «Retroalimentación y evaluar». | En una ficha, la pestaña **Retroalimentación** no permite comentar y la rúbrica está bloqueada. | ☐ |
| PER-06 | 04 | Quitar a DOC2 «Crear, editar y eliminar estudiantes». | Desaparece la pestaña **Estudiantes**. | ☐ |
| PER-07 | 04 | Quitar a EST2 «Ingresar pacientes y registrar». | No ve **Ingresar paciente** y sus fichas se abren en solo lectura. | ☐ |
| PER-08 | 04 | DOC1 o EST1: buscar el botón **Permisos**. | No existe. | ☐ |

## 6. Pacientes y fichas (CU-05, CU-06, CU-10, CU-14)

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| FIC-01 | 05 | EST1: **Ingresar paciente** con los datos de P1. | Se crea y se abre la ficha en estado *abierta*. | ☐ |
| FIC-02 | 05 | Ingresar un paciente con RUN `123`. | «El RUN no es válido. Ejemplo: 12.345.678-9». | ☐ |
| FIC-03 | 05 | EST2: ingresar un paciente con el mismo RUN de P1. | «Ya existe una ficha para ese RUN…». No se crea. | ☐ |
| FIC-04 | 05 | Ingresar el RUN con puntos (`22.222.222-2`) y sin puntos (`22222222-2`) en dos intentos. | Ambos formatos se aceptan; en la lista se ve `22.222.222-2`. | ☐ |
| FIC-05 | 05 | Dejar nombre o asignatura vacíos. | El formulario no se envía. | ☐ |
| FIC-06 | 05 | EST2 crea P2 y DOC1 crea P3. | Ambas fichas se crean. | ☐ |
| FIC-07 | 05 | En **Ingresar paciente**, escribir asignatura. | El campo sugiere asignaturas ya usadas. | ☐ |
| FIC-08 | 06 | EST1: ver la lista. | Solo aparece P1. Título «Mis fichas clínicas». | ☐ |
| FIC-09 | 06 | DOC1 y JEFA: ver la lista. | Aparecen P1, P2 y P3. | ☐ |
| FIC-10 | 06 | DOC1: buscar `juan`, luego `PÉREZ`, luego `per`. | Encuentra P1 en cada caso (sin distinguir mayúsculas). | ☐ |
| FIC-11 | 06 | DOC1: buscar `11.111.111`, `11111111` y `11.111`. | Encuentra P1 en los tres casos. | ☐ |
| FIC-12 | 06 | Buscar un texto inexistente. | «No hay pacientes que coincidan con la búsqueda.» | ☐ |
| FIC-13 | 06 | Filtrar por estado *Abiertas* y *Archivadas*. | La lista muestra solo las del estado elegido. | ☐ |
| FIC-14 | 10 | DOC1: filtrar **Creada por** = EST1. | Solo aparece P1. Con «Todos los creadores» vuelven todas. | ☐ |
| FIC-15 | 10 | DOC1 o JEFA: revisar columna «Creada por» y el encabezado de una ficha abierta. | Muestran el nombre y el correo del creador. | ☐ |
| FIC-16 | 10 | EST1: revisar la lista y el encabezado de su ficha. | No hay columna «Creada por», ni filtro de creador, ni correos. | ☐ |
| FIC-17 | 14 | JEFA o DOC1: **Listado por asignatura**. | Pacientes agrupados por asignatura con totales de abiertas y archivadas; incluye nombre y correo del creador. | ☐ |
| FIC-18 | 14 | EST1: buscar la pestaña **Listado por asignatura**. | No existe. | ☐ |

## 7. Edición de la ficha y cálculos (CU-07)

Usar la ficha de P1 con EST1. Los cálculos deben aparecer al instante, sin recargar.

| ID | CU | Pasos / datos | Resultado esperado | Res. |
|---|---|---|---|---|
| EDI-01 | 07 | Escribir en un campo de **Ingreso** y esperar unos 2 segundos. | El indicador pasa de «Sin guardar…» a «Guardando…» y luego «Guardado ✓». | ☐ |
| EDI-02 | 07 | Escribir datos, cerrar la ficha y volver a abrirla. | Los datos persisten. | ☐ |
| EDI-03 | 07 | Fecha de nacimiento `01-01-2000`. | Edad = años cumplidos a la fecha actual (por ejemplo, 26 en noviembre de 2026). | ☐ |
| EDI-04 | 07 | Peso 70 kg, talla 1,75 m. | IMC `22.9` · «Normal». | ☐ |
| EDI-05 | 07 | Peso 50, talla 1,70 · luego peso 90, talla 1,70. | `17.3` «Bajo peso» · `31.1` «Obesidad». | ☐ |
| EDI-06 | 07 | **Signos vitales** → Agregar registro. | Nueva fila con fecha, hora y responsable (tu nombre) ya completados. | ☐ |
| EDI-07 | 07 | PAS 120 y PAD 80. | PAM = `93`. | ☐ |
| EDI-08 | 07 | Valores normales: PAS 120, PAD 80, FC 80, FR 16, T° 36.5, SatO₂ 98. | Alertas = «Sin alertas»; ningún campo en rojo. | ☐ |
| EDI-09 | 07 | FC 120 y T° 38. | Alertas = «Revisar: FC, T°»; esos dos campos quedan en rojo. | ☐ |
| EDI-10 | 07 | T° 37.4 y luego 37.5. | 37.4 no alerta; 37.5 alerta («T°»). | ☐ |
| EDI-11 | 07 | EVA 5. | Alerta «EVA» (solo se alerta sobre 3). | ☐ |
| EDI-12 | 07 | **Medicamentos**: agregar fila y marcar los 5 correctos en «Sí». | «Cumple». | ☐ |
| EDI-13 | 07 | Cambiar uno de los cinco a «No». | «No cumple». | ☐ |
| EDI-14 | 07 | Dejar algún correcto en blanco, sin ningún «No». | Resultado vacío (aún incompleto). | ☐ |
| EDI-15 | 07 | **Balance hídrico**, fila 1: oral 500, EV 250, medicación 100, diuresis 400, drenajes 50. | Total ingresos 850 · total egresos 450 · parcial 400 · acumulado 400. | ☐ |
| EDI-16 | 07 | Fila 2: oral 300, diuresis 600. | Ingresos 300 · egresos 600 · parcial −300 · acumulado 100. | ☐ |
| EDI-17 | 07 | Revisar la fila **TOTAL**. | Oral 800 · EV 250 · medic. 100 · ingresos 1150 · diuresis 1000 · drenajes 50 · egresos 1050 · balance 100. | ☐ |
| EDI-18 | 07 | **Escalas → Glasgow**: 4, 5, 6 · luego 3, 3, 4 · luego 2, 2, 3. | 15 «Leve» · 10 «Moderado» · 7 «Grave». | ☐ |
| EDI-19 | 07 | **Braden**: (4,4,4,4,4,3) · (2,3,2,2,3,2) · (1,1,1,1,1,1). | 23 «Sin riesgo» · 14 «Riesgo moderado» · 6 «Riesgo muy alto». | ☐ |
| EDI-20 | 07 | **Downton**: marcar 2 y luego 3 casillas. | 2 → «Riesgo bajo» · 3 → «Riesgo alto de caídas». | ☐ |
| EDI-21 | 07 | Volver a **Ingreso → H. Resumen de escalas**. | Muestra los mismos totales e interpretaciones de la pestaña Escalas. | ☐ |
| EDI-22 | 07 | Eliminar una fila con ✕ en cada tabla de seguimiento. | La fila desaparece y los totales se recalculan. | ☐ |
| EDI-23 | 07 | **Notas de enfermería**: agregar una nota. EST1 intenta marcar «V°B° docente». | La casilla está bloqueada para el estudiante. | ☐ |
| EDI-24 | 07 | DOC1 (con «Ingresar pacientes y editar») abre la ficha y marca el V°B°. | La casilla se puede marcar y se guarda. | ☐ |
| EDI-25 | 07 | Cambiar el RUN de la ficha a uno que ya tiene otra ficha. | El indicador muestra «Ese RUN ya tiene otra ficha.» | ☐ |
| EDI-26 | 07 | Vaciar el nombre del paciente. | El indicador muestra el error y no se guarda. | ☐ |
| EDI-27 | 07 | Cortar la conexión (apagar Apache) y editar. | El indicador muestra un error; al reconectar y editar de nuevo, se guarda. | ☐ |

## 8. Archivado y estados (CU-08, CU-09)

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| EST-01 | 08 | EST1: **Archivar para revisión** y aceptar el aviso. | Estado *archivada*; aparece «Ficha archivada: solo lectura» y los campos se bloquean. | ☐ |
| EST-02 | 08 | EST1: cancelar el aviso de archivado. | La ficha sigue abierta. | ☐ |
| EST-03 | 08 | EST1: buscar el botón **Reabrir** en su ficha archivada. | No existe. | ☐ |
| EST-04 | 09 | DOC1: abrir la ficha archivada y pulsar **Reabrir**. | Pasa a *abierta*; EST1 vuelve a poder editarla. | ☐ |
| EST-05 | 09 | JEFA: **Archivar** una ficha abierta. | Pasa a *archivada*. | ☐ |
| EST-06 | 07 | DOC1 (con permiso de edición) abre una ficha archivada. | Puede editarla. | ☐ |
| EST-07 | 08 | El archivado guarda los últimos cambios escritos justo antes de pulsar. | Al reabrir, no se perdió nada. | ☐ |

## 9. Retroalimentación, rúbrica y PDF (CU-11, CU-12, CU-13)

| ID | CU | Pasos | Resultado esperado | Res. |
|---|---|---|---|---|
| RET-01 | 11 | DOC1: **Retroalimentación** → escribir y publicar un comentario. | Aparece con su nombre y fecha. | ☐ |
| RET-02 | 11 | Publicar un comentario vacío. | No se publica. | ☐ |
| RET-03 | 11 | EST1: abrir su ficha. | Ve el comentario; no hay cuadro para comentar. | ☐ |
| RET-04 | 11 | DOC1 elimina su propio comentario. | Desaparece. | ☐ |
| RET-05 | 11 | DOC2 intenta eliminar un comentario de DOC1; JEFA lo intenta. | DOC2 no ve el botón; JEFA sí puede. | ☐ |
| RET-06 | 12 | DOC1: asignar 3 puntos a los 12 criterios. | Puntaje 36 · 100 % · nota `7.0` · «Aprobado». | ☐ |
| RET-07 | 12 | Cambiar todos a 2. | 24 · 67 % · nota `4.5` · «Aprobado». | ☐ |
| RET-08 | 12 | Cambiar todos a 1. | 12 · 33 % · nota `2.7` · «Reprobado». | ☐ |
| RET-09 | 12 | Escribir estudiante evaluado, fecha, observaciones y retroalimentación general; cerrar y reabrir. | Todo persiste. | ☐ |
| RET-10 | 12 | EST1: abrir la rúbrica. | Ve los puntajes pero no puede modificarlos. | ☐ |
| PDF-01 | 13 | Abrir una ficha completa y pulsar **Descargar PDF**. | Se abre la vista de impresión con todas las secciones, cada pestaña en su página, sin botones ni menús. | ☐ |
| PDF-02 | 13 | Guardar como PDF y revisar el archivo. | Se leen los valores ingresados; los campos fuera de rango aparecen resaltados. | ☐ |
| PDF-03 | 14 | En **Listado por asignatura**, pulsar **Imprimir / PDF**. | Se imprime solo el listado. | ☐ |

## 10. Control de acceso y seguridad (API)

Probar desde la consola del navegador (F12) con la sesión del usuario indicado. Sustituir `ID` por el id de la ficha (visible en la pestaña Network al abrirla).

Ejemplo de llamada: `fetch('api/index.php?r=ficha&id=ID').then(r => r.status)`.

| ID | Pasos | Resultado esperado | Res. |
|---|---|---|---|
| SEG-01 | Sin sesión: abrir `http://localhost/ficha-tens/api/index.php?r=fichas`. | `{"error":"Sesión no iniciada."}` (401). | ☐ |
| SEG-02 | Como EST1: pedir `r=ficha&id=` con el id de la ficha de **EST2** (P2). | 404 «Ficha no encontrada». | ☐ |
| SEG-03 | Como EST1: `r=fichas`. | Solo devuelve sus fichas. | ☐ |
| SEG-04 | Como EST1: `r=fichas&creador=` con el id de EST2. | Sigue devolviendo solo las suyas (el filtro se ignora). | ☐ |
| SEG-05 | Como EST1: intentar un `PUT r=ficha&id=` sobre la ficha de EST2. | 403 (no autorizado). | ☐ |
| SEG-06 | Como EST1: `PUT r=estado&id=` sobre la ficha de EST2. | 403. | ☐ |
| SEG-07 | Como EST1 con su ficha archivada: `PUT r=ficha&id=`. | 403 «La ficha está archivada.» | ☐ |
| SEG-08 | Como EST1: `POST r=users` y `GET r=users`. | POST → 403; GET → solo su propio usuario. | ☐ |
| SEG-09 | Como EST1: `POST r=retro&id=` y `PUT r=evaluacion&id=`. | 403. | ☐ |
| SEG-10 | Como DOC1: `PUT r=permisos&id=` y `DELETE r=ficha&id=`. | 403 en ambos. | ☐ |
| SEG-11 | Como DOC1: `DELETE r=users&id=` con el id de otro docente o de la jefa. | 403. | ☐ |
| SEG-12 | Como DOC2 sin «Ver fichas»: `r=fichas` y `r=ficha&id=`. | Lista vacía y 403. | ☐ |
| SEG-13 | Enviar un `POST` con otro tipo de contenido (por ejemplo `text/plain`). | 415 «Formato no válido». | ☐ |
| SEG-14 | En el buscador escribir `' OR 1=1 --`. | Sin errores y sin resultados adicionales. | ☐ |
| SEG-15 | Crear un paciente con nombre `<script>alert(1)</script>`. | El texto se muestra tal cual; no se ejecuta ningún script. | ☐ |
| SEG-16 | Escribir `<b>negrita</b>` en un comentario o campo de la ficha. | Se ve como texto, sin formato. | ☐ |
| SEG-17 | En phpMyAdmin, revisar la columna `pass_hash` de `users`. | Contiene un hash que empieza con `$2y$`, nunca la contraseña. | ☐ |
| SEG-18 | Revisar la cookie de sesión en F12 → Application → Cookies. | Marcada **HttpOnly** y SameSite **Lax**. | ☐ |
| SEG-19 | Iniciar sesión dos veces y comparar el identificador de la cookie `PHPSESSID`. | Cambia en cada inicio de sesión. | ☐ |
| SEG-20 | Provocar un error de base de datos (apagar MySQL) y usar el sistema. | Mensaje genérico; no se ven consultas ni rutas del servidor. | ☐ |
| SEG-21 | Abrir `api/install.php`. | Ya no debe existir (error 404). | ☐ |

## 11. Concurrencia, integridad y eliminación

| ID | Pasos | Resultado esperado | Res. |
|---|---|---|---|
| INT-01 | Abrir la misma ficha en dos navegadores (por ejemplo JEFA en uno y DOC1 en incógnito). En el primero editar un campo y esperar «Guardado ✓». En el segundo editar y esperar. | El segundo muestra «Otra persona modificó esta ficha…»; no sobrescribe los cambios del primero. | ☐ |
| INT-02 | Tras el aviso, cerrar y reabrir la ficha en el segundo navegador. | Ve los cambios del primero y puede seguir editando. | ☐ |
| INT-03 | JEFA elimina una ficha con comentarios. | Desaparece de la lista; en phpMyAdmin, `retro` ya no tiene sus comentarios. | ☐ |
| INT-04 | DOC1 intenta eliminar una ficha. | No existe el botón **Eliminar** (solo la jefa). | ☐ |
| INT-05 | Intentar crear dos fichas con el mismo RUN desde dos navegadores casi a la vez. | Solo se crea una; la otra recibe el error de RUN existente (restricción UNIQUE). | ☐ |
| INT-06 | Revisar en phpMyAdmin que `fichas.creado_por` apunte al usuario que creó cada ficha. | Coincide con la columna «Creada por» de la pantalla. | ☐ |

## 12. Registro de resultados y defectos

| Fecha | Versión / fecha de los archivos | Responsable | Casos ejecutados | Aprobados | Fallidos |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

Defectos encontrados:

| N° | Caso | Descripción del problema | Severidad (alta / media / baja) | Estado |
|---|---|---|---|---|
|  |  |  |  |  |

## 13. Criterios de aceptación

- Todos los casos de las secciones 3, 5, 6, 8 y 10 aprobados (acceso, permisos y seguridad no admiten fallas).
- Todos los cálculos de la sección 7 coinciden con los valores esperados.
- Ningún defecto de severidad alta abierto.
- Los casos críticos (AUT-01, FIC-08, SEG-02, SEG-05, INT-01) repetidos en un segundo navegador.

## 14. Trazabilidad con los casos de uso

| Caso de uso | Casos de prueba |
|---|---|
| CU-01 Iniciar sesión | AUT-01 a AUT-08, AUT-11, AUT-12 |
| CU-02 Cerrar sesión | AUT-09, AUT-10 |
| CU-03 Gestionar usuarios | USR-01 a USR-15 |
| CU-04 Gestionar permisos | PER-01 a PER-08 |
| CU-05 Ingresar paciente | FIC-01 a FIC-07 |
| CU-06 Buscar paciente | FIC-08 a FIC-13 |
| CU-07 Registrar y editar ficha | EDI-01 a EDI-27, EST-06 |
| CU-08 Archivar para revisión | EST-01 a EST-03, EST-07 |
| CU-09 Archivar o reabrir | EST-04, EST-05 |
| CU-10 Revisar ficha y creador | FIC-14 a FIC-16 |
| CU-11 Retroalimentación | RET-01 a RET-05 |
| CU-12 Rúbrica | RET-06 a RET-10 |
| CU-13 PDF | PDF-01, PDF-02 |
| CU-14 Listado por asignatura | FIC-17, FIC-18, PDF-03 |
| CU-15 Eliminar ficha | INT-03, INT-04 |
| Reglas de negocio y seguridad | SEG-01 a SEG-21, INT-01 a INT-06 |
