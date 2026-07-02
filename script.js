// ===============================
// Canvas Setup
// ===============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");
const leaderboard = document.getElementById("leaderboard");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const playBtn = document.getElementById("playBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

// ===============================
// Game Constants
// ===============================
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// ===============================
// Game Variables
// ===============================
let snake = [];
let food = {};
let specialFood = null;

let dx = 1;
let dy = 0;

let score = 0;

let gameLoop = null;
let gameSpeed = 100;

let paused = false;

let touchStartX = 0;
let touchStartY = 0;

let specialFoodTimer;

// ===============================
// High Score
// ===============================
let highScore =
parseInt(localStorage.getItem("snakeHighScore")) || 0;

highScoreDisplay.textContent = highScore;

// ===============================
// Leaderboard
// ===============================
let scores =
JSON.parse(localStorage.getItem("leaderboard")) || [];

updateLeaderboard();

function updateLeaderboard() {

    leaderboard.innerHTML = "";

    if (scores.length === 0) {
        leaderboard.innerHTML = "<p>No scores yet</p>";
        return;
    }

    scores.forEach((value, index) => {

        leaderboard.innerHTML +=
        `<p>${index + 1}. ${value}</p>`;

    });

}

// ===============================
// Difficulty
// ===============================
function setDifficulty() {

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

}

// ===============================
// Special Food
// ===============================
function generateSpecialFood() {

    specialFood = {

        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)

    };

    clearTimeout(specialFoodTimer);

    specialFoodTimer = setTimeout(() => {

        specialFood = null;

    }, 5000);

}

// ===============================
// Start Game
// ===============================
function startGame() {

    clearInterval(gameLoop);

    paused = false;

    snake = [
        { x: 10, y: 10 }
    ];

    dx = 1;
    dy = 0;

    score = 0;
    scoreDisplay.textContent = score;

    specialFood = null;

    generateFood();

    setDifficulty();

    difficultySelect.disabled = true;

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    document.querySelector(".game-container").style.display = "block";

    gameLoop = setInterval(updateGame, gameSpeed);

    drawGame();

}

// ===============================
// Buttons
// ===============================
restartBtn.addEventListener("click", startGame);

playBtn.addEventListener("click", startGame);

playAgainBtn.addEventListener("click", startGame);

// ===============================
// Update Game
// ===============================
function updateGame() {

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Wall Mode
    const wallsEnabled =
        document.getElementById("wallMode").checked;

    if (wallsEnabled) {

        if (
            head.x < 0 ||
            head.x >= tileCount ||
            head.y < 0 ||
            head.y >= tileCount
        ) {
            gameOver();
            return;
        }

    } else {

        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;

    }

    // Self Collision
    for (let i = 1; i < snake.length; i++) {

        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {
            gameOver();
            return;
        }

    }

    snake.unshift(head);

    // ===============================
    // Normal Food
    // ===============================
    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;
        scoreDisplay.textContent = score;

        generateFood();

        // 20% chance of spawning special food
        if (!specialFood && Math.random() < 0.2) {
            generateSpecialFood();
        }

    } else {

        snake.pop();

    }

    // ===============================
    // Special Food
    // ===============================
    if (
        specialFood &&
        head.x === specialFood.x &&
        head.y === specialFood.y
    ) {

        score += 5;
        scoreDisplay.textContent = score;

        specialFood = null;

        clearTimeout(specialFoodTimer);

    }

    // ===============================
    // High Score
    // ===============================
    if (score > highScore) {

        highScore = score;

        highScoreDisplay.textContent = highScore;

        localStorage.setItem(
            "snakeHighScore",
            highScore
        );

    }

    drawGame();

}

// ===============================
// Draw Game
// ===============================
function drawGame() {

    // Background based on theme
    let background = "black";

    switch (document.body.className) {

        case "neon":
            background = "#111";
            break;

        case "retro":
            background = "#F5E6A7";
            break;

        default:
            background = "black";

    }

    ctx.fillStyle = background;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Grid
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

        if (document.body.className === "neon") {

            ctx.fillStyle =
                index === 0 ? "#00FFFF" : "#39FF14";

        } else if (document.body.className === "retro") {

            ctx.fillStyle =
                index === 0 ? "#8B4513" : "#228B22";

        } else {

            ctx.fillStyle =
                index === 0 ? "#00FF00" : "#4CAF50";

        }

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );

    });

    // Normal Food
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

    // Special Food
    if (specialFood) {

        ctx.fillStyle = "gold";

        ctx.beginPath();

        ctx.arc(
            specialFood.x * gridSize + gridSize / 2,
            specialFood.y * gridSize + gridSize / 2,
            gridSize / 2.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}

// ===============================
// Generate Food
// ===============================
function generateFood() {

    while (true) {

        food = {

            x: Math.floor(Math.random() * tileCount),

            y: Math.floor(Math.random() * tileCount)

        };

        const occupied = snake.some(part =>

            part.x === food.x &&
            part.y === food.y

        );

        if (
            !occupied &&
            (
                !specialFood ||
                food.x !== specialFood.x ||
                food.y !== specialFood.y
            )
        ) {
            break;
        }

    }

}

// ===============================
// Game Over
// ===============================
function gameOver() {

    clearInterval(gameLoop);

    difficultySelect.disabled = false;

    // Save leaderboard
    scores.push(score);

    scores.sort((a, b) => b - a);

    scores = scores.slice(0, 5);

    localStorage.setItem(
        "leaderboard",
        JSON.stringify(scores)
    );

    updateLeaderboard();

    finalScore.textContent =
        "Score : " + score;

    gameOverScreen.style.display = "flex";

}

// ===============================
// Keyboard Controls
// ===============================
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

        // Pause / Resume
        case " ":
        case "Spacebar":

            event.preventDefault();

            paused = !paused;

            if (paused) {

                clearInterval(gameLoop);

            } else {

                clearInterval(gameLoop);
                gameLoop = setInterval(updateGame, gameSpeed);

            }

            break;

    }

});

// ===============================
// Mobile Buttons
// ===============================
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

// ===============================
// Swipe Controls
// ===============================
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
    if (
        Math.abs(dxSwipe) < 30 &&
        Math.abs(dySwipe) < 30
    ) {
        return;
    }

    // Horizontal swipe
    if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {

        if (dxSwipe > 0 && dx !== -1) {

            dx = 1;
            dy = 0;

        } else if (dxSwipe < 0 && dx !== 1) {

            dx = -1;
            dy = 0;

        }

    }
    // Vertical swipe
    else {

        if (dySwipe > 0 && dy !== -1) {

            dx = 0;
            dy = 1;

        } else if (dySwipe < 0 && dy !== 1) {

            dx = 0;
            dy = -1;

        }

    }

}, { passive: true });

// ===============================
// Theme Selector
// ===============================
document.getElementById("theme").addEventListener("change", function () {

    document.body.className = this.value;

    drawGame();

});

// ===============================
// Difficulty Change
// ===============================
difficultySelect.addEventListener("change", () => {

    setDifficulty();

});

// ===============================
// Initial Screen Setup
// ===============================

// Hide game until Play is pressed
document.querySelector(".game-container").style.display = "none";

// Hide Game Over screen
gameOverScreen.style.display = "none";

// Draw an empty canvas
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);
