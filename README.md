# Ficha clínica de simulación TENS · CFT O'Higgins

Aplicación web para registrar fichas clínicas de **pacientes simulados** en las experiencias de simulación de la carrera de Técnico en Enfermería de Nivel Superior (TENS). Reemplaza la planilla `Ficha_Clinica_Simulacion_TNS.xlsx` por un sistema con usuarios, roles, permisos, búsqueda, retroalimentación docente y exportación a PDF.

> **Estado:** en desarrollo, funcionando en entorno local (XAMPP). Los datos clínicos son **ficticios**; el sistema no almacena archivos adjuntos.

## Qué hace

- **Inicio de sesión** con correo institucional (ej. `maria@tens.cftohiggins.cl`) y contraseña.
- **Tres roles** con permisos configurables: jefa de carrera, docente y estudiante.
- **Ficha clínica única por paciente** (identificada por RUN), con las secciones de la planilla:
  ingreso, examen físico, dispositivos, signos vitales, medicamentos (5 correctos), notas de enfermería, balance hídrico y escalas Glasgow, Braden y Downton.
- **Cálculos automáticos:** edad, IMC, presión arterial media, alertas por valores fuera de rango, verificación de los 5 correctos, balance hídrico acumulado e interpretación de escalas.
- **Autoguardado** mientras se escribe y aviso si otra persona modificó la misma ficha.
- **Búsqueda** por nombre o RUN, filtro por estado (abierta o archivada) y, para docentes y jefatura, filtro por creador.
- **Archivado de fichas** para que el docente las revise después.
- **Retroalimentación:** comentarios del docente y rúbrica de 12 criterios con nota de 1,0 a 7,0 (60 % de exigencia).
- **Listado por asignatura** y **descarga de la ficha en PDF** (desde la impresión del navegador).

## Roles

| Rol | Qué puede hacer |
|---|---|
| **Jefa de carrera** | Todo: usuarios, permisos, ver todas las fichas con su creador, retroalimentar, reportes y eliminar fichas. |
| **Docente** | Según los permisos que se le asignen: ver fichas, ingresar pacientes y editar, retroalimentar y evaluar, y gestionar estudiantes. Ve todas las fichas y quién las creó. |
| **Estudiante** | Ingresa pacientes y registra en **sus propias fichas**. No ve las fichas de sus compañeros. Puede archivarlas para revisión. |

Los permisos se asignan desde el botón **Permisos** (solo jefatura) y se validan siempre en el servidor. El detalle completo está en [`docs/casos-de-uso.md`](docs/casos-de-uso.md).

## Tecnologías

- **Cliente:** HTML, CSS y JavaScript (sin frameworks).
- **Servidor:** PHP 8.x sobre Apache.
- **Base de datos:** MySQL / MariaDB (acceso con PDO y consultas preparadas).
- **Entorno de desarrollo:** XAMPP en Windows.

## Estructura del proyecto

```
ficha-tens/
├── index.html          Inicio de sesión
├── panel.html          Panel principal (fichas, reporte, usuarios)
├── style.css           Estilos generales y del login
├── panel.css           Estilos del panel, la ficha y la impresión (PDF)
├── script.js           Lógica del login
├── panel.js            Lógica del panel
├── ficha.js            Editor de la ficha clínica y cálculos
├── api.js              Cliente de la API (fetch) y utilidades
├── api/
│   ├── config.php      Conexión a la base de datos y sesión
│   ├── index.php       API: login, usuarios, permisos, fichas, retroalimentación
│   └── install.php     Instalador (crear BD y cuenta de jefatura; borrar después)
├── docs/
│   ├── diagrama-er.md      Modelo de datos
│   ├── arquitectura.md     Arquitectura y rutas de la API
│   ├── despliegue.md       Entornos y paso a un servidor
│   ├── casos-de-uso.md     Casos de uso descritos y matriz de permisos
│   └── checklist-seguridad.md  Estado de seguridad y pendientes
└── README.md
```

## Instalación en local (XAMPP)

**Requisitos:** XAMPP con Apache, MySQL (MariaDB) y PHP 8.x.

1. **Encender XAMPP.** En el Panel de Control, pulsa *Start* en **Apache** y **MySQL** (deben quedar en verde).
2. **Copiar el proyecto** a `C:\xampp\htdocs\ficha-tens\`, manteniendo la subcarpeta `api\`.
3. **Revisar la conexión** en `api/config.php`. Con XAMPP por defecto no hay que cambiar nada:
   ```php
   const DB_HOST = '127.0.0.1';
   const DB_NAME = 'ficha_tens';
   const DB_USER = 'root';
   const DB_PASS = '';
   ```
4. **Crear la base de datos.** Abre `http://localhost/ficha-tens/api/install.php`. Crea la base `ficha_tens`, las tablas `users`, `fichas` y `retro`, y la cuenta de jefatura. Verás algo así:
   ```
   Correo: admin@cftohiggins.cl
   Contraseña: a1b2c3d4e5
   ```
   **Anota la contraseña:** no se vuelve a mostrar.
5. **Borrar `api/install.php`.** Una vez creada la base, elimínalo.
6. **Entrar** a `http://localhost/ficha-tens/` con la cuenta de jefatura.

> **Advertencia:** `install.php?reset=1` **borra todas las tablas** y las vuelve a crear. Úsalo solo en desarrollo, cuando cambie la estructura de la base y no necesites conservar datos.

### Primer uso

1. Como jefa de carrera, entra a **Usuarios** y crea un docente y un estudiante.
2. Revisa el botón **Permisos** para ajustar lo que puede hacer cada uno.
3. Entra como estudiante, pulsa **Ingresar paciente** y completa la ficha.
4. Entra como docente, revisa la ficha, deja un comentario y evalúa con la rúbrica.

## Problemas comunes

| Síntoma | Qué revisar |
|---|---|
| «Failed to fetch» al iniciar sesión | Estás abriendo el archivo con doble clic o con otro servidor. Usa siempre `http://localhost/ficha-tens/` con Apache encendido. |
| Apache no inicia | Puerto 80 ocupado. Cambia `Listen 80` por `Listen 8080` en `httpd.conf` y entra con `http://localhost:8080/ficha-tens/`. |
| «Error del servidor» | MySQL apagado o base de datos sin crear. Revisa el Panel de XAMPP y repite el paso 4. Más detalle en `C:\xampp\apache\logs\error.log`. |
| «Correo o contraseña incorrectos» | Revisa que estés usando la contraseña que mostró `install.php`. |
| El panel queda en blanco y «Salir» no responde | Mezcla de versiones de los archivos JS. Verifica que `api.js`, `ficha.js` y `panel.js` sean los actuales y recarga con **Ctrl + F5**. |
| Cambios que no se ven | El navegador guardó versiones antiguas: recarga con **Ctrl + F5**. |

Para diagnosticar, abre las herramientas del navegador con **F12** y revisa la pestaña *Console* y *Network*.

## Documentación

| Documento | Contenido |
|---|---|
| [`Documentación/01-diagrama-er.md`](docs/diagrama-er.md) | Diagrama entidad-relación y descripción de las tablas. |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Arquitectura en capas, rutas de la API y flujo de guardado. |
| [`docs/despliegue.md`](docs/despliegue.md) | Diagrama de despliegue y pasos para pasar de XAMPP a un servidor. |
| [`docs/casos-de-uso.md`](docs/casos-de-uso.md) | Casos de uso descritos, reglas de negocio y pendientes con el cliente. |
| [`docs/checklist-seguridad.md`](docs/checklist-seguridad.md) | Medidas implementadas y lista de pendientes antes de producción. |

Los diagramas están en formato Mermaid: se ven directamente en GitHub y en VS Code con la extensión *Markdown Preview Mermaid Support*.

## Seguridad (resumen)

Implementado: contraseñas con bcrypt, consultas SQL preparadas, cookie de sesión `httponly` y `SameSite`, permisos verificados en el servidor, validación de datos, escape de salida contra XSS y control de versiones contra ediciones simultáneas.

**Antes de usarlo fuera del equipo de desarrollo** faltan, entre otras cosas: HTTPS con cookie `secure`, límite de intentos de login, un usuario de base de datos con privilegios mínimos (en lugar de `root`), registro de auditoría, respaldos y revisión legal. La lista completa está en [`docs/checklist-seguridad.md`](docs/checklist-seguridad.md).

## Limitaciones y pendientes

- Los rangos de signos vitales, los cortes de las escalas y la fórmula de la nota provienen de la planilla y de criterios habituales; deben validarse con la institución. Hoy están fijos en `ficha.js`.
- La ficha es única por RUN y cada estudiante solo ve las suyas: si dos estudiantes necesitan el mismo paciente, solo uno puede tener la ficha. Falta definir cómo resolverlo.
- Podología: el informe del cliente la menciona, pero la planilla entregada es de enfermería; hoy todos usan la misma ficha.
- No hay cambio ni recuperación de contraseña por parte del usuario.
- Las tipografías se cargan desde Google Fonts.
- Más detalle en `docs/casos-de-uso.md` y `docs/checklist-seguridad.md`.
