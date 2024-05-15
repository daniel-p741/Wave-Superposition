window.onload = function () {
    const container = document.querySelector('#canvas-container');
    const loader = new THREE.GLTFLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const travelDistance = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xabcdef, 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increase ambient light intensity
    scene.add(ambientLight);

    const light = new THREE.PointLight(0xFFFFFF, 2, 100); // Increase point light intensity
    light.position.set(10, 10, 16);
    scene.add(light);

    var width = window.innerWidth;
    var height = window.innerHeight;

    //const wave1 = new THREE.LineDashedMaterial({ color: 0x0000ff, linewidth: 1, scale: 1, dashSize: .5, gapSize: .2 });

    const numPoints = 100;
    const waveAmplitude = 5;
    const waveAmount = 0.2;
    const waveLength = 50; // Total length of each wave
    let phaseShift = -waveLength / 2; // Start the phase shift at the left end
    let phaseShiftDirection = 1; // Direction of the phase shift

    // Function to create a single connected wave
    function createConnectedWave() {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = -waveLength + (2 * waveLength) * (i / numPoints);
            points.push(new THREE.Vector3(x, 0, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 5, // Set the desired line thickness
            linecap: 'round', // Set the line cap style to 'round' for rounded ends
            linejoin: 'round' // Set the line join style to 'round' for rounded joins
        });
        const wave = new THREE.Line(geometry, material);
        return wave;
    }

    let connectedWave = createConnectedWave();
    scene.add(connectedWave);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Update the phase shift based on the direction
        phaseShift += 0.05 * phaseShiftDirection;

        // Reverse the direction of the phase shift when it reaches the end of the wave
        if (phaseShift >= waveLength / 2 || phaseShift <= -waveLength / 2) {
            phaseShiftDirection *= -1;
        }

        // Update the positions of the points based on the phase shift
        const positions = connectedWave.geometry.attributes.position.array;
        for (let i = 0; i < numPoints; i++) {
            const x = positions[i * 3];
            const distanceFromCenter = Math.abs(x);
            const shiftFactor = Math.exp(-Math.pow(distanceFromCenter - phaseShift, 2) / (2 * Math.pow(waveLength / 10, 2)));
            const y = waveAmplitude * Math.abs(Math.sin(waveAmount * x)) * shiftFactor;
            positions[i * 3 + 1] = y;
        }

        // Mark the position attributes as needing update
        connectedWave.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

};