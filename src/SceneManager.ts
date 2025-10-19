import * as THREE from 'three';
import { DeviceOrientationControls } from './DeviceOrientationControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnchorManager } from './AnchorManager.js';
import { PhotoCaptureManager } from './PhotoCaptureManager.js';
import { App } from './App.js';

export class SceneManager {
    private static instance: SceneManager;
    
    // Core Three.js components
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    
    // Managers
    public anchorManager: AnchorManager;
    private photoCaptureManager: PhotoCaptureManager;
    
    // Controls
    public orbitControls: OrbitControls | null = null;
    public deviceOrientationControls: DeviceOrientationControls | null = null;
    
    // Animation
    private animationId: number | null = null;
    private isRunning: boolean = false;
    
    // Drag detection
    private isDragging: boolean = false;
    private dragStartTime: number = 0;
    private onControlSwitch: (() => void) | null = null;
    
    // Window size
    private windowSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    private constructor(photoCaptureManager: PhotoCaptureManager) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.windowSize.width / this.windowSize.height, 0.1, 1000);
        this.camera.position.set(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.windowSize.width, this.windowSize.height);
        document.body.appendChild(this.renderer.domElement);
        
        // Initialize managers
        this.anchorManager = AnchorManager.getInstance();
        this.photoCaptureManager = photoCaptureManager;
        
        this.setupEventListeners();
        this.setupScene();
        this.setupControls();
    }
    
    public static getInstance(photoCaptureManager: PhotoCaptureManager): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager(photoCaptureManager);
        }
        return SceneManager.instance;
    }
    
    private setupEventListeners(): void {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    private setupScene(): void {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(15, 16, 8);
        const material = new THREE.PointsMaterial({ color: 0x888888 });
        const sphere = new THREE.Points(geometry, material);
        this.scene.add(sphere);
        
        // Create anchor points
        this.anchorManager.createAnchorPoints(this.scene);
        
        // Request camera access
        this.photoCaptureManager.requestCameraAccess();
    }
    
    private setupControls(): void {
        // Initialize OrbitControls for drag control
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enablePan = false;
        this.orbitControls.enableRotate = true;
        this.orbitControls.target.set(0, 0, 0);
        this.orbitControls.maxDistance = 50;
        this.orbitControls.minDistance = 5;
        
        // Configure mouse buttons
        this.orbitControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        // Configure touch controls
        this.orbitControls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        
        console.log('OrbitControls initialized');
        
        // Add drag event listeners for automatic control switching
        this.setupDragDetection();
    }
    
    public setControlSwitchCallback(callback: () => void): void {
        this.onControlSwitch = callback;
    }
    
    private setupDragDetection(): void {
        if (!this.orbitControls) return;
        
        // Listen for mouse/touch events on the renderer
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            if (this.deviceOrientationControls && this.deviceOrientationControls.enabled) {
                // Check if debug mode is enabled before allowing drag controls
                const app = App.getInstance();
                if (app.debugMode) {
                    console.log('Mouse down detected while device tracker is active - switching to drag controls (debug mode)');
                    this.switchToDragControls();
                } else {
                    console.log('Mouse down detected but drag controls disabled - not in debug mode');
                }
            }
        });
        
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            if (this.deviceOrientationControls && this.deviceOrientationControls.enabled) {
                // Check if debug mode is enabled before allowing drag controls
                const app = App.getInstance();
                if (app.debugMode) {
                    console.log('Touch start detected while device tracker is active - switching to drag controls (debug mode)');
                    this.switchToDragControls();
                } else {
                    console.log('Touch start detected but drag controls disabled - not in debug mode');
                }
            }
        });
        
        // Track drag state for debugging
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (event.buttons > 0) {
                this.isDragging = true;
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', (event) => {
            this.isDragging = false;
        });
    }
    
    private switchToDragControls(): void {
        // Preserve current camera rotation before switching
        const currentQuaternion = this.camera.quaternion.clone();
        const currentRotation = this.camera.rotation.clone();
        
        console.log('Preserving camera rotation:', {
            quaternion: currentQuaternion,
            rotation: currentRotation
        });
        
        if (this.deviceOrientationControls) {
            this.deviceOrientationControls.disconnect();
            this.deviceOrientationControls = null;
        }
        
        if (this.orbitControls) {
            this.orbitControls.enabled = true;
            
            // Keep camera position at (0, 0, 0)
            this.camera.position.set(0, 0, 0);
            
            // Preserve the camera's rotation from the previous frame
            this.camera.quaternion.copy(currentQuaternion);
            this.camera.rotation.copy(currentRotation);
            
            // Set target at the center (0, 0, 0) for OrbitControls
            this.orbitControls.target.set(0, 0, 0);
            this.orbitControls.update();
            
            console.log('Camera rotation preserved:', this.camera.rotation);
            console.log('OrbitControls target set to center');
        }
        
        // Notify the App to update GUI state
        if (this.onControlSwitch) {
            this.onControlSwitch();
        }
        
        console.log('Switched to drag controls - rotation preserved');
    }
    
    public activateDeviceTracker(): void {
        console.log('Activating device tracker...');
        
        // Disable orbit controls
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
        
        // Enable device orientation controls
        this.deviceOrientationControls = new DeviceOrientationControls(this.camera);
        this.deviceOrientationControls.connect();
        
        // Reset camera position to center for device orientation
        // This is the expected behavior for device tracker
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
        
        console.log('Device tracker activated - camera positioned at center');
        
        // Start device orientation tracking
        this.photoCaptureManager.startDeviceOrientationTracking(this.camera);
    }
    
    public setCameraPosition(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
        console.log('Camera position set to:', this.camera.position);
    }
    
    public resetCamera(useDragControls: boolean = true): void {
        // Always keep camera at center (0, 0, 0)
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
        
        if (useDragControls && this.orbitControls) {
            this.orbitControls.target.set(0, 0, 0);
            this.orbitControls.update();
        }
        
        console.log('Camera reset to center');
    }
    
    public start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
        console.log('SceneManager started');
    }
    
    public stop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isRunning = false;
        console.log('SceneManager stopped');
    }
    
    private animate(): void {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.orbitControls && this.orbitControls.enabled) {
            this.orbitControls.update();
        }
        
        if (this.deviceOrientationControls) {
            this.deviceOrientationControls.update();
        }
        
        // Update anchor alignment and photo capture
        this.anchorManager.updateAlignment(this.camera, this.photoCaptureManager.getCameraState());
        this.anchorManager.updatePhotoCapture(
            this.photoCaptureManager.getCameraState(),
            () => this.photoCaptureManager.capturePhoto(),
            (anchor, imageData) => {
                // Remove old image if it exists
                if (anchor.imageMesh) {
                    this.scene.remove(anchor.imageMesh);
                }
                this.photoCaptureManager.renderImageOnAnchor(anchor, imageData, this.scene);
            }
        );
        
        this.renderer.render(this.scene, this.camera);
    }
    
    private onWindowResize(): void {
        this.windowSize.width = window.innerWidth;
        this.windowSize.height = window.innerHeight;
        
        this.camera.aspect = this.windowSize.width / this.windowSize.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.windowSize.width, this.windowSize.height);
    }
    
    public destroy(): void {
        this.stop();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
        
        if (this.deviceOrientationControls) {
            this.deviceOrientationControls.disconnect();
        }
        
        console.log('SceneManager destroyed');
    }
}
