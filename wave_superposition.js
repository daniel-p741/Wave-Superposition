window.onload = function () {
    const container = document.querySelector('#canvas-container');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xabcdef, 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const light = new THREE.PointLight(0xFFFFFF, 2, 100);
    light.position.set(10, 10, 16);
    scene.add(light);




    const numPoints = 100;

    const waveAmplitudeLeft = 4;
    const waveLengthLeft = 30;


    const waveAmplitudeRight = 3;
    const waveLengthRight = 30;


    const yOffset = -5;

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
            linewidth: 5,
            linecap: 'round',
            linejoin: 'round'
        });
        const wave = new THREE.Line(geometry, material);
        wave.userData = { waveAmplitude, waveLength, waveFrequency: Math.PI / (waveLength / 2), yOffset };
        return wave;
    }

    // Create two connected waves, one on each side of the screen
    const leftWave = createConnectedWave(-waveLengthLeft / 2, 1, waveLengthLeft, waveAmplitudeLeft, yOffset);
    const rightWave = createConnectedWave(waveLengthRight / 2, -1, waveLengthRight, waveAmplitudeRight, yOffset);
    scene.add(leftWave);
    scene.add(rightWave);

    let time = 0;
    let timeDirection = 1; // 1 for forward, -1 for backward

    // Function to update wave points with superposition
    function updateWavePoints(wave, time, direction) {
        const positions = wave.geometry.attributes.position.array;
        const waveData = wave.userData;
        for (let i = 0; i < numPoints; i++) {
            const x = positions[i * 3] + direction * time;
            const leftWaveData = leftWave.userData;
            const rightWaveData = rightWave.userData;
            const leftX = positions[i * 3] + time;
            const rightX = positions[i * 3] - time;

            if (x > -waveData.waveLength / 4 && x < waveData.waveLength / 4) {
                let y = waveData.yOffset + waveData.waveAmplitude * Math.sin(((x + waveData.waveLength / 4) % waveData.waveLength) * waveData.waveFrequency);

                // Check for overlap and apply superposition
                if (leftX > -leftWaveData.waveLength / 4 && leftX < leftWaveData.waveLength / 4 && rightX > -rightWaveData.waveLength / 4 && rightX < rightWaveData.waveLength / 4) {
                    const leftY = leftWaveData.waveAmplitude * Math.sin(((leftX + leftWaveData.waveLength / 4) % leftWaveData.waveLength) * leftWaveData.waveFrequency);
                    const rightY = rightWaveData.waveAmplitude * Math.sin(((rightX + rightWaveData.waveLength / 4) % rightWaveData.waveLength) * rightWaveData.waveFrequency);
                    y = waveData.yOffset + leftY + rightY;
                }

                positions[i * 3 + 1] = y;
            } else {
                positions[i * 3 + 1] = waveData.yOffset;
            }
        }
        wave.geometry.attributes.position.needsUpdate = true;
    }


    function animate() {
        requestAnimationFrame(animate);

        time += 0.05 * timeDirection;

        // Check if the wave crests need to reverse direction
        if (time > waveLengthLeft / 4 || time < -waveLengthLeft / 4) {
            timeDirection *= -1;
        }


        updateWavePoints(leftWave, time, 1);
        updateWavePoints(rightWave, time, -1);

        renderer.render(scene, camera);
    }

    document.getElementById('leftWaveAmplitude').addEventListener('input', function (event) {
        leftWave.userData.waveAmplitude = parseFloat(event.target.value);
    });

    document.getElementById('rightWaveAmplitude').addEventListener('input', function (event) {
        rightWave.userData.waveAmplitude = parseFloat(event.target.value);
    });

    animate();




}
