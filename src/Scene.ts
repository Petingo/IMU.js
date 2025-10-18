import * as THREE from 'three';
import { GUI } from 'https://unpkg.com/lil-gui@0.19.2/dist/lil-gui.esm.js';
import { DeviceOrientationControls } from './DeviceOrientationControls.js';
import { Logger } from './Logger.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { AnchorManager, AnchorPoint } from './AnchorManager.js';
import { PhotoCaptureManager, CameraState } from './PhotoCaptureManager.js';

// Initialize logger
const logger = Logger.getInstance();

interface WindowSize {
    width: number;
    height: number;
}

interface RotationParams {
    x: number;
    y: number;
    z: number;
    activateTracker: () => void;
    useDragControls: boolean;
}



const windowSize: WindowSize = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 30); // Set initial camera position

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Managers
const anchorManager = AnchorManager.getInstance();
const photoCaptureManager = PhotoCaptureManager.getInstance();

// Controls
let orbitControls: OrbitControls | null = null;
let deviceOrientationControls: DeviceOrientationControls | null = null;

const geometry = new THREE.SphereGeometry( 15, 16, 8 ); 
const material = new THREE.PointsMaterial( { color: 0x888888 } );
const points = new THREE.Points( geometry, material );
scene.add( points );

// X -> red, Y -> green, Z -> blue
const axisXLine = new THREE.Line( 
    new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 0)] ), 
    new THREE.LineBasicMaterial( { color: 0xff0000 } ) 
);
const axisYLine = new THREE.Line( 
    new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0)] ), 
    new THREE.LineBasicMaterial( { color: 0x00ff00 } ) 
);
const axisZLine = new THREE.Line( 
    new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 100)] ), 
    new THREE.LineBasicMaterial( { color: 0x0000ff } ) 
);
scene.add( axisXLine, axisYLine, axisZLine );

// Add centered targeting circle as screen overlay
const circleGeometry = new THREE.RingGeometry(0.8, 1.0, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.8,
    side: THREE.DoubleSide
});
const targetingCircle = new THREE.Mesh(circleGeometry, circleMaterial);
targetingCircle.position.set(0, 0, -0.5); // Very close to camera
targetingCircle.lookAt(0, 0, 1); // Face forward
targetingCircle.renderOrder = 999; // Render on top
camera.add(targetingCircle); // Attach to camera instead of scene

function animate(): void {
    requestAnimationFrame( animate );
    
    const currentTime = Date.now();
    
    // Update controls
    if (orbitControls && orbitControls.enabled) {
        orbitControls.update();
        // Debug: log camera position occasionally
        if (Math.random() < 0.01) { // 1% chance to log
            console.log('Camera position:', camera.position);
        }
    }
    
    // Update anchor alignment and photo capture
    anchorManager.updateAlignment(camera, photoCaptureManager.getCameraState());
    anchorManager.updatePhotoCapture(photoCaptureManager.getCameraState(), 
        () => photoCaptureManager.capturePhoto(), 
        (anchor: AnchorPoint, imageData: string) => {
            // Remove old image if it exists
            if (anchor.imageMesh) {
                scene.remove(anchor.imageMesh);
            }
            photoCaptureManager.renderImageOnAnchor(anchor, imageData, scene);
        }
    );
    
    renderer.render( scene, camera );
}

animate();

window.addEventListener('resize', () => {
    console.log("window resized")
    // Update sizes
    windowSize.width = window.innerWidth
    windowSize.height = window.innerHeight

    // Update camera
    camera.aspect = windowSize.width / windowSize.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// orientation
function createQuaternion( alpha: number, beta: number, gamma: number, screenOrientation: number ): THREE.Quaternion {
    const finalQuaternion = new THREE.Quaternion();
    const deviceEuler = new THREE.Euler();
    const screenTransform = new THREE.Quaternion();
    const worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis
    let minusHalfAngle = 0;

    deviceEuler.set( beta, alpha, -gamma, 'YXZ' );
    finalQuaternion.setFromEuler( deviceEuler );
    // minusHalfAngle = - screenOrientation / 2;
    // screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );
    // finalQuaternion.multiply( screenTransform );
    // finalQuaternion.multiply( worldTransform );

    console.log(finalQuaternion);

    return finalQuaternion;
}

function handleOrientation(event: DeviceOrientationEvent): void {
    const alpha = THREE.MathUtils.degToRad(event.alpha || 0);
    const beta = THREE.MathUtils.degToRad(event.beta || 0);
    const gamma = THREE.MathUtils.degToRad(event.gamma || 0);
    const orientation = THREE.MathUtils.degToRad(window.screen.orientation?.angle || 0);

    const q = createQuaternion(alpha, beta, gamma, orientation);
    camera.setRotationFromQuaternion(q);
    camera.up = new THREE.Vector3(0, 0, 1);
}







const rotationParams: RotationParams = {
    x: 0,
    y: 0,
    z: 0,
    useDragControls: true,
    activateTracker: function(): void {
        // Switch to device orientation controls
        if (orbitControls) {
            orbitControls.enabled = false;
        }
        
        // Reset camera position for device orientation
        camera.position.set(0, 0, 0); // Center the camera
        camera.rotation.set(0, 0, 0); // Reset rotation
        
        deviceOrientationControls = new DeviceOrientationControls(camera);
        rotationParams.useDragControls = false;
        console.log('Switched to device orientation controls - camera reset to center');
    }
}

// Initialize anchor points
anchorManager.createAnchorPoints(scene);

// Initialize camera access
photoCaptureManager.requestCameraAccess();

// Initialize OrbitControls for drag control
orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.enableZoom = true;
orbitControls.enablePan = false; // Disable panning to keep camera focused on sphere
orbitControls.enableRotate = true; // Enable rotation (should be default)
orbitControls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,    // Left mouse button for rotation
    MIDDLE: THREE.MOUSE.DOLLY,   // Middle mouse button for zoom
    RIGHT: THREE.MOUSE.PAN       // Right mouse button for pan (disabled)
};
orbitControls.touches = {
    ONE: THREE.TOUCH.ROTATE,     // One finger for rotation
    TWO: THREE.TOUCH.DOLLY_PAN   // Two fingers for zoom
};
orbitControls.target.set(0, 0, 0); // Focus on sphere center
orbitControls.maxDistance = 50; // Limit zoom out
orbitControls.minDistance = 5; // Limit zoom in
console.log('OrbitControls initialized');

const gui = new GUI();

gui.add(rotationParams, 'useDragControls').onChange((value: boolean) => {
    if (orbitControls) {
        orbitControls.enabled = value;
        console.log('OrbitControls enabled:', value);
    }
    if (deviceOrientationControls) {
        deviceOrientationControls.enabled = !value;
    }
    console.log('Drag controls:', value ? 'enabled' : 'disabled');
})

// Add debug function to test camera movement
const debugParams = {
    resetCamera: () => {
        if (rotationParams.useDragControls) {
            // Reset for drag controls
            camera.position.set(0, 0, 30);
            if (orbitControls) {
                orbitControls.target.set(0, 0, 0);
                orbitControls.update();
            }
            console.log('Camera reset for drag controls');
        } else {
            // Reset for device orientation
            camera.position.set(0, 0, 0);
            camera.rotation.set(0, 0, 0);
            console.log('Camera reset for device orientation');
        }
    }
};

gui.add(debugParams, 'resetCamera').name('Reset Camera');
gui.add(rotationParams, 'activateTracker')
