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
    document.getElementById("startButton").addEventListener("click", this.startGame.bind(this));
    setInterval(this.gameLoop.bind(this), 1000 / 60);
  }

  handleKeyDown(e) {
    if (e.key === "ArrowRight") this.keys.right = true;
    if (e.key === "ArrowLeft") this.keys.left = true;
    if (e.key === "ArrowUp") this.keys.up = true;
    if (e.key === "p") this.togglePause();
    if (e.key === "r" && this.gameOver) this.restartGame();
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
    document.getElementById("startButton").style.display = 'none'; // Hide button after starting
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

  // Other methods remain the same...
}
const game = new Game();
