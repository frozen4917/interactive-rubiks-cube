import * as THREE from "three";


/**
 * RUBIK'S CUBE ARCHITECTURE
 * Handles the visual generation and initial layout of the 27 smaller cubes (cubies) that make up the main puzzle.
 */
export class RubiksCube {
    constructor(scene) {
        this.scene = scene;
        this.pieces = []; // Store all 27 pieces here for easy access later

        // A single Three.js Group holds the entire puzzle.
        this.group = new THREE.Group(); 
        this.scene.add(this.group);

        this.buildCube();
    }

    /**
     * Procedurally generates a texture for a single sticker.
     * It creates a colored rounded square sitting inside a black background.
     * @param {string} colorHex - The hex code for the sticker color (e.g., '#ff0000')
     * @returns {THREE.CanvasTexture} A texture ready to be applied to a Three.js material
     */
    createStickerTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // 1. Draw the black base layer (this forms the "plastic" border of the piece)        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);

        // 2. Draw the colored sticker inside with rounded corners
        ctx.fillStyle = colorHex;
        const border = 18;  // Thickness of the black edge
        const radius = 24;  // Roundness of the corners
        const size = 256 - border * 2;
        const x = border;
        const y = border;

        // Standard canvas path drawing for a rectangle with rounded corners
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    /**
     * Constructs the 3x3x3 grid of sub-cubes.
     */
    buildCube() {
        const size = 2; // Physical size of one individual piece
        const geometry = new THREE.BoxGeometry(size, size, size);

        // Three.js BoxGeometry maps an array of exactly 6 materials to its 6 faces in a very specific order: [ Right, Left, Top, Bottom, Front, Back ]
        const materials = [
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#ff0000') }), // Right
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#ffaa00') }), // Left
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#ffffff') }), // Top
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#ffff00') }), // Bottom
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#00ff00') }), // Front
            new THREE.MeshPhongMaterial({ map: this.createStickerTexture('#0000ff') })  // Back
        ];

        // Matches the size of the geometry to ensure pieces sit perfectly flush against each other
        const offset = 2;

        // Generate a 3D grid from -1 to 1 on all three axes (3 x 3 x 3 = 27 pieces)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cube = new THREE.Mesh(geometry, materials);

                    // Multiply the grid coordinate by the offset to get the physical 3D world position
                    cube.position.set(x * offset, y * offset, z * offset);

                    // Attach custom state data to the Three.js mesh.
                    // The CubeController relies heavily on this original abstract (x,y,z) coordinate system  (ranging from -1 to 1) to determine which 9 pieces make up a specific rotating layer.
                    cube.userData = { x, y, z };

                    this.group.add(cube);
                    this.pieces.push(cube);
                }
            }
        }
    }
}