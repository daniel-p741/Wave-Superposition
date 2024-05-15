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

    // Function to create a sine wave
    function createSineWave(startX, endX, direction) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = startX + (endX - startX) * (i / numPoints);
            const y = waveAmplitude * Math.sin(waveFrequency * (x - phaseShift) * direction);
            points.push(new THREE.Vector3(x, y, 0));
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
        phaseShift += 0.05;

        // Re-create the wave geometries with updated phase shift
        scene.remove(wave1);
        scene.remove(wave2);
        wave1.geometry.dispose();
        wave2.geometry.dispose();
        wave1 = createSineWave(-waveLength, 0, 1);
        wave2 = createSineWave(0, waveLength, -1);
        scene.add(wave1);
        scene.add(wave2);

        renderer.render(scene, camera);
    }

    animate();


};