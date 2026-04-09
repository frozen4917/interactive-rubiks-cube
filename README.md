# 3D Interactive Rubik's Cube

A fully playable, interactive 3D Rubik's Cube built entirely in the browser using vanilla JavaScript and the `Three.js` library.

> [!NOTE]
> This project was developed as a Project-Based Learning for a Semester 4 Computer Graphics & Multimedia course.

## Controls

* **Rotate the Camera:** Click and drag anywhere *outside* the cube to tumble the scene.
* **Zoom:** Scroll the mouse wheel to zoom in and out.
* **Rotate a Layer:** Click and drag on any *specific piece* of the cube. The system will automatically determine which layer you are trying to spin (X, Y, or Z axis) based on the face you clicked and the direction of your mouse.
* **Snap to Grid:** Release the mouse to automatically snap the active layer to the nearest perfect 90-degree angle.

## Features

* **Custom Rotation Engine:** Uses an invisible central pivot system. When a layer is dragged, the 9 active pieces are dynamically parented to this pivot, rotated, and unparented without visual stuttering.
* **Precision Math & Stability:** Includes built-in floating-point error correction. Positions and quaternions are actively rounded to prevent the 3D meshes from drifting or mutating after multiple rotations.
* **Procedural Textures:** No external image files are used. The distinct coloured stickers (with rounded corners and black plastic borders) are drawn procedurally at runtime using the HTML5 Canvas API and mapped to Three.js materials.
* **Raycasting:** Real-time translation of Normalised Device Coordinates (NDC) to 3D vectors to detect exact click points and face normals (which way the clicked side is pointing).
* **Zero-Build Setup:** Uses modern HTML `importmap` tags to load Three.js as an ES module, meaning the project runs entirely in the browser without needing Webpack, Vite, or Node.js build steps.

## Technologies Used

- JavaScript
- HTML5 / CSS3
- Three.js (WebGL rendering, Raycasting, TrackballControls)

## Getting Started

Because this project uses native ES6 Modules (`<script type="module">`), modern browsers require it to be run through a local web server. You cannot simply double-click the `index.html` file.

### Prerequisites
* A modern web browser
* A basic local web server. You can use the **Live Preview** or **Live Server** extension in VS Code.

### Installation and Setup

#### **1. Clone the repository**
```sh
git clone https://github.com/frozen4917/interactive-rubiks-cube.git
```

#### **2. Navigate to the directory**
```sh
cd interactive-rubiks-cube
```

#### **3. Start a local server**
Install either the Live Preview or Live Server extension on VS Code and open the `index.html` using it.

#### **4. Play**
Open the browser and go to the link provided by the extension to play. 

## Future Enhancements
While the core mechanical foundation of the cube is complete, there is room for extended features:
- [ ] **Realistic Core Aesthetics:** Colour the internal, non-visible faces of all 27 cubies black so the inside of the puzzle looks like a real plastic mechanism when turning a layer, rather than showing misplaced stickers.
- [ ] **Smooth Animation:** Replace the instant "snap" on mouse release with a smooth tweening animation to settle the layer into place.
- [ ] **Scramble Function:** Add a button to apply 20+ random, mathematically valid rotations to shuffle the puzzle.
- [ ] **Win-State Detection:** Implement logic to check if all 6 faces share the same colours and trigger a victory screen.

## What I Learned

- **3D Coordinate Systems:** Gained a deep understanding of translating between Local Space and World Space in WebGL.
- **Quaternions & Euler Angles:** Learned how to safely rotate 3D objects without encountering Gimbal Lock, and how to apply floating-point corrections to complex rotational math.
- **Raycasting:** Learned how to project invisible lines from a 2D camera viewport into a 3D scene to detect exact intersection points and surface normals.
- **Asset Optimisation:** Discovered how to use the 2D Canvas API to generate lightweight, high-resolution textures on the fly, saving bandwidth and load times.
