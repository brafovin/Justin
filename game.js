// ============================================================
// FORTCRAFT - Fortnite-Style 3D Battle Royale
// Three.js basiert, First-Person Shooter mit Bau-System
// ============================================================

// ---------- Persistente Daten / Shop ----------
const SAVE_KEY = 'fortcraft_save_v1';

const DEFAULT_SAVE = {
    coins: 1000,
    owned: {
        pickaxe: ['default'],
        skin: ['default'],
        backpack: ['default']
    },
    selected: {
        pickaxe: 'default',
        skin: 'default',
        backpack: 'default'
    }
};

let save = loadSave();

function loadSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SAVE, ...parsed };
        }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
}

function saveGame() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
}

// ---------- Shop-Items ----------
const SHOP_ITEMS = {
    pickaxe: [
        { id: 'default',  name: 'STANDARD',     icon: '⛏',  rarity: 'common',    price: 0,    color: '#9e9e9e' },
        { id: 'neon',     name: 'NEON REAPER',  icon: '⚒',  rarity: 'rare',      price: 300,  color: '#00e5ff' },
        { id: 'candy',    name: 'ZUCKERSTANGE', icon: '🍭', rarity: 'rare',      price: 400,  color: '#ff4081' },
        { id: 'pharaoh',  name: 'PHARAO',       icon: '⚱',  rarity: 'epic',      price: 800,  color: '#ba68c8' },
        { id: 'dragon',   name: 'DRACHENKLAUE', icon: '🐉', rarity: 'epic',      price: 1200, color: '#e91e63' },
        { id: 'galaxy',   name: 'GALAXIE-AXT',  icon: '✦',  rarity: 'legendary', price: 2000, color: '#ff9800' }
    ],
    skin: [
        { id: 'default',  name: 'DEFAULT DRIFT', icon: '🧍', rarity: 'common',    price: 0,    color: '#4fc3f7' },
        { id: 'ranger',   name: 'RANGER',        icon: '🪖', rarity: 'common',    price: 200,  color: '#8d6e63' },
        { id: 'ninja',    name: 'SHADOW NINJA',  icon: '🥷', rarity: 'rare',      price: 500,  color: '#37474f' },
        { id: 'knight',   name: 'RITTER',        icon: '🛡', rarity: 'epic',      price: 900,  color: '#90a4ae' },
        { id: 'raven',    name: 'RAVEN',         icon: '🦅', rarity: 'epic',      price: 1500, color: '#263238' },
        { id: 'omega',    name: 'OMEGA',         icon: '👑', rarity: 'legendary', price: 2500, color: '#ffc107' }
    ],
    backpack: [
        { id: 'default',  name: 'STANDARD',      icon: '🎒', rarity: 'common',    price: 0,    color: '#6d4c41' },
        { id: 'wings',    name: 'ENGELSFL\u00dcGEL',  icon: '🪽', rarity: 'rare',      price: 350,  color: '#e1f5fe' },
        { id: 'jetpack',  name: 'JETPACK',       icon: '🚀', rarity: 'epic',      price: 700,  color: '#ef5350' },
        { id: 'crystal',  name: 'KRISTALL',      icon: '💎', rarity: 'epic',      price: 1100, color: '#80deea' },
        { id: 'cape',     name: 'DRACHENUMHANG', icon: '🧥', rarity: 'legendary', price: 1800, color: '#7b1fa2' }
    ]
};

function rarityLabel(r) {
    return { common: 'GEW\u00d6HNLICH', rare: 'SELTEN', epic: 'EPISCH', legendary: 'LEGEND\u00c4R' }[r] || r;
}

// ---------- Menü / Screen Navigation ----------
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function updateCoinDisplays() {
    ['menu-coins', 'shop-coins', 'locker-coins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = save.coins;
    });
}

function updateCharacterPreview() {
    const skin = SHOP_ITEMS.skin.find(s => s.id === save.selected.skin);
    const preview = document.getElementById('character-preview');
    const name = document.getElementById('char-name');
    if (preview && skin) {
        preview.style.background = `linear-gradient(180deg, ${skin.color} 0%, #000 120%)`;
    }
    if (name && skin) name.textContent = skin.name;
}

function openShop() {
    showScreen('shop-screen');
    renderShopGrid('pickaxe', 'shop-grid', false);
    setupTabs('shop-screen', 'shop-grid', false);
}

function openLocker() {
    showScreen('locker-screen');
    renderShopGrid('pickaxe', 'locker-grid', true);
    setupTabs('locker-screen', 'locker-grid', true);
}

function openHelp() {
    showScreen('help-screen');
}

function backToMenu() {
    showScreen('main-menu');
    updateCoinDisplays();
    updateCharacterPreview();
}

function setupTabs(screenId, gridId, lockerMode) {
    const screen = document.getElementById(screenId);
    screen.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            screen.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShopGrid(btn.dataset.tab, gridId, lockerMode);
        };
    });
}

function renderShopGrid(category, gridId, lockerMode) {
    const grid = document.getElementById(gridId);
    const items = SHOP_ITEMS[category];
    grid.innerHTML = '';
    items.forEach(item => {
        const owned = save.owned[category].includes(item.id);
        const selected = save.selected[category] === item.id;
        if (lockerMode && !owned) return;
        const div = document.createElement('div');
        div.className = `shop-item ${item.rarity}`;
        div.innerHTML = `
            <div class="item-preview" style="background:linear-gradient(180deg, ${item.color}, #111);">${item.icon}</div>
            <h3>${item.name}</h3>
            <div class="rarity-label">${rarityLabel(item.rarity)}</div>
            <button class="buy-btn ${selected ? 'selected' : owned ? 'owned' : ''}"
                    ${(!owned && save.coins < item.price) ? 'disabled' : ''}>
                ${selected ? 'AUSGERÜSTET' : owned ? 'AUSRÜSTEN' : `KAUFEN ● ${item.price}`}
            </button>
        `;
        const btn = div.querySelector('button');
        btn.onclick = () => {
            if (selected) return;
            if (owned) {
                save.selected[category] = item.id;
            } else {
                if (save.coins < item.price) return;
                save.coins -= item.price;
                save.owned[category].push(item.id);
                save.selected[category] = item.id;
            }
            saveGame();
            updateCoinDisplays();
            renderShopGrid(category, gridId, lockerMode);
        };
        grid.appendChild(div);
    });
}

// ============================================================
// 3D SPIEL MIT THREE.JS
// ============================================================

const WORLD_SIZE = 200;
const GRAVITY = 30;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.4;
const JUMP_SPEED = 10;

// Weapons
const WEAPONS = {
    pickaxe: { name: 'SPITZHACKE', icon: '⛏', damage: 20, fireRate: 0.5, range: 3,   spread: 0,    ammo: Infinity, clip: Infinity, sound: 'thud', isMelee: true },
    ar:      { name: 'STURMGEWEHR', icon: '🔫', damage: 18, fireRate: 0.1, range: 100, spread: 0.01, ammo: 90, clip: 30,  sound: 'bang' },
    shotgun: { name: 'SCHROTFLINTE', icon: '💥', damage: 12, fireRate: 0.8, range: 25,  spread: 0.1,  pellets: 8, ammo: 32, clip: 8, sound: 'boom' },
    sniper:  { name: 'SCHARFSCH\u00dcTZE', icon: '🎯', damage: 85, fireRate: 1.5, range: 300, spread: 0,    ammo: 20, clip: 5, sound: 'crack' }
};

const WEAPON_ORDER = ['pickaxe', 'ar', 'shotgun', 'sniper'];

// Build pieces (1x1 grid aligned)
const BUILD_SIZE = 4; // 4 units per piece
const BUILD_COST = 10;

// --- Three.js globale Variablen ---
let scene, camera, renderer, clock;
let playerState;
let worldObjects = []; // statische Kollider: { mesh, box, bulletBlock }
let buildPieces = [];  // vom Spieler gebaut
let bots = [];
let projectiles = []; // Kugel-Trails (visuell)
let raycaster;
let keys = {};
let mouse = { dx: 0, dy: 0, locked: false };
let yaw = 0, pitch = 0;
let gameRunning = false;
let buildModeOn = false;
let buildType = 'wall';
let ghost;
let weaponState = {};
let currentWeapon = 'ar';
let killCount = 0;
let gameStartTime = 0;
let damageFlashTime = 0;
let hitmarkerTime = 0;
let wood = 500;

// ---------- Three.js Setup ----------
function initThree() {
    if (scene) return; // nur einmal
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 60, 220);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, PLAYER_HEIGHT, 0);

    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();

    // Licht
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.0);
    sun.position.set(60, 120, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 400;
    scene.add(sun);

    // Boden
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Welt füllen
    buildWorld();

    // Ghost-Vorschau für Bauteile
    const ghostGeo = new THREE.BoxGeometry(BUILD_SIZE, BUILD_SIZE, 0.3);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35, wireframe: false });
    ghost = new THREE.Mesh(ghostGeo, ghostMat);
    ghost.visible = false;
    scene.add(ghost);

    window.addEventListener('resize', onResize);
}

function onResize() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Welt / Hindernisse ----------
function addObstacle(mesh, bulletBlock = true) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    worldObjects.push({ mesh, box, bulletBlock, type: 'static' });
}

function makeBox(w, h, d, color, x, y, z) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color })
    );
    mesh.position.set(x, y, z);
    return mesh;
}

function makeTree(x, z) {
    const group = new THREE.Group();
    const trunkH = 5 + Math.random() * 3;
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.7, trunkH, 8),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2.2 + Math.random() * 0.8, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
    );
    leaves.position.y = trunkH + 1.3;
    leaves.castShadow = true;
    group.add(leaves);

    group.position.set(x, 0, z);
    scene.add(group);
    group.updateMatrixWorld(true);

    // Kollider als Box um Stamm
    const trunkBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, trunkH / 2, z),
        new THREE.Vector3(1.4, trunkH, 1.4)
    );
    worldObjects.push({ mesh: trunk, box: trunkBox, bulletBlock: true, type: 'tree' });

    // Blätterkrone als zusätzlicher Blocker
    const leavesBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, trunkH + 1.3, z),
        new THREE.Vector3(4.4, 4.4, 4.4)
    );
    worldObjects.push({ mesh: leaves, box: leavesBox, bulletBlock: true, type: 'leaves' });
}

function makeHouse(x, z, size) {
    const w = size, d = size, h = 4;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
    const group = new THREE.Group();

    // 4 Wände
    const north = makeBox(w, h, 0.4, 0xbcaaa4, 0, h/2, -d/2);
    const south = makeBox(w, h, 0.4, 0xbcaaa4, 0, h/2,  d/2);
    const east  = makeBox(0.4, h, d, 0xbcaaa4,  w/2, h/2, 0);
    const west  = makeBox(0.4, h, d, 0xbcaaa4, -w/2, h/2, 0);

    // Tür in South-Wand (Lücke durch Door-Cutout simulieren via zwei Wandteilen)
    south.visible = false;
    const doorGap = 1.8;
    const leftPart  = makeBox((w - doorGap) / 2, h, 0.4, 0xbcaaa4, -(w/2 + doorGap/2)/2 - doorGap/2 + (w - doorGap)/4, h/2, d/2);
    leftPart.position.x = -(w/4 + doorGap/4);
    const rightPart = makeBox((w - doorGap) / 2, h, 0.4, 0xbcaaa4,  (w/4 + doorGap/4), h/2, d/2);

    // Dach (Pyramide)
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(w * 0.85, 2.5, 4),
        roofMat
    );
    roof.position.y = h + 1.25;
    roof.rotation.y = Math.PI / 4;

    [north, east, west, leftPart, rightPart, roof].forEach(m => {
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
    });

    group.position.set(x, 0, z);
    scene.add(group);
    group.updateMatrixWorld(true);

    [north, east, west, leftPart, rightPart, roof].forEach(m => {
        m.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(m);
        worldObjects.push({ mesh: m, box, bulletBlock: true, type: 'house' });
    });
}

function makeRock(x, z) {
    const r = 1.2 + Math.random() * 1.2;
    const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r),
        new THREE.MeshStandardMaterial({ color: 0x78909c, flatShading: true })
    );
    mesh.position.set(x, r * 0.6, z);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    addObstacle(mesh, true);
}

function buildWorld() {
    // Zufällige Bäume
    for (let i = 0; i < 70; i++) {
        const x = (Math.random() - 0.5) * WORLD_SIZE * 1.8;
        const z = (Math.random() - 0.5) * WORLD_SIZE * 1.8;
        if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
        makeTree(x, z);
    }
    // Häuser
    const housePositions = [
        [30, 30, 8], [-40, 25, 10], [45, -35, 9], [-30, -40, 8],
        [0, 60, 12], [-60, -10, 9], [60, 0, 10], [15, -55, 8]
    ];
    housePositions.forEach(([x, z, s]) => makeHouse(x, z, s));
    // Felsen
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() - 0.5) * WORLD_SIZE * 1.6;
        const z = (Math.random() - 0.5) * WORLD_SIZE * 1.6;
        if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
        makeRock(x, z);
    }
    // Grenze (unsichtbare Wände am Rand)
    const boundary = WORLD_SIZE;
    const bmat = new THREE.MeshBasicMaterial({ visible: false });
    const walls = [
        makeBox(boundary * 2, 20, 2, 0, 0, 10, -boundary),
        makeBox(boundary * 2, 20, 2, 0, 0, 10,  boundary),
        makeBox(2, 20, boundary * 2, 0, -boundary, 10, 0),
        makeBox(2, 20, boundary * 2, 0,  boundary, 10, 0)
    ];
    walls.forEach(w => { w.material = bmat; addObstacle(w, true); });
}

// ---------- Spieler Setup ----------
function resetPlayer() {
    playerState = {
        pos: new THREE.Vector3(0, PLAYER_HEIGHT, 0),
        vel: new THREE.Vector3(),
        onGround: false,
        hp: 100,
        maxHp: 100,
        shield: 100,
        maxShield: 100
    };
    yaw = 0;
    pitch = 0;
    camera.position.copy(playerState.pos);
    camera.rotation.set(0, 0, 0);

    weaponState = {};
    Object.keys(WEAPONS).forEach(k => {
        const w = WEAPONS[k];
        weaponState[k] = {
            current: w.clip,
            reserve: w.ammo,
            cooldown: 0,
            reloading: false,
            reloadTime: 0
        };
    });
    currentWeapon = 'ar';
    killCount = 0;
    wood = 500;
    buildModeOn = false;
    if (ghost) ghost.visible = false;
    document.getElementById('build-mode').classList.remove('active');
    updateHUD();
}

// ---------- Bots ----------
function spawnBot(x, z) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5) });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xffcc99 })
    );
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);
    // Arme
    const armMat = new THREE.MeshStandardMaterial({ color: bodyMat.color });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.25), armMat);
    armL.position.set(-0.55, 0.95, 0);
    group.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.25), armMat);
    armR.position.set(0.55, 0.95, 0);
    group.add(armR);
    // Beine
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3949ab });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), legMat);
    legL.position.set(-0.2, 0.35, 0);
    group.add(legL);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), legMat);
    legR.position.set(0.2, 0.35, 0);
    group.add(legR);
    // Waffe
    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x222 })
    );
    gun.position.set(0.55, 1.1, 0.4);
    group.add(gun);

    group.position.set(x, 0, z);
    scene.add(group);

    bots.push({
        group, body, head,
        pos: group.position,
        vel: new THREE.Vector3(),
        hp: 80,
        maxHp: 80,
        state: 'wander',
        target: new THREE.Vector3(x + (Math.random() - 0.5) * 20, 0, z + (Math.random() - 0.5) * 20),
        shootCooldown: 1 + Math.random() * 2,
        radius: 0.5,
        height: 2.2,
        sightRange: 50,
        lastSeenPlayer: 0,
        dead: false
    });
}

function spawnBots(count) {
    bots.forEach(b => scene.remove(b.group));
    bots.length = 0;
    for (let i = 0; i < count; i++) {
        let x, z, tries = 0;
        do {
            x = (Math.random() - 0.5) * WORLD_SIZE * 1.4;
            z = (Math.random() - 0.5) * WORLD_SIZE * 1.4;
            tries++;
        } while (Math.hypot(x, z) < 20 && tries < 20);
        spawnBot(x, z);
    }
}

// ---------- Kollision (AABB vs Zylinder) ----------
function collidesWithWorld(pos, radius, height) {
    const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - radius, pos.y - height, pos.z - radius),
        new THREE.Vector3(pos.x + radius, pos.y, pos.z + radius)
    );
    for (const obj of worldObjects) {
        if (obj.box.intersectsBox(playerBox)) return obj;
    }
    for (const p of buildPieces) {
        if (p.box.intersectsBox(playerBox)) return p;
    }
    return null;
}

function movePlayer(dt) {
    // Input
    const speed = (keys['shift'] ? 8 : 5);
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    let wish = new THREE.Vector3();
    if (keys['w']) wish.add(forward);
    if (keys['s']) wish.sub(forward);
    if (keys['d']) wish.add(right);
    if (keys['a']) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed);
    playerState.vel.x = wish.x;
    playerState.vel.z = wish.z;

    // Springen
    if (keys[' '] && playerState.onGround) {
        playerState.vel.y = JUMP_SPEED;
        playerState.onGround = false;
    }

    // Schwerkraft
    playerState.vel.y -= GRAVITY * dt;

    // Bewegung entlang Achsen einzeln für Kollision
    const newPos = playerState.pos.clone();

    // X
    newPos.x += playerState.vel.x * dt;
    if (collidesWithWorld(newPos, PLAYER_RADIUS, PLAYER_HEIGHT)) {
        newPos.x = playerState.pos.x;
        playerState.vel.x = 0;
    }
    // Z
    newPos.z += playerState.vel.z * dt;
    if (collidesWithWorld(newPos, PLAYER_RADIUS, PLAYER_HEIGHT)) {
        newPos.z = playerState.pos.z;
        playerState.vel.z = 0;
    }
    // Y
    newPos.y += playerState.vel.y * dt;
    const hit = collidesWithWorld(newPos, PLAYER_RADIUS, PLAYER_HEIGHT);
    if (hit) {
        if (playerState.vel.y < 0) playerState.onGround = true;
        playerState.vel.y = 0;
        newPos.y = playerState.pos.y;
    } else {
        playerState.onGround = false;
    }

    // Boden
    if (newPos.y - PLAYER_HEIGHT < 0) {
        newPos.y = PLAYER_HEIGHT;
        playerState.vel.y = 0;
        playerState.onGround = true;
    }

    playerState.pos.copy(newPos);
    camera.position.copy(playerState.pos);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

// ---------- Raycast gegen Welt (Schüsse blockieren) ----------
function raycastWorld(origin, dir, maxDist) {
    // Sammle alle Meshes, die Geschosse blocken
    const meshes = [];
    worldObjects.forEach(o => { if (o.bulletBlock) meshes.push(o.mesh); });
    buildPieces.forEach(p => meshes.push(p.mesh));
    raycaster.set(origin, dir.clone().normalize());
    raycaster.far = maxDist;
    const hits = raycaster.intersectObjects(meshes, false);
    return hits.length > 0 ? hits[0] : null;
}

function raycastBots(origin, dir, maxDist, blockDist) {
    // Raycast gegen Bots, akzeptiere nur wenn näher als blockDist
    const meshes = [];
    bots.forEach(b => { if (!b.dead) { meshes.push(b.body); meshes.push(b.head); } });
    raycaster.set(origin, dir.clone().normalize());
    raycaster.far = Math.min(maxDist, blockDist);
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return null;
    // finde den Bot
    const hit = hits[0];
    const bot = bots.find(b => b.body === hit.object || b.head === hit.object);
    return { bot, point: hit.point, distance: hit.distance, head: bot && bot.head === hit.object };
}

// ---------- Schießen ----------
function shoot() {
    const w = WEAPONS[currentWeapon];
    const s = weaponState[currentWeapon];
    if (s.cooldown > 0 || s.reloading) return;
    if (w.isMelee) {
        meleeAttack(w);
        s.cooldown = w.fireRate;
        return;
    }
    if (s.current <= 0) {
        startReload();
        return;
    }
    s.current -= 1;
    s.cooldown = w.fireRate;

    const origin = camera.position.clone();
    const baseDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const pellets = w.pellets || 1;
    for (let i = 0; i < pellets; i++) {
        const dir = baseDir.clone();
        if (w.spread > 0) {
            dir.x += (Math.random() - 0.5) * w.spread;
            dir.y += (Math.random() - 0.5) * w.spread;
            dir.z += (Math.random() - 0.5) * w.spread;
            dir.normalize();
        }
        fireRay(origin, dir, w);
    }
    updateHUD();
    if (s.current <= 0) startReload();
}

function fireRay(origin, dir, weapon) {
    // Zuerst: Wie weit reicht die Welt? (Wand blockt)
    const worldHit = raycastWorld(origin, dir, weapon.range);
    const blockDist = worldHit ? worldHit.distance : weapon.range;
    // Dann: Bot innerhalb der Block-Distanz?
    const botHit = raycastBots(origin, dir, weapon.range, blockDist);
    let endPoint;
    if (botHit) {
        endPoint = botHit.point;
        const dmg = botHit.head ? weapon.damage * 2 : weapon.damage;
        damageBot(botHit.bot, dmg);
        showHitmarker();
    } else if (worldHit) {
        endPoint = worldHit.point;
    } else {
        endPoint = origin.clone().add(dir.clone().multiplyScalar(weapon.range));
    }
    spawnTracer(origin, endPoint);
}

function spawnTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    projectiles.push({ line, life: 0.08 });
}

function meleeAttack(w) {
    const origin = camera.position.clone();
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    // Welt prüfen für Reichweite
    const worldHit = raycastWorld(origin, dir, w.range);
    const blockDist = worldHit ? worldHit.distance : w.range;
    const botHit = raycastBots(origin, dir, w.range, blockDist);
    if (botHit) {
        damageBot(botHit.bot, w.damage);
        showHitmarker();
    } else if (worldHit) {
        // Holz von Bäumen sammeln
        const obj = worldObjects.find(o => o.mesh === worldHit.object);
        if (obj && (obj.type === 'tree' || obj.type === 'leaves')) {
            wood = Math.min(999, wood + 15);
        } else {
            wood = Math.min(999, wood + 5);
        }
        updateHUD();
    }
}

function damageBot(bot, dmg) {
    bot.hp -= dmg;
    if (bot.hp <= 0 && !bot.dead) {
        bot.dead = true;
        scene.remove(bot.group);
        killCount++;
        updateHUD();
        checkWinCondition();
    }
}

function showHitmarker() {
    hitmarkerTime = 0.15;
    document.getElementById('hitmarker').classList.remove('hidden');
}

function startReload() {
    const w = WEAPONS[currentWeapon];
    const s = weaponState[currentWeapon];
    if (w.isMelee) return;
    if (s.current >= w.clip || s.reserve <= 0) return;
    s.reloading = true;
    s.reloadTime = 1.8;
}

function finishReload() {
    const w = WEAPONS[currentWeapon];
    const s = weaponState[currentWeapon];
    const need = w.clip - s.current;
    const give = Math.min(need, s.reserve);
    s.current += give;
    s.reserve -= give;
    s.reloading = false;
    updateHUD();
}

// ---------- Bau-System ----------
function toggleBuildMode() {
    buildModeOn = !buildModeOn;
    document.getElementById('build-mode').classList.toggle('active', buildModeOn);
    ghost.visible = buildModeOn;
    if (buildModeOn) setBuildType(buildType);
}

function setBuildType(t) {
    buildType = t;
    document.querySelectorAll('.build-slot').forEach(el => {
        el.classList.toggle('active', el.dataset.build === t);
    });
    // Ghost-Geometrie austauschen
    ghost.geometry.dispose();
    if (t === 'wall') {
        ghost.geometry = new THREE.BoxGeometry(BUILD_SIZE, BUILD_SIZE, 0.3);
    } else if (t === 'floor') {
        ghost.geometry = new THREE.BoxGeometry(BUILD_SIZE, 0.3, BUILD_SIZE);
    } else if (t === 'ramp') {
        ghost.geometry = new THREE.BoxGeometry(BUILD_SIZE, 0.3, BUILD_SIZE * 1.4);
    } else if (t === 'roof') {
        ghost.geometry = new THREE.BoxGeometry(BUILD_SIZE, 0.4, BUILD_SIZE);
    }
}

function snapToGrid(v) {
    return Math.round(v / BUILD_SIZE) * BUILD_SIZE;
}

function getBuildTarget() {
    // Platziere vor dem Spieler
    const dir = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const pos = playerState.pos.clone().add(dir.multiplyScalar(BUILD_SIZE * 0.8));
    pos.x = snapToGrid(pos.x);
    pos.z = snapToGrid(pos.z);

    if (buildType === 'wall') {
        // Richtung: welche Achse ist dominant?
        if (Math.abs(dir.x) > Math.abs(dir.z)) {
            pos.y = BUILD_SIZE / 2;
            return { pos, rotY: Math.PI / 2 };
        } else {
            pos.y = BUILD_SIZE / 2;
            return { pos, rotY: 0 };
        }
    } else if (buildType === 'floor') {
        pos.y = Math.floor(playerState.pos.y / BUILD_SIZE) * BUILD_SIZE;
        return { pos, rotY: 0 };
    } else if (buildType === 'ramp') {
        pos.y = Math.floor(playerState.pos.y / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE / 2;
        const rotX = -Math.PI / 6;
        return { pos, rotY: Math.abs(dir.x) > Math.abs(dir.z) ? Math.PI / 2 : 0, rotX };
    } else if (buildType === 'roof') {
        pos.y = Math.floor(playerState.pos.y / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE;
        return { pos, rotY: 0 };
    }
    return { pos, rotY: 0 };
}

function updateGhost() {
    if (!buildModeOn) return;
    const t = getBuildTarget();
    ghost.position.copy(t.pos);
    ghost.rotation.set(t.rotX || 0, t.rotY || 0, 0);
    const canBuild = wood >= BUILD_COST;
    ghost.material.color.set(canBuild ? 0x00e5ff : 0xff5252);
}

function placeBuild() {
    if (wood < BUILD_COST) return;
    const t = getBuildTarget();
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8956d });
    let geo;
    if (buildType === 'wall') {
        geo = new THREE.BoxGeometry(BUILD_SIZE, BUILD_SIZE, 0.3);
    } else if (buildType === 'floor') {
        geo = new THREE.BoxGeometry(BUILD_SIZE, 0.3, BUILD_SIZE);
    } else if (buildType === 'ramp') {
        geo = new THREE.BoxGeometry(BUILD_SIZE, 0.3, BUILD_SIZE * 1.4);
    } else if (buildType === 'roof') {
        geo = new THREE.BoxGeometry(BUILD_SIZE, 0.4, BUILD_SIZE);
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(t.pos);
    mesh.rotation.set(t.rotX || 0, t.rotY || 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    buildPieces.push({ mesh, box, bulletBlock: true, hp: 200 });
    wood -= BUILD_COST;
    updateHUD();
}

// ---------- Bot KI ----------
function updateBots(dt) {
    for (const bot of bots) {
        if (bot.dead) continue;
        const toPlayer = new THREE.Vector3().subVectors(playerState.pos, bot.pos);
        const distPlayer = toPlayer.length();

        // Sichtlinie prüfen
        let canSeePlayer = false;
        if (distPlayer < bot.sightRange) {
            const eyeOrigin = bot.pos.clone(); eyeOrigin.y += 1.6;
            const dir = toPlayer.clone().normalize();
            const hit = raycastWorld(eyeOrigin, dir, distPlayer);
            if (!hit) canSeePlayer = true;
        }

        if (canSeePlayer) {
            bot.state = 'attack';
            bot.lastSeenPlayer = 0;
        } else {
            bot.lastSeenPlayer += dt;
            if (bot.lastSeenPlayer > 3) bot.state = 'wander';
        }

        // Bewegung
        let moveDir = new THREE.Vector3();
        if (bot.state === 'attack') {
            // Optimaler Abstand ~ 15
            const desiredDist = 15;
            if (distPlayer > desiredDist + 2) {
                moveDir.copy(toPlayer).normalize();
            } else if (distPlayer < desiredDist - 2) {
                moveDir.copy(toPlayer).normalize().multiplyScalar(-1);
            } else {
                // Strafe
                moveDir.set(-toPlayer.z, 0, toPlayer.x).normalize();
                if (Math.floor(gameStartTime + bot.pos.x) % 2 === 0) moveDir.multiplyScalar(-1);
            }
            // Zum Spieler schauen
            bot.group.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
            // Schießen
            bot.shootCooldown -= dt;
            if (bot.shootCooldown <= 0) {
                botShoot(bot);
                bot.shootCooldown = 0.4 + Math.random() * 0.8;
            }
        } else {
            // Wandern
            const toTarget = new THREE.Vector3().subVectors(bot.target, bot.pos);
            toTarget.y = 0;
            if (toTarget.length() < 2) {
                bot.target.set(
                    bot.pos.x + (Math.random() - 0.5) * 30,
                    0,
                    bot.pos.z + (Math.random() - 0.5) * 30
                );
            }
            moveDir.copy(toTarget).normalize();
            bot.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        }

        moveDir.y = 0;
        const speed = bot.state === 'attack' ? 3.5 : 2.5;
        bot.vel.x = moveDir.x * speed;
        bot.vel.z = moveDir.z * speed;
        bot.vel.y -= GRAVITY * dt;

        const newPos = bot.pos.clone();
        newPos.x += bot.vel.x * dt;
        if (collidesWithWorld(newPos, bot.radius, bot.height)) { newPos.x = bot.pos.x; bot.vel.x = 0; }
        newPos.z += bot.vel.z * dt;
        if (collidesWithWorld(newPos, bot.radius, bot.height)) { newPos.z = bot.pos.z; bot.vel.z = 0; }
        newPos.y += bot.vel.y * dt;
        if (newPos.y < 0) { newPos.y = 0; bot.vel.y = 0; }
        bot.pos.copy(newPos);
        bot.group.position.copy(newPos);
    }
}

function botShoot(bot) {
    const origin = bot.pos.clone(); origin.y += 1.6;
    const dir = new THREE.Vector3().subVectors(playerState.pos, origin).normalize();
    // Ungenauigkeit
    dir.x += (Math.random() - 0.5) * 0.05;
    dir.y += (Math.random() - 0.5) * 0.05;
    dir.z += (Math.random() - 0.5) * 0.05;
    dir.normalize();

    const range = 60;
    const worldHit = raycastWorld(origin, dir, range);
    const blockDist = worldHit ? worldHit.distance : range;

    // Trifft er den Spieler? Echter Abstand Punkt-zu-Strahl
    // Spieler als Kapsel: wir prüfen gegen Kopf (pos) und Mittelpunkt Torso (pos.y - 0.9)
    let hitsPlayer = false;
    const checkPts = [
        playerState.pos.clone(),
        new THREE.Vector3(playerState.pos.x, playerState.pos.y - 0.9, playerState.pos.z)
    ];
    for (const p of checkPts) {
        const toP = new THREE.Vector3().subVectors(p, origin);
        const t = toP.dot(dir);
        if (t <= 0 || t >= blockDist) continue;
        const closest = origin.clone().add(dir.clone().multiplyScalar(t));
        const perp = p.distanceTo(closest);
        if (perp < 0.55) { hitsPlayer = true; break; }
    }

    let endPoint;
    if (hitsPlayer) {
        endPoint = playerState.pos.clone();
        damagePlayer(8 + Math.random() * 4);
    } else if (worldHit) {
        endPoint = worldHit.point;
    } else {
        endPoint = origin.clone().add(dir.clone().multiplyScalar(range));
    }
    // roter Tracer
    const geo = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
    const mat = new THREE.LineBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.9 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    projectiles.push({ line, life: 0.08 });
}

function damagePlayer(amount) {
    if (playerState.shield > 0) {
        const absorbed = Math.min(playerState.shield, amount);
        playerState.shield -= absorbed;
        amount -= absorbed;
    }
    if (amount > 0) playerState.hp -= amount;
    damageFlashTime = 0.25;
    document.getElementById('damage-vignette').classList.add('hit');
    updateHUD();
    if (playerState.hp <= 0) endGame(false);
}

// ---------- HUD Updates ----------
function updateHUD() {
    if (!playerState) return;
    const hpPct = Math.max(0, playerState.hp / playerState.maxHp) * 100;
    const shPct = Math.max(0, playerState.shield / playerState.maxShield) * 100;
    document.getElementById('hp-fill').style.width = hpPct + '%';
    document.getElementById('hp-fill').classList.toggle('low', hpPct < 35);
    document.getElementById('shield-fill').style.width = shPct + '%';
    document.getElementById('hp-text').textContent = Math.max(0, Math.round(playerState.hp));
    document.getElementById('shield-text').textContent = Math.max(0, Math.round(playerState.shield));
    document.getElementById('kill-count').textContent = killCount;
    const alive = bots.filter(b => !b.dead).length;
    document.getElementById('enemies-left').textContent = alive;
    document.getElementById('wood-count').textContent = wood;
    document.getElementById('mat-wood').textContent = wood;

    // Waffen-Slots
    const slots = document.getElementById('weapon-slots');
    slots.innerHTML = '';
    WEAPON_ORDER.forEach((key, idx) => {
        const w = WEAPONS[key];
        const active = key === currentWeapon;
        const s = weaponState[key];
        const div = document.createElement('div');
        div.className = 'weapon-slot' + (active ? ' active' : '');
        div.innerHTML = `
            <div class="ws-num">${idx + 1}</div>
            <div class="ws-icon">${w.icon}</div>
            <div class="ws-name">${w.name}</div>
        `;
        slots.appendChild(div);
    });

    // Ammo-Anzeige
    const ammoDisp = document.getElementById('ammo-display');
    const w = WEAPONS[currentWeapon];
    if (w.isMelee) {
        ammoDisp.classList.add('hidden');
    } else {
        ammoDisp.classList.remove('hidden');
        const s = weaponState[currentWeapon];
        document.getElementById('ammo-current').textContent = s.reloading ? '...' : s.current;
        document.getElementById('ammo-reserve').textContent = s.reserve;
    }
}

// ---------- Game Loop ----------
function gameLoop() {
    if (!gameRunning) return;
    requestAnimationFrame(gameLoop);
    const dt = Math.min(0.05, clock.getDelta());
    gameStartTime += dt;

    // Alle World-Matrices aktualisieren, damit Raycasts korrekte Positionen verwenden
    scene.updateMatrixWorld(true);

    // Kamera per Maus
    if (mouse.locked) {
        yaw   -= mouse.dx * 0.0025;
        pitch -= mouse.dy * 0.0025;
        pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));
        mouse.dx = 0; mouse.dy = 0;
    }

    movePlayer(dt);
    updateBots(dt);

    // Waffen-Cooldowns
    for (const k in weaponState) {
        const s = weaponState[k];
        if (s.cooldown > 0) s.cooldown -= dt;
        if (s.reloading) {
            s.reloadTime -= dt;
            if (s.reloadTime <= 0) finishReload();
        }
    }

    // Dauerfeuer für AR, halte Maus
    if (mouse.held && currentWeapon === 'ar' && !buildModeOn) shoot();

    // Build ghost
    updateGhost();

    // Projektile entfernen
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].life -= dt;
        if (projectiles[i].life <= 0) {
            scene.remove(projectiles[i].line);
            projectiles[i].line.geometry.dispose();
            projectiles[i].line.material.dispose();
            projectiles.splice(i, 1);
        }
    }

    // Damage flash
    if (damageFlashTime > 0) {
        damageFlashTime -= dt;
        if (damageFlashTime <= 0) document.getElementById('damage-vignette').classList.remove('hit');
    }
    // Hitmarker
    if (hitmarkerTime > 0) {
        hitmarkerTime -= dt;
        if (hitmarkerTime <= 0) document.getElementById('hitmarker').classList.add('hidden');
    }

    renderer.render(scene, camera);
}

// ---------- Eingaben ----------
function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (!gameRunning && e.key !== 'Escape') return;
        const k = e.key.toLowerCase();
        keys[k] = true;

        if (e.key === 'Escape') {
            if (gameRunning) togglePause();
            return;
        }
        if (!mouse.locked) return;

        if (k === '1') switchWeapon('pickaxe');
        else if (k === '2') switchWeapon('ar');
        else if (k === '3') switchWeapon('shotgun');
        else if (k === '4') switchWeapon('sniper');
        else if (k === 'q') toggleBuildMode();
        else if (k === 'r') startReload();

        if (e.key === 'F1') { e.preventDefault(); if (buildModeOn) setBuildType('wall'); }
        if (e.key === 'F2') { e.preventDefault(); if (buildModeOn) setBuildType('floor'); }
        if (e.key === 'F3') { e.preventDefault(); if (buildModeOn) setBuildType('ramp'); }
        if (e.key === 'F4') { e.preventDefault(); if (buildModeOn) setBuildType('roof'); }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Maus
    const canvas = document.getElementById('game-canvas');
    document.addEventListener('pointerlockchange', () => {
        mouse.locked = (document.pointerLockElement === canvas);
        if (mouse.locked) {
            document.getElementById('lock-overlay').classList.add('hidden');
        }
    });
    document.addEventListener('mousemove', (e) => {
        if (mouse.locked) {
            mouse.dx += e.movementX;
            mouse.dy += e.movementY;
        }
    });
    document.addEventListener('mousedown', (e) => {
        if (!gameRunning || !mouse.locked) return;
        if (e.button === 0) {
            mouse.held = true;
            if (buildModeOn) placeBuild();
            else shoot();
        }
    });
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) mouse.held = false;
    });

    document.getElementById('lock-start-btn').addEventListener('click', () => {
        canvas.requestPointerLock();
    });
    canvas.addEventListener('click', () => {
        if (gameRunning && !mouse.locked) canvas.requestPointerLock();
    });

    // Build-Slot Klicks
    document.querySelectorAll('.build-slot').forEach(el => {
        el.addEventListener('click', () => setBuildType(el.dataset.build));
    });
}

function switchWeapon(w) {
    if (!WEAPONS[w]) return;
    currentWeapon = w;
    if (buildModeOn) toggleBuildMode();
    updateHUD();
}

function togglePause() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        document.exitPointerLock();
    } else {
        overlay.classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
    }
}

function resumeGame() {
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('game-canvas').requestPointerLock();
}

// ---------- Spiel Start / Ende ----------
function startGame() {
    showScreen('game-screen');
    initThree();
    // Alte Build-Stücke entfernen
    buildPieces.forEach(p => scene.remove(p.mesh));
    buildPieces.length = 0;
    // Alte Projektile
    projectiles.forEach(p => scene.remove(p.line));
    projectiles.length = 0;
    resetPlayer();
    spawnBots(12);
    updateHUD();
    gameRunning = true;
    gameStartTime = 0;
    clock.start();
    document.getElementById('result-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('lock-overlay').classList.remove('hidden');
    gameLoop();
}

function checkWinCondition() {
    const alive = bots.filter(b => !b.dead).length;
    if (alive === 0) endGame(true);
}

function endGame(victory) {
    gameRunning = false;
    document.exitPointerLock();
    const title = document.getElementById('result-title');
    const reward = killCount * 50 + (victory ? 300 : 50);
    save.coins += reward;
    saveGame();
    title.textContent = victory ? 'SIEG!' : 'DU WURDEST ELIMINIERT';
    title.style.color = victory ? '#ffd700' : '#ef5350';
    document.getElementById('result-kills').textContent = killCount;
    document.getElementById('result-place').textContent = victory ? '#1' : '#' + (1 + bots.filter(b => !b.dead).length);
    document.getElementById('result-coins').textContent = reward;
    document.getElementById('result-overlay').classList.remove('hidden');
}

function quitGame() {
    gameRunning = false;
    document.exitPointerLock();
    // Aufräumen
    bots.forEach(b => scene && scene.remove(b.group));
    bots.length = 0;
    buildPieces.forEach(p => scene && scene.remove(p.mesh));
    buildPieces.length = 0;
    projectiles.forEach(p => scene && scene.remove(p.line));
    projectiles.length = 0;
    backToMenu();
}

// ---------- Start ----------
window.addEventListener('DOMContentLoaded', () => {
    updateCoinDisplays();
    updateCharacterPreview();
    setupInput();
});










