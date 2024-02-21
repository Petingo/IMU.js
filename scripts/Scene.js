import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GUI } from 'https://unpkg.com/three@0.161.0/examples/jsm/libs/lil-gui.module.min.js';
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

function animate() {
    requestAnimationFrame( animate );
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



const gui = new GUI();

gui.add(rotationParams, 'x', -180, 180).onFinishChange( (value) => {
    cube.rotation.x = value * Math.PI / 180;
})
gui.add(rotationParams, 'y', -180, 180).onFinishChange( (value) => {
    cube.rotation.y = value * Math.PI / 180;
})
gui.add(rotationParams, 'z', -180, 180).onFinishChange( (value) => {
    cube.rotation.z = value * Math.PI / 180;
})
gui.add(rotationParams, 'activateTracker')

