export function turningAction(direction, command) {
  const action = {};
  if (direction === "right") {
    action = {
      turnBottom: "turn right",
      turnTop: "turn left",
    };
  }
  if (direction === "left") {
    action = {
      turnBottom: "turn left",
      turnTop: "turn right",
    };
  }
  if (direction === "top") {
    action = {
      turnRight: "turn right",
      turnLeft: "turn left",
    };
  }
  if (direction === "bottom") {
    action = {
      turnRight: "turn left",
      turnLeft: "turn right",
    };
  }
  return action[command];
}
