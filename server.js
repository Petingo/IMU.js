const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5500;

// Serve static files
app.use(express.static('.'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create self-signed certificate for HTTPS
const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Create HTTPS server
const server = https.createServer(options, app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running on https://localhost:${PORT}`);
    console.log('Note: You may need to accept the self-signed certificate in your browser');
});

// Generate self-signed certificate if it doesn't exist
const { exec } = require('child_process');
const certPath = path.join(__dirname, 'cert.pem');

if (!fs.existsSync(certPath)) {
    console.log('Generating self-signed certificate...');
    exec(`openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error generating certificate:', error);
            console.log('Please install OpenSSL or generate certificates manually');
        } else {
            console.log('Certificate generated successfully');
        }
    });
}
