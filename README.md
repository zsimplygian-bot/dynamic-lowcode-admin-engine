# 🚀 Dynamic Low-Code Admin Engine

[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v1.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-InnoDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

> Motor de administración dinámico y extensible que transforma esquemas de base de datos en interfaces de usuario funcionales, eliminando el código repetitivo para acelerar el desarrollo de la lógica de negocio.

---

## 💡 Introducción

Este paquete/proyecto reduce el código repetitivo al construir paneles administrativos en Laravel y React. En lugar de configurar manualmente controladores, peticiones AJAX, paginación, filtros y formularios para cada entidad, abstrae estas interfaces rápidamente para concentrarse en la lógica propia de la aplicación.

---

## ✨ Características Principales

El sistema está diseñado para que todos los módulos funcionen a partir de la configuración e inspección de la base de datos (`SCHEMA`). A través del esquema, se extraen y cachean modelos, campos de formularios, reglas de validación y columnas de DataTables, permitiendo que bastes con definir una tabla para tener un módulo CRUD funcional automáticamente.

### Backend (Laravel + Inertia)
- **Controladores dinámicos vía Traits:** Infieren metadata directamente del esquema de la base de datos para construir reglas de validación, estructuras de formularios y columnas del DataTable.
- **Caché de configuración:** Las definiciones de formularios y tablas se entregan por API y se almacenan en caché para evitar consultas redundantes al esquema.

### Frontend (React + Tailwind)
- **Componentes "Smart":** UI declarativa y rápida mediante componentes base (Button, Modal, Tooltip, etc.).
- **Formularios e Inputs dinámicos:** Manejo dinámico de estados y selects (simples o asíncronos que consumen datos vía API bajo demanda).

---

## 🛠️ Stack Tecnológico

- **Backend:** Laravel 13 (Controladores, Traits, Inspección de BD)
- **Adaptador:** Inertia.js (Pasaje transparente de datos y estado desde el servidor)
- **Frontend:** React + TypeScript (Tipado estático en UI)
- **Estilos:** Tailwind CSS + Shadcn UI + Lucide Icons
- **Base de Datos:** MySQL (InnoDB)

---

## 🏗️ Arquitectura del Sistema

Diseñado bajo un enfoque pragmático, simple y escalable. Aplica el principio DRY en los componentes atómicos y mantiene la UI principal agrupada para evitar la sobreingeniería de abstracciones innecesarias. 

Como caso de uso base, está preconfigurado para un **sistema de administración veterinaria**, incluyendo las tablas relacionadas y modelos necesarios para demostrar la generación automática de módulos.

---

## 🏗️ Preview

La base de datos es la única fuente de verdad para el armado principal de los módulos, modificas la tabla y el resto se actualiza solo, solo se debe limpiar el caché:
- **Configuración de tabla:**.
<img width="1916" height="937" alt="Captura de pantalla 2026-10-02 124019" src="https://github.com/user-attachments/assets/315e3c77-3453-4ae8-8550-bb0abc954b0d" />

- **Vista previa de datatable**.
<img width="1596" height="280" alt="Captura de pantalla 2026-10-02 124219" src="https://github.com/user-attachments/assets/a42540a7-7538-45c6-8e25-342118213182" />

- **Vista previa de formulario**.
<img width="672" height="927" alt="Captura de pantalla 2026-10-02 124329" src="https://github.com/user-attachments/assets/9497bb55-2fc6-4dbb-8758-47646c5d7d7f" />

