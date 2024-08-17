const gridSize = 10;
let grid = [];
let isCreatorMode = true;
let playerPos = null;
let zombiePos = null;

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
  if (!isCreatorMode) return;

  const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);

  if (!playerPos) {
    playerPos = { x, y };
    cell.classList.add("player");
  } else if (!zombiePos) {
    zombiePos = { x, y };
    cell.classList.add("zombie");
  } else {
    if (grid[y][x] === 0) {
      grid[y][x] = 1; // Mark as barrier
      cell.classList.add("barrier");
    } else {
      grid[y][x] = 0; // Remove barrier
      cell.classList.remove("barrier");
    }
  }
}

function switchToPlayMode() {
  isCreatorMode = false;
  if (playerPos && zombiePos) {
    const path = findPath(playerPos, zombiePos);
    if (path) {
      drawPath(path);
    } else {
      alert("No path found!");
    }
  }
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

// Event listeners for mode buttons
document.getElementById("creatorMode").addEventListener("click", () => {
  isCreatorMode = true;
});

document.getElementById("playMode").addEventListener("click", switchToPlayMode);

// Initialize the grid on page load
createGrid();
