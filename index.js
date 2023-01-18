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

  let isBarrierOnLeft = false;
  let isBarrierOnRight = false;
  let isBarrierInFront = false;

  const onFutureLeftPosition = {
    x:
      direction === "left"
        ? headPositionCoordinates.x + 1
        : direction === "right"
        ? headPositionCoordinates.x - 1
        : headPositionCoordinates.x,
    y:
      direction === "up"
        ? headPositionCoordinates.y + 1
        : direction === "down"
        ? headPositionCoordinates.y - 1
        : headPositionCoordinates.y,
  };

  console.log({ onFutureLeftPosition, headPositionCoordinates, direction });

  room.players.forEach((player) => {
    player.fromHeadPosition.forEach((bodyPart) => {
      if (
        bodyPart.x === onFutureLeftPosition.x &&
        bodyPart.y === onFutureLeftPosition.y
      ) {
        isBarrierOnLeft = true;
      }
    });
  });
  if (
    headPositionCoordinates.y + 1 === roomSize.height + 1 &&
    direction === "down"
  ) {
    isBarrierInFront = true;
  } else if (headPositionCoordinates.y === 0 && direction === "up") {
    isBarrierInFront = true;
  } else if (headPositionCoordinates.x === 0 && direction === "left") {
    isBarrierOnLeft = true;
  } else if (
    headPositionCoordinates.x === roomSize.width &&
    direction === "right"
  ) {
    isBarrierOnRight = true;
  }

  if (!isBarrierInFront) {
    action = "forward";
  } else {
    action = "right";
  }

  // if (direction === "right" && headPositionCoordinates.x === roomSize.width) {
  //   action = "right";
  // } else if (
  //   direction === "down" &&
  //   headPositionCoordinates.y === roomSize.height
  // ) {
  //   action = "right";
  // } else if (direction === "left" && headPositionCoordinates.x === 0) {
  //   action = "right";
  // } else if (direction === "up" && headPositionCoordinates.y === 0) {
  //   action = "right";
  // } else {
  //   action = "forward";

  //   if (isGoingOnLeftSide || isGoingOnRightSide) {
  //     foodPositions.forEach((apple) => {
  //       if (apple.position.y === headPositionCoordinates.y) {
  //         action = "right";
  //       }
  //     });
  //   }
  //   if (isGoingOnTopSide || isGoingOnBottomSide) {
  //     foodPositions.forEach((apple) => {
  //       if (apple.position.x === headPositionCoordinates.x) {
  //         action = "right";
  //       }
  //     });
  //   }
  // }
}
