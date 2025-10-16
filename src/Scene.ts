import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { DeviceOrientationControls } from './DeviceOrientationControls.js';
import { Logger } from './Logger.js';

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
}

const windowSize: WindowSize = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

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

function animate(): void {
    requestAnimationFrame( animate );
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
    activateTracker: function(): void {
        const cameraControl = new DeviceOrientationControls(camera);
    }
}

const gui = new GUI();

gui.add(rotationParams, 'x', -180, 180).onFinishChange( (value: number) => {
    // Note: cube is not defined in the original code, commenting out
    // cube.rotation.x = value * Math.PI / 180;
})
gui.add(rotationParams, 'y', -180, 180).onFinishChange( (value: number) => {
    // cube.rotation.y = value * Math.PI / 180;
})
gui.add(rotationParams, 'z', -180, 180).onFinishChange( (value: number) => {
    // cube.rotation.z = value * Math.PI / 180;
})
gui.add(rotationParams, 'activateTracker')
