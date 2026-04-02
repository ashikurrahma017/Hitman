const socket = io();

// 🎮 Game Config
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
let myId;
let scoreText;

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
  this.load.image("arrow", "https://labs.phaser.io/assets/sprites/arrow.png");
}

// ================= CREATE =================
function create() {
  const self = this;

  arrows = this.physics.add.group();

  // 🎯 Score display
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "20px",
    fill: "#ffffff"
  });

  // 🔌 Socket events
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
        players[id].setPosition(serverPlayers[id].x, serverPlayers[id].y);

        // update score display for self
        if (id === myId) {
          scoreText.setText("Score: " + serverPlayers[id].score);
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

  // 📱 TOUCH / CLICK SHOOT
  this.input.on("pointerdown", function (pointer) {
    let player = players[myId];
    if (!player) return;

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
function addPlayer(scene, id, playerData) {
  let player = scene.physics.add.sprite(
    playerData.x,
    playerData.y,
    "player"
  );

  player.setCollideWorldBounds(true);
  players[id] = player;
}

// ================= SHOOT ARROW =================
function shootArrow(scene, player, angle, power) {
  let arrow = arrows.create(player.x, player.y, "arrow");

  arrow.setVelocity(
    power * Math.cos(angle),
    power * Math.sin(angle)
  );

  arrow.setRotation(angle);

  // 💥 COLLISION DETECTION
  scene.physics.add.overlap(
    arrow,
    Object.values(players),
    (arr, target) => {
      if (target === player) return;

      let hitY = arr.y - target.y;

      // 🎯 Head or Body
      let points = hitY < -15 ? 10 : 5;

      socket.emit("hit", {
        target: getPlayerId(target),
        points: points
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
