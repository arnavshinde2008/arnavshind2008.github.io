const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

console.log(canvas);
console.log(scoreDisplay);
console.log(restartBtn);

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const difficultySelect = document.getElementById("difficulty");
const highScoreDisplay = document.getElementById("highScore");

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreDisplay.textContent = highScore;

let gameSpeed = 100;

let snake;
let food;
let dx;
let dy;
let score;
let gameLoop;
let touchStartX = 0;
let touchStartY = 0;

function startGame() {
    snake = [
        { x: 10, y: 10 }
    ];

    dx = 1;
    dy = 0;

    score = 0;
    scoreDisplay.textContent = score;

    generateFood();
    score++;
scoreDisplay.textContent = score;

if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
    localStorage.setItem("snakeHighScore", highScore);
}

  switch (difficultySelect.value) {
    case "easy":
        gameSpeed = 150;
        break;

    case "medium":
        gameSpeed = 100;
        break;

    case "hard":
        gameSpeed = 60;
        break;
}
    difficultySelect.disabled = true;

clearInterval(gameLoop);
gameLoop = setInterval(updateGame, gameSpeed);

drawGame();
}

function updateGame() {

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Wall Collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        gameOver();
        return;
    }

    // Self Collision
    for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
    }
}

    snake.unshift(head);

    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid (optional)
    ctx.strokeStyle = "#222";

    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#00ff00" : "#4CAF50";

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // Food
    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function generateFood() {

    while (true) {

        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        let onSnake = snake.some(
            part => part.x === food.x && part.y === food.y
        );

        if (!onSnake) break;
    }
}


function gameOver() {

    clearInterval(gameLoop);

    difficultySelect.disabled = false;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    ctx.font = "20px Arial";
    ctx.fillText(
        "Final Score: " + score,
        canvas.width / 2,
        canvas.height / 2 + 35
    );
}
// Mobile Controls

document.getElementById("up").addEventListener("click", () => {
    if (dy !== 1) {
        dx = 0;
        dy = -1;
    }
});

document.getElementById("down").addEventListener("click", () => {
    if (dy !== -1) {
        dx = 0;
        dy = 1;
    }
});

document.getElementById("left").addEventListener("click", () => {
    if (dx !== 1) {
        dx = -1;
        dy = 0;
    }
});

document.getElementById("right").addEventListener("click", () => {
    if (dx !== -1) {
        dx = 1;
        dy = 0;
    }
});
canvas.addEventListener("touchstart", (event) => {

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;

}, { passive: true });
canvas.addEventListener("touchend", (event) => {

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const dxSwipe = touchEndX - touchStartX;
    const dySwipe = touchEndY - touchStartY;

    // Ignore tiny swipes
    if (Math.abs(dxSwipe) < 30 && Math.abs(dySwipe) < 30) {
        return;
    }

    // Horizontal swipe
    if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {

        if (dxSwipe > 0 && dx !== -1) {
            dx = 1;
            dy = 0;
        }

        if (dxSwipe < 0 && dx !== 1) {
            dx = -1;
            dy = 0;
        }

    } else {

        // Vertical swipe
        if (dySwipe > 0 && dy !== -1) {
            dx = 0;
            dy = 1;
        }

        if (dySwipe < 0 && dy !== 1) {
            dx = 0;
            dy = -1;
        }

    }

}, { passive: true });
document.addEventListener("keydown", (event) => {

    switch (event.key) {

        case "ArrowUp":
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;

        case "ArrowDown":
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;

        case "ArrowLeft":
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;

        case "ArrowRight":
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

restartBtn.addEventListener("click", startGame);

difficultySelect.disabled = true;
startGame();
