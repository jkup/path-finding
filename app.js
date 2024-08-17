const gridSize = 10;
let grid = [];
let placingType = "player"; // Current object type to place
let playerPositions = [];
let zombiePositions = [];

function createGrid() {
  const gridElement = document.getElementById("grid");
  gridElement.innerHTML = "";
  grid = [];

  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", () => onCellClick(x, y));
      gridElement.appendChild(cell);
      row.push(0);
    }
    grid.push(row);
  }
}

function onCellClick(x, y) {
  const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);

  switch (placingType) {
    case "player":
      if (!cell.classList.contains("player")) {
        playerPositions.push({ x, y });
        cell.classList.add("player");
      }
      break;
    case "zombie":
      if (!cell.classList.contains("zombie")) {
        zombiePositions.push({ x, y });
        cell.classList.add("zombie");
      }
      break;
    case "obstacle":
      if (grid[y][x] === 0) {
        grid[y][x] = 1; // Mark as barrier
        cell.classList.add("barrier");
      } else {
        grid[y][x] = 0; // Remove barrier
        cell.classList.remove("barrier");
      }
      break;
  }
}

function findPaths() {
  playerPositions.forEach((player) => {
    zombiePositions.forEach((zombie) => {
      const path = findPath(zombie, player);
      if (path) {
        drawPath(path);
      }
    });
  });
}

function findPath(start, end) {
  const openList = [];
  const closedList = new Set();

  const startNode = { ...start, g: 0, h: 0, f: 0, parent: null };
  openList.push(startNode);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift();

    if (currentNode.x === end.x && currentNode.y === end.y) {
      const path = [];
      let temp = currentNode;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path.reverse();
    }

    closedList.add(`${currentNode.x},${currentNode.y}`);

    const neighbors = getNeighbors(currentNode);
    for (const neighbor of neighbors) {
      if (
        closedList.has(`${neighbor.x},${neighbor.y}`) ||
        grid[neighbor.y][neighbor.x] === 1
      ) {
        continue;
      }

      const g = currentNode.g + 1;
      const h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
      const f = g + h;

      const existingNode = openList.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );
      if (existingNode && g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = f;
        existingNode.parent = currentNode;
      } else if (!existingNode) {
        openList.push({ ...neighbor, g, h, f, parent: currentNode });
      }
    }
  }

  return null; // No path found
}

function getNeighbors(node) {
  const neighbors = [];
  const { x, y } = node;

  if (x > 0) neighbors.push({ x: x - 1, y });
  if (x < gridSize - 1) neighbors.push({ x: x + 1, y });
  if (y > 0) neighbors.push({ x, y: y - 1 });
  if (y < gridSize - 1) neighbors.push({ x, y: y + 1 });

  return neighbors;
}

function drawPath(path) {
  path.forEach((step) => {
    const cell = document.querySelector(
      `[data-x="${step.x}"][data-y="${step.y}"]`
    );
    if (
      !cell.classList.contains("player") &&
      !cell.classList.contains("zombie")
    ) {
      cell.classList.add("path");
    }
  });
}

// Event listeners for placing buttons
document.getElementById("placePlayer").addEventListener("click", () => {
  placingType = "player";
});

document.getElementById("placeZombie").addEventListener("click", () => {
  placingType = "zombie";
});

document.getElementById("placeObstacle").addEventListener("click", () => {
  placingType = "obstacle";
});

// Event listener for the Find Paths button
document.getElementById("findPaths").addEventListener("click", findPaths);

// Initialize the grid on page load
createGrid();
