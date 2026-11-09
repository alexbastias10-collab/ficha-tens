-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-11-2026 a las 13:05:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ficha_tens`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichas`
--

CREATE TABLE `fichas` (
  `id` int(10) UNSIGNED NOT NULL,
  `rut` varchar(12) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `asignatura` varchar(120) NOT NULL,
  `estado` enum('abierta','archivada') NOT NULL DEFAULT 'abierta',
  `datos` longtext NOT NULL,
  `evaluacion` longtext NOT NULL,
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `creado_por` int(10) UNSIGNED DEFAULT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizada` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `fichas`
--

INSERT INTO `fichas` (`id`, `rut`, `nombre`, `asignatura`, `estado`, `datos`, `evaluacion`, `version`, `creado_por`, `creado`, `actualizada`) VALUES
(1, '12144221-1', 'juan moya', 'Podologia', 'archivada', '{\"vitales\":[],\"meds\":[],\"notas\":[],\"balance\":[],\"caso\":\"1\",\"fecha\":\"2026-11-04\",\"hora\":\"09:54\",\"estudiantes\":\"Martin Toro\",\"docente\":\"Alex\",\"grupo\":\"Grupo 1 \",\"rol\":\"Podologo\",\"nacimiento\":\"1984-02-04\",\"sexo\":\"Masculino\",\"civil\":\"divorciado\",\"ocupacion\":\"albañil\",\"educacion\":\"educacion media terminada\",\"domicilio\":\"la punta del cerro\",\"telefono\":\"+56 9 1037 8967\",\"contacto\":\"ex-mujer\",\"ingreso\":\"2026-11-01T12:18\",\"unidad\":\"ambulancia\",\"diagnostico\":\"cancer de prostata\",\"via\":\"2\",\"motivo\":\"sospecha de cancer de prostata\",\"morbidos\":\"dependencia alcoholica\",\"alergias\":\"alergia al sol\",\"medhab\":\"ibuprofeno y paracetamol\",\"familiares\":\"victima de abuso intrafamiliar\",\"tabaco\":\"positivo\",\"alcohol\":\"positivo\",\"sustancias\":\"metanfetamina\",\"actividad\":\"alta\",\"sueno\":\"6 horas de sueño al dia\",\"alimentacion\":\"alimentacion baja en vitaminas\",\"urinaria\":\"si\",\"intestinal\":\"si\",\"vacunas\":\"si\",\"autovalencia\":\"si\",\"peso\":\"87\",\"talla\":\"1.8\",\"cintura\":\"50\",\"conciencia\":\"Coma\",\"exam\":{\"0\":{\"estado\":\"Normal\"},\"1\":{\"estado\":\"Alterado\"},\"2\":{\"estado\":\"Normal\"},\"3\":{\"estado\":\"Normal\"},\"4\":{\"estado\":\"Normal\"},\"5\":{\"estado\":\"Alterado\"},\"6\":{\"estado\":\"Alterado\"},\"7\":{\"estado\":\"Alterado\"},\"8\":{\"estado\":\"Alterado\"}},\"disp\":{\"0\":{\"pres\":\"Sí\",\"fecha\":\"2026-11-02\"},\"1\":{\"pres\":\"No\",\"fecha\":\"2026-11-01\"},\"2\":{\"pres\":\"Sí\",\"fecha\":\"2026-11-01\"},\"3\":{\"pres\":\"Sí\",\"fecha\":\"2026-11-03\"},\"4\":{\"pres\":\"No\",\"fecha\":\"2026-11-03\"},\"5\":{\"pres\":\"No\",\"fecha\":\"2026-11-02\"}},\"problemas\":\"necesidad de quimioterapia\"}', '{}', 69, 2, '2026-11-04 12:53:49', '2026-11-04 13:03:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `retro`
--

CREATE TABLE `retro` (
  `id` int(10) UNSIGNED NOT NULL,
  `ficha_id` int(10) UNSIGNED NOT NULL,
  `autor_id` int(10) UNSIGNED DEFAULT NULL,
  `autor` varchar(120) NOT NULL,
  `texto` text NOT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `pass_hash` varchar(255) NOT NULL,
  `rol` enum('admin','docente','alumno') NOT NULL,
  `ver_fichas` tinyint(1) NOT NULL DEFAULT 0,
  `ingresar_pacientes` tinyint(1) NOT NULL DEFAULT 0,
  `retroalimentar` tinyint(1) NOT NULL DEFAULT 0,
  `gestionar_alumnos` tinyint(1) NOT NULL DEFAULT 0,
  `registrar_fichas` tinyint(1) NOT NULL DEFAULT 0,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `email`, `pass_hash`, `rol`, `ver_fichas`, `ingresar_pacientes`, `retroalimentar`, `gestionar_alumnos`, `registrar_fichas`, `creado`) VALUES
(1, 'Jefa de carrera', 'admin@cftohiggins.cl', '$2y$10$JhTzeDAoD4fqIuuQHHM8Oezz61L5KnL2DLpEeamwE/vSSW8OvmFWi', 'admin', 0, 0, 0, 0, 0, '2026-11-04 12:45:30'),
(2, 'martin toro', 'martintoro@gmail.com', '$2y$10$cLHJz4eW5ZyJXXyxj1CrGuHBzDCeYfuhCUQ9mhKx/AivR1s.fJe7m', 'alumno', 0, 0, 0, 0, 1, '2026-11-04 12:53:05'),
(3, 'Axel Guajardo', 'axelguajardo@tens.cftohiggins.cl', '$2y$10$lRr6V27GkVt4UVSItLQbROZtCxnEg8wPSJeTlKCP5NupnMWOwMbbi', 'docente', 1, 1, 1, 1, 0, '2026-11-06 12:48:40');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `fichas`
--
ALTER TABLE `fichas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `retro`
--
ALTER TABLE `retro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ficha_id` (`ficha_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `fichas`
--
ALTER TABLE `fichas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `retro`
--
ALTER TABLE `retro`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `fichas`
--
ALTER TABLE `fichas`
  ADD CONSTRAINT `fichas_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `retro`
--
ALTER TABLE `retro`
  ADD CONSTRAINT `retro_ibfk_1` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
