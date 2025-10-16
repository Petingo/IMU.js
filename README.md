# IMU.js

A Three.js-based device orientation controls application with TypeScript support and HTTPS server.

## Features

- Device orientation controls using Three.js
- TypeScript implementation
- HTTPS server on port 5500
- Transparent logger overlay for console messages
- Real-time device orientation tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript files:
```bash
npm run build
```

3. Start the HTTPS server:
```bash
npm start
```

4. Open your browser and navigate to `https://localhost:5500`
   - You may need to accept the self-signed certificate
   - For iOS devices, you'll need to grant permission for device orientation

## Development

- Run `npm run build:watch` for automatic TypeScript compilation
- The logger overlay will show all console.log, console.error, console.warn, and console.info messages
- Logger is positioned at the bottom of the screen with a transparent background

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (generated)
- `server.js` - Node.js HTTPS server
- `index.html` - Main HTML file
- `styles/main.css` - CSS styles including logger styles
