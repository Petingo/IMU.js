import { App } from './App.js';
import { Logger } from './Logger.js';

// Initialize logger
const logger = Logger.getInstance();

// Create the main application instance
export const app = new App();

// Initialize the application
function initializeApp(): void {
    console.log('Initializing IMU.js application...');
    
    try {
        // Start the application
        app.start();
        console.log('Application started successfully');
    } catch (error) {
        console.error('Failed to start application:', error);
    }
}

// Handle page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('Cleaning up application...');
    app.destroy();
});

// Export the app instance for other modules to use
export default app;
