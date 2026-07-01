const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const grid = 20;

let snake = [
{ x: 200, y: 200 }
];

let dx = grid;
let dy = 0;

let food = {
x: 300,
y: 300
};

let score = 0;

let game;

function randomFood(){

food.x = Math.floor(Math.random()*30)*grid;
food.y = Math.floor(Math.random()*30)*grid;

}

function draw(){

ctx.clearRect(0,0,600,600);

snake.unshift({
x: snake[0].x + dx,
y: snake[0].y + dy
});

if(
snake[0].x==food.x &&
snake[0].y==food.y
){

score++;
scoreElement.innerText=score;
randomFood();

}else{

snake.pop();

}

ctx.fillStyle="red";

ctx.fillRect(food.x,food.y,grid-2,grid-2);

ctx.fillStyle="lime";

snake.forEach(part=>{
ctx.fillRect(part.x,part.y,grid-2,grid-2);
});

if(

snake[0].x<0 ||
snake[0].y<0 ||
snake[0].x>=600 ||
snake[0].y>=600

){

gameOver();

}

for(let i=1;i<snake.length;i++){

if(
snake[0].x===snake[i].x &&
snake[0].y===snake[i].y
){
gameOver();
}

}

}

function gameOver(){

clearInterval(game);

alert("Game Over!\nScore : "+score);

}

document.addEventListener("keydown",(e)=>{

if(e.key==="ArrowUp" && dy===0){
dx=0;
dy=-grid;
}

if(e.key==="ArrowDown" && dy===0){
dx=0;
dy=grid;
}

if(e.key==="ArrowLeft" && dx===0){
dx=-grid;
dy=0;
}

if(e.key==="ArrowRight" && dx===0){
dx=grid;
dy=0;
}

});

restartBtn.onclick=()=>{

snake=[{x:200,y:200}];

dx=grid;
dy=0;

score=0;

scoreElement.innerText=0;

randomFood();

clearInterval(game);

game=setInterval(draw,100);

}

randomFood();

game=setInterval(draw,100);
