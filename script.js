const holes = [...document.querySelectorAll(".hole")];
const score = document.querySelector("#score");
const time = document.querySelector("#time");
const status = document.querySelector("#status");
const gameOver = document.querySelector("#game-over");
const finalScore = document.querySelector("#final-score");
const playAgain = document.querySelector("#play-again");
const startScreen = document.querySelector("#start-screen");
const startGameButton = document.querySelector("#start-game");
const catVisibleFor = 700;
let hideTimeout;
let points = 0;
let timeLeft = 30;
let gameRunning = true;
let catInterval;
let countdownInterval;

function showCat() {
  if (!gameRunning) return;
  window.clearTimeout(hideTimeout);
  holes.forEach((hole) => hole.classList.remove("active"));
  const randomHole = holes[Math.floor(Math.random() * holes.length)];
  randomHole.classList.add("active");

  hideTimeout = window.setTimeout(() => {
    randomHole.classList.remove("active");
  }, catVisibleFor);
}

function whack(hole) {
  if (!gameRunning || !hole.classList.contains("active")) return;
  points += 1;
  score.textContent = points;
  hole.classList.remove("active");
  window.clearTimeout(hideTimeout);
}

holes.forEach((hole) => {
  hole.addEventListener("click", () => whack(hole));
  hole.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      whack(hole);
    }
  });
});

function startGame() {
  timeLeft = 30;
  points = 0;
  gameRunning = true;
  time.textContent = timeLeft;
  score.textContent = points;
  status.textContent = "";
  startScreen.hidden = true;
  gameOver.hidden = true;
  showCat();
  catInterval = window.setInterval(showCat, 1000);
  countdownInterval = window.setInterval(() => {
  timeLeft -= 1;
  time.textContent = timeLeft;
  if (timeLeft === 0) {
    gameRunning = false;
    window.clearInterval(catInterval);
    window.clearInterval(countdownInterval);
    window.clearTimeout(hideTimeout);
    holes.forEach((hole) => hole.classList.remove("active"));
    finalScore.textContent = points;
    gameOver.hidden = false;
  }
  }, 1000);
}

playAgain.addEventListener("click", startGame);
startGameButton.addEventListener("click", startGame);
