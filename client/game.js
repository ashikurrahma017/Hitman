const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, enemy, arrow = null;
let score = 0, scoreText;

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
  this.load.image("arrow", "https://labs.phaser.io/assets/sprites/longarrow.png");
  this.load.image("bg", "https://labs.phaser.io/assets/skies/space3.png");
}

// ================= CREATE =================
function create() {
  const w = this.scale.width;
  const h = this.scale.height;

  // Background
  this.add.image(w / 2, h / 2, "bg").setDisplaySize(w, h);

  // Player
  player = this.add.image(120, h - 120, "player").setScale(2);

  // Enemy
  spawnEnemy(this);

  // Score
  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: "28px",
    fill: "#fff"
  });

  // Shoot
  this.input.on("pointerdown", (pointer) => {
    shootArrow(this, pointer);
  });
}

// ================= UPDATE =================
function update() {
  if (arrow && enemy) {
    let dist = Phaser.Math.Distance.Between(
      arrow.x, arrow.y,
      enemy.x, enemy.y
    );

    if (dist < 50) {
      hitEnemy(this);
    }
  }
}

// ================= SHOOT =================
function shootArrow(scene, pointer) {
  if (arrow) arrow.destroy();

  arrow = scene.add.image(player.x, player.y, "arrow").setScale(2);

  let angle = Phaser.Math.Angle.Between(
    player.x, player.y,
    pointer.x, pointer.y
  );

  arrow.rotation = angle;

  // move arrow manually
  scene.tweens.add({
    targets: arrow,
    x: pointer.x,
    y: pointer.y,
    duration: 800,
    ease: "Linear"
  });
}

// ================= HIT =================
function hitEnemy(scene) {
  if (!enemy) return;

  score += 10;
  scoreText.setText("Score: " + score);

  // FALL ANIMATION
  scene.tweens.add({
    targets: enemy,
    y: enemy.y + 300,
    angle: 90,
    duration: 600,
    ease: "Power2",
    onComplete: () => {
      enemy.destroy();
      spawnEnemy(scene);
    }
  });

  arrow.destroy();
  arrow = null;
}

// ================= SPAWN ENEMY =================
function spawnEnemy(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;

  enemy = scene.add.image(
    Phaser.Math.Between(w / 2, w - 100),
    h - 120,
    "player"
  ).setScale(2);

  // 🎨 Random color every time
  enemy.setTint(Phaser.Display.Color.RandomRGB().color);
}
