window.onload = function () {
    const container = document.querySelector('#canvas-container');
    const loader = new THREE.GLTFLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

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
    const waveAmplitude = 2;
    const waveFrequency = 0.1;
    const waveLength = 50; // Total length of each wave
    let phaseShift = 0; // Phase shift to make crests move towards the center
    let phaseShiftDirection = -1; // Direction of the phase shift

    // Function to create a sine wave
    function createSineWave(startX, endX, direction) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = startX + (endX - startX) * (i / numPoints);
            points.push(new THREE.Vector3(x, 0, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const wave = new THREE.Line(geometry, material);
        return wave;
    }

    let wave1 = createSineWave(-waveLength, 0, 1); // Left to middle
    let wave2 = createSineWave(0, waveLength, -1); // Right to middle
    scene.add(wave1);
    scene.add(wave2);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Update the phase shift to make crests move towards the center
        phaseShift += 0.05 * phaseShiftDirection;

        // Reverse the direction of the phase shift when it reaches certain thresholds
        if (phaseShift <= -waveLength / 2 || phaseShift >= waveLength / 2) {
            phaseShiftDirection *= -1;
        }

        // Update the positions of the points based on the phase shift
        const positions1 = wave1.geometry.attributes.position.array;
        const positions2 = wave2.geometry.attributes.position.array;
        for (let i = 0; i < numPoints; i++) {
            const x1 = positions1[i * 3];
            const distanceFromCenter1 = Math.abs(x1);
            const shiftFactor1 = Math.exp(-Math.pow(distanceFromCenter1 - phaseShift, 2) / (2 * Math.pow(waveLength / 10, 2)));
            const y1 = waveAmplitude * Math.sin(waveFrequency * x1) * shiftFactor1;
            positions1[i * 3 + 1] = y1;

            const x2 = positions2[i * 3];
            const distanceFromCenter2 = Math.abs(x2);
            const shiftFactor2 = Math.exp(-Math.pow(distanceFromCenter2 - phaseShift, 2) / (2 * Math.pow(waveLength / 10, 2)));
            const y2 = waveAmplitude * Math.sin(waveFrequency * x2) * shiftFactor2;
            positions2[i * 3 + 1] = y2;
        }

        // Mark the position attributes as needing update
        wave1.geometry.attributes.position.needsUpdate = true;
        wave2.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();


};