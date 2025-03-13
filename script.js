// 定义游戏板的行数和列数
const ROWS = 20;
const COLS = 10;
// 方块大小
const BLOCK_SIZE = 30;
// 方块形状
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]]
];
// 方块颜色
const COLORS = [
  '#00FFFF', '#FFFF00', '#FF00FF', '#00FF00', '#FF0000', '#0000FF', '#FFA500'
];

// 获取画布和绘图上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// 游戏板
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
// 当前方块
let currentPiece;
// 下一个方块
let nextPiece;
// 得分
let score = 0;
// 游戏是否结束
let gameOver = false;

// 创建新方块
function createPiece() {
  const randomIndex = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[randomIndex],
    color: COLORS[randomIndex],
    x: Math.floor(COLS / 2) - Math.floor(SHAPES[randomIndex][0].length / 2),
    y: 0
  };
}

// 绘制方块
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 绘制游戏板
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawBlock(x, y, board[y][x]);
      }
    }
  }
  // 绘制当前方块
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
      }
    }
  }
  // 绘制得分
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`得分: ${score}`, 10, 20);
}

// 检查碰撞
function checkCollision(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x;
        const newY = piece.y + y;
        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

// 固定方块到游戏板
function fixPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
      }
    }
  }
}

// 消除满行
function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      score += 100;
    }
  }
}

// 方块下落
function moveDown() {
  const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
  if (checkCollision(newPiece)) {
    fixPiece();
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();
    if (checkCollision(currentPiece)) {
      gameOver = true;
    }
  } else {
    currentPiece = newPiece;
  }
  drawBoard();
}

// 旋转方块
function rotatePiece() {
  const rotatedShape = currentPiece.shape[0].map((_, index) =>
    currentPiece.shape.map(row => row[index]).reverse()
  );
  const newPiece = { ...currentPiece, shape: rotatedShape };
  if (!checkCollision(newPiece)) {
    currentPiece = newPiece;
  }
  drawBoard();
}

// 水平移动方块
function moveHorizontal(direction) {
  const newPiece = { ...currentPiece, x: currentPiece.x + direction };
  if (!checkCollision(newPiece)) {
    currentPiece = newPiece;
  }
  drawBoard();
}

// 触屏事件处理
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      moveHorizontal(1);
    } else {
      moveHorizontal(-1);
    }
  } else {
    if (dy > 0) {
      moveDown();
    } else {
      rotatePiece();
    }
  }
});

// 游戏主循环
function gameLoop() {
  if (!gameOver) {
    moveDown();
    setTimeout(gameLoop, 500);
  } else {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('游戏结束', canvas.width / 2 - 80, canvas.height / 2);
  }
}

// 初始化游戏
function init() {
  currentPiece = createPiece();
  nextPiece = createPiece();
  gameLoop();
}

init();