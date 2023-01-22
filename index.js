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
        name: "Dumbass",
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

  const secondPartBodyPositionCoordinates = room.players[0].fromHeadPosition[1];
  const [headPositionCoordinates, ...bodyWithoutHeadCoordinates] =
    room.players[0].fromHeadPosition;
  const roomSize = { width: room.width - 1, height: room.height - 1 };

  //direction of the snake
  const directionNumber =
    secondPartBodyPositionCoordinates.x === headPositionCoordinates.x - 1 &&
    secondPartBodyPositionCoordinates.y === headPositionCoordinates.y
      ? 1
      : secondPartBodyPositionCoordinates.y === headPositionCoordinates.y - 1 &&
        secondPartBodyPositionCoordinates.x === headPositionCoordinates.x
      ? -1
      : secondPartBodyPositionCoordinates.x === headPositionCoordinates.x + 1 &&
        secondPartBodyPositionCoordinates.y === headPositionCoordinates.y
      ? -1
      : secondPartBodyPositionCoordinates.y === headPositionCoordinates.y + 1 &&
        secondPartBodyPositionCoordinates.x === headPositionCoordinates.x
      ? 1
      : 0;

  let outsitePlaygorund = false;

  if (
    (headPositionCoordinates.y === roomSize.height && directionNumber === -1) ||
    (headPositionCoordinates.x === roomSize.width && directionNumber === 1) ||
    (headPositionCoordinates.x === 0 && directionNumber === -1) ||
    (headPositionCoordinates.y === 0 && directionNumber === 1)
  ) {
    outsitePlaygorund = true;
  }

  if (outsitePlaygorund) {
    action = "right";
  } else {
    action = "forward";
  }

  console.log({ directionNumber, outsitePlaygorund });
}
