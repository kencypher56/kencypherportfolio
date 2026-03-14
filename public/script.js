// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510); // very dark blue-black

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false; // not needed

// ----- Black Hole with Gravitational Lensing Effect -----
const blackHoleGroup = new THREE.Group();

// Core (event horizon) - pure black sphere with slight emissive to fake glow
const coreGeo = new THREE.SphereGeometry(1.5, 128, 128);
const coreMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x220000,
    roughness: 0.2,
    metalness: 0.1
});
const core = new THREE.Mesh(coreGeo, coreMat);
blackHoleGroup.add(core);

// Accretion disk (particle-based for more realism)
const diskParticlesGeo = new THREE.BufferGeometry();
const diskCount = 15000;
const diskPositions = new Float32Array(diskCount * 3);
const diskColors = new Float32Array(diskCount * 3);
for (let i = 0; i < diskCount; i++) {
    const radius = 2.0 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.2 * (radius / 3.5); // thinner at edges
    // Spiral twist
    const twist = (radius - 2.0) * 2.0;
    const finalAngle = angle + twist;
    diskPositions[i*3] = Math.cos(finalAngle) * radius;
    diskPositions[i*3+1] = y;
    diskPositions[i*3+2] = Math.sin(finalAngle) * radius;
    
    // Color from orange to red to blue based on radius
    const t = (radius - 2.0) / 3.5; // 0 near core, 1 at edge
    const r = 1.0;
    const g = 0.5 + 0.5 * Math.sin(t * Math.PI);
    const b = 0.2 + 0.8 * t;
    diskColors[i*3] = r;
    diskColors[i*3+1] = g;
    diskColors[i*3+2] = b;
}
diskParticlesGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
diskParticlesGeo.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));
const diskParticlesMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 });
const diskParticles = new THREE.Points(diskParticlesGeo, diskParticlesMat);
blackHoleGroup.add(diskParticles);

// Photon ring (thin glowing ring)
const photonRingGeo = new THREE.TorusGeometry(1.8, 0.03, 32, 100);
const photonRingMat = new THREE.MeshStandardMaterial({
    color: 0xffaa33,
    emissive: 0xff5500,
    transparent: true,
    opacity: 0.9
});
const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
photonRing.rotation.x = Math.PI / 2;
blackHoleGroup.add(photonRing);

// Second ring (cooler)
const ring2Geo = new THREE.TorusGeometry(2.4, 0.02, 32, 100);
const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0x44aaff,
    emissive: 0x2244aa,
    transparent: true,
    opacity: 0.6
});
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
ring2.rotation.x = Math.PI / 2;
ring2.rotation.z = 0.3;
blackHoleGroup.add(ring2);

// Add gravitational lensing effect: a transparent sphere with refraction-like shader? 
// We'll simulate by adding a slightly larger sphere with a distorted texture or by using a custom shader.
// For simplicity, we'll add a few extra rings and a glow effect using point lights.

const glowLight = new THREE.PointLight(0xff5500, 1, 20);
glowLight.position.set(2, 1, 2);
blackHoleGroup.add(glowLight);
const glowLight2 = new THREE.PointLight(0x3355ff, 0.5, 20);
glowLight2.position.set(-2, -1, -2);
blackHoleGroup.add(glowLight2);

scene.add(blackHoleGroup);

// ----- Background Interactive Particles (PlayStation symbols) -----
// Create canvas textures for different shapes
function createShapeTexture(shape, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI*2);
        ctx.fill();
    } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(16, 2);
        ctx.lineTo(30, 26);
        ctx.lineTo(2, 26);
        ctx.closePath();
        ctx.fill();
    } else if (shape === 'square') {
        ctx.fillRect(6, 6, 20, 20);
    } else if (shape === 'x') {
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.lineTo(26, 26);
        ctx.moveTo(26, 6);
        ctx.lineTo(6, 26);
        ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

const shapes = ['circle', 'triangle', 'square', 'x'];
const colors = ['#ff3366', '#33ff66', '#3366ff', '#ffcc00'];

const particleCount = 4000;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleTypes = new Uint8Array(particleCount); // 0-3 for shape index

for (let i = 0; i < particleCount; i++) {
    // Random sphere distribution with radius 20-60
    const r = 20 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i*3+2] = r * Math.cos(phi);
    
    const color = new THREE.Color().setHSL(0.6 + Math.random()*0.3, 0.8, 0.6);
    particleColors[i*3] = color.r;
    particleColors[i*3+1] = color.g;
    particleColors[i*3+2] = color.b;
    
    particleSizes[i] = 0.1 + Math.random() * 0.3;
    particleTypes[i] = Math.floor(Math.random() * 4);
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
particles.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
particles.setAttribute('type', new THREE.BufferAttribute(particleTypes, 1));

// Custom shader material for points to use different textures based on type
const vertexShader = `
    attribute float size;
    attribute float type;
    varying float vType;
    void main() {
        vType = type;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    uniform sampler2D textures[4];
    varying float vType;
    varying vec3 vColor;
    void main() {
        int index = int(vType);
        vec4 texColor;
        if (index == 0) texColor = texture2D(textures[0], gl_PointCoord);
        else if (index == 1) texColor = texture2D(textures[1], gl_PointCoord);
        else if (index == 2) texColor = texture2D(textures[2], gl_PointCoord);
        else texColor = texture2D(textures[3], gl_PointCoord);
        
        if (texColor.a < 0.1) discard;
        gl_FragColor = texColor;
    }
`;

// Create textures
const textures = shapes.map((shape, i) => createShapeTexture(shape, colors[i]));

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        textures: { value: textures }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Store original positions for movement
const originalPositions = particlePositions.slice();

// ----- Mouse Interaction -----
let mouseX = 0, mouseY = 0;
let targetBlackHoleRotY = 0;
let targetBlackHoleRotX = 0.2;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetBlackHoleRotY = mouseX * 0.5;
    targetBlackHoleRotX = 0.2 + mouseY * 0.3;
});

// Scroll interaction
let scrollFactor = 0;
const nameElement = document.getElementById('main-name');
window.addEventListener('scroll', () => {
    scrollFactor = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (nameElement) {
        nameElement.style.opacity = Math.max(0, 1 - scrollFactor * 2);
    }
});

// Click burst (on particles)
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
    mouseVec.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouseVec.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    
    // Create burst at intersection point (or along ray)
    const direction = raycaster.ray.direction.clone().multiplyScalar(15);
    const burstPos = camera.position.clone().add(direction);
    
    // Create burst particles (simple sphere of points)
    const burstCount = 200;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = [];
    const burstColors = [];
    for (let i = 0; i < burstCount; i++) {
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.3;
        burstPositions.push(burstPos.x, burstPos.y, burstPos.z);
        burstColors.push(Math.random(), Math.random(), Math.random());
    }
    burstGeo.setAttribute('position', new THREE.Float32BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute('color', new THREE.Float32BufferAttribute(burstColors, 3));
    const burstMat = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);
    
    // Animate burst
    const velocities = [];
    for (let i = 0; i < burstCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.1 + Math.random() * 0.2;
        velocities.push({
            x: Math.sin(phi) * Math.cos(theta) * speed,
            y: Math.sin(phi) * Math.sin(theta) * speed,
            z: Math.cos(phi) * speed
        });
    }
    let life = 1.0;
    function animateBurst() {
        if (life <= 0) {
            scene.remove(burst);
            return;
        }
        life -= 0.02;
        const positions = burst.geometry.attributes.position.array;
        for (let i = 0; i < burstCount; i++) {
            positions[i*3] += velocities[i].x;
            positions[i*3+1] += velocities[i].y;
            positions[i*3+2] += velocities[i].z;
        }
        burst.geometry.attributes.position.needsUpdate = true;
        burst.material.opacity = life;
        requestAnimationFrame(animateBurst);
    }
    animateBurst();
});

// Camera control variables
let cameraPosX = 0, cameraPosY = 2, cameraPosZ = 15;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth black hole rotation
    blackHoleGroup.rotation.y += (targetBlackHoleRotY - blackHoleGroup.rotation.y) * 0.05;
    blackHoleGroup.rotation.x += (targetBlackHoleRotX - blackHoleGroup.rotation.x) * 0.05;
    
    // Add scroll effect: rotate faster as we scroll
    blackHoleGroup.rotation.y += scrollFactor * 0.02;

    // Animate disk particles independently
    diskParticles.rotation.y += 0.005;
    
    // Animate background particles: random walk + mouse repulsion
    const positions = particleSystem.geometry.attributes.position.array;
    const count = particleCount;
    const mouseInfluence = 0.5;
    const mouseDir = new THREE.Vector3(mouseX, mouseY, 0.5).normalize();
    
    for (let i = 0; i < count; i++) {
        const ix = i*3;
        const iy = i*3+1;
        const iz = i*3+2;
        
        // Random walk
        positions[ix] += (Math.random() - 0.5) * 0.2;
        positions[iy] += (Math.random() - 0.5) * 0.2;
        positions[iz] += (Math.random() - 0.5) * 0.2;
        
        // Repel from mouse direction (simplified)
        const particlePos = new THREE.Vector3(positions[ix], positions[iy], positions[iz]);
        const toCamera = camera.position.clone().sub(particlePos).normalize();
        const dot = toCamera.dot(mouseDir);
        if (dot > 0.8) {
            // Move away
            positions[ix] += mouseDir.x * 0.1;
            positions[iy] += mouseDir.y * 0.1;
            positions[iz] += mouseDir.z * 0.1;
        }
        
        // Keep within bounds (sphere)
        const radius = Math.sqrt(positions[ix]*positions[ix] + positions[iy]*positions[iy] + positions[iz]*positions[iz]);
        if (radius > 60) {
            // Pull back towards original radius
            const origR = Math.sqrt(originalPositions[ix]*originalPositions[ix] + originalPositions[iy]*originalPositions[iy] + originalPositions[iz]*originalPositions[iz]);
            const factor = origR / radius;
            positions[ix] *= factor;
            positions[iy] *= factor;
            positions[iz] *= factor;
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Camera movement based on mouse for parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 2 + 2 - camera.position.y) * 0.02;
    camera.lookAt(blackHoleGroup.position);

    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});