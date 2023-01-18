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

  const coordinates = room.players[0].fromHeadPosition;

  console.log(coordinates);

  action = Math.random() > 0.3 ? "forward" : "right";
}
