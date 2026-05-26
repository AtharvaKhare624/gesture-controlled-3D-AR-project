/** 
 * GLOBALS & CONFIG
 */
const videoElement = document.querySelector('.input_video');
const bgCanvas = document.getElementById('bgCanvas');
const mainCanvas = document.getElementById('mainCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = mainCanvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

let time = 0;
let lastTime = performance.now();
let framesThisSecond = 0;
let lastFpsTime = performance.now();

let currentHands = []; // Latest data from MediaPipe
let handVelocities = 0; // Average hand movement speed

// Shape Config
let selectedShape = null;
let currentShapeX = window.innerWidth / 2;
let currentShapeY = window.innerHeight / 2;
let targetShapeX = window.innerWidth / 2;
let targetShapeY = window.innerHeight / 2;
let isPrecisionPinching = false;
let startPinchMid = {x:0, y:0};
let startPinchDist = 1;
let startPinchDistX = 1;
let startPinchDistY = 1;
let startPinchAngle = 0;
let startShapeCenter = {x:0, y:0};
let startShapeSize = 100;
let startShapeRotation = 0;
let currentShapeSize = 100;
let targetShapeSize = 100;
let currentShapeRotation = 0;
let targetShapeRotation = 0;
let currentShapeRotX = 0, currentShapeRotY = 0, currentShapeRotZ = 0;
let targetShapeRotX = 0, targetShapeRotY = 0, targetShapeRotZ = 0;
let startShapeRotZ = 0;
let currentStretchX = 1;
let currentStretchY = 1;
let targetStretchX = 1;
let targetStretchY = 1;
let startStretchX = 1;
let startStretchY = 1;

// Physics Engines Data
let particles = [];
let ripples = [];
const FINGER_TIPS = [4, 8, 12, 16, 20];

// Matrix Background
let matrixColumns = [];
const fontSize = 16;
let maxColumns = 0;

// Audio Node References
let audioCtx = null;
let humOsc = null;
let humGain = null;

// UI Elements
const uiHands = document.getElementById('ui-hands');
const uiFps = document.getElementById('ui-fps');
const uiGesture = document.getElementById('ui-gesture');
const uiSpread = document.getElementById('ui-spread');
