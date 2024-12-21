class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameStarted = false;
    this.timer = 30;
    this.level = 1;
    this.player = {
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
    this.coins = [];
    this.enemies = [];
    this.keys = { left: false, right: false, up: false };
    this.sounds = {
      jump: new Audio('jump.mp3'),
      coin: new Audio('coin.mp3'),
      gameOver: new Audio('gameOver.mp3'),
      damage: new Audio('damage.mp3'),
      levelUp: new Audio('levelUp.mp3'),
      background: new Audio('backgroundMusic.mp3')
    };
    this.paused = false;

    this.init();
  }

  init() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    setInterval(this.gameLoop.bind(this), 1000 / 60);
  }

  handleKeyDown(e) {
    if (e.key === "ArrowRight") this.keys.right = true;
    if (e.key === "ArrowLeft") this.keys.left = true;
    if (e.key === "ArrowUp") this.keys.up = true;
    if (e.key === "p") this.togglePause();
    if (e.key === "r" && this.gameOver) this.restartGame();
    if (e.key === "Enter" && !this.gameStarted) this.startGame();
  }

  handleKeyUp(e) {
    if (e.key === "ArrowRight") this.keys.right = false;
    if (e.key === "ArrowLeft") this.keys.left = false;
    if (e.key === "ArrowUp") this.keys.up = false;
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.sounds.background.pause();
    } else {
      this.sounds.background.play();
    }
  }

  startGame() {
    this.createCoins();
    this.createEnemies();
    this.gameStarted = true;
    this.sounds.background.loop = true;
    this.sounds.background.play();
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.timer = 30;
    this.level = 1;
    this.player = {
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
    this.createCoins();
    this.createEnemies();
    this.gameOver = false;
    this.gameStarted = false;
    this.startGame();
  }

  createCoins() {
    this.coins = [];
    for (let i = 0; i < 10 * this.level; i++) {
      this.coins.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, radius: 10, color: "yellow" });
    }
  }

  createEnemies() {
    this.enemies = [];
    for (let i = 0; i < 5 * this.level; i++) {
      this.enemies.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, speed: 2 + this.level, color: "red" });
    }
  }

  drawPlayer() {
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    if (this.player.invincible) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }
  }

  drawCoins() {
    this.coins.forEach((coin) => {
      this.ctx.beginPath();
      this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = coin.color;
      this.ctx.fill();
      this.ctx.closePath();
    });
  }

  drawEnemies() {
    this.enemies.forEach((enemy) => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, 20, 20);
      enemy.x += (Math.random() > 0.5 ? 1 : -1) * enemy.speed;
      enemy.y += (Math.random() > 0.5 ? 1 : -1) * enemy.speed;
    });
  }

  updateScoreboard() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("timer").textContent = this.timer;
    document.getElementById("lives").textContent = this.lives;
  }

  checkCoinCollisions() {
    this.coins.forEach((coin, index) => {
      if (this.player.x < coin.x + coin.radius && this.player.x + this.player.width > coin.x &&
        this.player.y < coin.y + coin.radius && this.player.y + this.player.height > coin.y) {
        this.coins.splice(index, 1);
        this.score += 10;
        this.sounds.coin.play();
      }
    });
  }

  checkEnemyCollisions() {
    this.enemies.forEach((enemy) => {
      if (this.player.x < enemy.x + 20 && this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + 20 && this.player.y + this.player.height > enemy.y) {
        if (!this.player.invincible) {
          this.lives--;
          this.sounds.damage.play();
          if (this.lives <= 0) {
            this.gameOver = true;
            this.sounds.gameOver.play();
          }
          this.player.invincible = true;
          setTimeout(() => { this.player.invincible = false; }, 2000);
        }
      }
    });
  }

  movePlayer() {
    if (this.keys.left) this.player.x -= this.player.speed;
    if (this.keys.right) this.player.x += this.player.speed;
    if (this.keys.up && this.player.grounded) {
      this.player.velocityY = this.player.jumpHeight;
      this.player.grounded = false;
      this.sounds.jump.play();
    }

    this.player.velocityY += 1; // gravity
    this.player.y += this.player.velocityY;

    if (this.player.y + this.player.height >= this.canvas.height - 10) {
      this.player.y = this.canvas.height - this.player.height - 10;
      this.player.velocityY = 0;
      this.player.grounded = true;
    }
  }

  gameLoop() {
    if (!this.gameStarted) {
      this.drawStartScreen();
      return;
    }

    if (this.paused || this.gameOver) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    this.movePlayer();
    this.checkCoinCollisions();
    this.checkEnemyCollisions();
    this.updateScoreboard();
    this.drawCoins();
    this.drawEnemies();
    this.drawPlayer();
  }

  drawBackground() {
    this.ctx.fillStyle = "#87CEEB";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawStartScreen() {
    this.ctx.fillStyle = "#282828";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Welcome to the Game", this.canvas.width / 2 - 120, this.canvas.height / 3);
    this.ctx.fillText("Press ENTER to start", this.canvas.width / 2 - 150, this.canvas.height / 2);
    this.ctx.fillText("High Score: " + localStorage.getItem("highestScore"), this.canvas.width / 2 - 120, this.canvas.height / 1.5);
  }
}

const game = new Game();
