const holes = [...document.querySelectorAll(".hole")];
const score = document.querySelector("#score");
const time = document.querySelector("#time");
const combo = document.querySelector("#combo");
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
let spawnTimeout;
let successfulHits = 0;
let streak = 0;
let nextCatIsGolden = false;
let audioContext;

function showCat() {
  if (!gameRunning) return;
  window.clearTimeout(hideTimeout);
  holes.forEach((hole) => hole.classList.remove("active", "golden"));
  const randomHole = holes[Math.floor(Math.random() * holes.length)];
  randomHole.classList.add("active");
  if (nextCatIsGolden) {
    randomHole.classList.add("golden");
    nextCatIsGolden = false;
  }

  hideTimeout = window.setTimeout(() => {
    randomHole.classList.remove("active");
  }, catVisibleFor);
  spawnTimeout = window.setTimeout(showCat, 1000);
}

function playPopSound() {
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(420, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.09);
  gain.gain.setValueAtTime(0.12, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.09);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.09);
}

function whack(hole) {
  if (!gameRunning) return;
  if (!hole.classList.contains("active")) {
    streak = 0;
    combo.textContent = 0;
    return;
  }
  playPopSound();
  successfulHits += 1;
  streak += 1;
  const isGolden = hole.classList.contains("golden");
  points += isGolden ? 5 : streak === 3 ? 4 : 1;
  combo.textContent = streak;
  if (successfulHits % 3 === 0) nextCatIsGolden = true;
  score.textContent = points;
  hole.classList.remove("active");
  hole.classList.remove("golden");
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
  successfulHits = 0;
  streak = 0;
  combo.textContent = 0;
  nextCatIsGolden = false;
  gameRunning = true;
  time.textContent = timeLeft;
  score.textContent = points;
  status.textContent = "";
  startScreen.hidden = true;
  gameOver.hidden = true;
  showCat();
  showCat();
  countdownInterval = window.setInterval(() => {
  timeLeft -= 1;
  time.textContent = timeLeft;
  if (timeLeft === 0) {
    gameRunning = false;
    window.clearInterval(catInterval);
    window.clearInterval(countdownInterval);
    window.clearTimeout(hideTimeout);
    window.clearTimeout(spawnTimeout);
    holes.forEach((hole) => hole.classList.remove("active"));
    finalScore.textContent = points;
    gameOver.hidden = false;
  }
  }, 1000);
}

playAgain.addEventListener("click", startGame);
startGameButton.addEventListener("click", startGame);
