// ============================================================
// BRAWL HEROES - Ein Brawl Stars inspiriertes Spiel
// ============================================================

// ---------- Spielzustand / Spielerdaten ----------
const gameData = {
    coins: 500,
    gems: 50,
    selectedBrawler: 'shelly',
    ownedBrawlers: ['shelly']
};

// ---------- Brawler-Definitionen ----------
const BRAWLERS = {
    shelly: {
        name: 'SHELLY',
        color: '#ff9800',
        hp: 100,
        speed: 2.8,
        damage: 18,
        fireRate: 400,
        projectileSpeed: 6,
        projectileCount: 5,
        spread: 0.35,
        range: 280,
        price: 0,
        desc: 'Schrotflinten-Angreiferin, stark auf kurze Distanz'
    },
    colt: {
        name: 'COLT',
        color: '#2196f3',
        hp: 90,
        speed: 3.0,
        damage: 14,
        fireRate: 180,
        projectileSpeed: 9,
        projectileCount: 1,
        spread: 0.02,
        range: 420,
        price: 200,
        desc: 'Schnelle Salve aus zwei Revolvern'
    },
    bull: {
        name: 'BULL',
        color: '#795548',
        hp: 160,
        speed: 2.5,
        damage: 22,
        fireRate: 500,
        projectileSpeed: 6,
        projectileCount: 6,
        spread: 0.45,
        range: 240,
        price: 300,
        desc: 'Tanky Nahkämpfer mit doppelter Schrotflinte'
    },
    nita: {
        name: 'NITA',
        color: '#9c27b0',
        hp: 120,
        speed: 2.8,
        damage: 20,
        fireRate: 450,
        projectileSpeed: 7,
        projectileCount: 1,
        spread: 0.05,
        range: 340,
        price: 400,
        desc: 'Schockwelle mit mittlerer Reichweite'
    },
    piper: {
        name: 'PIPER',
        color: '#e91e63',
        hp: 80,
        speed: 2.6,
        damage: 40,
        fireRate: 700,
        projectileSpeed: 11,
        projectileCount: 1,
        spread: 0,
        range: 550,
        price: 500,
        desc: 'Präzise Scharfschützin mit großer Reichweite'
    },
    elprimo: {
        name: 'EL PRIMO',
        color: '#f44336',
        hp: 200,
        speed: 3.2,
        damage: 15,
        fireRate: 300,
        projectileSpeed: 5,
        projectileCount: 4,
        spread: 0.3,
        range: 180,
        price: 600,
        desc: 'Wrestler mit massiven Fäusten und viel HP'
    }
};

// ---------- Shop Items ----------
const SHOP_ITEMS = [
    { type: 'coins', name: '100 MÜNZEN', amount: 100, price: 10, currency: 'gems', color: '#ffd700' },
    { type: 'coins', name: '500 MÜNZEN', amount: 500, price: 40, currency: 'gems', color: '#ffd700' },
    { type: 'gems', name: '20 EDELSTEINE', amount: 20, price: 200, currency: 'coins', color: '#e91e63' },
    { type: 'brawler', brawler: 'colt' },
    { type: 'brawler', brawler: 'bull' },
    { type: 'brawler', brawler: 'nita' },
    { type: 'brawler', brawler: 'piper' },
    { type: 'brawler', brawler: 'elprimo' }
];

// ============================================================
// NAVIGATION
// ============================================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function backToMenu() {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    gameLoop = null;
    document.getElementById('game-over-overlay').classList.add('hidden');
    updateMenu();
    showScreen('main-menu');
}

function openShop() {
    renderShop();
    showScreen('shop-screen');
}

function openBrawlers() {
    renderBrawlers();
    showScreen('brawlers-screen');
}

function updateMenu() {
    document.getElementById('menu-coins').textContent = gameData.coins;
    document.getElementById('menu-gems').textContent = gameData.gems;
    const br = BRAWLERS[gameData.selectedBrawler];
    document.getElementById('selected-brawler-name').textContent = br.name;
    document.getElementById('selected-brawler-preview').style.background = br.color;
}

// ============================================================
// SHOP
// ============================================================
function renderShop() {
    document.getElementById('shop-coins').textContent = gameData.coins;
    document.getElementById('shop-gems').textContent = gameData.gems;
    const container = document.getElementById('shop-items');
    container.innerHTML = '';

    SHOP_ITEMS.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'shop-item';

        if (item.type === 'brawler') {
            const br = BRAWLERS[item.brawler];
            const owned = gameData.ownedBrawlers.includes(item.brawler);
            card.innerHTML = `
                <div class="shop-item-preview" style="background: ${br.color}"></div>
                <h3>${br.name}</h3>
                <p>${br.desc}</p>
                <div class="stats">
                    <div>HP<br><span class="stat-value">${br.hp}</span></div>
                    <div>DMG<br><span class="stat-value">${br.damage}</span></div>
                    <div>SPD<br><span class="stat-value">${br.speed.toFixed(1)}</span></div>
                </div>
                <button class="buy-btn" ${owned ? 'disabled' : ''} onclick="buyBrawler('${item.brawler}')">
                    ${owned ? 'BEREITS GEKAUFT' : `KAUFEN ($${br.price})`}
                </button>
            `;
        } else {
            const symbol = item.currency === 'gems' ? '◆' : '$';
            card.innerHTML = `
                <div class="shop-item-preview" style="background: ${item.color}; position: relative;">
                    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;color:white;text-shadow: 3px 3px 0 #000;">
                        ${item.type === 'coins' ? '$' : '◆'}
                    </div>
                </div>
                <h3>${item.name}</h3>
                <p>Schnell aufstocken für deine Einkäufe</p>
                <button class="buy-btn" onclick="buyCurrency(${idx})">
                    KAUFEN (${item.price}${symbol})
                </button>
            `;
        }
        container.appendChild(card);
    });
}

function buyBrawler(key) {
    const br = BRAWLERS[key];
    if (gameData.coins < br.price) {
        flashMessage('Nicht genug Münzen!');
        return;
    }
    gameData.coins -= br.price;
    gameData.ownedBrawlers.push(key);
    gameData.selectedBrawler = key;
    renderShop();
}

function buyCurrency(idx) {
    const item = SHOP_ITEMS[idx];
    if (gameData[item.currency] < item.price) {
        flashMessage('Nicht genug Währung!');
        return;
    }
    gameData[item.currency] -= item.price;
    gameData[item.type] += item.amount;
    renderShop();
}

function flashMessage(msg) {
    const flash = document.createElement('div');
    flash.textContent = msg;
    flash.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#f44336;color:white;padding:20px 40px;border-radius:10px;font-size:22px;z-index:9999;border:3px solid #000;box-shadow:0 6px 0 rgba(0,0,0,0.4);';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1500);
}

// ============================================================
// BRAWLER AUSWAHL
// ============================================================
function renderBrawlers() {
    const container = document.getElementById('brawlers-grid');
    container.innerHTML = '';

    Object.keys(BRAWLERS).forEach(key => {
        const br = BRAWLERS[key];
        const owned = gameData.ownedBrawlers.includes(key);
        const selected = gameData.selectedBrawler === key;
        const card = document.createElement('div');
        card.className = 'brawler-card' + (owned ? '' : ' locked');
        card.innerHTML = `
            <div class="brawler-card-preview" style="background: ${br.color}"></div>
            <h3>${br.name}</h3>
            <p>${br.desc}</p>
            <div class="stats">
                <div>HP<br><span class="stat-value">${br.hp}</span></div>
                <div>DMG<br><span class="stat-value">${br.damage}</span></div>
                <div>SPD<br><span class="stat-value">${br.speed.toFixed(1)}</span></div>
            </div>
            <button class="select-btn ${selected ? 'selected' : ''}" onclick="selectBrawler('${key}')">
                ${!owned ? '🔒 GESPERRT' : (selected ? '✓ AUSGEWÄHLT' : 'AUSWÄHLEN')}
            </button>
        `;
        container.appendChild(card);
    });
}

function selectBrawler(key) {
    if (!gameData.ownedBrawlers.includes(key)) {
        flashMessage('Diesen Brawler zuerst im Shop kaufen!');
        return;
    }
    gameData.selectedBrawler = key;
    renderBrawlers();
}

// ============================================================
// SPIELLOGIK
// ============================================================
const WORLD = { width: 1600, height: 1100 };
const TILE = 50;

let canvas, ctx;
let gameLoop = null;
let keys = {};
let mouse = { x: 0, y: 0, down: false };
let camera = { x: 0, y: 0 };

let player = null;
let enemies = [];
let bushes = [];
let walls = [];
let projectiles = [];
let particles = [];
let pickups = [];
let kills = 0;
let gameStartTime = 0;
let gameDuration = 120000; // 2 Minuten
let gameEnded = false;

// ---------- Spielstart ----------
function startGame() {
    showScreen('game-screen');
    document.getElementById('game-over-overlay').classList.add('hidden');
    initGame();
}

function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const br = BRAWLERS[gameData.selectedBrawler];
    player = {
        x: WORLD.width / 2,
        y: WORLD.height / 2,
        radius: 22,
        hp: br.hp,
        maxHp: br.hp,
        speed: br.speed,
        color: br.color,
        lastShot: 0,
        brawler: br,
        angle: 0,
        inBush: false
    };

    enemies = [];
    projectiles = [];
    particles = [];
    pickups = [];
    kills = 0;
    gameEnded = false;
    gameStartTime = Date.now();

    generateWorld();
    spawnEnemies(5);

    setupInput();
    loop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ---------- Welt generieren ----------
function generateWorld() {
    walls = [];
    bushes = [];

    // Äußere Grenzen als Wände
    const border = 40;
    walls.push({ x: 0, y: 0, w: WORLD.width, h: border });
    walls.push({ x: 0, y: WORLD.height - border, w: WORLD.width, h: border });
    walls.push({ x: 0, y: 0, w: border, h: WORLD.height });
    walls.push({ x: WORLD.width - border, y: 0, w: border, h: WORLD.height });

    // Ein paar Hindernisse (Felsen/Kisten)
    const obstacles = [
        { x: 300, y: 250, w: 100, h: 100 },
        { x: 1200, y: 250, w: 100, h: 100 },
        { x: 300, y: 750, w: 100, h: 100 },
        { x: 1200, y: 750, w: 100, h: 100 },
        { x: 700, y: 500, w: 200, h: 100 },
        { x: 550, y: 200, w: 80, h: 80 },
        { x: 950, y: 800, w: 80, h: 80 }
    ];
    obstacles.forEach(o => walls.push(o));

    // Büsche - große Gras-Flächen, in denen man sich verstecken kann
    const bushAreas = [
        { x: 150, y: 450, w: 240, h: 200 },
        { x: 1210, y: 450, w: 240, h: 200 },
        { x: 650, y: 150, w: 300, h: 120 },
        { x: 650, y: 830, w: 300, h: 120 },
        { x: 450, y: 350, w: 120, h: 400 },
        { x: 1030, y: 350, w: 120, h: 400 }
    ];

    bushAreas.forEach(area => {
        // Mehrere Bush-Tiles pro Fläche, leicht überlappend
        for (let y = area.y; y < area.y + area.h; y += 30) {
            for (let x = area.x; x < area.x + area.w; x += 30) {
                bushes.push({
                    x: x + Math.random() * 10,
                    y: y + Math.random() * 10,
                    r: 28 + Math.random() * 10
                });
            }
        }
    });
}

// ---------- Feinde spawnen ----------
function spawnEnemies(count) {
    const brawlerKeys = Object.keys(BRAWLERS);
    for (let i = 0; i < count; i++) {
        const key = brawlerKeys[Math.floor(Math.random() * brawlerKeys.length)];
        const br = BRAWLERS[key];
        let x, y, tries = 0;
        do {
            x = 100 + Math.random() * (WORLD.width - 200);
            y = 100 + Math.random() * (WORLD.height - 200);
            tries++;
        } while ((Math.hypot(x - player.x, y - player.y) < 400 || hitsWall(x, y, 25)) && tries < 50);

        enemies.push({
            x, y,
            radius: 22,
            hp: br.hp,
            maxHp: br.hp,
            speed: br.speed * 0.6,
            color: br.color,
            brawler: br,
            lastShot: 0,
            angle: 0,
            inBush: false,
            target: { x, y },
            retargetTime: 0,
            aiState: 'patrol'
        });
    }
}

// ---------- Eingabe ----------
function setupInput() {
    // Entfernen wir alte Listener falls vorhanden
    if (window._brawlInputSetup) return;
    window._brawlInputSetup = true;

    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', () => { mouse.down = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
}

// ---------- Kollision ----------
function hitsWall(x, y, r) {
    for (const w of walls) {
        const cx = Math.max(w.x, Math.min(x, w.x + w.w));
        const cy = Math.max(w.y, Math.min(y, w.y + w.h));
        if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
    }
    return false;
}

function isInBush(x, y) {
    for (const b of bushes) {
        if ((x - b.x) ** 2 + (y - b.y) ** 2 < b.r * b.r) return true;
    }
    return false;
}

// ---------- Spieler bewegen ----------
function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    if (dx || dy) {
        const len = Math.hypot(dx, dy);
        dx /= len; dy /= len;
        const nx = player.x + dx * player.speed;
        const ny = player.y + dy * player.speed;
        if (!hitsWall(nx, player.y, player.radius)) player.x = nx;
        if (!hitsWall(player.x, ny, player.radius)) player.y = ny;
    }

    player.x = Math.max(player.radius, Math.min(WORLD.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(WORLD.height - player.radius, player.y));

    // Winkel zur Maus
    const worldMx = mouse.x + camera.x;
    const worldMy = mouse.y + camera.y;
    player.angle = Math.atan2(worldMy - player.y, worldMx - player.x);

    player.inBush = isInBush(player.x, player.y);

    // Schießen
    if (mouse.down) {
        shoot(player, player.angle);
    }
}

// ---------- Schießen ----------
function shoot(shooter, angle) {
    const now = Date.now();
    if (now - shooter.lastShot < shooter.brawler.fireRate) return;
    shooter.lastShot = now;

    const br = shooter.brawler;
    const isPlayer = shooter === player;

    for (let i = 0; i < br.projectileCount; i++) {
        const spreadAngle = angle + (Math.random() - 0.5) * br.spread;
        projectiles.push({
            x: shooter.x + Math.cos(angle) * shooter.radius,
            y: shooter.y + Math.sin(angle) * shooter.radius,
            vx: Math.cos(spreadAngle) * br.projectileSpeed,
            vy: Math.sin(spreadAngle) * br.projectileSpeed,
            damage: br.damage,
            range: br.range,
            traveled: 0,
            fromPlayer: isPlayer,
            color: shooter.color,
            radius: 6
        });
    }

    // Mündungsfeuer
    for (let i = 0; i < 6; i++) {
        particles.push({
            x: shooter.x + Math.cos(angle) * shooter.radius,
            y: shooter.y + Math.sin(angle) * shooter.radius,
            vx: Math.cos(angle) * 4 + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * 4 + (Math.random() - 0.5) * 2,
            life: 15,
            maxLife: 15,
            color: shooter.color,
            radius: 4
        });
    }
}

// ---------- Projektile aktualisieren ----------
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.traveled += Math.hypot(p.vx, p.vy);

        if (p.traveled > p.range || hitsWall(p.x, p.y, p.radius)) {
            explodeParticle(p.x, p.y, p.color);
            projectiles.splice(i, 1);
            continue;
        }

        // Treffer
        if (p.fromPlayer) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if ((p.x - e.x) ** 2 + (p.y - e.y) ** 2 < (p.radius + e.radius) ** 2) {
                    e.hp -= p.damage;
                    explodeParticle(p.x, p.y, p.color);
                    projectiles.splice(i, 1);
                    if (e.hp <= 0) {
                        kills++;
                        document.getElementById('kill-count').textContent = kills;
                        spawnPickup(e.x, e.y);
                        explodeParticle(e.x, e.y, e.color, 20);
                        enemies.splice(j, 1);
                        setTimeout(() => spawnEnemies(1), 2000);
                    }
                    break;
                }
            }
        } else {
            if ((p.x - player.x) ** 2 + (p.y - player.y) ** 2 < (p.radius + player.radius) ** 2) {
                player.hp -= p.damage;
                explodeParticle(p.x, p.y, p.color);
                projectiles.splice(i, 1);
                if (player.hp <= 0) endGame(false);
            }
        }
    }
}

function explodeParticle(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            life: 20 + Math.random() * 10,
            maxLife: 30,
            color,
            radius: 3 + Math.random() * 3
        });
    }
}

function spawnPickup(x, y) {
    pickups.push({ x, y, type: 'coin', radius: 12, bounce: 0 });
}

// ---------- KI-Feinde ----------
function updateEnemies() {
    const now = Date.now();
    enemies.forEach(e => {
        e.inBush = isInBush(e.x, e.y);
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        const canSeePlayer = !player.inBush || dist < 150;

        if (canSeePlayer && dist < 500) {
            e.aiState = 'attack';
            e.angle = Math.atan2(player.y - e.y, player.x - e.x);

            // In Reichweite schießen
            if (dist < e.brawler.range * 0.8) {
                shoot(e, e.angle);
                // Kleinen Abstand halten
                if (dist < e.brawler.range * 0.4) {
                    moveEnemy(e, -Math.cos(e.angle), -Math.sin(e.angle));
                }
            } else {
                moveEnemy(e, Math.cos(e.angle), Math.sin(e.angle));
            }
        } else {
            // Patrouille
            if (now > e.retargetTime || Math.hypot(e.target.x - e.x, e.target.y - e.y) < 30) {
                e.target = {
                    x: 100 + Math.random() * (WORLD.width - 200),
                    y: 100 + Math.random() * (WORLD.height - 200)
                };
                e.retargetTime = now + 3000 + Math.random() * 2000;
            }
            const ang = Math.atan2(e.target.y - e.y, e.target.x - e.x);
            e.angle = ang;
            moveEnemy(e, Math.cos(ang), Math.sin(ang));
        }
    });
}

function moveEnemy(e, dx, dy) {
    const nx = e.x + dx * e.speed;
    const ny = e.y + dy * e.speed;
    if (!hitsWall(nx, e.y, e.radius)) e.x = nx;
    if (!hitsWall(e.x, ny, e.radius)) e.y = ny;
    e.x = Math.max(e.radius, Math.min(WORLD.width - e.radius, e.x));
    e.y = Math.max(e.radius, Math.min(WORLD.height - e.radius, e.y));
}

// ---------- Partikel / Pickups ----------
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updatePickups() {
    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.bounce += 0.1;
        if ((p.x - player.x) ** 2 + (p.y - player.y) ** 2 < 40 * 40) {
            gameData.coins += 5;
            pickups.splice(i, 1);
        }
    }
}

// ---------- Kamera ----------
function updateCamera() {
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
    camera.x = Math.max(0, Math.min(WORLD.width - canvas.width, camera.x));
    camera.y = Math.max(0, Math.min(WORLD.height - canvas.height, camera.y));
}

// ---------- Rendering ----------
function render() {
    // Hintergrund Gras
    ctx.fillStyle = '#4a7c3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gras-Kachelmuster
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    for (let x = 0; x < WORLD.width; x += TILE) {
        for (let y = 0; y < WORLD.height; y += TILE) {
            const isDark = ((x / TILE) + (y / TILE)) % 2 === 0;
            ctx.fillStyle = isDark ? '#4a7c3a' : '#528a40';
            ctx.fillRect(x, y, TILE, TILE);
        }
    }

    // Wände
    walls.forEach(w => {
        ctx.fillStyle = '#5c3317';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = '#7a4520';
        ctx.fillRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
        ctx.strokeStyle = '#3a1f0a';
        ctx.lineWidth = 3;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Pickups (Münzen)
    pickups.forEach(p => {
        const b = Math.sin(p.bounce) * 3;
        ctx.save();
        ctx.translate(p.x, p.y + b);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#b8860b';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
    });

    // Spieler zeichnen (sichtbar wenn nicht im Busch, oder halbtransparent)
    if (!player.inBush) {
        drawBrawler(player);
    } else {
        ctx.globalAlpha = 0.3;
        drawBrawler(player);
        ctx.globalAlpha = 1;
    }

    // Gegner zeichnen — nur wenn nicht im Busch
    enemies.forEach(e => {
        if (!e.inBush) {
            drawBrawler(e);
        }
    });

    // Projektile
    projectiles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    });

    // Partikel
    particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Büsche ÜBER allem — so verdecken sie was drin ist
    bushes.forEach(b => {
        ctx.fillStyle = '#2d5a1e';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        // Hellere Gras-Flecken
        ctx.fillStyle = '#3d7a28';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x + b.r * 0.3, b.y + b.r * 0.2, b.r * 0.3, 0, Math.PI * 2);
        ctx.fill();
    });

    // "Versteckt"-Indikator für Spieler
    if (player.inBush) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('🌿 VERSTECKT', player.x, player.y - 45);
        ctx.fillText('🌿 VERSTECKT', player.x, player.y - 45);
    }

    ctx.restore();
}

function drawBrawler(b) {
    // Schatten
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + b.radius - 2, b.radius, b.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Körper
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Augen (in Blickrichtung)
    const eyeDx = Math.cos(b.angle) * 4;
    const eyeDy = Math.sin(b.angle) * 4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x - 6 + eyeDx, b.y - 4 + eyeDy, 5, 0, Math.PI * 2);
    ctx.arc(b.x + 6 + eyeDx, b.y - 4 + eyeDy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(b.x - 6 + eyeDx * 1.5, b.y - 4 + eyeDy * 1.5, 2.5, 0, Math.PI * 2);
    ctx.arc(b.x + 6 + eyeDx * 1.5, b.y - 4 + eyeDy * 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // HP-Balken
    const barW = 50;
    const barH = 6;
    const bx = b.x - barW / 2;
    const by = b.y - b.radius - 14;
    ctx.fillStyle = '#000';
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, barW, barH);
    const pct = Math.max(0, b.hp / b.maxHp);
    ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    ctx.fillRect(bx, by, barW * pct, barH);

    // Waffenlinie zur Ziel-Richtung
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + Math.cos(b.angle) * (b.radius + 10), b.y + Math.sin(b.angle) * (b.radius + 10));
    ctx.stroke();
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

// ---------- HUD ----------
function updateHud() {
    const pct = Math.max(0, player.hp / player.maxHp) * 100;
    const fill = document.getElementById('hp-fill');
    fill.style.width = pct + '%';
    fill.classList.toggle('low', pct < 30);
    document.getElementById('hp-text').textContent = Math.max(0, Math.ceil(player.hp)) + ' / ' + player.maxHp;

    const remain = Math.max(0, gameDuration - (Date.now() - gameStartTime));
    const m = Math.floor(remain / 60000);
    const s = Math.floor((remain % 60000) / 1000);
    document.getElementById('game-timer').textContent = m + ':' + String(s).padStart(2, '0');

    if (remain <= 0 && !gameEnded) endGame(true);
}

// ---------- Spielende ----------
function endGame(won) {
    if (gameEnded) return;
    gameEnded = true;
    const reward = kills * 20 + (won ? 50 : 0);
    gameData.coins += reward;
    document.getElementById('game-over-title').textContent = won ? 'SIEG!' : 'NIEDERLAGE';
    document.getElementById('game-over-title').style.color = won ? '#ffd700' : '#f44336';
    document.getElementById('result-kills').textContent = kills;
    document.getElementById('reward-coins').textContent = reward;
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

function quitGame() {
    backToMenu();
}

// ---------- Haupt-Loop ----------
function loop() {
    if (!gameEnded) {
        updatePlayer();
        updateEnemies();
        updateProjectiles();
        updateParticles();
        updatePickups();
        updateCamera();
        updateHud();
    }
    render();
    gameLoop = requestAnimationFrame(loop);
}

// ============================================================
// INIT
// ============================================================
updateMenu();
