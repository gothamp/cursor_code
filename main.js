// Initialize Kaboom.js
kaboom({
    canvas: document.getElementById("kaboom-canvas"),
    width: 1000,
    height: 600,
    background: [135, 206, 235] // Sky blue background
});

// Define game constants
const SPEED = 200;
const JUMP_FORCE = 800;
const GRAVITY = 800;
const ENEMY_SPEED = 50;
const COIN_VALUE = 10;

// Game state
let score = 0;
let health = 3;
let lives = 3;

// Set gravity
setGravity(GRAVITY);

// Load sprites (using built-in shapes for now)
loadSprite("coin", "data:image/svg+xml;base64," + btoa(`
<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="6" fill="gold" stroke="orange" stroke-width="2"/>
  <text x="8" y="12" text-anchor="middle" font-size="8" fill="black">$</text>
</svg>
`));

loadSprite("enemy", "data:image/svg+xml;base64," + btoa(`
<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="16" height="12" fill="purple"/>
  <circle cx="8" cy="12" r="2" fill="red"/>
  <circle cx="16" cy="12" r="2" fill="red"/>
  <rect x="6" y="18" width="12" height="2" fill="black"/>
</svg>
`));

// Create ground/platform
add([
    rect(width(), 50),
    pos(0, height() - 50),
    area(),
    body({ isStatic: true }),
    color(34, 139, 34), // Forest green
    "ground"
]);

// Create additional platforms
add([
    rect(150, 20),
    pos(200, height() - 200),
    area(),
    body({ isStatic: true }),
    color(139, 69, 19), // Brown
    "platform"
]);

add([
    rect(150, 20),
    pos(500, height() - 350),
    area(),
    body({ isStatic: true }),
    color(139, 69, 19), // Brown
    "platform"
]);

add([
    rect(150, 20),
    pos(750, height() - 150),
    area(),
    body({ isStatic: true }),
    color(139, 69, 19), // Brown
    "platform"
]);

// Create player character
const player = add([
    rect(32, 48),
    pos(100, 100),
    area(),
    body(),
    color(255, 0, 0), // Red
    "player"
]);

// Function to spawn enemies
function spawnEnemy(x, y) {
    const enemy = add([
        sprite("enemy"),
        pos(x, y),
        area(),
        body({ isStatic: true }),
        "enemy",
        {
            direction: 1,
            speed: ENEMY_SPEED
        }
    ]);
    
    enemy.onUpdate(() => {
        enemy.move(enemy.direction * enemy.speed, 0);
        
        // Turn around at platform edges
        if (enemy.pos.x <= 0 || enemy.pos.x >= width() - enemy.width) {
            enemy.direction *= -1;
        }
    });
}

// Function to spawn coins
function spawnCoin(x, y) {
    add([
        sprite("coin"),
        pos(x, y),
        area(),
        body({ isStatic: true }),
        "coin"
    ]);
}

// Spawn enemies
spawnEnemy(250, height() - 250);
spawnEnemy(550, height() - 400);
spawnEnemy(800, height() - 200);

// Spawn coins
spawnCoin(300, height() - 250);
spawnCoin(600, height() - 400);
spawnCoin(850, height() - 200);
spawnCoin(100, height() - 100);
spawnCoin(400, height() - 100);
spawnCoin(700, height() - 100);

// Player movement controls with visual feedback
onKeyDown("left", () => {
    player.move(-SPEED, 0);
    // Visual effect for movement
    if (player.isGrounded()) {
        add([
            circle(2),
            pos(player.pos.x + player.width/2, player.pos.y + player.height),
            color(100, 100, 100),
            lifespan(0.2),
            "dust"
        ]);
    }
});

onKeyDown("right", () => {
    player.move(SPEED, 0);
    // Visual effect for movement
    if (player.isGrounded()) {
        add([
            circle(2),
            pos(player.pos.x + player.width/2, player.pos.y + player.height),
            color(100, 100, 100),
            lifespan(0.2),
            "dust"
        ]);
    }
});

onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
    }
});

// Collision detection
player.onCollide("enemy", (enemy) => {
    // Player takes damage
    health--;
    player.pos = vec2(100, 100); // Reset position
    
    // Flash effect when taking damage
    player.color = rgb(255, 255, 255);
    wait(0.1, () => {
        player.color = rgb(255, 0, 0);
    });
    
    if (health <= 0) {
        lives--;
        health = 3;
        if (lives <= 0) {
            // Game over
            add([
                text("GAME OVER!", {
                    size: 48,
                    color: rgb(255, 0, 0)
                }),
                pos(width()/2 - 150, height()/2),
                "gameOver"
            ]);
            player.destroy();
        }
    }
});

player.onCollide("coin", (coin) => {
    score += COIN_VALUE;
    coin.destroy();
    
    // Score effect
    add([
        text(`+${COIN_VALUE}`, {
            size: 20,
            color: rgb(255, 215, 0)
        }),
        pos(coin.pos.x, coin.pos.y - 20),
        lifespan(1),
        "scoreEffect"
    ]);
});

// Keep player on screen
player.onUpdate(() => {
    // Prevent player from going off the left side
    if (player.pos.x < 0) {
        player.pos.x = 0;
    }
    
    // Prevent player from going off the right side
    if (player.pos.x > width() - player.width) {
        player.pos.x = width() - player.width;
    }
    
    // Reset player if they fall off the bottom
    if (player.pos.y > height()) {
        health--;
        player.pos = vec2(100, 100);
        if (health <= 0) {
            lives--;
            health = 3;
            if (lives <= 0) {
                add([
                    text("GAME OVER!", {
                        size: 48,
                        color: rgb(255, 0, 0)
                    }),
                    pos(width()/2 - 150, height()/2),
                    "gameOver"
                ]);
                player.destroy();
            }
        }
    }
});

// Add some visual feedback
onKeyPress("space", () => {
    if (player.isGrounded()) {
        // Add a small visual effect when jumping
        add([
            circle(4),
            pos(player.pos.x + player.width/2, player.pos.y + player.height),
            color(255, 255, 0),
            lifespan(0.3),
            "jumpEffect"
        ]);
        
        // Add dust particles when jumping
        for (let i = 0; i < 3; i++) {
            add([
                circle(1),
                pos(player.pos.x + player.width/2 + (Math.random() - 0.5) * 20, player.pos.y + player.height),
                color(150, 150, 150),
                lifespan(0.5),
                "jumpDust"
            ]);
        }
    }
});

// Add background decoration
for (let i = 0; i < 10; i++) {
    add([
        circle(2),
        pos(Math.random() * width(), Math.random() * height() * 0.7),
        color(255, 255, 255, 0.3),
        "cloud"
    ]);
}

// UI Elements
const scoreText = add([
    text(`Score: ${score}`, {
        size: 20,
        color: rgb(255, 255, 255)
    }),
    pos(10, 10),
    "scoreText"
]);

const healthText = add([
    text(`Health: ${health}`, {
        size: 20,
        color: rgb(255, 255, 255)
    }),
    pos(10, 35),
    "healthText"
]);

const livesText = add([
    text(`Lives: ${lives}`, {
        size: 20,
        color: rgb(255, 255, 255)
    }),
    pos(10, 60),
    "livesText"
]);

// Update UI
onUpdate(() => {
    scoreText.text = `Score: ${score}`;
    healthText.text = `Health: ${health}`;
    livesText.text = `Lives: ${lives}`;
});

// Add instructions
add([
    text("Arrow Keys: Move | Spacebar: Jump | Avoid enemies, collect coins!", {
        size: 14,
        color: rgb(255, 255, 255)
    }),
    pos(10, height() - 30),
    "instructions"
]);

// Add restart functionality
onKeyPress("r", () => {
    if (lives <= 0) {
        go("main");
    }
});

console.log("Enhanced 2D Platformer Game loaded! Use arrow keys to move, spacebar to jump. Avoid enemies and collect coins!");
