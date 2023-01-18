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

  const secondPartBodyPositionCoordinates = room.players[0].fromHeadPosition[1];
  const [headPositionCoordinates, ...bodyWithoutHeadCoordinates] =
    room.players[0].fromHeadPosition;
  const roomSize = { width: room.width - 1, height: room.height - 1 };

  //direction of the snake
  const direction =
    secondPartBodyPositionCoordinates.x === headPositionCoordinates.x - 1 &&
    secondPartBodyPositionCoordinates.y === headPositionCoordinates.y
      ? "right"
      : secondPartBodyPositionCoordinates.y === headPositionCoordinates.y - 1 &&
        secondPartBodyPositionCoordinates.x === headPositionCoordinates.x
      ? "down"
      : secondPartBodyPositionCoordinates.x === headPositionCoordinates.x + 1 &&
        secondPartBodyPositionCoordinates.y === headPositionCoordinates.y
      ? "left"
      : secondPartBodyPositionCoordinates.y === headPositionCoordinates.y + 1 &&
        secondPartBodyPositionCoordinates.x === headPositionCoordinates.x
      ? "up"
      : "";

  const isGoingOnLeftSide =
    headPositionCoordinates.x === 0 && direction === "up";
  const isGoingOnRightSide =
    headPositionCoordinates.x === roomSize.width && direction === "down";
  const isGoingOnTopSide =
    headPositionCoordinates.y === 0 && direction === "right";
  const isGoingOnBottomSide =
    headPositionCoordinates.y === roomSize.height && direction === "left";

  const foodPositions = room.food;

  let isBarrierLeft = false;
  let isBarrierRight = false;
  let isBarrierTop = false;
  let isBarrierBottom = false;

  room.players.forEach((player) => {
    player.fromHeadPosition.forEach((bodyPart) => {
      if (bodyPart.y === headPositionCoordinates.y + 1) {
        isBarrierBottom = true;
      } else if (bodyPart.y === headPositionCoordinates.y - 1) {
        isBarrierTop = true;
      } else if (bodyPart.x === headPositionCoordinates.x + 1) {
        isBarrierRight = true;
      } else if (bodyPart.x === headPositionCoordinates.x - 1) {
        isBarrierLeft = true;
      }
    });
  });
  if (
    headPositionCoordinates.y + 1 === roomSize.height + 1 &&
    direction === "down"
  ) {
    isBarrierTop = true;
  } else if (headPositionCoordinates.y === 0 && direction === "up") {
    isBarrierTop = true;
  } else if (headPositionCoordinates.x === 0 && direction === "left") {
    isBarrierLeft = true;
  } else if (
    headPositionCoordinates.x === roomSize.width &&
    direction === "right"
  ) {
    isBarrierRight = true;
  }

  console.log({ isBarrierLeft, isBarrierRight, isBarrierTop, isBarrierBottom });

  if (!isBarrierTop) {
    action = "forward";
  } else {
    action = "turn right";
  }

  // if (direction === "right" && headPositionCoordinates.x === roomSize.width) {
  //   action = "turn right";
  // } else if (
  //   direction === "down" &&
  //   headPositionCoordinates.y === roomSize.height
  // ) {
  //   action = "turn right";
  // } else if (direction === "left" && headPositionCoordinates.x === 0) {
  //   action = "turn right";
  // } else if (direction === "up" && headPositionCoordinates.y === 0) {
  //   action = "turn right";
  // } else {
  //   action = "forward";

  //   if (isGoingOnLeftSide || isGoingOnRightSide) {
  //     foodPositions.forEach((apple) => {
  //       if (apple.position.y === headPositionCoordinates.y) {
  //         action = "turn right";
  //       }
  //     });
  //   }
  //   if (isGoingOnTopSide || isGoingOnBottomSide) {
  //     foodPositions.forEach((apple) => {
  //       if (apple.position.x === headPositionCoordinates.x) {
  //         action = "turn right";
  //       }
  //     });
  //   }
  // }
}
