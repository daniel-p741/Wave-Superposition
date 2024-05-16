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
    const waveAmplitude = 3;
    const waveLength = 40; // Total length of each wave

    // Function to create a single connected wave
    function createConnectedWave(startX, direction) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = startX + direction * (waveLength * i) / numPoints;
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

    // Create two connected waves, one on each side of the screen
    const leftWave = createConnectedWave(-waveLength / 2, 1);
    const rightWave = createConnectedWave(waveLength / 2, -1);
    scene.add(leftWave);
    scene.add(rightWave);

    let time = 0;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        time += 0.05;

        // Update the positions of the points for the left wave
        const leftPositions = leftWave.geometry.attributes.position.array;
        for (let i = 0; i < numPoints; i++) {
            const x = leftPositions[i * 3] + time;
            if (x > -waveLength / 4 && x < waveLength / 4) {
                const y = waveAmplitude * Math.sin(((x + waveLength / 4) % waveLength) * (Math.PI / (waveLength / 2)));
                leftPositions[i * 3 + 1] = y;
            } else {
                leftPositions[i * 3 + 1] = 0;
            }
        }
        leftWave.geometry.attributes.position.needsUpdate = true;

        // Update the positions of the points for the right wave
        const rightPositions = rightWave.geometry.attributes.position.array;
        for (let i = 0; i < numPoints; i++) {
            const x = rightPositions[i * 3] - time;
            if (x > -waveLength / 4 && x < waveLength / 4) {
                const y = waveAmplitude * Math.sin(((x + waveLength / 4) % waveLength) * (Math.PI / (waveLength / 2)));
                rightPositions[i * 3 + 1] = y;
            } else {
                rightPositions[i * 3 + 1] = 0;
            }
        }
        rightWave.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

};