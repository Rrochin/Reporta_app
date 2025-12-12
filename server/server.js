
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

//Middleware
app.use(cors()); 
app.use(bodyParser.json()); 

//Base de datos 
let reports = [
    { 
        id: 1, 
        title: 'Bache Peligroso', 
        summary: 'Se requiere reparación urgente en la calle principal.', 
        location: 'Av. Libertador, Sector 5 (Lat: -34.6037, Lon: -58.3816)', 
        latitude: -34.6037, 
        longitude: -58.3816,
        category: 'Infraestructura', 
        photo_url: 'https://via.placeholder.com/400x200/5095e0/FFFFFF?text=FOTO+BACHEP',
        status: 'Pendiente', 
        date: new Date().toISOString()
    },
    { 
        id: 2, 
        title: 'Lámpara Fundida', 
        summary: 'La luminaria de la esquina lleva 3 días apagada, afecta la seguridad.', 
        location: 'Calle 10 esq. Mitre (Lat: -34.6137, Lon: -58.3916)', 
        latitude: -34.6137, 
        longitude: -58.3916,
        category: 'Alumbrado', 
        photo_url: 'https://via.placeholder.com/400x200/5095e0/FFFFFF?text=FOTO+ALUMBRADO',
        status: 'En Progreso', 
        date: new Date().toISOString()
    },
];
let nextId = 3; 

// api

//Obtiene todos los reportes.
app.get('/api/reports', (req, res) => {
    res.status(200).json(reports);
});

//Crea un nuevo reporte.
app.post('/api/reports', (req, res) => {
    const { title, summary, location, photo_url, latitude, longitude, category } = req.body;

    if (!title || !summary || !location || !photo_url) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el reporte.' });
    }

    const newReport = {
        id: nextId++,
        title,
        summary,
        location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        category: category || 'General',
        photo_url: photo_url, 
        status: 'Pendiente', 
        date: new Date().toISOString()
    };

    reports.unshift(newReport); 

    res.status(201).json({ 
        message: 'Reporte enviado con éxito.', 
        report: newReport 
    });
});

// Inicio
app.listen(PORT, () => {
    console.log(`🚀 Servidor 'Reporta API' corriendo en http://localhost:${PORT}`);
});