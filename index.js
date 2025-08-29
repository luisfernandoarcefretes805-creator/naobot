// Cargar variables de entorno
require('dotenv').config();

// Dependencias
const express = require('express');
const { CronJob } = require('cron');
const axios = require('axios');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 3001;

// La URL de tu app principal (NaoClips) que leeremos de las variables de entorno
const TARGET_URL = process.env.NAOCLIPS_URL;
const PING_SECRET = process.env.PING_SECRET; // Un secreto para validar los pings

// 1. Endpoint para RECIBIR pings de NaoClips
app.get('/ping/:secret', (req, res) => {
    // Verificamos que el ping venga con el secreto correcto
    if (req.params.secret !== PING_SECRET) {
        console.warn('⚠️ Intento de ping con secreto incorrecto.');
        return res.status(403).send('Acceso denegado.');
    }

    console.log(`✅ Ping recibido de NaoClips a las ${new Date().toLocaleTimeString()}`);
    res.status(200).send('Pong desde Pinger Bot!');
});


// 2. Función para ENVIAR pings a NaoClips
const sendPing = async () => {
    if (!TARGET_URL || !PING_SECRET) {
        console.log('ℹ️ No se ha configurado NAOCLIPS_URL o PING_SECRET. El ping está desactivado.');
        return;
    }
    try {
        const url_completa = `${TARGET_URL}/ping/${PING_SECRET}`;
        console.log(`PING --> Enviando ping a NaoClips en ${url_completa}`);
        await axios.get(url_completa);
        console.log(`PONG <-- Respuesta recibida de NaoClips.`);
    } catch (error) {
        console.error(`❌ Error al enviar el ping a NaoClips: ${error.message}`);
    }
};

// 3. Tarea programada (Cron Job) para ejecutar la función `sendPing`
// Se ejecuta cada 14 minutos para estar dentro del límite de 15 min de Render.
const job = new CronJob(
    '*/14 * * * *', // Cron sintaxis para "cada 14 minutos"
    sendPing,
    null,
    true, // Iniciar el job inmediatamente
    'America/Asuncion' // Tu zona horaria
);

console.log(`🚀 Pinger Bot iniciado. Pingueando a ${TARGET_URL} cada 14 minutos.`);
// LÍNEA NUEVA (CORRECTA)
console.log(`▶️ El próximo ping será a las: ${job.nextDate().toJSDate().toLocaleTimeString()}`);


// Iniciar el servidor
app.listen(PORT, () => console.log(`🎧 Servidor Pinger Bot escuchando en el puerto ${PORT}`));
