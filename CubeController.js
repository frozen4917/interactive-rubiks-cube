import * as THREE from "three";


/**
 * CUBE CONTROLLER
 * Translates 2D mouse/touch movements into 3D raycasts to rotate specific layers of the Rubik's Cube.
 */
export class CubeController {
    constructor(camera, domElement, rubiksCube, trackballControls) {
        this.camera = camera;
        this.domElement = domElement;
        this.rubiksCube = rubiksCube;

        // while the user is actively twisting a layer of the cube, we need access to the camera controls so we can disable them 
        this.trackballControls = trackballControls;

        // Raycasting tools to translate screen clicks into 3D world hits
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Create an invisible pivot point at the center of the scene (0,0,0)
        // We will temporarily attach cubes to this pivot to rotate them easily
        this.pivot = new THREE.Group();
        this.rubiksCube.scene.add(this.pivot);

        // Interaction state variables
        this.isDragging = false;

        // Math helpers for calculating the drag direction
        this.clickPoint = new THREE.Vector3();        // Exactly where the ray hit in 3D space
        this.clickedNormal = new THREE.Vector3();     // Which direction the clicked face is pointing
        this.intersectionPlane = new THREE.Plane();   // An invisible, infinite flat surface that we track the mouse across
        
        // Target state variables
        this.clickedPiece = null;
        this.rotationAxis = null;  // Will be 'x', 'y', or 'z'
        this.activeLayer = [];     // Array of the 9 pieces currently being rotated

        // Bind 'this' context for event listeners
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);

        this.domElement.addEventListener('pointerdown', this.onPointerDown, { capture: true });
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    /**
     * Converts browser pixel coordinates into Normalized Device Coordinates (-1 to +1).
     * This is required for Three.js Raycasting.
     */
    updatePointer(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    /**
     * Fires when mouse/touch begins. Determines if the user actually clicked on a piece of the puzzle.
     */
    onPointerDown(event) {
        this.updatePointer(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        // Check if the ray hit any of the 27 sub-cubes
        const intersects = this.raycaster.intersectObjects(this.rubiksCube.group.children, false);

        if (intersects.length > 0) {
            // Stop the event so we don't accidentally click other UI elements
            event.stopImmediatePropagation();
            
            // Disable camera tumbling while we twist the cube
            this.trackballControls.enabled = false;
            this.isDragging = true;

            const firstHit = intersects[0];
            this.clickedPiece = firstHit.object;
            
            // Extract the "Normal" (the perpendicular direction the clicked face is pointing).
            // Transform it to world space and round it to get a clean X, Y, or Z vector (e.g., [1,0,0]).
            this.clickedNormal.copy(firstHit.face.normal);
            this.clickedNormal.transformDirection(firstHit.object.matrixWorld).round();
            
            this.clickPoint.copy(firstHit.point);
            
            // Create a mathematical plane resting exactly on the face we just clicked.
            // This will be used in onPointerMove to measure how far the mouse travels along this surface.
            this.intersectionPlane.setFromNormalAndCoplanarPoint(this.clickedNormal, this.clickPoint);
            this.rotationAxis = null;
        }
    }

    /**
     * Fires as mouse/touch drags. Calculates what layer to group and how much to rotate it.
     */
    onPointerMove(event) {
        if (!this.isDragging) return;

        this.updatePointer(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const currentPoint = new THREE.Vector3();

        // Project the ray forward until it hits our invisible math plane
        const hit = this.raycaster.ray.intersectPlane(this.intersectionPlane, currentPoint);

        if (hit) {
            // Calculate the 3D distance and direction the mouse has moved on the plane since the initial click
            const dragVector = new THREE.Vector3().subVectors(currentPoint, this.clickPoint);

            // Wait until the user drags a tiny bit (0.1 units) before deciding which way they are trying to spin it
            if (this.rotationAxis === null && dragVector.length() > 0.1) {
                this.determineRotationAxis(dragVector);
                this.groupActiveLayer();
            }

            // Rotate the invisible pivot in real-time
            if (this.rotationAxis !== null) {
                // Cross product determines the direction of rotation based on the face clicked and the way we dragged
                const rotationDirection = new THREE.Vector3().crossVectors(this.clickedNormal, dragVector);

                // 0.6 is a sensitivity multiplier
                const angle = rotationDirection[this.rotationAxis] * 0.6; 
                this.pivot.rotation[this.rotationAxis] = angle;
            }
        }
    }

    /**
     * Calculates whether we are spinning on the X, Y, or Z axis.
     * E.g. If you click the Front face (Z-normal) and drag left/right (X-drag), you rotate around the Y axis.
     */
    determineRotationAxis(dragVector) {
        const absX = Math.abs(dragVector.x);
        const absY = Math.abs(dragVector.y);
        const absZ = Math.abs(dragVector.z);

        if (Math.abs(this.clickedNormal.x) > 0.5) {
            this.rotationAxis = absY > absZ ? 'z' : 'y';
        } else if (Math.abs(this.clickedNormal.y) > 0.5) {
            this.rotationAxis = absX > absZ ? 'z' : 'x';
        } else if (Math.abs(this.clickedNormal.z) > 0.5) {
            this.rotationAxis = absX > absY ? 'y' : 'x';
        }
    }

    /**
     * Finds the 9 pieces that belong to the slice the user is trying to turn.
     */
    groupActiveLayer() {
        // Look at the original, abstract grid coordinate (from our userData object) of the piece we clicked
        const targetCoordinate = this.clickedPiece.userData[this.rotationAxis];

        // Filter all 27 pieces to find the 9 that share that same coordinate on the chosen axis
        this.activeLayer = this.rubiksCube.pieces.filter(piece => {
            return Math.abs(piece.userData[this.rotationAxis] - targetCoordinate) < 0.1;
        });

        // 'attach' is a powerful Three.js method: it changes a mesh's parent to the pivot, but automatically recalculates its transform so it doesn't jump visually on screen.
        this.activeLayer.forEach(piece => {
            this.pivot.attach(piece);
        });
    }

    /**
     * Fires when mouse/touch is released. Snaps the rotation to a perfect 90-degree angle and cleans up.
     */
    onPointerUp(event) {
        // Re-enable camera tumbling
        this.trackballControls.enabled = true;
        this.isDragging = false;

        // Only run snapping logic if a rotation was actually initiated
        if (this.rotationAxis !== null) {
            
            // 1. Calculate the nearest 90 degree snap point (Pi / 2 radians)
            const currentAngle = this.pivot.rotation[this.rotationAxis];
            const ninetyDegrees = Math.PI / 2;
            const snappedAngle = Math.round(currentAngle / ninetyDegrees) * ninetyDegrees;

            // 2. Instantly snap the pivot to that exact mathematical angle
            this.pivot.rotation[this.rotationAxis] = snappedAngle;
            
            // Force Three.js to calculate the exact new 3D positions of the sub-cubes right now
            this.pivot.updateMatrixWorld();

            // 3. Detach the cubes from the pivot and put them back in the main Rubik's Cube group
            this.activeLayer.forEach(piece => {
                this.rubiksCube.group.attach(piece);

                // Floating Point Math correction using round()
                piece.position.x = Math.round(piece.position.x / 2) * 2;
                piece.position.y = Math.round(piece.position.y / 2) * 2;
                piece.position.z = Math.round(piece.position.z / 2) * 2;

                // 4. Update the internal state grid so the next turn grabs the right pieces
                piece.userData.x = Math.round(piece.position.x / 2);
                piece.userData.y = Math.round(piece.position.y / 2);
                piece.userData.z = Math.round(piece.position.z / 2);

                // Floating point correction for the physical rotation (Euler angles) of the sub-cubes
                const euler = new THREE.Euler().setFromQuaternion(piece.quaternion);
                euler.x = Math.round(euler.x / ninetyDegrees) * ninetyDegrees;
                euler.y = Math.round(euler.y / ninetyDegrees) * ninetyDegrees;
                euler.z = Math.round(euler.z / ninetyDegrees) * ninetyDegrees;
                piece.quaternion.setFromEuler(euler);
            });

            // 5. Reset the empty pivot's rotation back to zero, ready for the next move
            this.pivot.rotation.set(0, 0, 0);
        }

        // Clean up state variables
        this.clickedPiece = null;
        this.rotationAxis = null;
        this.activeLayer = [];
    }
}