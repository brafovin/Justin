// ============================================================
// FORTZONE - Fortnite-style 3D Battle Royale
// ============================================================

// ---------- PLAYER STATE (LocalStorage) ----------
const DEFAULT_STATE = {
    coins: 1000,
    gems: 50,
    owned: { skins: ['default'], backpacks: ['none'], pickaxes: ['default'] },
    equipped: { skin: 'default', backpack: 'none', pickaxe: 'default' }
};

let playerState = loadState();

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem('fortzone_state'));
        if (saved && saved.owned) return { ...DEFAULT_STATE, ...saved };
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
    localStorage.setItem('fortzone_state', JSON.stringify(playerState));
    updateCurrencyDisplays();
}

function updateCurrencyDisplays() {
    ['menu-coins', 'shop-coins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = playerState.coins;
    });
    const gemEl = document.getElementById('menu-gems');
    if (gemEl) gemEl.textContent = playerState.gems;
}

// ---------- SHOP DATA ----------
const SHOP_ITEMS = {
    skins: [
        { id: 'default', name: 'REKRUT', desc: 'Der Standard-Krieger', price: 0, rarity: 'rare', color: '#00d4ff', emoji: '\u{1F464}' },
        { id: 'ninja', name: 'SCHATTEN NINJA', desc: 'Lautlos und toedlich', price: 800, rarity: 'epic', color: '#9d4edd', emoji: '\u{1F977}' },
        { id: 'ghost', name: 'GEIST', desc: 'Aus einer anderen Welt', price: 1200, rarity: 'epic', color: '#e0aaff', emoji: '\u{1F47B}' },
        { id: 'robot', name: 'CYBER BOT', desc: 'Aus der Zukunft', price: 1500, rarity: 'legendary', color: '#ffd700', emoji: '\u{1F916}' },
        { id: 'knight', name: 'RITTER', desc: 'Unbesiegbar in Ruestung', price: 2000, rarity: 'legendary', color: '#c0c0c0', emoji: '\u{1FA96}' },
        { id: 'dragon', name: 'DRACHEN LORD', desc: 'Mythisches Wesen', price: 2500, rarity: 'legendary', color: '#ff006e', emoji: '\u{1F409}' }
    ],
    backpacks: [
        { id: 'none', name: 'KEINER', desc: 'Kein Rucksack', price: 0, rarity: 'rare', color: '#888', emoji: '\u274C' },
        { id: 'classic', name: 'KLASSISCH', desc: 'Standard Rucksack', price: 300, rarity: 'rare', color: '#8b4513', emoji: '\u{1F392}' },
        { id: 'techbag', name: 'TECH PACK', desc: 'Hightech Ausruestung', price: 600, rarity: 'epic', color: '#00d4ff', emoji: '\u{1F4BC}' },
        { id: 'wings', name: 'FLUEGEL', desc: 'Engel der Arena', price: 1200, rarity: 'legendary', color: '#ffffff', emoji: '\u{1F985}' },
        { id: 'jetpack', name: 'JETPACK', desc: 'Raketenantrieb', price: 1800, rarity: 'legendary', color: '#ff006e', emoji: '\u{1F680}' }
    ],
    pickaxes: [
        { id: 'default', name: 'STANDARD AXT', desc: 'Die klassische Spitzhacke', price: 0, rarity: 'rare', color: '#888', emoji: '\u26CF' },
        { id: 'hammer', name: 'VORSCHLAGHAMMER', desc: 'Schlaegt alles zu Brei', price: 400, rarity: 'epic', color: '#8b4513', emoji: '\u{1F528}' },
        { id: 'laser', name: 'LASER AXT', desc: 'Schneidet durch alles', price: 900, rarity: 'epic', color: '#ff006e', emoji: '\u26A1' },
        { id: 'gold', name: 'GOLDENE AXT', desc: 'Legendaere Spitzhacke', price: 1500, rarity: 'legendary', color: '#ffd700', emoji: '\u{1F3C6}' },
        { id: 'katana', name: 'KATANA', desc: 'Samurai Schwert', price: 2200, rarity: 'legendary', color: '#ffffff', emoji: '\u{1F5E1}' }
    ]
};

let currentShopTab = 'skins';

// ---------- MENU NAVIGATION ----------
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function backToMenu() {
    if (gameActive) endGameSession(false);
    showScreen('main-menu');
    updateCurrencyDisplays();
}

function openShop() {
    showScreen('shop-screen');
    showShopTab('skins');
    updateCurrencyDisplays();
}

function openLocker() {
    showScreen('locker-screen');
    renderLocker();
}

function showTab(tab) { /* noop: home is default */ }

function showShopTab(tab) {
    currentShopTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const idx = tab === 'skins' ? 0 : tab === 'backpacks' ? 1 : 2;
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[idx]) tabs[idx].classList.add('active');
    renderShop();
}

function renderShop() {
    const grid = document.getElementById('shop-grid');
    const items = SHOP_ITEMS[currentShopTab];
    const previewClass = currentShopTab === 'skins' ? 'skin-preview' :
                         currentShopTab === 'backpacks' ? 'backpack-preview' : 'pickaxe-preview';
    grid.innerHTML = items.map(item => {
        const owned = playerState.owned[currentShopTab].includes(item.id);
        const eqKey = currentShopTab === 'skins' ? 'skin' : currentShopTab === 'backpacks' ? 'backpack' : 'pickaxe';
        const equipped = playerState.equipped[eqKey] === item.id;
        let btn;
        if (equipped) btn = '<button class="buy-btn equipped">AUSGERUESTET</button>';
        else if (owned) btn = '<button class="buy-btn owned" onclick="equipItem(\'' + currentShopTab + '\',\'' + item.id + '\')">AUSRUESTEN</button>';
        else btn = '<button class="buy-btn" onclick="buyItem(\'' + currentShopTab + '\',\'' + item.id + '\')"><span class="price-coin">&#9733;</span> ' + item.price + '</button>';
        return '<div class="shop-item ' + item.rarity + '">' +
               '<div class="rarity-badge ' + item.rarity + '">' + item.rarity.toUpperCase() + '</div>' +
               '<div class="item-preview ' + previewClass + '" style="background: linear-gradient(135deg, ' + item.color + ', #000)">' +
               '<span class="item-emoji" style="font-size:60px">' + item.emoji + '</span></div>' +
               '<h3>' + item.name + '</h3>' +
               '<div class="item-desc">' + item.desc + '</div>' + btn + '</div>';
    }).join('');
}

function buyItem(category, id) {
    const item = SHOP_ITEMS[category].find(i => i.id === id);
    if (!item || playerState.coins < item.price) { flash('Nicht genug Coins!'); return; }
    playerState.coins -= item.price;
    playerState.owned[category].push(id);
    saveState();
    renderShop();
    flash('Gekauft: ' + item.name);
}

function equipItem(category, id) {
    const key = category === 'skins' ? 'skin' : category === 'backpacks' ? 'backpack' : 'pickaxe';
    playerState.equipped[key] = id;
    saveState();
    renderShop();
    renderLocker();
}

function renderLocker() {
    ['skins', 'backpacks', 'pickaxes'].forEach(cat => {
        const container = document.getElementById('locker-' + cat);
        if (!container) return;
        const key = cat === 'skins' ? 'skin' : cat === 'backpacks' ? 'backpack' : 'pickaxe';
        const previewClass = cat === 'skins' ? 'skin-preview' : cat === 'backpacks' ? 'backpack-preview' : 'pickaxe-preview';
        container.innerHTML = SHOP_ITEMS[cat]
            .filter(item => playerState.owned[cat].includes(item.id))
            .map(item => {
                const equipped = playerState.equipped[key] === item.id;
                return '<div class="shop-item ' + item.rarity + '" onclick="equipItem(\'' + cat + '\',\'' + item.id + '\')">' +
                       '<div class="item-preview ' + previewClass + '" style="background: linear-gradient(135deg, ' + item.color + ', #000)">' +
                       '<span class="item-emoji" style="font-size:60px">' + item.emoji + '</span></div>' +
                       '<h3>' + item.name + '</h3>' +
                       '<button class="buy-btn ' + (equipped ? 'equipped' : 'owned') + '">' + (equipped ? 'AUSGERUESTET' : 'AUSRUESTEN') + '</button></div>';
            }).join('');
    });
}

// ---------- MATCHMAKING ----------
let matchmakingTimer = null;

function startMatchmaking() {
    showScreen('matchmaking-screen');
    const foundEl = document.getElementById('found-players');
    const progEl = document.getElementById('matchmaking-progress');
    const statusEl = document.getElementById('matchmaking-status');
    let found = 1;
    foundEl.textContent = found;
    progEl.style.width = '5%';
    statusEl.textContent = 'Suche nach Gegnern...';
    if (matchmakingTimer) clearInterval(matchmakingTimer);
    matchmakingTimer = setInterval(() => {
        found += Math.ceil(Math.random() * 3);
        if (found >= 21) {
            found = 21;
            foundEl.textContent = found;
            progEl.style.width = '100%';
            statusEl.textContent = 'Match gefunden! Lade Arena...';
            clearInterval(matchmakingTimer);
            matchmakingTimer = null;
            setTimeout(() => startGame(), 1200);
            return;
        }
        foundEl.textContent = found;
        progEl.style.width = (found / 21 * 100) + '%';
    }, 180);
}

function cancelMatchmaking() {
    if (matchmakingTimer) { clearInterval(matchmakingTimer); matchmakingTimer = null; }
    backToMenu();
}

function flash(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);border:3px solid #ffd700;padding:20px 40px;font-size:24px;color:#ffd700;letter-spacing:3px;z-index:9999;border-radius:10px;text-shadow:2px 2px 0 #000;box-shadow:0 0 30px rgba(255,215,0,0.6);font-family:Impact,sans-serif';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// ============================================================
// 3D GAME ENGINE (Three.js)
// ============================================================
let scene, camera, renderer;
let player, playerModel, playerGun;
let bots = [];
let bullets = [];
let obstacles = [];
let trees = [];
let bus, parachute;
let gameActive = false;
let gamePhase = 'bus'; // 'bus' -> 'skydive' -> 'parachute' -> 'ground'
let playerHP = 100, playerShield = 50, playerKills = 0;
let ammo = 30, maxAmmo = 30, reserveAmmo = 90;
let keys = {};
let mouseX = 0, mouseY = 0;
let playerVelocity = new THREE.Vector3();
let yawAngle = 0, pitchAngle = 0;
let pointerLocked = false;
let lastShotTime = 0;
let clock;
const MAP_SIZE = 400;

function initGame() {
    const canvas = document.getElementById('game-canvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 400);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(100, 200, 50);
    sun.castShadow = true;
    sun.shadow.camera.left = -300;
    sun.shadow.camera.right = 300;
    sun.shadow.camera.top = 300;
    sun.shadow.camera.bottom = -300;
    sun.shadow.camera.far = 600;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    clock = new THREE.Clock();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- WORLD ----------
function buildWorld() {
    // Clear old
    while (scene.children.length > 0) scene.remove(scene.children[0]);
    obstacles = [];
    trees = [];
    bots = [];
    bullets = [];

    // Relights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(100, 200, 50);
    sun.castShadow = true;
    scene.add(sun);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE * 2, MAP_SIZE * 2, 32, 32);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Border walls (invisible)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x333344, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 4; i++) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(MAP_SIZE * 2, 50, 2), wallMat);
        if (i === 0) wall.position.set(0, 25, MAP_SIZE);
        else if (i === 1) wall.position.set(0, 25, -MAP_SIZE);
        else if (i === 2) { wall.position.set(MAP_SIZE, 25, 0); wall.rotation.y = Math.PI / 2; }
        else { wall.position.set(-MAP_SIZE, 25, 0); wall.rotation.y = Math.PI / 2; }
        scene.add(wall);
    }

    // Trees
    for (let i = 0; i < 80; i++) {
        const tx = (Math.random() - 0.5) * MAP_SIZE * 1.8;
        const tz = (Math.random() - 0.5) * MAP_SIZE * 1.8;
        const tree = makeTree();
        tree.position.set(tx, 0, tz);
        scene.add(tree);
        trees.push({ mesh: tree, radius: 1.5, pos: tree.position });
    }

    // Buildings (simple houses)
    for (let i = 0; i < 25; i++) {
        const bx = (Math.random() - 0.5) * MAP_SIZE * 1.6;
        const bz = (Math.random() - 0.5) * MAP_SIZE * 1.6;
        const bh = Math.random();
        const building = makeBuilding(bh);
        building.position.set(bx, 0, bz);
        scene.add(building);
        const size = bh > 0.5 ? 8 : 6;
        obstacles.push({ mesh: building, radius: size, pos: building.position });
    }

    // Rocks
    for (let i = 0; i < 40; i++) {
        const rx = (Math.random() - 0.5) * MAP_SIZE * 1.8;
        const rz = (Math.random() - 0.5) * MAP_SIZE * 1.8;
        const rock = makeRock();
        rock.position.set(rx, 0, rz);
        scene.add(rock);
        obstacles.push({ mesh: rock, radius: 2, pos: rock.position });
    }
}

function makeTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 4, 8),
        new THREE.MeshLambertMaterial({ color: 0x6b3e1f })
    );
    trunk.position.y = 2;
    trunk.castShadow = true;
    g.add(trunk);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2d5f2d });
    for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(2.5 - i * 0.5, 8, 6), leavesMat);
        leaves.position.y = 4 + i * 1.5;
        leaves.position.x = (Math.random() - 0.5) * 0.5;
        leaves.position.z = (Math.random() - 0.5) * 0.5;
        leaves.castShadow = true;
        g.add(leaves);
    }
    return g;
}

function makeBuilding(heightFactor) {
    const g = new THREE.Group();
    const h = 6 + heightFactor * 8;
    const w = 8 + heightFactor * 4;
    const d = 8 + heightFactor * 4;
    const wallColors = [0x8b4513, 0xa0522d, 0x696969, 0xbdb76b, 0x4682b4];
    const color = wallColors[Math.floor(Math.random() * wallColors.length)];
    const walls = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color })
    );
    walls.position.y = h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    g.add(walls);
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(w * 0.8, 3, 4),
        new THREE.MeshLambertMaterial({ color: 0x8b0000 })
    );
    roof.position.y = h + 1.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    return g;
}

function makeRock() {
    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.5 + Math.random() * 1.5, 0),
        new THREE.MeshLambertMaterial({ color: 0x777777 })
    );
    rock.position.y = 1;
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

// ---------- CHARACTER MODEL ----------
function makeCharacter(skinColor, backpackId, pickaxeId, isPlayer) {
    const g = new THREE.Group();
    // Legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x222244 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), legMat);
    leftLeg.position.set(-0.3, 0.6, 0);
    leftLeg.castShadow = true;
    g.add(leftLeg);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), legMat);
    rightLeg.position.set(0.3, 0.6, 0);
    rightLeg.castShadow = true;
    g.add(rightLeg);
    // Body
    const bodyCol = new THREE.Color(skinColor || '#00d4ff');
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.5, 0.7),
        new THREE.MeshLambertMaterial({ color: bodyCol })
    );
    body.position.y = 2;
    body.castShadow = true;
    g.add(body);
    // Arms
    const armMat = new THREE.MeshLambertMaterial({ color: bodyCol });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 0.35), armMat);
    leftArm.position.set(-0.85, 2, 0);
    leftArm.castShadow = true;
    g.add(leftArm);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 0.35), armMat);
    rightArm.position.set(0.85, 2, 0.2);
    rightArm.castShadow = true;
    g.add(rightArm);
    // Head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.9, 0.9),
        new THREE.MeshLambertMaterial({ color: 0xffcc99 })
    );
    head.position.y = 3.3;
    head.castShadow = true;
    g.add(head);
    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    leftEye.position.set(-0.2, 3.4, 0.47);
    g.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    rightEye.position.set(0.2, 3.4, 0.47);
    g.add(rightEye);
    // Backpack
    if (backpackId && backpackId !== 'none') {
        const bpInfo = SHOP_ITEMS.backpacks.find(i => i.id === backpackId);
        const bp = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 1.3, 0.5),
            new THREE.MeshLambertMaterial({ color: new THREE.Color(bpInfo ? bpInfo.color : '#8b4513') })
        );
        bp.position.set(0, 2, -0.55);
        bp.castShadow = true;
        g.add(bp);
    }
    // Weapon/Gun (held in right hand)
    const gunGroup = new THREE.Group();
    const gunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 1.4),
        new THREE.MeshLambertMaterial({ color: 0x222222 })
    );
    gunBody.position.z = 0.7;
    gunGroup.add(gunBody);
    const gunHandle = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.5, 0.25),
        new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
    );
    gunHandle.position.set(0, -0.3, 0.3);
    gunGroup.add(gunHandle);
    const gunBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.z = 1.6;
    gunGroup.add(gunBarrel);
    gunGroup.position.set(0.85, 2, 0.6);
    g.add(gunGroup);
    g.userData.gun = gunGroup;

    return g;
}

// ---------- BUS ----------
function makeBus() {
    const g = new THREE.Group();
    const busBody = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 14),
        new THREE.MeshLambertMaterial({ color: 0x3366ff })
    );
    busBody.position.y = 2;
    g.add(busBody);
    // Windows
    for (let i = -2; i <= 2; i++) {
        const win = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.2, 1.5),
            new THREE.MeshBasicMaterial({ color: 0x88ccff })
        );
        win.position.set(3.05, 2.5, i * 2);
        g.add(win);
        const win2 = win.clone();
        win2.position.x = -3.05;
        g.add(win2);
    }
    // Balloon on top (Fortnite-style)
    const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(6, 16, 16),
        new THREE.MeshLambertMaterial({ color: 0xff4444 })
    );
    balloon.position.y = 12;
    balloon.scale.y = 1.3;
    g.add(balloon);
    // Ropes
    for (let i = 0; i < 4; i++) {
        const rope = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 5, 4),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        const angle = (i / 4) * Math.PI * 2;
        rope.position.set(Math.cos(angle) * 2, 6.5, Math.sin(angle) * 2);
        rope.rotation.z = angle;
        g.add(rope);
    }
    // Wheels
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.5, 12),
            new THREE.MeshLambertMaterial({ color: 0x111111 })
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(i < 2 ? -3 : 3, 0.8, (i % 2 === 0 ? -4 : 4));
        g.add(wheel);
    }
    return g;
}

function makeParachute() {
    const g = new THREE.Group();
    const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: 0xff006e, side: THREE.DoubleSide })
    );
    canopy.position.y = 3;
    g.add(canopy);
    // Strings
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const str = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 3, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        str.position.set(Math.cos(angle) * 2, 1.5, Math.sin(angle) * 2);
        str.rotation.z = angle * 0.3;
        g.add(str);
    }
    return g;
}

// ---------- BOTS ----------
const BOT_NAMES = ['Ghost', 'Viper', 'Blade', 'Storm', 'Raven', 'Nova', 'Hawk', 'Fury',
                   'Frost', 'Ember', 'Shadow', 'Titan', 'Flash', 'Jinx', 'Rogue', 'Specter',
                   'Kilo', 'Reaper', 'Rex', 'Zero'];

// ---------- GAME START ----------
function startGame() {
    showScreen('game-screen');
    if (!scene) initGame();
    buildWorld();

    // Player
    const skin = SHOP_ITEMS.skins.find(s => s.id === playerState.equipped.skin);
    playerModel = makeCharacter(skin ? skin.color : '#00d4ff', playerState.equipped.backpack, playerState.equipped.pickaxe, true);
    playerModel.position.set(0, 200, 0);
    scene.add(playerModel);
    player = { mesh: playerModel, pos: playerModel.position };

    // Bus
    bus = makeBus();
    bus.position.set(-300, 220, 0);
    scene.add(bus);

    // Hide parachute initially
    parachute = null;

    // Reset state
    playerHP = 100;
    playerShield = 50;
    playerKills = 0;
    ammo = 30;
    reserveAmmo = 90;
    gamePhase = 'bus';
    gameActive = true;
    yawAngle = 0;
    pitchAngle = 0;
    playerVelocity.set(0, 0, 0);

    spawnBots();
    updateHUD();

    document.getElementById('bus-notification').classList.remove('hidden');
    document.getElementById('parachute-hint').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('kill-feed').innerHTML = '';

    setupInput();

    if (!gameLoopRunning) {
        gameLoopRunning = true;
        animate();
    }
}

let gameLoopRunning = false;

function spawnBots() {
    for (let i = 0; i < 20; i++) {
        const skinColors = ['#ff006e', '#00ff88', '#ffd700', '#9d4edd', '#ff9900', '#00d4ff', '#ffffff', '#ff4444'];
        const color = skinColors[i % skinColors.length];
        const botMesh = makeCharacter(color, 'none', 'default', false);
        const angle = (i / 20) * Math.PI * 2;
        const radius = 50 + Math.random() * 150;
        botMesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        scene.add(botMesh);
        bots.push({
            mesh: botMesh,
            name: BOT_NAMES[i],
            hp: 100,
            velocity: new THREE.Vector3(),
            aiState: 'patrol',
            aiTarget: new THREE.Vector3(Math.random() * 200 - 100, 0, Math.random() * 200 - 100),
            aiTimer: 0,
            shootCooldown: 0,
            alive: true,
            skinColor: color
        });
    }
}

// ---------- INPUT ----------
let inputSetup = false;
function setupInput() {
    if (inputSetup) return;
    inputSetup = true;
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space') {
            e.preventDefault();
            handleSpacePress();
        }
        if (e.code === 'KeyR') {
            reloadWeapon();
        }
    });
    document.addEventListener('keyup', (e) => { keys[e.code] = false; });

    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', () => {
        if (gameActive && gamePhase === 'ground' && !pointerLocked) {
            canvas.requestPointerLock();
        }
    });
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === canvas;
    });
    document.addEventListener('mousemove', (e) => {
        if (pointerLocked) {
            yawAngle -= e.movementX * 0.0025;
            pitchAngle -= e.movementY * 0.0025;
            pitchAngle = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, pitchAngle));
        }
    });
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0 && gameActive && gamePhase === 'ground' && pointerLocked) {
            shoot();
        }
    });
}

function handleSpacePress() {
    if (gamePhase === 'bus') {
        // Jump out of bus
        gamePhase = 'skydive';
        document.getElementById('bus-notification').classList.add('hidden');
        document.getElementById('parachute-hint').classList.remove('hidden');
        playerModel.position.copy(bus.position);
        playerModel.position.y -= 5;
        playerVelocity.set(0, -0.3, 0);
    } else if (gamePhase === 'skydive') {
        // Deploy parachute
        gamePhase = 'parachute';
        document.getElementById('parachute-hint').classList.add('hidden');
        parachute = makeParachute();
        playerModel.add(parachute);
    } else if (gamePhase === 'ground') {
        // Normal jump (small hop)
        if (playerModel.position.y <= 0.05) {
            playerVelocity.y = 0.35;
        }
    }
}

function reloadWeapon() {
    if (ammo < maxAmmo && reserveAmmo > 0) {
        const need = maxAmmo - ammo;
        const take = Math.min(need, reserveAmmo);
        ammo += take;
        reserveAmmo -= take;
        updateHUD();
    }
}

function shoot() {
    const now = performance.now();
    if (now - lastShotTime < 120) return;
    if (ammo <= 0) { reloadWeapon(); return; }
    lastShotTime = now;
    ammo--;
    updateHUD();

    // Shoot from the player's gun position toward what the camera is aiming at
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    // Aim point = far point along camera forward
    const aimTarget = camera.position.clone().add(camDir.clone().multiplyScalar(500));
    const gunOrigin = new THREE.Vector3(
        playerModel.position.x,
        playerModel.position.y + 2.5,
        playerModel.position.z
    );
    const shootDir = aimTarget.sub(gunOrigin).normalize();

    const raycaster = new THREE.Raycaster(gunOrigin, shootDir);

    // Check bot hits
    let hitBot = null, hitDist = Infinity;
    bots.forEach(bot => {
        if (!bot.alive) return;
        const botHitbox = new THREE.Box3().setFromObject(bot.mesh);
        const hit = raycaster.ray.intersectBox(botHitbox, new THREE.Vector3());
        if (hit) {
            const dist = gunOrigin.distanceTo(hit);
            if (dist < hitDist) {
                hitDist = dist;
                hitBot = bot;
            }
        }
    });
    if (hitBot) {
        hitBot.hp -= 25 + Math.random() * 10;
        if (hitBot.hp <= 0) {
            killBot(hitBot, 'DU');
        }
    }

    // Muzzle flash + tracer originate from the player's gun
    spawnMuzzleFlash(gunOrigin, shootDir);
    spawnTracer(gunOrigin, shootDir);
}

function spawnMuzzleFlash(origin, dir) {
    const flash = new THREE.PointLight(0xffaa00, 5, 10);
    if (origin && dir) {
        flash.position.copy(origin).add(dir.clone().multiplyScalar(1.5));
    } else {
        const d = new THREE.Vector3();
        camera.getWorldDirection(d);
        flash.position.copy(camera.position).add(d.multiplyScalar(2));
    }
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 60);
}

function spawnTracer(from, dir) {
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([
        from.clone(),
        from.clone().add(dir.clone().multiplyScalar(200))
    ]);
    const tracer = new THREE.Line(
        tracerGeo,
        new THREE.LineBasicMaterial({ color: 0xffff00 })
    );
    scene.add(tracer);
    setTimeout(() => scene.remove(tracer), 80);
}

function killBot(bot, killer) {
    bot.alive = false;
    scene.remove(bot.mesh);
    if (killer === 'DU') {
        playerKills++;
        addKillFeed('DU hat ' + bot.name + ' eliminiert');
    } else {
        addKillFeed(killer + ' hat ' + bot.name + ' eliminiert');
    }
    updateHUD();
    checkWinCondition();
}

function addKillFeed(msg) {
    const feed = document.getElementById('kill-feed');
    const el = document.createElement('div');
    el.className = 'kill-message';
    el.textContent = msg;
    feed.appendChild(el);
    if (feed.children.length > 5) feed.removeChild(feed.firstChild);
    setTimeout(() => el.remove(), 5000);
}

function updateHUD() {
    document.getElementById('hp-fill').style.width = Math.max(0, playerHP) + '%';
    document.getElementById('hp-text').textContent = Math.max(0, Math.floor(playerHP)) + ' / 100';
    document.getElementById('shield-fill').style.width = Math.max(0, playerShield) + '%';
    document.getElementById('shield-text').textContent = Math.max(0, Math.floor(playerShield)) + ' / 100';
    document.getElementById('kill-count').textContent = playerKills;
    document.getElementById('alive-count').textContent = bots.filter(b => b.alive).length + 1;
    document.getElementById('weapon-ammo').textContent = ammo + ' / ' + reserveAmmo;
    const hpFill = document.getElementById('hp-fill');
    if (playerHP < 30) hpFill.classList.add('low'); else hpFill.classList.remove('low');
}

// ---------- ANIMATION LOOP ----------
function animate() {
    requestAnimationFrame(animate);
    if (!gameActive) {
        renderer.render(scene, camera);
        return;
    }
    const dt = Math.min(clock.getDelta(), 0.05);

    if (gamePhase === 'bus') {
        // Bus flies across map
        bus.position.x += dt * 20;
        playerModel.position.copy(bus.position);
        playerModel.position.y -= 3;
        // Camera follows bus
        camera.position.set(bus.position.x - 30, bus.position.y + 15, bus.position.z + 30);
        camera.lookAt(bus.position);
        if (bus.position.x > 300) {
            // Force jump
            handleSpacePress();
        }
    } else if (gamePhase === 'skydive') {
        // Fall fast
        playerVelocity.y -= dt * 1.5;
        playerVelocity.y = Math.max(playerVelocity.y, -0.8);
        // Allow WASD to move horizontally while falling
        const moveSpeed = 20 * dt;
        if (keys['KeyW']) playerModel.position.z -= moveSpeed;
        if (keys['KeyS']) playerModel.position.z += moveSpeed;
        if (keys['KeyA']) playerModel.position.x -= moveSpeed;
        if (keys['KeyD']) playerModel.position.x += moveSpeed;
        playerModel.position.y += playerVelocity.y * dt * 60;
        // Third-person camera
        camera.position.set(
            playerModel.position.x,
            playerModel.position.y + 8,
            playerModel.position.z + 15
        );
        camera.lookAt(playerModel.position);
        if (playerModel.position.y <= 0.1) {
            // Hit ground without parachute - damage
            playerModel.position.y = 0;
            playerHP -= 30;
            gamePhase = 'ground';
            document.getElementById('parachute-hint').classList.add('hidden');
            lockPointer();
            updateHUD();
        }
    } else if (gamePhase === 'parachute') {
        // Slow descent
        playerVelocity.y = -0.08;
        const moveSpeed = 10 * dt;
        if (keys['KeyW']) playerModel.position.z -= moveSpeed;
        if (keys['KeyS']) playerModel.position.z += moveSpeed;
        if (keys['KeyA']) playerModel.position.x -= moveSpeed;
        if (keys['KeyD']) playerModel.position.x += moveSpeed;
        playerModel.position.y += playerVelocity.y * dt * 60;
        camera.position.set(
            playerModel.position.x,
            playerModel.position.y + 8,
            playerModel.position.z + 15
        );
        camera.lookAt(playerModel.position);
        if (playerModel.position.y <= 0.1) {
            playerModel.position.y = 0;
            if (parachute) {
                playerModel.remove(parachute);
                parachute = null;
            }
            gamePhase = 'ground';
            lockPointer();
        }
    } else if (gamePhase === 'ground') {
        updatePlayer(dt);
        updateBots(dt);
    }

    // Clamp player to map
    playerModel.position.x = Math.max(-MAP_SIZE + 5, Math.min(MAP_SIZE - 5, playerModel.position.x));
    playerModel.position.z = Math.max(-MAP_SIZE + 5, Math.min(MAP_SIZE - 5, playerModel.position.z));

    renderer.render(scene, camera);
}

function lockPointer() {
    const canvas = document.getElementById('game-canvas');
    canvas.requestPointerLock && canvas.requestPointerLock();
}

function updatePlayer(dt) {
    // Rotate player to face yaw
    playerModel.rotation.y = yawAngle;

    // Movement (WASD) relative to yaw
    const forward = new THREE.Vector3(-Math.sin(yawAngle), 0, -Math.cos(yawAngle));
    const right = new THREE.Vector3(-Math.cos(yawAngle), 0, Math.sin(yawAngle));
    const moveSpeed = 12;
    const move = new THREE.Vector3();
    if (keys['KeyW']) move.add(forward);
    if (keys['KeyS']) move.sub(forward);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);
    if (move.length() > 0) move.normalize().multiplyScalar(moveSpeed * dt);
    playerModel.position.add(move);

    // Gravity
    playerVelocity.y -= dt * 2.2;
    playerModel.position.y += playerVelocity.y;
    if (playerModel.position.y < 0) { playerModel.position.y = 0; playerVelocity.y = 0; }

    // Collision with obstacles
    obstacles.concat(trees).forEach(obs => {
        const dx = playerModel.position.x - obs.pos.x;
        const dz = playerModel.position.z - obs.pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = obs.radius + 1;
        if (dist < minDist && dist > 0) {
            const push = (minDist - dist);
            playerModel.position.x += (dx / dist) * push;
            playerModel.position.z += (dz / dist) * push;
        }
    });

    // Third-person camera (behind + above player so the skin is visible)
    const camDistance = 7;
    const camHeight = 4.5;
    const lookDir = new THREE.Vector3(
        -Math.sin(yawAngle) * Math.cos(pitchAngle),
        Math.sin(pitchAngle),
        -Math.cos(yawAngle) * Math.cos(pitchAngle)
    );
    const focusPoint = new THREE.Vector3(
        playerModel.position.x,
        playerModel.position.y + 3.2,
        playerModel.position.z
    );
    // Camera sits behind the player along the negative look direction
    const camOffset = lookDir.clone().multiplyScalar(-camDistance);
    camOffset.y += camHeight;
    const desiredCamPos = focusPoint.clone().add(camOffset);

    // Simple collision: pull camera closer if it would clip into an obstacle
    const camRay = new THREE.Raycaster(focusPoint, camOffset.clone().normalize(), 0, camDistance + 2);
    const hits = camRay.intersectObjects(scene.children, true);
    let finalDistance = camDistance;
    for (const h of hits) {
        if (h.object === playerModel || playerModel.children.includes(h.object)) continue;
        if (h.distance < finalDistance) {
            finalDistance = Math.max(2, h.distance - 0.5);
            break;
        }
    }
    const finalOffset = lookDir.clone().multiplyScalar(-finalDistance);
    finalOffset.y += camHeight;
    camera.position.copy(focusPoint).add(finalOffset);

    // Look slightly ahead of the player so aiming matches the crosshair
    const aimPoint = focusPoint.clone().add(lookDir.clone().multiplyScalar(20));
    camera.lookAt(aimPoint);

    // Shield regen
    if (playerShield < 100) playerShield = Math.min(100, playerShield + dt * 3);
    updateHUD();

    if (playerHP <= 0) {
        endGameSession(false);
    }
}

function updateBots(dt) {
    bots.forEach(bot => {
        if (!bot.alive) return;
        bot.aiTimer -= dt;
        bot.shootCooldown -= dt;

        const toPlayer = new THREE.Vector3().subVectors(playerModel.position, bot.mesh.position);
        const distToPlayer = toPlayer.length();

        if (distToPlayer < 70) {
            // Chase / attack player
            bot.aiState = 'attack';
            toPlayer.y = 0;
            toPlayer.normalize();
            bot.mesh.lookAt(playerModel.position.x, bot.mesh.position.y, playerModel.position.z);
            if (distToPlayer > 15) {
                bot.mesh.position.x += toPlayer.x * dt * 5;
                bot.mesh.position.z += toPlayer.z * dt * 5;
            }
            // Shoot
            if (bot.shootCooldown <= 0 && distToPlayer < 60) {
                bot.shootCooldown = 0.8 + Math.random() * 0.7;
                // Accuracy drops with distance
                const hitChance = Math.max(0.15, 0.7 - distToPlayer / 100);
                if (Math.random() < hitChance) {
                    let dmg = 8 + Math.random() * 6;
                    if (playerShield > 0) {
                        const absorbed = Math.min(playerShield, dmg);
                        playerShield -= absorbed;
                        dmg -= absorbed;
                    }
                    playerHP -= dmg;
                }
                // Visual: line from bot to player
                const tracerGeo = new THREE.BufferGeometry().setFromPoints([
                    bot.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)),
                    playerModel.position.clone().add(new THREE.Vector3(0, 2, 0))
                ]);
                const tracer = new THREE.Line(tracerGeo, new THREE.LineBasicMaterial({ color: 0xff4400 }));
                scene.add(tracer);
                setTimeout(() => scene.remove(tracer), 60);
            }
        } else {
            // Patrol
            if (bot.aiTimer <= 0) {
                bot.aiTarget.set(
                    (Math.random() - 0.5) * MAP_SIZE * 1.5,
                    0,
                    (Math.random() - 0.5) * MAP_SIZE * 1.5
                );
                bot.aiTimer = 3 + Math.random() * 3;
            }
            const dir = new THREE.Vector3().subVectors(bot.aiTarget, bot.mesh.position);
            dir.y = 0;
            if (dir.length() > 2) {
                dir.normalize();
                bot.mesh.position.x += dir.x * dt * 3;
                bot.mesh.position.z += dir.z * dt * 3;
                bot.mesh.lookAt(bot.aiTarget.x, bot.mesh.position.y, bot.aiTarget.z);
            }
        }

        // Clamp bots
        bot.mesh.position.x = Math.max(-MAP_SIZE + 5, Math.min(MAP_SIZE - 5, bot.mesh.position.x));
        bot.mesh.position.z = Math.max(-MAP_SIZE + 5, Math.min(MAP_SIZE - 5, bot.mesh.position.z));
    });

    // Random bot vs bot kills
    if (Math.random() < 0.003) {
        const aliveBots = bots.filter(b => b.alive);
        if (aliveBots.length >= 2) {
            const victim = aliveBots[Math.floor(Math.random() * aliveBots.length)];
            const killer = aliveBots[Math.floor(Math.random() * aliveBots.length)];
            if (victim !== killer) killBot(victim, killer.name);
        }
    }
}

function checkWinCondition() {
    const aliveBots = bots.filter(b => b.alive).length;
    if (aliveBots === 0) {
        endGameSession(true);
    }
}

function endGameSession(victory) {
    gameActive = false;
    if (document.exitPointerLock) document.exitPointerLock();
    const overlay = document.getElementById('game-over-overlay');
    overlay.classList.remove('hidden');
    const aliveBots = bots.filter(b => b.alive).length;
    const place = victory ? 1 : aliveBots + 1;
    document.getElementById('game-over-title').textContent = victory ? 'VICTORY ROYALE!' : 'NIEDERLAGE';
    document.getElementById('result-kills').textContent = playerKills;
    document.getElementById('result-place').textContent = place;
    const reward = playerKills * 50 + (victory ? 500 : 100);
    document.getElementById('reward-coins').textContent = reward;
    playerState.coins += reward;
    saveState();
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    updateCurrencyDisplays();
});
updateCurrencyDisplays();








