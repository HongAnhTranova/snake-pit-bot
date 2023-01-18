// Create player
if (localStorage.getItem("token") === null) {
  const createPlayerResponse = await fetch(
    "https://snake-pit.onrender.com/create-player",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "The best snake ever",
      }),
    }
  );
  const { playerToken } = await createPlayerResponse.json();
  localStorage.setItem("token", playerToken);
}

const playerToken = localStorage.getItem("token");

const response = await fetch("https://snake-pit.onrender.com/me", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    playerToken,
  }),
});

const data = await response.json();

if (!data?.player?.id) {
  localStorage.removeItem("token");
  location.reload();
}

// Find room to join
const listRoomsResponse = await fetch(
  "https://snake-pit.onrender.com/list-rooms"
);
const { rooms } = await listRoomsResponse.json();
const roomId = rooms.find(
  (room) => room.status === "waiting" && room.maximumPlayers === 1
).id;

let action = "forward";
while (true) {
  const payload = {
    playerToken,
    action,
  };
  const response = await fetch(
    `https://snake-pit.onrender.com/room/${roomId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const { room } = await response.json();

  const headPositionCoordinates = room.players[0].fromHeadPosition[0];
  const bodyPositionCoordinates = room.players[0].fromHeadPosition[1];
  const roomSize = { width: room.width - 1, height: room.height - 1 };

  const direction =
    bodyPositionCoordinates.x === headPositionCoordinates.x - 1 &&
    bodyPositionCoordinates.y === headPositionCoordinates.y
      ? "right"
      : bodyPositionCoordinates.y === headPositionCoordinates.y - 1 &&
        bodyPositionCoordinates.x === headPositionCoordinates.x
      ? "down"
      : bodyPositionCoordinates.x === headPositionCoordinates.x + 1 &&
        bodyPositionCoordinates.y === headPositionCoordinates.y
      ? "left"
      : bodyPositionCoordinates.y === headPositionCoordinates.y + 1 &&
        bodyPositionCoordinates.x === headPositionCoordinates.x
      ? "top"
      : "";

  console.log(headPositionCoordinates, roomSize);
  console.log(direction);

  if (direction === "right" && headPositionCoordinates.x === roomSize.width) {
    action = "right";
  } else if (
    direction === "down" &&
    headPositionCoordinates.y === roomSize.height
  ) {
    action = "right";
  } else if (direction === "left" && headPositionCoordinates.x === 0) {
    action = "right";
  } else if (direction === "top" && headPositionCoordinates.y === 0) {
    action = "right";
  } else {
    action = "forward";
    if (Math.random() < 0.2) {
      action = "right";
    }
  }
}
