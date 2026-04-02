const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // 🚫 NO GRAVITY (IMPORTANT)
      debug: false
    }
  },
  scene: { preload, create }
};

const game = new Phaser.Game(config);

let player, enemy, arrows, score = 0, scoreText;

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");

  this.load.image("arrow", "https://labs.phaser.io/assets/sprites/longarrow.png");

  this.load.image("bg", "https://labs.phaser.io/assets/skies/space3.png");
}

// ================= CREATE =================
function create() {
  const width = this.scale.width;
  const height = this.scale.height;

  // 🌌 Background
  this.add.image(width / 2, height / 2, "bg")
    .setDisplaySize(width, height);

  arrows = this.physics.add.group();

  // 🧍 PLAYER
  player = this.physics.add.sprite(120, height - 150, "player");
  player.setScale(2);
  player.body.setAllowGravity(false); // 🚫 NO FALL

  // 🤖 ENEMY
  spawnEnemy(this);

  // 🎯 SCORE
  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: "28px",
    fill: "#ffffff"
  });

  // 📱 SHOOT
  this.input.on("pointerdown", (pointer) => {
    let angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );

    shootArrow(this, angle);
  });
}

// ================= SPAWN ENEMY =================
function spawnEnemy(scene) {
  const width = scene.scale.width;
  const height = scene.scale.height;

  if (enemy) enemy.destroy(); // remove old enemy

  enemy = scene.physics.add.sprite(
    Phaser.Math.Between(width / 2, width - 100),
    height - 150,
    "player"
  );

  enemy.setScale(2);
  enemy.setTint(0xff0000);
  enemy.body.setAllowGravity(false); // 🚫 NO FALL
}

// ================= SHOOT =================
function shootArrow(scene, angle) {
  let arrow = scene.physics.add.image(player.x, player.y, "arrow");

  arrow.setScale(1.5);

  arrow.setVelocity(
    700 * Math.cos(angle),
    700 * Math.sin(angle)
  );

  arrow.setRotation(angle);

  // 💥 HIT
  scene.physics.add.overlap(arrow, enemy, (arr, target) => {
    let hitY = arr.y - target.y;

    let points = hitY < -40 ? 10 : 5;

    score += points;
    scoreText.setText("Score: " + score);

    arr.destroy();

    // 🔥 INSTANT NEW ENEMY
    spawnEnemy(scene);
  });
}
