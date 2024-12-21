const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables globales
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let timer = 30;
let level = 1;
let player = {
  x: 50,
  y: 350,
  width: 30,
  height: 30,
  color: "blue",
  speed: 5,
  velocityY: 0,
  jumpHeight: -15,
  grounded: false,
  invincible: false
};

let coins = [];
let enemies = [];
let keys = { left: false, right: false, up: false };

// Sonidos
const jumpSound = new Audio('jump.mp3');
const coinSound = new Audio('coin.mp3');
const gameOverSound = new Audio('gameOver.mp3');
const damageSound = new Audio('damage.mp3');
const levelUpSound = new Audio('levelUp.mp3');
const backgroundMusic = new Audio('backgroundMusic.mp3');

// Funciones para la creación de monedas y enemigos
function createCoins() {
  coins = [];
  for (let i = 0; i < 10 * level; i++) {
    coins.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 10, color: "yellow" });
  }
}

function createEnemies() {
  enemies = [];
  for (let i = 0; i < 5 * level; i++) {
    enemies.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 2 + level, color: "red" });
  }
}

// Funciones de dibujo
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (player.invincible) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function drawCoins() {
  coins.forEach((coin) => {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = coin.color;
    ctx.fill();
    ctx.closePath();
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, 20, 20);
    enemy.x += (Math.random() > 0.5 ? 1 : -1) * enemy.speed;
    enemy.y += (Math.random() > 0.5 ? 1 : -1) * enemy.speed;
  });
}

function drawBackground() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (Math.random() > 0.9) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerUp() {
  ctx.fillStyle = "green";
  ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 20, 20);
}

function updateScoreboard() {
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = timer;
  document.getElementById("lives").textContent = lives;
}

function updateLevel() {
  if (score >= level * 100) {
    level++;
    createCoins();
    createEnemies();
    levelUpSound.play();
  }
}

// Función de colisiones
function checkCoinCollisions() {
  coins.forEach((coin, index) => {
    if (player.x < coin.x + coin.radius && player.x + player.width > coin.x &&
      player.y < coin.y + coin.radius && player.y + player.height > coin.y) {
      coins.splice(index, 1);
      score += 10;
      coinSound.play();
    }
  });
}

function checkEnemyCollisions() {
  enemies.forEach((enemy) => {
    if (player.x < enemy.x + 20 && player.x + player.width > enemy.x &&
      player.y < enemy.y + 20 && player.y + player.height > enemy.y) {
      if (!player.invincible) {
        lives--;
        damageSound.play();
        if (lives <= 0) {
          gameOver = true;
          gameOverSound.play();
        }
        player.invincible = true;
        setTimeout(() => { player.invincible = false; }, 2000);
      }
    }
  });
}

function checkPowerUpCollision() {
  // Lógica de colisión con PowerUp (si lo tienes)
}

function updateTimer() {
  if (timer > 0 && !gameOver) {
    timer--;
  } else if (timer === 0 && !gameOver) {
    gameOver = true;
    gameOverSound.play();
  }
}

function movePlayer() {
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  if (keys.up && player.grounded) {
    player.velocityY = player.jumpHeight;
    player.grounded = false;
    jumpSound.play();
  }

  player.velocityY += 1; // gravedad
  player.y += player.velocityY;

  if (player.y + player.height >= canvas.height - 10) {
    player.y = canvas.height - player.height - 10;
    player.velocityY = 0;
    player.grounded = true;
  }
}

// Eventos de teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "p") togglePause(); // Pausar el juego
  if (e.key === "r" && gameOver) restartGame(); // Reiniciar juego
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowUp") keys.up = false;
});

// Función de pausa
let paused = false;
function togglePause() {
  paused = !paused;
  if (paused) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
}

// Función para dibujar la pantalla de inicio
function drawStartScreen() {
  ctx.fillStyle = "#282828";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Bienvenido al Juego", canvas.width / 2 - 120, canvas.height / 3);
  ctx.fillText("Pulsar ENTER para comenzar", canvas.width / 2 - 150, canvas.height / 2);
  ctx.fillText("Puntaje más alto: " + localStorage.getItem("highestScore"), canvas.width / 2 - 120, canvas.height / 1.5);
}

// Función para iniciar el juego
function startGame() {
  createCoins();
  createEnemies();
  gameStarted = true;
  backgroundMusic.loop = true;
  backgroundMusic.play();
}

// Función de reinicio
function restartGame() {
  score = 0;
  lives = 3;
  timer = 30;
  level = 1;
  player = { x: 50, y: 350, width: 30, height: 30, color: "blue", speed: 5, velocityY: 0, jumpHeight: -15, grounded: false, invincible: false };
  createCoins();
  createEnemies();
  gameOver = false;
  gameStarted = false;
  startGame();
}

// Bucle del juego
function gameLoop() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (paused || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  movePlayer();
  updateTimer();
  checkCoinCollisions();
  checkEnemyCollisions();
  updateLevel();
  drawCoins();
  drawEnemies();
  drawPlayer();
  updateScoreboard();
}

setInterval(gameLoop, 1000 / 60); // Ejecutar el bucle cada 60fps


// Función para dibujar un fondo animado
function drawAnimatedBackground() {
  ctx.fillStyle = "#87CEEB"; // Cielo
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Nubes
  if (Math.random() < 0.1) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 50, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();
    ctx.closePath();
  }
  
  // Sol animado
  ctx.beginPath();
  ctx.arc(150, 150, 60, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

// Función para mostrar el puntaje más alto
function showHighestScore() {
  const highestScore = localStorage.getItem("highestScore") || 0;
  ctx.font = "25px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Puntaje más alto: " + highestScore, canvas.width / 2 - 120, 30);
}

// Función para mostrar animaciones de partículas
function drawExplosionParticles(x, y, color) {
  let particles = [];
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 3,
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 - 2,
      color: color,
    });
  }

  particles.forEach(particle => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.closePath();

    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.size *= 0.95; // Reducir el tamaño
  });
}

// Efecto de animación de la plataforma donde el jugador puede saltar
function drawMovingPlatforms() {
  let platforms = [
    { x: 200, y: 300, width: 100, height: 20, speedX: 2 },
    { x: 400, y: 250, width: 120, height: 20, speedX: -2 },
  ];

  platforms.forEach(platform => {
    ctx.fillStyle = "brown";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    platform.x += platform.speedX;

    // Rebotar las plataformas
    if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
      platform.speedX *= -1;
    }
  });
}

// Función para agregar animación a los enemigos
function animateEnemies() {
  enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // Movimiento de enemigos
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    enemy.x += (dx / distance) * 2; // Los enemigos se mueven hacia el jugador
    enemy.y += (dy / distance) * 2;
  });
}

// Función para mostrar un mensaje cuando el jugador gane
function showWinMessage() {
  ctx.fillStyle = "#282828";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = "40px Arial";
  ctx.fillStyle = "green";
  ctx.fillText("¡GANASTE!", canvas.width / 2 - 100, canvas.height / 3);
  ctx.fillText("Puntaje final: " + score, canvas.width / 2 - 140, canvas.height / 2);
  ctx.fillText("Pulsa ENTER para reiniciar", canvas.width / 2 - 170, canvas.height / 1.5);
}

// Función para iniciar el juego desde la pantalla de inicio
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && showStartScreen) {
    showStartScreen = false;
    startGame();
  }
});

// Crear un nuevo power-up aleatorio
function spawnRandomPowerUp() {
  if (Math.random() < 0.05) {
    powerUp = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      width: 25,
      height: 25,
      color: "purple",
    };
  }
}

// Función para crear más enemigos con dificultad creciente
function spawnNewEnemies() {
  if (score % 100 === 0) {
    let newEnemy = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 5 + 2,
      color: "darkred",
    };
    enemies.push(newEnemy);
  }
}

// Aumentar la dificultad del juego
function increaseDifficulty() {
  if (score > 200) {
    player.speed = 7; // Aumentar la velocidad del jugador
  }

  if (score > 500) {
    level += 1; // Aumentar el nivel de dificultad
  }
}

// Función para dibujar el HUD de estadísticas del juego
function drawHUD() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Puntaje: " + score, 10, 30);
  ctx.fillText("Vidas: " + lives, canvas.width - 100, 30);
  ctx.fillText("Nivel: " + level, canvas.width / 2 - 50, 30);
  ctx.fillText("Tiempo: " + timer, canvas.width - 100, 60);
}

// Función para manejar los efectos de sonido cuando el jugador recoge una moneda
function playCollectSound() {
  if (Math.random() < 0.3) {
    coinSound.play();
  }
}

// Función para dibujar las partículas cuando el jugador salta
function drawJumpParticles() {
  if (!player.grounded) {
    let particle = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      size: Math.random() * 5 + 2,
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 - 2,
      color: "white",
    };
    particles.push(particle);
  }

  particles.forEach((particle, index) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.closePath();

    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.size *= 0.95;

    if (particle.size <= 0.5) {
      particles.splice(index, 1); // Eliminar las partículas
    }
  });
}

// Función para pausar el juego
let paused = false;
function togglePause() {
  paused = !paused;
  if (paused) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
}

// Control de pausa
document.addEventListener("keydown", (e) => {
  if (e.key === "p") {
    togglePause();
  }
});

// Muestra la pantalla de game over
function showGameOverScreen() {
  ctx.fillStyle = "#282828";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = "40px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("¡GAME OVER!", canvas.width / 2 - 120, canvas.height / 3);
  ctx.fillText("Puntaje Final: " + score, canvas.width / 2 - 140, canvas.height / 2);
  ctx.fillText("Pulsa ENTER para reiniciar", canvas.width / 2 - 170, canvas.height / 1.5);
}

// Función de animación del salto
function animateJump() {
  if (!player.grounded) {
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fill();
    ctx.closePath();
  }
}

// Función para mover el jugador con suavidad
function movePlayerSmoothly() {
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;

  if (keys.up && player.grounded) {
    player.velocityY = player.jumpHeight;
    player.grounded = false;
    jumpSound.play();
  }

  // Movimiento suave
  player.velocityY += 0.8; // gravedad
  player.y += player.velocityY;

  if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
    player.grounded = true;
    player.velocityY = 0;
  }
}

// Función para agregar música de fondo
let backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true;
backgroundMusic.play();
