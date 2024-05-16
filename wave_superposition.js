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

    const numPoints = 100;

    const waveAmplitudeLeft = 4; // Initial amplitude for the left wave
    const waveLengthLeft = 30; // Wavelength for the left wave
    const waveFrequencyLeft = Math.PI / (waveLengthLeft / 2);

    const waveAmplitudeRight = 3; // Initial amplitude for the right wave
    const waveLengthRight = 30; // Wavelength for the right wave
    const waveFrequencyRight = Math.PI / (waveLengthRight / 2);

    const yOffset = -5; // Adjust this value to move the waves closer to the bottom

    // Function to create a single connected wave with specific amplitude and wavelength
    function createConnectedWave(startX, direction, waveLength, waveAmplitude, yOffset) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = startX + direction * (waveLength * i) / numPoints;
            points.push(new THREE.Vector3(x, yOffset, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 5, // Set the desired line thickness
            linecap: 'round', // Set the line cap style to 'round' for rounded ends
            linejoin: 'round' // Set the line join style to 'round' for rounded joins
        });
        const wave = new THREE.Line(geometry, material);
        wave.userData = { waveAmplitude, initialAmplitude: waveAmplitude, waveLength, waveFrequency: Math.PI / (waveLength / 2), yOffset };
        return wave;
    }

    // Create two connected waves, one on each side of the screen
    const leftWave = createConnectedWave(-waveLengthLeft / 2, 1, waveLengthLeft, waveAmplitudeLeft, yOffset);
    const rightWave = createConnectedWave(waveLengthRight / 2, -1, waveLengthRight, waveAmplitudeRight, yOffset);
    scene.add(leftWave);
    scene.add(rightWave);

    let time = 0;
    let timeDirection = 1; // 1 for forward, -1 for backward

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        time += 0.05 * timeDirection;

        // Check if the wave crests need to reverse direction
        if (time > waveLengthLeft / 4 || time < -waveLengthLeft / 4) {
            timeDirection *= -1;
        }

        // Function to calculate wave Y position
        function calculateWaveYPosition(x, waveData) {
            return waveData.yOffset + waveData.waveAmplitude * Math.sin(((x + waveData.waveLength / 4) % waveData.waveLength) * waveData.waveFrequency);
        }

        // Update the positions of the points for the left wave
        const leftPositions = leftWave.geometry.attributes.position.array;
        const leftWaveData = leftWave.userData;
        for (let i = 0; i < numPoints; i++) {
            const x = leftPositions[i * 3] + time;
            if (x > -leftWaveData.waveLength / 4 && x < leftWaveData.waveLength / 4) {
                leftPositions[i * 3 + 1] = calculateWaveYPosition(x, leftWaveData);
            } else {
                leftPositions[i * 3 + 1] = leftWaveData.yOffset;
            }
        }

        // Update the positions of the points for the right wave
        const rightPositions = rightWave.geometry.attributes.position.array;
        const rightWaveData = rightWave.userData;
        for (let i = 0; i < numPoints; i++) {
            const x = rightPositions[i * 3] - time;
            if (x > -rightWaveData.waveLength / 4 && x < rightWaveData.waveLength / 4) {
                rightPositions[i * 3 + 1] = calculateWaveYPosition(x, rightWaveData);
            } else {
                rightPositions[i * 3 + 1] = rightWaveData.yOffset;
            }
        }

        // Check for intersection and adjust amplitude
        let wavesOverlap = false;
        for (let i = 0; i < numPoints; i++) {
            const leftX = leftPositions[i * 3];
            const rightX = rightPositions[i * 3];
            if (Math.abs(leftX - rightX) < 0.1) { // Adjust threshold for intersection detection
                const leftY = leftPositions[i * 3 + 1];
                const rightY = rightPositions[i * 3 + 1];
                if (Math.abs(leftY - rightY) < 0.1) { // Adjust threshold for Y intersection
                    wavesOverlap = true;
                    if (leftWaveData.waveAmplitude > rightWaveData.waveAmplitude) {
                        leftWaveData.waveAmplitude = leftWaveData.initialAmplitude + rightWaveData.initialAmplitude;
                    } else {
                        rightWaveData.waveAmplitude = rightWaveData.initialAmplitude + leftWaveData.initialAmplitude;
                    }
                }
            }
        }

        // If waves do not overlap, revert to initial amplitude
        if (!wavesOverlap) {
            leftWaveData.waveAmplitude = leftWaveData.initialAmplitude;
            rightWaveData.waveAmplitude = rightWaveData.initialAmplitude;
        }

        leftWave.geometry.attributes.position.needsUpdate = true;
        rightWave.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    document.getElementById('leftWaveAmplitude').addEventListener('input', function (event) {
        leftWave.userData.waveAmplitude = parseFloat(event.target.value); // Update left wave amplitude
        leftWave.userData.initialAmplitude = parseFloat(event.target.value); // Update initial left wave amplitude
    });

    document.getElementById('rightWaveAmplitude').addEventListener('input', function (event) {
        rightWave.userData.waveAmplitude = parseFloat(event.target.value); // Update right wave amplitude
        rightWave.userData.initialAmplitude = parseFloat(event.target.value); // Update initial right wave amplitude
    });

    animate();
}