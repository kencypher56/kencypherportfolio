// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ----- Black Hole (Interstellar style) -----
const blackHoleGroup = new THREE.Group();

// Core (event horizon)
const coreGeo = new THREE.SphereGeometry(1.5, 128, 128);
const coreMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x220000,
    roughness: 0.2,
    metalness: 0.1
});
const core = new THREE.Mesh(coreGeo, coreMat);
blackHoleGroup.add(core);

// Accretion disk particles
const diskParticlesGeo = new THREE.BufferGeometry();
const diskCount = 15000;
const diskPositions = new Float32Array(diskCount * 3);
const diskColors = new Float32Array(diskCount * 3);
for (let i = 0; i < diskCount; i++) {
    const radius = 2.0 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.2 * (radius / 3.5);
    const twist = (radius - 2.0) * 2.0;
    const finalAngle = angle + twist;
    diskPositions[i*3] = Math.cos(finalAngle) * radius;
    diskPositions[i*3+1] = y;
    diskPositions[i*3+2] = Math.sin(finalAngle) * radius;
    
    const t = (radius - 2.0) / 3.5;
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

// Photon ring
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

// Second ring
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

// Glow lights
const glowLight = new THREE.PointLight(0xff5500, 1, 20);
glowLight.position.set(2, 1, 2);
blackHoleGroup.add(glowLight);
const glowLight2 = new THREE.PointLight(0x3355ff, 0.5, 20);
glowLight2.position.set(-2, -1, -2);
blackHoleGroup.add(glowLight2);

scene.add(blackHoleGroup);

// ----- New Dynamic Background Particles (inspired by toukoum) -----
const bgParticleCount = 6000;
const bgParticlesGeo = new THREE.BufferGeometry();
const bgPositions = new Float32Array(bgParticleCount * 3);
const bgColors = new Float32Array(bgParticleCount * 3);
const bgSizes = new Float32Array(bgParticleCount);

// Store velocities for animation
const bgVelocities = [];

for (let i = 0; i < bgParticleCount; i++) {
    // Larger sphere for depth (80 to 150 units)
    const r = 80 + Math.random() * 70;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    bgPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    bgPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    bgPositions[i*3+2] = r * Math.cos(phi);
    
    // Color: subtle blues, purples, whites with slight RGB variation
    const hue = 0.65 + Math.random() * 0.2; // blue to purple range
    const color = new THREE.Color().setHSL(hue, 0.6, 0.5 + Math.random() * 0.3);
    bgColors[i*3] = color.r;
    bgColors[i*3+1] = color.g;
    bgColors[i*3+2] = color.b;
    
    bgSizes[i] = 0.2 + Math.random() * 0.5;
    
    // Random slow drift velocity
    bgVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
    ));
}

bgParticlesGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
bgParticlesGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
bgParticlesGeo.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

const bgParticlesMat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
});
const bgParticles = new THREE.Points(bgParticlesGeo, bgParticlesMat);
scene.add(bgParticles);

// Store original positions for drift reset
const originalBgPositions = bgPositions.slice();

// Mouse interaction for background particles
let mouseX = 0, mouseY = 0;
let mouseWorldPos = new THREE.Vector3();
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    // Approximate 3D mouse position in the scene (at mid-distance)
    mouseWorldPos.set(mouseX * 50, mouseY * 30 + 2, 30);
});

// Click burst effect
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
    mouseVec.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouseVec.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    
    const clickPoint = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));
    
    // Apply impulse to nearby background particles
    const positions = bgParticlesGeo.attributes.position.array;
    for (let i = 0; i < bgParticleCount; i++) {
        const ix = i*3;
        const px = positions[ix];
        const py = positions[ix+1];
        const pz = positions[ix+2];
        const distSq = (px - clickPoint.x)**2 + (py - clickPoint.y)**2 + (pz - clickPoint.z)**2;
        if (distSq < 400) { // radius 20
            const dir = new THREE.Vector3(px - clickPoint.x, py - clickPoint.y, pz - clickPoint.z).normalize();
            bgVelocities[i].add(dir.multiplyScalar(0.2));
        }
    }
    
    // Visual burst
    const burstCount = 200;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = [];
    const burstColors = [];
    for (let j = 0; j < burstCount; j++) {
        burstPositions.push(clickPoint.x, clickPoint.y, clickPoint.z);
        burstColors.push(Math.random(), Math.random(), Math.random());
    }
    burstGeo.setAttribute('position', new THREE.Float32BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute('color', new THREE.Float32BufferAttribute(burstColors, 3));
    const burstMat = new THREE.PointsMaterial({ size: 0.4, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);
    
    const burstVelocities = [];
    for (let j = 0; j < burstCount; j++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.2 + Math.random() * 0.4;
        burstVelocities.push({
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
        life -= 0.015;
        const positions = burst.geometry.attributes.position.array;
        for (let j = 0; j < burstCount; j++) {
            positions[j*3] += burstVelocities[j].x;
            positions[j*3+1] += burstVelocities[j].y;
            positions[j*3+2] += burstVelocities[j].z;
        }
        burst.geometry.attributes.position.needsUpdate = true;
        burst.material.opacity = life;
        requestAnimationFrame(animateBurst);
    }
    animateBurst();
});

// Scroll interaction (affects black hole rotation and name fade)
let scrollFactor = 0;
const nameElement = document.getElementById('main-name');
window.addEventListener('scroll', () => {
    scrollFactor = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (nameElement) {
        nameElement.style.opacity = Math.max(0, 1 - scrollFactor * 2);
    }
});

// Black hole rotation targets
let targetBlackHoleRotY = 0;
let targetBlackHoleRotX = 0.2;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Black hole rotation (smooth follow)
    blackHoleGroup.rotation.y += (targetBlackHoleRotY - blackHoleGroup.rotation.y) * 0.05;
    blackHoleGroup.rotation.x += (targetBlackHoleRotX - blackHoleGroup.rotation.x) * 0.05;
    blackHoleGroup.rotation.y += scrollFactor * 0.02;
    diskParticles.rotation.y += 0.005;

    // Update background particles
    const positions = bgParticlesGeo.attributes.position.array;
    for (let i = 0; i < bgParticleCount; i++) {
        const ix = i*3;
        // Apply velocity
        positions[ix] += bgVelocities[i].x;
        positions[ix+1] += bgVelocities[i].y;
        positions[ix+2] += bgVelocities[i].z;
        
        // Mouse repulsion
        const px = positions[ix];
        const py = positions[ix+1];
        const pz = positions[ix+2];
        const toMouse = new THREE.Vector3(px - mouseWorldPos.x, py - mouseWorldPos.y, pz - mouseWorldPos.z);
        const dist = toMouse.length();
        if (dist < 30) {
            const force = toMouse.normalize().multiplyScalar(0.05 * (30 - dist) / 30);
            bgVelocities[i].add(force);
        }
        
        // Boundary: keep within sphere, gently push back
        const pos = new THREE.Vector3(px, py, pz);
        const r = pos.length();
        if (r > 150) {
            pos.normalize().multiplyScalar(140);
            positions[ix] = pos.x;
            positions[ix+1] = pos.y;
            positions[ix+2] = pos.z;
            bgVelocities[i].reflect(pos.clone().normalize());
        } else if (r < 70) {
            pos.normalize().multiplyScalar(80);
            positions[ix] = pos.x;
            positions[ix+1] = pos.y;
            positions[ix+2] = pos.z;
            bgVelocities[i].reflect(pos.clone().normalize().negate());
        }
        
        // Damping
        bgVelocities[i].multiplyScalar(0.99);
    }
    bgParticlesGeo.attributes.position.needsUpdate = true;

    // Camera parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 2 + 2 - camera.position.y) * 0.02;
    camera.lookAt(blackHoleGroup.position);

    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});