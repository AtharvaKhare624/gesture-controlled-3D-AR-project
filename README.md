An immersive, high-fidelity browser-based Augmented Reality (AR) experience that uses your webcam to project dynamic 3D holographic wireframes and neon physics particles onto your live video feed. By leveraging **MediaPipe Hands** and native HTML5 Canvas, it maps interactive dual-hand gestures to volumetric manipulations and real-time audio synthesis.

---

##  Key Features

### 1.  True 3D Volumetric Holograms
Renders mathematically accurate 3D wireframe projections with depth volume, additive glowing bloom, and atmospheric perspective:
*   **Sphere**: Core wireframe orbits with custom diffuse radial alpha gradients.
*   **Cube**: An orthogonal 8-vertex, 12-edge box that rotating dynamically.
*   **Cone**: Circular base ellipse with intersecting generative wireline apexes.
*   **Planet**: A central sphere enveloped by a glowing planetary disk ring, backed by atmospheric light scattering.
*   **Atom**: A pulsing volumetric nucleus orbited by three independent electronic paths featuring traveling high-bloom electrons.

### 2.  Advanced Hand Interactions & Gestures
Real-time 21-point tracking for up to two hands simultaneously:
*   ** Dual Open Hands (Rotate & Scale)**: Spread your fingers on both hands to rotate the active shape across 3D axes ($X$, $Y$, $Z$) and scale it relative to your hands' coordinates.
*   ** Dual Pinch-to-Stretch**: Pinch the thumb and index finger on both hands to enter **Precision Pinch Mode**. Move and pull your hands to scale and physically stretch the holographic shapes along independent X and Y axes.
*   ** Fingertip Lightning Arcs**: Bringing the fingertips of both hands close together generates high-frequency electric arcing with intense white glow blooms.
*   ** Tip Connective Mandalas**: Perfectly tracking 10 fingertips generates a self-orienting rotating sacred star mandala between your hands.

### 3.  Interactive Web Audio Synthesizer
*   Generates a procedural, low-frequency cosmic synthesizer hum directly in the browser.
*   Modulates frequency (pitch) and gain (volume) dynamically in real-time based on the proximity of your index fingertips.

### 4.  Matrix Starfield Background
*   A custom trailing matrix falling star effect that reflects ambient velocity.
*   The starfield speed and density dynamically accelerate and intensify as your hand movement velocity increases.

---

##  Project Architecture

The project is designed in a highly modular, clean frontend architecture:

```
HandConnect/
├── css/
│   └── style.css      # Extracted clean layout, neon overlays, and glassmorphism styling
├── js/
│   ├── globals.js     # Shared global variables, canvas configs, and HUD state bindings
│   ├── utils.js       # 2D geometry distance formulas, open hand checkers, and 3D projections
│   ├── audio.js       # Web Audio synthesizer engines, modular zaps, and active multi-hum
│   ├── physics.js     # Sparks emission systems, gravity algorithms, and target pullers
│   ├── renderer.js    # Canvas matrix backgrounds, volumetric renderers, and main anim loops
│   ├── gestures.js    # Multi-pinch decoders, index spreads, and gesture state modifiers
│   └── main.js        # DOM elements hookup, window resizers, and MediaPipe start hooks
├── index.html         # Unified modular entry point
├── RUN_INSTRUCTIONS.md# Local developer setup quick-guide
└── README.md          # Technical overview documentation (This file)
```

---

## How to Run Locally

To experience the interactive AR on your computer, follow these simple setup steps:

### Step 1: Clone the Repository
First, clone this repository to copy all project files onto your local system:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/HandConnect.git
cd HandConnect
```
*(Alternatively, you can click the green **"Code"** button at the top right of this GitHub page and select **"Download ZIP"**, then extract it.)*

### Step 2: Serve the App (Zero Package Installations Required! 🎉)
Because this is a pure, static frontend web application, **there are no package dependencies to install!** You do not need to run `npm install` or install python packages. All heavy machine learning libraries (such as Google MediaPipe Hands) are loaded dynamically over the internet via high-speed CDNs.

Due to browser privacy regulations governing webcam permissions, the webcam will only activate if the page is served locally through `localhost` or over a secure `https://` connection. Choose **one** of the simple methods below to run a local server:

#### Option A: Using Python (Simplest & Recommended 🐍)
If you have Python installed on your computer:
1. Open your terminal in the cloned `HandConnect` directory.
2. Spin up the lightweight server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to: [**`http://localhost:8000`**](http://localhost:8000)

#### Option B: Using VS Code "Live Server" Extension
1. Open the cloned `HandConnect` workspace folder in **VS Code**.
2. Install the **"Live Server"** extension by Ritwick Dey from the VS Code Marketplace.
3. Click the **"Go Live"** button in the bottom right corner of the VS Code status bar.

#### Option C: Using Node.js
If you have Node.js installed:
1. Open your terminal in the cloned `HandConnect` directory.
2. Run this command:
   ```bash
   npx http-server -p 8000
   ```
3. Open your browser and navigate to: [**`http://localhost:8000`**](http://localhost:8000)

---

##  Built With

*   **[Google MediaPipe Hands](https://github.com/google-ai-edge/mediapipe)** - ML-based real-time hand skeleton keypoint detector.
*   **HTML5 Canvas API** - Dual-canvas layers for video capture, additive particle trails (`mix-blend-mode: screen`), and volumetric projections.
*   **Web Audio API** - Custom native oscillators, nodes, and real-time gain controllers.
*   **Vanilla CSS** - Premium dark layout with glassmorphic dashboards.