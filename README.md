# Proyecton8n

# Sistema Unificado de Registro y Seguimiento Automatizado en Plataformas Educativas

Este proyecto implementa un sistema multiagente inteligente orientado a la automatización del seguimiento y acompañamiento de usuarios en plataformas educativas, especialmente en contextos donde los estudiantes no asisten a clases sincrónicas. El sistema reproduce el comportamiento humano de ingreso a reuniones virtuales, recuperación de datos contextuales de la sesión y envío de reportes personalizados al correo electrónico del participante.

El flujo completo ha sido diseñado como una red de agentes autónomos que interactúan con Zoom, extraen información relevante del entorno virtual, y responden de forma personalizada, actuando como asistentes pedagógicos digitales.

---

## 🧠 Contexto de Automatización Multiagente

Cada componente del sistema está diseñado como un agente con funciones independientes:

- **Agente de Registro**: Ingresa a la sala Zoom y simula la presencia del usuario.
- **Agente de Extracción**: Recupera asistentes reales desde la plataforma.
- **Agente de Comparación**: Verifica quién no estuvo presente.
- **Agente de Comunicación**: Envía un correo con el resumen de la clase y actividades.
- **Agente Orquestador (n8n)**: Controla todo el flujo mediante un Webhook.

Este diseño bajo principios de sistemas multiagente (SMA) permite que el sistema sea escalable, distribuido, autónomo y colaborativo.

---

## 🧰 Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [Playwright](https://playwright.dev/)
- [n8n](https://n8n.io/)
- VNC + entorno gráfico en servidor remoto
- Servidor privado en **Azura Cloud**

---

## 🔧 Configuración del entorno en servidor

1. **Conexión al servidor**
   ```bash
   ssh emanuel@20.171.8.14

2. Limpieza previa del entorno gráfico

rm -f /tmp/.X1-lock
rm -f /tmp/.X11-unix/X1

3. Lanzar entorno gráfico con VNC

vncserver :1
echo $DISPLAY
export DISPLAY=:1

4. Ejecutar el servidor

node server.js

🔗 Webhook de Entrada
El flujo se inicia al recibir una petición POST en:

http://localhost:5678/webhook/formulario-campistas
Este endpoint recibe los datos del formulario del campista, activa los agentes, y ejecuta todo el flujo de simulación, recolección y envío del correo con el resumen personalizado de la clase.

