const socket = io();

// 🎮 CONFIG
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
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

// 🧠 VARIABLES
let players = {};
let arrows;
let myId = null;
let scoreText;

// ================= PRELOAD =================
function preload() {
  this.load.image(
    "player",
    "https://labs.phaser.io/assets/sprites/phaser-dude.png"
  );

  this.load.image(
    "arrow",
    "https://labs.phaser.io/assets/sprites/arrow.png"
  );

  this.load.image(
    "bg",
    "https://labs.phaser.io/assets/skies/space3.png"
  );
}

// ================= CREATE =================
function create() {
  const self = this;

  // 🌌 Background
  this.add.image(400, 250, "bg").setDisplaySize(800, 500);

  arrows = this.physics.add.group();

  // 🎯 Score
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "20px",
    fill: "#ffffff"
  });

  // 🔌 SOCKET EVENTS

  socket.on("currentPlayers", (serverPlayers) => {
    Object.keys(serverPlayers).forEach((id) => {
      addPlayer(self, id, serverPlayers[id]);

      if (id === socket.id) {
        myId = id;
      }
    });
  });

  socket.on("newPlayer", (playerData) => {
    addPlayer(self, playerData.id, playerData);
  });

  socket.on("updatePlayers", (serverPlayers) => {
    Object.keys(serverPlayers).forEach((id) => {
      if (players[id]) {
        players[id].setPosition(
          serverPlayers[id].x,
          serverPlayers[id].y
        );

        if (id === myId) {
          scoreText.setText(
            "Score: " + serverPlayers[id].score
          );
        }
      }
    });
  });

  socket.on("shoot", (data) => {
    if (players[data.id]) {
      shootArrow(self, players[data.id], data.angle, data.power);
    }
  });

  socket.on("playerDisconnected", (id) => {
    if (players[id]) {
      players[id].destroy();
      delete players[id];
    }
  });

  // 📱 CLICK / TOUCH TO SHOOT
  this.input.on("pointerdown", function (pointer) {
    if (!myId || !players[myId]) return;

    let player = players[myId];

    let angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );

    let power = 350;

    shootArrow(self, player, angle, power);

    socket.emit("shoot", {
      angle,
      power
    });
  });
}

// ================= UPDATE =================
function update() {}

// ================= ADD PLAYER =================
function addPlayer(scene, id, data) {
  if (players[id]) return;

  let player = scene.physics.add.sprite(
    data.x,
    data.y,
    "player"
  );

  player.setScale(0.5);
  player.setCollideWorldBounds(true);

  players[id] = player;
}

// ================= SHOOT ARROW =================
function shootArrow(scene, player, angle, power) {
  let arrow = scene.physics.add.image(
    player.x,
    player.y,
    "arrow"
  );

  arrow.setScale(0.5);

  arrow.setVelocity(
    power * Math.cos(angle),
    power * Math.sin(angle)
  );

  arrow.setRotation(angle);

  // 💥 HIT DETECTION
  scene.physics.add.overlap(
    arrow,
    Object.values(players),
    (arr, target) => {
      if (target === player) return;

      let hitY = arr.y - target.y;

      let points = hitY < -15 ? 10 : 5;

      socket.emit("hit", {
        target: getPlayerId(target),
        points
      });

      arr.destroy();
    }
  );
}

// ================= HELPER =================
function getPlayerId(playerObj) {
  return Object.keys(players).find(
    (id) => players[id] === playerObj
  );
}
