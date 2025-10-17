import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GUI } from 'https://unpkg.com/lil-gui@0.19.2/dist/lil-gui.esm.js';
import { DeviceOrientationControls } from './DeviceOrientationControls.js';

const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera state for photo capture
const cameraState = {
    stream: null,
    video: null,
    isActive: false
};

// Anchor points array
const anchorPoints = [];
const sphereRadius = 15;

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const geometry = new THREE.SphereGeometry( 15, 16, 8 ); 
const material = new THREE.PointsMaterial( { color: 0x888888 } );
const points = new THREE.Points( geometry, material );
scene.add( points );

// X -> red, Y -> green, Z -> blue
const axisXLine = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 0)] ), new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
const axisYLine = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0)] ), new THREE.LineBasicMaterial( { color: 0x00ff00 } ) );
const axisZLine = new THREE.Line( new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 100)] ), new THREE.LineBasicMaterial( { color: 0x0000ff } ) );
scene.add( axisXLine, axisYLine, axisZLine );

// camera.position.z = 45;
// camera.lookAt( 0, 0, 0 );
// console.log(camera.position);
// console.log(camera.rotation);

// Function to create anchor points on the sphere
function createAnchorPoints() {
    const anchorGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const anchorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    // Top section (3 anchors)
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * sphereRadius * 0.8;
        const z = Math.sin(angle) * sphereRadius * 0.8;
        const y = sphereRadius * 0.8;
        
        const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
        anchorMesh.position.set(x, y, z);
        scene.add(anchorMesh);
        
        anchorPoints.push({
            position: new THREE.Vector3(x, y, z),
            mesh: anchorMesh,
            isActive: false
        });
    }
    
    // Top-mid section (9 anchors)
    for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const x = Math.cos(angle) * sphereRadius * 0.4;
        const z = Math.sin(angle) * sphereRadius * 0.4;
        const y = sphereRadius * 0.4;
        
        const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
        anchorMesh.position.set(x, y, z);
        scene.add(anchorMesh);
        
        anchorPoints.push({
            position: new THREE.Vector3(x, y, z),
            mesh: anchorMesh,
            isActive: false
        });
    }
    
    // Mid section (12 anchors)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * sphereRadius;
        const z = Math.sin(angle) * sphereRadius;
        const y = 0;
        
        const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
        anchorMesh.position.set(x, y, z);
        scene.add(anchorMesh);
        
        anchorPoints.push({
            position: new THREE.Vector3(x, y, z),
            mesh: anchorMesh,
            isActive: false
        });
    }
    
    // Bottom-mid section (9 anchors)
    for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const x = Math.cos(angle) * sphereRadius * 0.4;
        const z = Math.sin(angle) * sphereRadius * 0.4;
        const y = -sphereRadius * 0.4;
        
        const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
        anchorMesh.position.set(x, y, z);
        scene.add(anchorMesh);
        
        anchorPoints.push({
            position: new THREE.Vector3(x, y, z),
            mesh: anchorMesh,
            isActive: false
        });
    }
    
    // Bottom section (3 anchors)
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * sphereRadius * 0.8;
        const z = Math.sin(angle) * sphereRadius * 0.8;
        const y = -sphereRadius * 0.8;
        
        const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
        anchorMesh.position.set(x, y, z);
        scene.add(anchorMesh);
        
        anchorPoints.push({
            position: new THREE.Vector3(x, y, z),
            mesh: anchorMesh,
            isActive: false
        });
    }
}

// Function to request camera access
async function requestCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        cameraState.stream = stream;
        cameraState.isActive = true;
        
        // Create video element for photo capture
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        cameraState.video = video;
        
        console.log('Camera access granted');
        return true;
    } catch (error) {
        console.log('Camera access denied:', error);
        return false;
    }
}

// Function to capture photo
function capturePhoto() {
    if (!cameraState.video || !cameraState.isActive) {
        console.log('Camera not ready for photo capture');
        return null;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        console.log('Failed to get canvas context');
        return null;
    }
    
    canvas.width = cameraState.video.videoWidth;
    canvas.height = cameraState.video.videoHeight;
    
    context.drawImage(cameraState.video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    console.log('Photo captured, size:', canvas.width, 'x', canvas.height);
    return imageData;
}

// Function to render captured image on anchor point
function renderImageOnAnchor(anchor, imageData) {
    console.log('Starting to render image on anchor');
    
    // Create a simple plane geometry first
    const imageGeometry = new THREE.PlaneGeometry(4, 4);
    
    // Create material with the texture
    const imageMaterial = new THREE.MeshBasicMaterial({ 
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
    
    // Position the image to face the center of the sphere
    const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), anchor.position).normalize();
    imageMesh.position.copy(anchor.position).add(direction.multiplyScalar(1.0));
    imageMesh.lookAt(0, 0, 0);
    
    // Load texture and apply it
    const texture = new THREE.TextureLoader().load(imageData, (loadedTexture) => {
        console.log('Texture loaded successfully');
        // Update the material with the loaded texture
        imageMaterial.map = loadedTexture;
        imageMaterial.needsUpdate = true;
        
        // Update geometry with correct aspect ratio
        const aspectRatio = loadedTexture.image.width / loadedTexture.image.height;
        const imageSize = 4;
        imageMesh.geometry.dispose();
        imageMesh.geometry = new THREE.PlaneGeometry(
            imageSize * aspectRatio,
            imageSize
        );
        
        console.log('Image rendered at position:', imageMesh.position);
        console.log('Image size:', imageSize * aspectRatio, 'x', imageSize);
    });
    
    scene.add(imageMesh);
    anchor.imageMesh = imageMesh;
    anchor.capturedImage = imageData;
    
    console.log('Image mesh added to scene');
}

// Function to get alignment score for an anchor point
function getAlignmentScore(anchor) {
    // Get camera direction (where camera is looking)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Get direction from camera to anchor point
    const anchorDirection = new THREE.Vector3().subVectors(anchor.position, camera.position).normalize();
    
    // Calculate how aligned the camera is with the anchor
    const dotProduct = cameraDirection.dot(anchorDirection);
    
    return dotProduct;
}

// Function to check if camera orientation aligns with anchor point (kept for compatibility)
function checkOrientationAlignment(anchor) {
    return getAlignmentScore(anchor) > 0.8;
}

// Variables for stillness detection
let stillnessTimer = 0;
let lastStillnessTime = 0;
let currentTargetAnchor = null;

// Performance optimization variables
let lastCheckTime = 0;
const checkInterval = 100; // Check every 100ms instead of every frame

function animate() {
    requestAnimationFrame( animate );
    
    const currentTime = Date.now();
    
    // Check orientation alignment with anchor points
    if (cameraState.isActive) {
        // Only do expensive calculations periodically
        if ((currentTime - lastCheckTime) > checkInterval) {
            lastCheckTime = currentTime;
            
            // First, reset all anchors to green
            for (const anchor of anchorPoints) {
                if (anchor.isActive) {
                    anchor.mesh.material.color.setHex(0x00ff00);
                    anchor.isActive = false;
                }
            }
            
            // Find the anchor with the highest alignment score
            let bestAlignment = 0;
            let bestAnchor = null;
            
            for (const anchor of anchorPoints) {
                const alignment = getAlignmentScore(anchor);
                if (alignment > bestAlignment) {
                    bestAlignment = alignment;
                    bestAnchor = anchor;
                }
            }
            
            // Only activate the best anchor if it meets the threshold
            if (bestAnchor && bestAlignment > 0.8) {
                bestAnchor.mesh.material.color.setHex(0xff0000);
                bestAnchor.isActive = true;
                currentTargetAnchor = bestAnchor;
                stillnessTimer = 0;
                console.log('Best anchor activated:', bestAlignment.toFixed(3));
            } else {
                currentTargetAnchor = null;
                stillnessTimer = 0;
            }
        }
        
        // Check for photo capture every frame for accurate timing
        if (currentTargetAnchor) {
            stillnessTimer += 16; // 60fps timing
            if (stillnessTimer >= 1000) {
                const photo = capturePhoto();
                if (photo) {
                    // Remove old image if it exists
                    if (currentTargetAnchor.imageMesh) {
                        scene.remove(currentTargetAnchor.imageMesh);
                    }
                    renderImageOnAnchor(currentTargetAnchor, photo);
                    console.log('Photo captured and rendered on anchor point');
                    
                    // Reset the timer to prevent immediate re-capture
                    stillnessTimer = 0;
                }
            }
        }
    }
    
    renderer.render( scene, camera );
}

animate();

// const controls = new OrbitControls( camera, renderer.domElement );

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
function createQuaternion( alpha, beta, gamma, screenOrientation ){
    var finalQuaternion = new THREE.Quaternion();
    var deviceEuler = new THREE.Euler();
    var screenTransform = new THREE.Quaternion();
    var worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis
    var minusHalfAngle = 0;

    deviceEuler.set( beta, alpha, -gamma, 'YXZ' );
    finalQuaternion.setFromEuler( deviceEuler );
    // minusHalfAngle = - screenOrientation / 2;
    // screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );
    // finalQuaternion.multiply( screenTransform );
    // finalQuaternion.multiply( worldTransform );

    console.log(finalQuaternion);

    return finalQuaternion;
};

function handleOrientation(event) {
    let alpha = THREE.MathUtils.degToRad(event.alpha);
    let beta = THREE.MathUtils.degToRad(event.beta);
    let gamma = THREE.MathUtils.degToRad(event.gamma);
    let orientation = THREE.MathUtils.degToRad(window.screen.orientation);

    let q = createQuaternion(alpha, beta, gamma, orientation);
    camera.setRotationFromQuaternion(q);
    camera.up = new THREE.Vector3(0, 0, 1);
}

let rotationParams = {
    x: 0,
    y: 0,
    z: 0,
    activateTracker: function() {
        // // Request permission for iOS 13+ devices
        // if (
        //     DeviceMotionEvent &&
        //     typeof DeviceMotionEvent.requestPermission === "function"
        // ) {
        //     DeviceMotionEvent.requestPermission();
        // }
        
        // // window.addEventListener("devicemotion", handleMotion);
        // window.addEventListener("deviceorientation", handleOrientation);
        const cameraControl = new DeviceOrientationControls(camera);
    }
}



// Initialize anchor points
createAnchorPoints();

// Initialize camera access
requestCameraAccess();

const gui = new GUI();

gui.add(rotationParams, 'x', -180, 180).onFinishChange( (value) => {
    // Note: cube is not defined in the original code, commenting out
    // cube.rotation.x = value * Math.PI / 180;
})
gui.add(rotationParams, 'y', -180, 180).onFinishChange( (value) => {
    // cube.rotation.y = value * Math.PI / 180;
})
gui.add(rotationParams, 'z', -180, 180).onFinishChange( (value) => {
    // cube.rotation.z = value * Math.PI / 180;
})
gui.add(rotationParams, 'activateTracker')

