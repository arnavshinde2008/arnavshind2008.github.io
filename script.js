// =====================================
// CONFIG.JS
// Global Variables & Game Settings
// =====================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const leaderboard = document.getElementById("leaderboard");

const restartBtn = document.getElementById("restartBtn");
const playBtn = document.getElementById("playBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const difficultySelect = document.getElementById("difficulty");
const wallModeCheckbox = document.getElementById("wallMode");
const themeSelect = document.getElementById("theme");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

// =============================
// Board
// =============================
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// =============================
// Snake
// =============================
let snake = [];
let direction = { x: 1, y: 0 };

// =============================
// Food
// =============================
let food = null;
let specialFood = null;
let specialFoodTimer = null;

// =============================
// Score
// =============================
let score = 0;

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

highScoreDisplay.textContent = highScore;

// =============================
// Leaderboard
// =============================
let leaderboardScores =
    JSON.parse(localStorage.getItem("leaderboard")) || [];

// =============================
// Game
// =============================
let gameLoop = null;

let paused = false;

let gameSpeed = 100;

// =============================
// Touch Controls
// =============================
let touchStartX = 0;
let touchStartY = 0;

// =============================
// Difficulty Speeds
// =============================
const SPEED = {

    easy:150,

    medium:100,

    hard:60

};

// =============================
// Theme Colors
// =============================
const THEMES = {

    dark:{

        background:"#111",

        snake:"#4CAF50",

        head:"#00FF00",

        food:"red",

        special:"gold"

    },

    neon:{

        background:"#050505",

        snake:"#39FF14",

        head:"#00FFFF",

        food:"#FF007F",

        special:"#FFD700"

    },

    retro:{

        background:"#D2B48C",

        snake:"#228B22",

        head:"#006400",

        food:"#CC0000",

        special:"#FFAA00"

    }

};

// =============================
// Current Theme
// =============================
let currentTheme = "dark";
// =====================================
// FOOD.JS
// Food Management
// =====================================

// Generate normal food
function generateFood() {

    while (true) {

        const newFood = {

            x: Math.floor(Math.random() * TILE_COUNT),

            y: Math.floor(Math.random() * TILE_COUNT)

        };

        // Check if food is on snake
        const onSnake = snake.some(part =>

            part.x === newFood.x &&
            part.y === newFood.y

        );

        // Check if food is on special food
        const onSpecialFood =

            specialFood &&
            newFood.x === specialFood.x &&
            newFood.y === specialFood.y;

        if (!onSnake && !onSpecialFood) {

            food = newFood;
            return;

        }

    }

}

// =====================================
// Generate Special Food
// =====================================
function generateSpecialFood() {

    while (true) {

        const newFood = {

            x: Math.floor(Math.random() * TILE_COUNT),

            y: Math.floor(Math.random() * TILE_COUNT)

        };

        const onSnake = snake.some(part =>

            part.x === newFood.x &&
            part.y === newFood.y

        );

        const onNormalFood =

            food &&
            newFood.x === food.x &&
            newFood.y === food.y;

        if (!onSnake && !onNormalFood) {

            specialFood = newFood;
            break;

        }

    }

    clearTimeout(specialFoodTimer);

    specialFoodTimer = setTimeout(() => {

        specialFood = null;

    }, 5000);

}

// =====================================
// Try to Spawn Special Food
// =====================================
function maybeSpawnSpecialFood() {

    if (specialFood) return;

    const chance = Math.random();

    if (chance <= 0.20) {

        generateSpecialFood();

    }

}

// =====================================
// Eat Normal Food
// =====================================
function eatNormalFood(head) {

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        scoreDisplay.textContent = score;

        generateFood();

        maybeSpawnSpecialFood();

        return true;

    }

    return false;

}

// =====================================
// Eat Special Food
// =====================================
function eatSpecialFood(head) {

    if (!specialFood) return false;

    if (

        head.x === specialFood.x &&
        head.y === specialFood.y

    ) {

        score += 5;

        scoreDisplay.textContent = score;

        specialFood = null;

        clearTimeout(specialFoodTimer);

        return true;

    }

    return false;

}
// =====================================
// DRAW.JS
// Drawing Functions
// =====================================

// Get current theme
function getTheme() {

    return THEMES[currentTheme];

}

// =====================================
// Draw Background
// =====================================
function drawBackground() {

    const theme = getTheme();

    ctx.fillStyle = theme.background;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

// =====================================
// Draw Grid
// =====================================
function drawGrid() {

    ctx.strokeStyle = "rgba(255,255,255,0.08)";

    for (let i = 0; i <= TILE_COUNT; i++) {

        ctx.beginPath();

        ctx.moveTo(i * GRID_SIZE, 0);

        ctx.lineTo(i * GRID_SIZE, canvas.height);

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(0, i * GRID_SIZE);

        ctx.lineTo(canvas.width, i * GRID_SIZE);

        ctx.stroke();

    }

}

// =====================================
// Draw Snake
// =====================================
function drawSnake() {

    const theme = getTheme();

    snake.forEach((segment, index) => {

        ctx.fillStyle =
            index === 0
                ? theme.head
                : theme.snake;

        ctx.fillRect(

            segment.x * GRID_SIZE + 1,

            segment.y * GRID_SIZE + 1,

            GRID_SIZE - 2,

            GRID_SIZE - 2

        );

    });

}

// =====================================
// Draw Normal Food
// =====================================
function drawFood() {

    const theme = getTheme();

    if (!food) return;

    ctx.fillStyle = theme.food;

    ctx.beginPath();

    ctx.arc(

        food.x * GRID_SIZE + GRID_SIZE / 2,

        food.y * GRID_SIZE + GRID_SIZE / 2,

        GRID_SIZE / 2.6,

        0,

        Math.PI * 2

    );

    ctx.fill();

}

// =====================================
// Draw Special Food
// =====================================
function drawSpecialFood() {

    if (!specialFood) return;

    const theme = getTheme();

    ctx.fillStyle = theme.special;

    ctx.beginPath();

    ctx.arc(

        specialFood.x * GRID_SIZE + GRID_SIZE / 2,

        specialFood.y * GRID_SIZE + GRID_SIZE / 2,

        GRID_SIZE / 2.4,

        0,

        Math.PI * 2

    );

    ctx.fill();

    // Small white sparkle
    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(

        specialFood.x * GRID_SIZE + GRID_SIZE / 2,

        specialFood.y * GRID_SIZE + GRID_SIZE / 2,

        2,

        0,

        Math.PI * 2

    );

    ctx.fill();

}

// =====================================
// Draw Pause Overlay
// =====================================
function drawPauseScreen() {

    ctx.fillStyle = "rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";

    ctx.textAlign = "center";

    ctx.font = "bold 34px Arial";

    ctx.fillText(

        "PAUSED",

        canvas.width / 2,

        canvas.height / 2

    );

}

// =====================================
// Draw Score on Canvas (Optional)
// =====================================
function drawCanvasScore() {

    ctx.fillStyle = "white";

    ctx.font = "16px Arial";

    ctx.textAlign = "left";

    ctx.fillText(

        "Score: " + score,

        10,

        20

    );

}

// =====================================
// Main Draw Function
// =====================================
function drawGame() {

    drawBackground();

    drawGrid();

    drawSnake();

    drawFood();

    drawSpecialFood();

    drawCanvasScore();

    if (paused) {

        drawPauseScreen();

    }

}
// =====================================
// STORAGE.JS
// High Score & Leaderboard
// =====================================

// =============================
// Load High Score
// =============================
function loadHighScore() {

    highScore =
        Number(localStorage.getItem("snakeHighScore")) || 0;

    highScoreDisplay.textContent = highScore;

}

// =============================
// Save High Score
// =============================
function saveHighScore() {

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "snakeHighScore",
            highScore
        );

        highScoreDisplay.textContent = highScore;

    }

}

// =============================
// Load Leaderboard
// =============================
function loadLeaderboard() {

    leaderboardScores =
        JSON.parse(
            localStorage.getItem("leaderboard")
        ) || [];

    updateLeaderboard();

}

// =============================
// Save Current Score
// =============================
function saveScore() {

    leaderboardScores.push(score);

    leaderboardScores.sort((a, b) => b - a);

    leaderboardScores =
        leaderboardScores.slice(0, 5);

    localStorage.setItem(
        "leaderboard",
        JSON.stringify(leaderboardScores)
    );

    updateLeaderboard();

}

// =============================
// Update Leaderboard Display
// =============================
function updateLeaderboard() {

    leaderboard.innerHTML = "";

    if (leaderboardScores.length === 0) {

        leaderboard.innerHTML =
            "<p>No scores yet</p>";

        return;

    }

    leaderboardScores.forEach((value, index) => {

        const row =
            document.createElement("p");

        row.textContent =
            `${index + 1}. ${value}`;

        leaderboard.appendChild(row);

    });

}

// =============================
// Reset Leaderboard (Optional)
// =============================
function resetLeaderboard() {

    leaderboardScores = [];

    localStorage.removeItem("leaderboard");

    updateLeaderboard();

}

// =============================
// Reset High Score (Optional)
// =============================
function resetHighScore() {

    highScore = 0;

    localStorage.removeItem("snakeHighScore");

    highScoreDisplay.textContent = 0;

}
// =====================================
// UI.JS
// User Interface Management
// =====================================

// =============================
// Show Start Screen
// =============================
function showStartScreen() {

    startScreen.style.display = "flex";

    gameOverScreen.style.display = "none";

    document.querySelector(".game-container").style.display = "none";

}

// =============================
// Hide Start Screen
// =============================
function hideStartScreen() {

    startScreen.style.display = "none";

    document.querySelector(".game-container").style.display = "flex";

}

// =============================
// Show Game Over Screen
// =============================
function showGameOverScreen() {

    finalScore.textContent = `Final Score : ${score}`;

    gameOverScreen.style.display = "flex";

}

// =============================
// Hide Game Over Screen
// =============================
function hideGameOverScreen() {

    gameOverScreen.style.display = "none";

}

// =============================
// Enable Difficulty Selector
// =============================
function enableDifficulty() {

    difficultySelect.disabled = false;

}

// =============================
// Disable Difficulty Selector
// =============================
function disableDifficulty() {

    difficultySelect.disabled = true;

}

// =============================
// Change Theme
// =============================
function setTheme(themeName) {

    currentTheme = themeName;

    document.body.className = themeName;

    drawGame();

}

// =============================
// Theme Selector
// =============================
themeSelect.addEventListener("change", function () {

    setTheme(this.value);

});

// =============================
// Pause / Resume
// =============================
function pauseGame() {

    if (paused) return;

    paused = true;

    clearInterval(gameLoop);

    drawGame();

}

function resumeGame() {

    if (!paused) return;

    paused = false;

    clearInterval(gameLoop);

    gameLoop = setInterval(updateGame, gameSpeed);

}

// =============================
// Toggle Pause
// =============================
function togglePause() {

    if (paused) {

        resumeGame();

    } else {

        pauseGame();

    }

}

// =============================
// Initialize UI
// =============================
function initializeUI() {

    loadHighScore();

    loadLeaderboard();

    showStartScreen();

    setTheme("dark");

}
// =====================================
// CONTROLS.JS
// Keyboard, Mobile & Swipe Controls
// =====================================

// =============================
// Change Direction
// =============================
function changeDirection(x, y) {

    // Prevent reversing into yourself
    if (
        x === -direction.x &&
        y === -direction.y
    ) {
        return;
    }

    direction.x = x;
    direction.y = y;

}

// =============================
// Keyboard Controls
// =============================
document.addEventListener("keydown", (event) => {

    switch (event.key) {

        case "ArrowUp":

            changeDirection(0, -1);
            break;

        case "ArrowDown":

            changeDirection(0, 1);
            break;

        case "ArrowLeft":

            changeDirection(-1, 0);
            break;

        case "ArrowRight":

            changeDirection(1, 0);
            break;

        case " ":
        case "Spacebar":

            event.preventDefault();

            togglePause();

            break;

    }

});

// =============================
// Mobile Buttons
// =============================
document.getElementById("up").addEventListener("click", () => {

    changeDirection(0, -1);

});

document.getElementById("down").addEventListener("click", () => {

    changeDirection(0, 1);

});

document.getElementById("left").addEventListener("click", () => {

    changeDirection(-1, 0);

});

document.getElementById("right").addEventListener("click", () => {

    changeDirection(1, 0);

});

// =============================
// Swipe Controls
// =============================
canvas.addEventListener("touchstart", (event) => {

    touchStartX = event.touches[0].clientX;

    touchStartY = event.touches[0].clientY;

}, { passive: true });

canvas.addEventListener("touchend", (event) => {

    const touchEndX =
        event.changedTouches[0].clientX;

    const touchEndY =
        event.changedTouches[0].clientY;

    const dx =
        touchEndX - touchStartX;

    const dy =
        touchEndY - touchStartY;

    if (
        Math.abs(dx) < 30 &&
        Math.abs(dy) < 30
    ) {
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {

        if (dx > 0) {

            changeDirection(1, 0);

        } else {

            changeDirection(-1, 0);

        }

    } else {

        if (dy > 0) {

            changeDirection(0, 1);

        } else {

            changeDirection(0, -1);

        }

    }

}, { passive: true });

// =============================
// Difficulty
// =============================
difficultySelect.addEventListener("change", () => {

    gameSpeed =
        SPEED[difficultySelect.value];

});

// =============================
// Play Button
// =============================
playBtn.addEventListener("click", () => {

    hideStartScreen();

    startGame();

});

// =============================
// Restart
// =============================
restartBtn.addEventListener("click", () => {

    startGame();

});

// =============================
// Play Again
// =============================
playAgainBtn.addEventListener("click", () => {

    hideGameOverScreen();

    startGame();

});
// =====================================
// GAME.JS
// Main Game Engine
// =====================================

// =============================
// Start Game
// =============================
function startGame() {

    clearInterval(gameLoop);

    paused = false;

    score = 0;
    scoreDisplay.textContent = score;

    direction = {
        x: 1,
        y: 0
    };

    snake = [
        { x: 10, y: 10 }
    ];

    specialFood = null;
    clearTimeout(specialFoodTimer);

    generateFood();

    gameSpeed = SPEED[difficultySelect.value];

    disableDifficulty();

    hideGameOverScreen();

    gameLoop = setInterval(updateGame, gameSpeed);

    drawGame();

}

// =============================
// Update Game
// =============================
function updateGame() {

    const head = {

        x: snake[0].x + direction.x,

        y: snake[0].y + direction.y

    };

    handleWalls(head);

    if (checkSelfCollision(head)) {

        endGame();
        return;

    }

    snake.unshift(head);

    if (eatNormalFood(head)) {

        // Snake grows automatically

    }

    else if (eatSpecialFood(head)) {

        // Snake also grows

    }

    else {

        snake.pop();

    }

    saveHighScore();

    drawGame();

}

// =============================
// Handle Wall Mode
// =============================
function handleWalls(head) {

    if (wallModeCheckbox.checked) {

        if (

            head.x < 0 ||

            head.x >= TILE_COUNT ||

            head.y < 0 ||

            head.y >= TILE_COUNT

        ) {

            endGame();

        }

    }

    else {

        if (head.x < 0)
            head.x = TILE_COUNT - 1;

        if (head.x >= TILE_COUNT)
            head.x = 0;

        if (head.y < 0)
            head.y = TILE_COUNT - 1;

        if (head.y >= TILE_COUNT)
            head.y = 0;

    }

}

// =============================
// Self Collision
// =============================
function checkSelfCollision(head) {

    for (let i = 0; i < snake.length; i++) {

        if (

            head.x === snake[i].x &&

            head.y === snake[i].y

        ) {

            return true;

        }

    }

    return false;

}

// =============================
// End Game
// =============================
function endGame() {

    clearInterval(gameLoop);

    clearTimeout(specialFoodTimer);

    enableDifficulty();

    saveHighScore();

    saveScore();

    showGameOverScreen();

}

// =============================
// Reset Game
// =============================
function resetGame() {

    clearInterval(gameLoop);

    paused = false;

    score = 0;

    snake = [];

    direction = {

        x:1,

        y:0

    };

    specialFood = null;

    generateFood();

    drawGame();

}
// =====================================
// SCRIPT.JS
// Snake Game Initialization
// =====================================

window.addEventListener("load", () => {

    // Load saved data
    loadHighScore();
    loadLeaderboard();

    // Default theme
    setTheme("dark");

    // Hide game container until Play is pressed
    document.querySelector(".game-container").style.display = "none";

    // Show start screen
    showStartScreen();

    // Draw an empty board
    snake = [
        { x: 10, y: 10 }
    ];

    food = {
        x: 15,
        y: 10
    };

    drawGame();

});
