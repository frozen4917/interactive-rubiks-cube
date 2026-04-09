import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { RubiksCube } from "./RubiksCube.js"; 
import { CubeController } from "./CubeController.js";

/**
 * 1. CORE SCENE SETUP
 * Initializes the basic Three.js environment:
 * Scene, Camera, and the WebGL Renderer.
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // FOV, aspect ratio, near clipping plane, far clipping plane
camera.position.set(5, 8, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Smooth out jagged pixel edges
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/**
 * 2. CAMERA CONTROLS
 * Allows the user to tumble, zoom, and rotate the entire scene around the cube.
 */
const controls = new TrackballControls(camera, renderer.domElement);

// Fine-tuning the interactive feel of the camera
controls.rotateSpeed = 3.0; // Higher = faster tumbling
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noPan = true; // Disabled to prevent the user from dragging the cube off-center
controls.minDistance = 6; // Prevents zooming completely inside the geometry
controls.maxDistance = 20; // Prevents zooming out too far into the void

/**
 * 3. LIGHTING
 * A mix of directional and ambient lights ensures all faces of the cube are visible and have clear depth/shadows.
 */
// Main key light from the top right
const light = new THREE.DirectionalLight('#ffffff', 1);
light.position.set(5, 10, 7);
scene.add(light);

// Fill light from the bottom left to illuminate shadows cast by the key light
const light2 = new THREE.DirectionalLight('#ffffff', 1);
light2.position.set(-5, -10, -7);
scene.add(light2);

// Base global illumination so pitch-black shadows don't completely obscure colors
const ambient = new THREE.AmbientLight('#ffffff', 0.8);
scene.add(ambient);

/**
 * 4. CUBE INITIALIZATION
 * Instantiates the 3D geometry and attaches the interactive mouse/touch controller.
 */
const myCube = new RubiksCube(scene);
const cubeController = new CubeController(camera, renderer.domElement, myCube, controls);

/**
 * 5. RENDER LOOP & WINDOW RESIZE
 * Keeps the scene continuously updating.
 */
function animate() {
    // Tells the browser we wish to perform a frame animation (syncs with monitor refresh rate)
    requestAnimationFrame(animate);

    // TrackballControls inherently require an update call every frame to calculate momentum
    controls.update();
    renderer.render(scene, camera);
}

// Gracefully handle browser window resizing
window.addEventListener('resize', () => {
    // Update camera aspect ratio to prevent the cube from stretching/squashing
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Match the renderer canvas to the new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize(); 
});

animate();