const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player, enemy, arrows, score = 0, scoreText;

// ================= PRELOAD =================
function preload() {
  this.load.image(
    "player",
    "https://labs.phaser.io/assets/sprites/phaser-dude.png"
  );

  // 🏹 REAL ARROW
  this.load.image(
    "arrow",
    "https://labs.phaser.io/assets/sprites/longarrow.png"
  );

  this.load.image(
    "bg",
    "https://labs.phaser.io/assets/skies/space3.png"
  );
}

// ================= CREATE =================
function create() {
  const width = this.scale.width;
  const height = this.scale.height;

  // 🌌 Background FULL SCREEN
  this.add.image(width / 2, height / 2, "bg")
    .setDisplaySize(width, height);

  arrows = this.physics.add.group();

  // 🧍 PLAYER (LEFT SIDE)
  player = this.physics.add.sprite(120, height - 120, "player");
  player.setScale(2); // 🔥 BIG
  player.setCollideWorldBounds(true);

  // 🤖 ENEMY (RIGHT SIDE)
  enemy = this.physics.add.sprite(width - 120, height - 120, "player");
  enemy.setScale(2);
  enemy.setTint(0xff0000); // red enemy

  // 🎯 SCORE
  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: "28px",
    fill: "#ffffff"
  });

  // 📱 SHOOT CONTROL
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

// ================= UPDATE =================
function update() {}

// ================= SHOOT =================
function shootArrow(scene, angle) {
  let arrow = scene.physics.add.image(player.x, player.y, "arrow");

  arrow.setScale(1.5); // bigger arrow

  arrow.setVelocity(
    600 * Math.cos(angle),
    600 * Math.sin(angle)
  );

  arrow.setRotation(angle);

  // 💥 COLLISION
  scene.physics.add.overlap(arrow, enemy, (arr, target) => {
    let hitY = arr.y - target.y;

    let points = hitY < -40 ? 10 : 5;

    score += points;
    scoreText.setText("Score: " + score);

    // 🔄 Enemy respawn random position
    target.x = Phaser.Math.Between(
      scene.scale.width / 2,
      scene.scale.width - 100
    );

    target.y = scene.scale.height - 120;

    arr.destroy();
  });
}
