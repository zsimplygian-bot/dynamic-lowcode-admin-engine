# 🚀 Dynamic Low-Code Admin Engine

[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v1.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-InnoDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

> Motor de administración dinámico y extensible que transforma esquemas de base de datos en interfaces de usuario funcionales, eliminando el código repetitivo para acelerar el desarrollo del núcleo de negocio.

---

## 💡 Introducción

Este paquete/proyecto reduce el código repetitivo al construir paneles administrativos en Laravel y React. En lugar de configurar manualmente controladores, peticiones AJAX, paginación, filtros y formularios para cada entidad, permite abstraer estas interfaces rápidamente para concentrarse en la lógica de negocio.

**Dynamic Low-Code Admin Engine** nace para romper ese ciclo. Inspeccionando en tiempo real la estructura de la base de datos (`information_schema`), el sistema genera automáticamente:
- Formularios interactivos con tipos de entrada adaptativos.
- Tablas dinamizadas con ordenamiento, búsqueda global y paginación.
- Filtros automáticos basados en tipos de datos y mapeo nativo de tipos `enum`.

Esto permite pasar de una migración de base de datos a un módulo completamente operativo en minutos, manteniendo total flexibilidad para sobreescribir o personalizar cuando la regla de negocio lo requiera.

---

## ✨ Características Principales

- ⚡ **Dynamic Schema Engine:** Deducción automática de vistas, campos, validaciones y filtros basados en la estructura viva de la base de datos sin depender de archivos de configuración estáticos.
- 📦 **Mapeo Inteligente de Tipos:** Detección automática de tipos `enum`, cadenas, números, fechas y textos largos, renderizando los componentes de UI adecuados (selects, inputs, textareas).
- 🛡️ **Protección y Sincronización de Datos Granular:** Trait `HasProtectedTables` y controlador con opción de respaldo e importación inteligente (`keep_protected`), permitiendo sincronizar estructuras entre entorno local y producción sin riesgo de sobrescribir usuarios, roles o sesiones activas.
- 🧩 **Librería de Componentes `SmartUI`:** Conjunto de componentes reutilizables sobre Shadcn UI (`SmartButton`, `SmartTable`, `SmartModal`, `SmartTooltip`, `SmartDropdown`) diseñados para mantener una coherencia visual y comportamiento fluido en toda la app.
- 🎨 **Tema Dinámico Nativo:** Soporte integrado para modo claro y oscuro con persistencia en el navegador.
- ⚡ **Arquitectura Monolítica Moderna (Inertia + React):** La velocidad y fluidez de una SPA (Single Page Application) sin la complejidad de gestionar APIs REST dedicadas o tokens JWT adicionales.

---

## 🛠️ Stack Tecnológico

- **Backend:** Laravel 13 (Controladores, Traits, Inspección de BD)
- **Adaptador:** Inertia.js (Paso transparente de props y estado del servidor al cliente)
- **Frontend:** React + TypeScript (Tipado estático en UI)
- **Estilos y UI:** Tailwind CSS + Shadcn UI + Lucide Icons
- **Base de Datos:** MySQL (Motor InnoDB)

---

## 🏗️ Arquitectura del Sistema