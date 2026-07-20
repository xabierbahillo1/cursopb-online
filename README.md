# Plataforma de Cursos Programación

## Descripción del Proyecto

Este proyecto es una aplicación web de **e-learning** construida con **React**. Su objetivo es proporcionar una experiencia de aprendizaje interactiva, con un enfoque en **ejercicios de programación** y contenido técnico.

**Actualmente, la plataforma está siendo utilizada para impartir un Curso de Programación Básica, disponible en: [https://cursoprogramacionbasica.es](https://cursoprogramacionbasica.es).**

La plataforma incluye las siguientes características:

* **Estructura de Cursos:** El contenido se organiza en **módulos** y **lecciones** (`CourseContainer.js`).
* **Diversidad de Contenido:** Soporte para diferentes tipos de lecciones como **contenido explicativo**, **cuestionarios (quiz)**, **encuestas (survey)** y, fundamentalmente, **ejercicios de código** (`LessonContent.js`).
* **Editor de Código Interactivo:** Los ejercicios prácticos utilizan un **editor de código** integrado (`CodeEditor.js`) que permite a los usuarios escribir, ejecutar, guardar y resetear su solución, con funcionalidades como la persistencia local y sincronización con un backend.
* **Evaluación de Ejercicios:** Cada ejercicio tiene un sistema de evaluación (`Exercise.js`, `FinalExerciseScreen.js`) que ejecuta pruebas y muestra los resultados y una puntuación final.
* **Renderizado de Matemáticas:** Capacidad para mostrar fórmulas y ecuaciones matemáticas complejas utilizando la notación **LaTeX/KaTeX** (`LatexRenderer.js`, `LessonViewer.js`).
* **Autenticación y Progreso:** Los usuarios pueden autenticarse mediante Firebase y el progreso de las lecciones completadas y el código de los ejercicios se guarda y sincroniza (`AuthButton.js`, `ProgressService`).
* **Reporte de Problemas:** Se incluye un enlace para que los usuarios puedan reportar errores fácilmente por correo electrónico (`BugReportLink.js`).

---

## 🚀 Cómo Empezar

Para configurar el proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/xabierbahillo1/cursopb-online.git
    cd cursopb-online
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configuración de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura las variables necesarias a partir de `.env.example`

---

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`

Ejecuta la aplicación en el modo de desarrollo.
Abre **[http://localhost:3000](http://localhost:3000)** para verla en tu navegador.

### `npm run build`

Compila la aplicación para **producción** en la carpeta `build`.