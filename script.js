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
