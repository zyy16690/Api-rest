// server.js

const express = require('express');
const path = require('path');
require('dotenv').config(); // Untuk memuat variabel dari .env

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'SKYZO_DEFAULT_KEY'; // Gunakan API Key dari .env atau default

// --- Konfigurasi Express ---

// Set EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk melayani file statis (seperti CSS, JS, Gambar)
// Dalam konteks ini, kita akan menggunakan CDN Bootstrap, jadi mungkin tidak terlalu perlu,
// tetapi ini adalah praktik yang baik.
// app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk parsing body JSON dan URL-encoded (untuk API)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Global Data (Untuk Apikey) ---

// Definisikan global.apikey (sesuai kebutuhan fungsi API Anda)
global.apikey = [API_KEY, 'another_key_if_needed'];
// Definisikan global.fetch (jika Anda menggunakan Node.js versi lama)
if (typeof global.fetch === 'undefined') {
    global.fetch = require('node-fetch');
}


// --- Routes Utama (Web Pages) ---

// Route Landing Page / Get Started
app.get('/', (req, res) => {
    const apiRoutes = require('./routes/orderkuota');
    res.render('documentation', {
        title: 'API Documentation',
        routes: apiRoutes,
        hostUrl: `http://localhost:${PORT}`
    });
});

// Route Dokumentasi
app.get('/documentation', (req, res) => {
    const apiRoutes = require('./routes/orderkuota');
    res.render('documentation', {
        title: 'API Documentation',
        routes: apiRoutes,
        hostUrl: `http://localhost:${PORT}`
    });
});

// --- API Routes ---

const orderKuotaRoutes = require('./routes/orderkuota');

// Loop melalui array routes dari orderkuota.js dan daftarkan sebagai route Express
orderKuotaRoutes.forEach(route => {
    // Menambahkan apikey= di path untuk dokumentasi yang lebih jelas, tapi route express tidak peduli
    // Kita akan menggunakan route.path aslinya, misal: /orderkuota/getotp
    const routePath = route.path.split('?')[0];

    app.get(routePath, async (req, res) => {
        try {
            // Jalankan fungsi run dari route
            await route.run(req, res);
        } catch (error) {
            console.error(`Error in route ${route.name}:`, error.message);
            res.status(500).json({ 
                status: false, 
                error: 'Internal Server Error',
                detail: error.message 
            });
        }
    });
});

// --- Server Listener ---

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
