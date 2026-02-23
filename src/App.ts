import { SceneManager } from './SceneManager.js';
import { PhotoCaptureManager } from './PhotoCaptureManager.js';
import { GUIManager } from './GUI.js';
import { Logger } from './Logger.js';

export class App {
    private static instance: App;
    
    // Debug mode flag
    public debugMode: boolean = false;
    
    // Managers
    public sceneManager: SceneManager;
    public photoCaptureManager: PhotoCaptureManager;
    public guiManager: GUIManager;
    
    public constructor() {
        // Initialize managers
        this.photoCaptureManager = PhotoCaptureManager.getInstance();
        this.sceneManager = SceneManager.getInstance(this.photoCaptureManager);
        this.guiManager = GUIManager.getInstance(this);
        
        // Set up automatic control switching
        this.sceneManager.setControlSwitchCallback(() => this.onControlSwitch());
        
        // Set initial camera position based on debug mode
        this.updateCameraPositionForMode();
    }
    
    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }
    
    public activateDeviceTracker(): void {
        this.sceneManager.activateDeviceTracker();
    }
    
    public resetCamera(): void {
        const rotationParams = this.guiManager.getRotationParams();
        this.sceneManager.resetCamera(rotationParams.useDragControls);
    }
    
    public start(): void {
        this.sceneManager.start();
        console.log('App started');
    }
    
    public stop(): void {
        this.sceneManager.stop();
        console.log('App stopped');
    }
    
    public getPhotoCaptureManager(): PhotoCaptureManager {
        return this.photoCaptureManager;
    }
    
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
        this.updateCameraPositionForMode();
        console.log('Debug mode:', enabled ? 'enabled' : 'disabled');
    }
    
    public toggleDebugMode(): void {
        this.setDebugMode(!this.debugMode);
    }
    
    private updateCameraPositionForMode(): void {
        if (this.debugMode) {
            // Debug mode: camera at (0, 0, 30) for orbital view
            this.sceneManager.setCameraPosition(0, 0, 30);
        } else {
            // Normal mode: camera at (0, 0, 0) for immersive view
            this.sceneManager.setCameraPosition(0, 0, 0);
        }
    }
    
    private onControlSwitch(): void {
        // Only allow drag controls in debug mode
        if (!this.debugMode) {
            console.log('Drag controls disabled - not in debug mode');
            return;
        }
        
        // Update GUI to reflect that we're now using drag controls
        const rotationParams = this.guiManager.getRotationParams();
        rotationParams.useDragControls = true;
        console.log('GUI updated: switched to drag controls (debug mode)');
    }
    
    public destroy(): void {
        this.sceneManager.destroy();
        
        if (this.guiManager) {
            this.guiManager.destroy();
        }
        
        console.log('App destroyed');
    }
}