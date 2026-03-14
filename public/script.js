// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510); // dark blue-black

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ----- Black Hole (unchanged, as you liked it) -----
const blackHoleGroup = new THREE.Group();

// Core
const coreGeo = new THREE.SphereGeometry(1.5, 128, 128);
const coreMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x220000, roughness: 0.2, metalness: 0.1 });
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
const photonRingMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff5500, transparent: true, opacity: 0.9 });
const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
photonRing.rotation.x = Math.PI / 2;
blackHoleGroup.add(photonRing);

// Second ring
const ring2Geo = new THREE.TorusGeometry(2.4, 0.02, 32, 100);
const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x44aaff, emissive: 0x2244aa, transparent: true, opacity: 0.6 });
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

// ----- PlayStation-Style Particles (▲, ●, ✖, ■) -----
// Create canvas textures for each shape with PlayStation colors
function createShapeTexture(shape, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI*2);
        ctx.fill();
    } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(16, 4);
        ctx.lineTo(28, 24);
        ctx.lineTo(4, 24);
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
        // Also draw a small X shape
    }
    return new THREE.CanvasTexture(canvas);
}

// PlayStation colors: red circle, green triangle, blue cross, pink square (classic)
const shapes = [
    { type: 'circle', color: '#ff3333' },  // red
    { type: 'triangle', color: '#33ff33' }, // green
    { type: 'x', color: '#3333ff' },        // blue
    { type: 'square', color: '#ff33ff' }    // pink
];

const textures = shapes.map(s => createShapeTexture(s.type, s.color));

// Create separate point clouds for each shape to easily apply different textures
const particleGroups = [];
const particlesPerShape = 1000; // 4000 total
const totalParticles = particlesPerShape * 4;

// Store velocities for each particle
const velocities = [];

for (let shapeIdx = 0; shapeIdx < 4; shapeIdx++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesPerShape * 3);
    const colors = new Float32Array(particlesPerShape * 3); // optional, not strictly needed
    
    for (let i = 0; i < particlesPerShape; i++) {
        // Spherical distribution with radius 20-60
        const r = 20 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = r * Math.cos(phi);
        
        // Random color tint (optional)
        const color = new THREE.Color().setHSL(0.6 + Math.random()*0.3, 0.8, 0.6);
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
        
        // Initialize velocity (random direction, small speed)
        const vx = (Math.random() - 0.5) * 0.1;
        const vy = (Math.random() - 0.5) * 0.1;
        const vz = (Math.random() - 0.5) * 0.1;
        velocities.push({ x: vx, y: vy, z: vz });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        map: textures[shapeIdx],
        size: 0.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.9
    });
    
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    particleGroups.push(points);
}

// Flattened position array references for easier updates
const posArrays = particleGroups.map(g => g.geometry.attributes.position.array);
const totalParticleCount = totalParticles;

// Store original positions for boundary recovery
const originalPositions = new Float32Array(totalParticleCount * 3);
let idx = 0;
for (let g = 0; g < 4; g++) {
    const arr = posArrays[g];
    for (let i = 0; i < arr.length; i++) {
        originalPositions[idx++] = arr[i];
    }
}

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

// Click burst
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
    mouseVec.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouseVec.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    
    const direction = raycaster.ray.direction.clone().multiplyScalar(15);
    const burstPos = camera.position.clone().add(direction);
    
    const burstCount = 200;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = [];
    const burstColors = [];
    const burstVelocities = [];
    
    for (let i = 0; i < burstCount; i++) {
        burstPositions.push(burstPos.x, burstPos.y, burstPos.z);
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
        burstColors.push(color.r, color.g, color.b);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.1 + Math.random() * 0.2;
        burstVelocities.push({
            x: Math.sin(phi) * Math.cos(theta) * speed,
            y: Math.sin(phi) * Math.sin(theta) * speed,
            z: Math.cos(phi) * speed
        });
    }
    
    burstGeo.setAttribute('position', new THREE.Float32BufferAttribute(burstPositions, 3));
    burstGeo.setAttribute('color', new THREE.Float32BufferAttribute(burstColors, 3));
    
    const burstMat = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);
    
    let life = 1.0;
    function animateBurst() {
        if (life <= 0) {
            scene.remove(burst);
            return;
        }
        life -= 0.02;
        const posAttr = burst.geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < burstCount; i++) {
            arr[i*3] += burstVelocities[i].x;
            arr[i*3+1] += burstVelocities[i].y;
            arr[i*3+2] += burstVelocities[i].z;
        }
        posAttr.needsUpdate = true;
        burst.material.opacity = life;
        requestAnimationFrame(animateBurst);
    }
    animateBurst();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Black hole rotation
    blackHoleGroup.rotation.y += (targetBlackHoleRotY - blackHoleGroup.rotation.y) * 0.05;
    blackHoleGroup.rotation.x += (targetBlackHoleRotX - blackHoleGroup.rotation.x) * 0.05;
    blackHoleGroup.rotation.y += scrollFactor * 0.02;
    diskParticles.rotation.y += 0.005;

    // Update particles: random movement + mouse repulsion
    const mouseDir = new THREE.Vector3(mouseX, mouseY, 0.5).normalize();
    const repulsionStrength = 0.05;
    
    let particleIndex = 0;
    for (let g = 0; g < 4; g++) {
        const posAttr = particleGroups[g].geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < arr.length; i += 3) {
            // Apply velocity
            arr[i] += velocities[particleIndex].x;
            arr[i+1] += velocities[particleIndex].y;
            arr[i+2] += velocities[particleIndex].z;
            
            // Randomly change velocity (Brownian motion)
            velocities[particleIndex].x += (Math.random() - 0.5) * 0.01;
            velocities[particleIndex].y += (Math.random() - 0.5) * 0.01;
            velocities[particleIndex].z += (Math.random() - 0.5) * 0.01;
            
            // Limit speed
            const speed = Math.sqrt(
                velocities[particleIndex].x**2 +
                velocities[particleIndex].y**2 +
                velocities[particleIndex].z**2
            );
            if (speed > 0.2) {
                velocities[particleIndex].x *= 0.99;
                velocities[particleIndex].y *= 0.99;
                velocities[particleIndex].z *= 0.99;
            }
            
            // Mouse repulsion: if particle is near mouse direction, push away
            const particlePos = new THREE.Vector3(arr[i], arr[i+1], arr[i+2]);
            const toCamera = camera.position.clone().sub(particlePos).normalize();
            const dot = toCamera.dot(mouseDir);
            if (dot > 0.9) {
                arr[i] += mouseDir.x * repulsionStrength;
                arr[i+1] += mouseDir.y * repulsionStrength;
                arr[i+2] += mouseDir.z * repulsionStrength;
            }
            
            // Keep within spherical shell (20-60 radius)
            const radius = Math.sqrt(arr[i]**2 + arr[i+1]**2 + arr[i+2]**2);
            if (radius < 18) {
                // Push outward
                const normX = arr[i] / radius;
                const normY = arr[i+1] / radius;
                const normZ = arr[i+2] / radius;
                arr[i] = normX * 22;
                arr[i+1] = normY * 22;
                arr[i+2] = normZ * 22;
                velocities[particleIndex].x += normX * 0.02;
                velocities[particleIndex].y += normY * 0.02;
                velocities[particleIndex].z += normZ * 0.02;
            } else if (radius > 62) {
                // Pull inward
                const normX = arr[i] / radius;
                const normY = arr[i+1] / radius;
                const normZ = arr[i+2] / radius;
                arr[i] = normX * 58;
                arr[i+1] = normY * 58;
                arr[i+2] = normZ * 58;
                velocities[particleIndex].x -= normX * 0.02;
                velocities[particleIndex].y -= normY * 0.02;
                velocities[particleIndex].z -= normZ * 0.02;
            }
            
            particleIndex++;
        }
        posAttr.needsUpdate = true;
    }

    // Camera parallax
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