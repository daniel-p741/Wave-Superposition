let scene, camera, renderer, composer;
let leftWave, rightWave, resultWave;
let time = 0;
let isPlaying = true;
let pointsCount = 300;
let xRange = 40; // from -20 to 20

// State
let state = {
    leftAmp: 5.0,
    rightAmp: 5.0,
    speed: 2.0,
    type: 'pulse', // 'pulse' or 'continuous'
    phase1: 0,    // radians
    phase2: 0,    // radians
};

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    // Scene setup
    scene = new THREE.Scene();
    // Dark space background
    scene.background = new THREE.Color(0x0a0a0f);

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Grid Helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x333333, 0x222222);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Post-Processing (Bloom for that premium glow)
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.1);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Create Wave Geometries
    leftWave = createWaveLine(0x3b82f6, 0);   // Blue
    rightWave = createWaveLine(0xec4899, 1);  // Pink
    resultWave = createWaveLine(0xffffff, 2); // White
    
    scene.add(leftWave);
    scene.add(rightWave);
    scene.add(resultWave);

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Bind UI
    bindUIEvents();
}

function createWaveLine(colorHex, zOffset) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);
    
    for(let i=0; i<pointsCount; i++) {
        let x = (i / (pointsCount - 1)) * xRange - (xRange / 2);
        positions[i*3] = x;
        positions[i*3+1] = 0;
        positions[i*3+2] = zOffset * 0.1; // Small Z offset to prevent z-fighting if they perfectly align
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
        color: colorHex,
        linewidth: 2 // Note: WebGL implementation might restrict to 1px
    });

    return new THREE.Line(geometry, material);
}

// Math for waves
// phase: offset in radians
// For pulse: phase shifts center by (phase / 2π) × wavelength → one full wavelength per 360°
// For sine:  phase adds directly to the sin() argument
function evalWave(type, x, t, amplitude, speed, directionOffset, phase) {
    const frequency = 0.5; // spatial frequency (rad/unit)
    let v = speed * 10;

    let center = (directionOffset === 1)
        ? -20 + v * t
        :  20 - v * t;

    if (type === 'pulse') {
        // Spatial shift equivalent to phase: Δx = phase / frequency
        const phaseShift = phase / frequency;
        const width = 2.0;
        return amplitude * Math.exp( -Math.pow((x - center - phaseShift), 2) / (width * width) );
    } else {
        let distFromSource = (directionOffset === 1) ? (x - (-20)) : (20 - x);
        let distTraveled = v * t;
        if (distFromSource > distTraveled) return 0;
        return amplitude * Math.sin( frequency * (distFromSource - distTraveled) + phase );
    }
}

function updateWaves() {
    // We update the buffer geometry for left, right, and result
    const leftPos = leftWave.geometry.attributes.position.array;
    const rightPos = rightWave.geometry.attributes.position.array;
    const resPos = resultWave.geometry.attributes.position.array;
    
    // Auto-reset time if pulses are far off screen
    if(state.type === 'pulse' && time > 40 / (state.speed * 10 + 0.001) + 2) {
        time = 0; // seamless looping for pulses
    }

    for(let i=0; i<pointsCount; i++) {
        let x = (i / (pointsCount - 1)) * xRange - (xRange / 2);

        let yL   = evalWave(state.type, x, time, state.leftAmp,  state.speed,  1, state.phase1);
        let yR   = evalWave(state.type, x, time, state.rightAmp, state.speed, -1, state.phase2);
        let yRes = yL + yR;

        leftPos[i*3+1] = yL;
        rightPos[i*3+1] = yR;
        resPos[i*3+1] = yRes;
    }

    leftWave.geometry.attributes.position.needsUpdate = true;
    rightWave.geometry.attributes.position.needsUpdate = true;
    resultWave.geometry.attributes.position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    
    if(isPlaying) {
        time += 0.016; // Approx 60fps
    }
    
    updateWaves();
    
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function bindUIEvents() {
    const elWaveType = document.getElementById('waveType');
    const elLeftAmp = document.getElementById('leftWaveAmplitude');
    const elRightAmp = document.getElementById('rightWaveAmplitude');
    const elSpeed = document.getElementById('waveSpeed');
    
    const valLeftAmp = document.getElementById('leftAmpVal');
    const valRightAmp = document.getElementById('rightAmpVal');
    const valSpeed = document.getElementById('speedVal');
    
    const elPhase1  = document.getElementById('wave1Phase');
    const elPhase2  = document.getElementById('wave2Phase');
    const valPhase1 = document.getElementById('phase1Val');
    const valPhase2 = document.getElementById('phase2Val');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnReset = document.getElementById('btnReset');

    elWaveType.addEventListener('change', (e) => {
        state.type = e.target.value;
        time = 0;
    });

    elLeftAmp.addEventListener('input', (e) => {
        state.leftAmp = parseFloat(e.target.value);
        valLeftAmp.textContent = state.leftAmp.toFixed(1) + ' m';
    });

    elRightAmp.addEventListener('input', (e) => {
        state.rightAmp = parseFloat(e.target.value);
        valRightAmp.textContent = state.rightAmp.toFixed(1) + ' m';
    });

    elSpeed.addEventListener('input', (e) => {
        state.speed = parseFloat(e.target.value);
        valSpeed.textContent = state.speed.toFixed(1) + ' m/s';
    });

    elPhase1.addEventListener('input', (e) => {
        const deg = parseInt(e.target.value);
        state.phase1 = deg * (Math.PI / 180);
        valPhase1.textContent = deg + '°';
    });

    elPhase2.addEventListener('input', (e) => {
        const deg = parseInt(e.target.value);
        state.phase2 = deg * (Math.PI / 180);
        valPhase2.textContent = deg + '°';
    });

    btnPlayPause.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlayPause.textContent = isPlaying ? "Pause" : "Play";
    });

    btnReset.addEventListener('click', () => {
        time = 0;
    });

    // --- Drag logic ---
    const panel = document.getElementById('ui-panel');
    const panelHeader = panel.querySelector('.panel-header');
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    panelHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = panel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        panel.style.transition = 'none';
        panel.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = e.clientX - dragOffsetX;
        let newTop  = e.clientY - dragOffsetY;
        // Clamp within viewport
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - panel.offsetWidth));
        newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - panel.offsetHeight));
        // Switch from bottom/left to top/left positioning
        panel.style.bottom = 'auto';
        panel.style.left   = newLeft + 'px';
        panel.style.top    = newTop  + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        panel.style.cursor = '';
    });
}
