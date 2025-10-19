import { GUI } from 'lil-gui';
import { App } from './App';

export class GUIManager {
    private static instance: GUIManager;
    private gui: GUI;
    private app: App;
    
    // GUI parameters
    private rotationParams = {
        x: 0,
        y: 0,
        z: 0,
        activateTracker: () => this.activateTracker(),
        useDragControls: true
    };
    
    private debugParams = {
        resetCamera: () => this.resetCamera(),
        showDebugInfo: false
    };
    
    private constructor(app: App) {
        this.app = app;
        this.gui = new GUI();
        this.setupGUI();
    }
    
    public static getInstance(app: App): GUIManager {
        if (!GUIManager.instance) {
            GUIManager.instance = new GUIManager(app);
        }
        return GUIManager.instance;
    }
    
    private setupGUI(): void {
        // Rotation controls
        const rotationFolder = this.gui.addFolder('Rotation Controls');
        rotationFolder.add(this.rotationParams, 'x', -Math.PI, Math.PI, 0.01).name('X Rotation');
        rotationFolder.add(this.rotationParams, 'y', -Math.PI, Math.PI, 0.01).name('Y Rotation');
        rotationFolder.add(this.rotationParams, 'z', -Math.PI, Math.PI, 0.01).name('Z Rotation');
        rotationFolder.add(this.rotationParams, 'activateTracker').name('Activate Device Tracker');
        rotationFolder.add(this.rotationParams, 'useDragControls').name('Use Drag Controls');
        
        // Debug controls
        const debugFolder = this.gui.addFolder('Debug Controls');
        debugFolder.add(this.debugParams, 'resetCamera').name('Reset Camera');
        debugFolder.add(this.debugParams, 'showDebugInfo').name('Show Debug Info');
        
        // Open folders by default
        rotationFolder.open();
        debugFolder.open();
    }
    
    private activateTracker(): void {
        console.log('Activating device tracker...');
        this.app.activateDeviceTracker();
    }
    
    private resetCamera(): void {
        console.log('Resetting camera...');
        this.app.resetCamera();
    }
    
    public getRotationParams() {
        return this.rotationParams;
    }
    
    public getDebugParams() {
        return this.debugParams;
    }
    
    public updateRotation(x: number, y: number, z: number): void {
        this.rotationParams.x = x;
        this.rotationParams.y = y;
        this.rotationParams.z = z;
    }
    
    public destroy(): void {
        if (this.gui) {
            this.gui.destroy();
        }
    }
}
