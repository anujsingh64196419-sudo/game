// Simple Pong game
// Left paddle: player (mouse + Up/Down)
// Right paddle: computer AI

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const W = canvas.width;
const H = canvas.height;

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 6; // keyboard speed
const COMPUTER_MAX_SPEED = 4.5;

const BALL_SIZE = 12;
const BALL_SPEED_START = 4;
const BALL_SPEED_INCREASE = 1.05; // speed multiplier on paddle hit
const WIN_SCORE = 10;

// Game state
let playerScore = 0;
let computerScore = 0;

let leftPaddle = {
  x: 20,
  y: (H - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

let rightPaddle = {
  x: W - 20 - PADDLE_WIDTH,
  y: (H - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

let ball = {
  x: W / 2,
  y: H / 2,
  size: BALL_SIZE,
  vx: BALL_SPEED_START * (Math.random() < 0.5 ? 1 : -1),
  vy: (Math.random() * 2 - 1) * BALL_SPEED_START
};

let upPressed = false;
let downPressed = false;

// Helpers
function resetBall(direction = null) {
  ball.x = W / 2;
  ball.y = H / 2;
  const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // small angle
  const dir = direction || (Math.random() < 0.5 ? -1 : 1);
  const speed = BALL_SPEED_START;
  ball.vx = dir * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}

function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawNet() {
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  const step = 16;
  const dashHeight = 8;
  for (let i = 0; i < H; i += step) {
    ctx.fillRect(W / 2 - 1, i, 2, dashHeight);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // background gradient subtle
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(255,255,255,0.01)');
  g.addColorStop(1, 'rgba(255,255,255,0.005)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawNet();

  // paddles
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#e6eef5');
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#e6eef5');

  // ball
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);
}

function update() {
  // Player keyboard movement
  if (upPressed) leftPaddle.y -= PADDLE_SPEED;
  if (downPressed) leftPaddle.y += PADDLE_SPEED;

  // Constrain player paddle
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > H) leftPaddle.y = H - leftPaddle.height;

  // Computer paddle: simple tracking with max speed
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const diff = ball.y - paddleCenter;
  const move = Math.max(-COMPUTER_MAX_SPEED, Math.min(COMPUTER_MAX_SPEED, diff * 0.12));
  rightPaddle.y += move;

  // Constrain computer paddle
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > H) rightPaddle.y = H - rightPaddle.height;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision (top/bottom)
  if (ball.y - ball.size / 2 <= 0) {
    ball.y = ball.size / 2;
    ball.vy *= -1;
  } else if (ball.y + ball.size / 2 >= H) {
    ball.y = H - ball.size / 2;
    ball.vy *= -1;
  }

  // Paddle collisions
  // Left paddle
  if (ball.x - ball.size / 2 <= leftPaddle.x + leftPaddle.width) {
    if (ball.y + ball.size / 2 >= leftPaddle.y && ball.y - ball.size / 2 <= leftPaddle.y + leftPaddle.height) {
      // hit
      ball.x = leftPaddle.x + leftPaddle.width + ball.size / 2; // push out
      ball.vx *= -1;
      // add spin based on where it hit on the paddle
      const relative = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
      ball.vy = relative * 6;
      // increase speed slightly
      ball.vx *= BALL_SPEED_INCREASE;
    }
  }

  // Right paddle
  if (ball.x + ball.size / 2 >= rightPaddle.x) {
    if (ball.y + ball.size / 2 >= rightPaddle.y && ball.y - ball.size / 2 <= rightPaddle.y + rightPaddle.height) {
      // hit
      ball.x = rightPaddle.x - ball.size / 2;
      ball.vx *= -1;
      const relative = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
      ball.vy = relative * 6;
      ball.vx *= BALL_SPEED_INCREASE;
    }
  }

  // Score (ball passes left or right)
  if (ball.x < 0) {
    // Computer scores
    computerScore++;
    computerScoreEl.textContent = computerScore;
    if (computerScore >= WIN_SCORE) {
      alert('Computer wins! Refresh to play again.');
      resetGame();
      return;
    }
    resetBall(1); // send ball to right
  } else if (ball.x > W) {
    // Player scores
    playerScore++;
    playerScoreEl.textContent = playerScore;
    if (playerScore >= WIN_SCORE) {
      alert('You win! Refresh to play again.');
      resetGame();
      return;
    }
    resetBall(-1); // send ball to left
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function resetGame(){
  playerScore = 0;
  computerScore = 0;
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
  leftPaddle.y = (H - PADDLE_HEIGHT) / 2;
  rightPaddle.y = (H - PADDLE_HEIGHT) / 2;
  resetBall();
}

// Input handlers
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  // center paddle on mouse y
  leftPaddle.y = y - leftPaddle.height / 2;
  // constrain
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > H) leftPaddle.y = H - leftPaddle.height;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    upPressed = true;
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    downPressed = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') {
    upPressed = false;
  } else if (e.key === 'ArrowDown') {
    downPressed = false;
  }
});

// Start game
resetBall();
requestAnimationFrame(loop);