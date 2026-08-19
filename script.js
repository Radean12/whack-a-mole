const holes = [...document.querySelectorAll(".hole")];
const score = document.querySelector("#score");
const time = document.querySelector("#time");
const combo = document.querySelector("#combo");
const status = document.querySelector("#status");
const gameOver = document.querySelector("#game-over");
const finalScore = document.querySelector("#final-score");
const playAgain = document.querySelector("#play-again");
const goHome = document.querySelector("#go-home");
const gameOverTitle = document.querySelector("#game-over-title");
const gameOverEyebrow = document.querySelector("#game-over-eyebrow");
const startScreen = document.querySelector("#start-screen");
const startGameButton = document.querySelector("#start-game");
const difficultyButtons = [...document.querySelectorAll(".difficulty-button")];
const catVisibleFor = 574;
let hideTimeout;
let points = 0;
let timeLeft = 30;
let gameRunning = true;
let catInterval;
let countdownInterval;
let difficulty = "normal";
const difficultySpeed = { easy: 1.2, normal: 1, hard: 0.8 };
let spawnTimeout;
let bombInterval;
let streak = 0;
let nextCatIsGolden = false;
let audioContext;

function showCat(isSilver = false, numberOfCats = 1) {
  if (!gameRunning) return;
  window.clearTimeout(hideTimeout);
  window.clearTimeout(spawnTimeout);
  holes.forEach((hole) => hole.classList.remove("active", "golden"));
  const randomHoles = [...holes].sort(() => Math.random() - 0.5).slice(0, numberOfCats);
  randomHoles.forEach((hole) => hole.classList.add("active"));
  if (isSilver || nextCatIsGolden) {
    randomHoles[0].classList.add("golden");
    nextCatIsGolden = false;
  }

  const visibleTime = (randomHoles.some((hole) => hole.classList.contains("golden")) ? 679 : catVisibleFor) * difficultySpeed[difficulty];
  hideTimeout = window.setTimeout(() => {
    randomHoles.forEach((hole) => hole.classList.remove("active", "golden"));
  }, visibleTime);
  spawnTimeout = window.setTimeout(() => showCat(), 784 * difficultySpeed[difficulty]);
}

function showBomb() {
  if (!gameRunning) return;
  const availableHoles = holes.filter((hole) => !hole.classList.contains("active"));
  const bombHole = (availableHoles.length ? availableHoles : holes)[Math.floor(Math.random() * (availableHoles.length || holes.length))];
  holes.forEach((hole) => hole.classList.remove("bomb"));
  bombHole.classList.add("bomb");
}

function explode() {
  if (!gameRunning) return;
  stopGameTimers();
  gameRunning = false;
  holes.forEach((hole) => hole.classList.remove("active", "golden", "bomb"));
  gameOverEyebrow.textContent = "GAME OVER";
  gameOverTitle.textContent = "You Exploded!";
  finalScore.textContent = points;
  gameOver.classList.add("exploded");
  gameOver.hidden = false;
}

function stopGameTimers() {
  window.clearInterval(countdownInterval);
  window.clearInterval(bombInterval);
  window.clearTimeout(hideTimeout);
  window.clearTimeout(spawnTimeout);
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
  if (hole.classList.contains("bomb")) {
    explode();
    return;
  }
  if (!hole.classList.contains("active")) {
    streak = 0;
    combo.textContent = 0;
    return;
  }
  playPopSound();
  streak += 1;
  const isGolden = hole.classList.contains("golden");
  const pointsAwarded = isGolden ? 5 : streak === 3 ? 4 : 1;
  points += pointsAwarded;
  combo.textContent = streak;
  score.textContent = points;
  hole.dataset.points = `+${pointsAwarded}`;
  hole.classList.remove("hit");
  void hole.offsetWidth;
  hole.classList.add("hit", "smushed");
  window.clearTimeout(hideTimeout);
  window.setTimeout(() => {
    hole.classList.remove("active", "smushed", "golden");
  }, 220);
  window.setTimeout(() => hole.classList.remove("hit"), 500);
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
  streak = 0;
  combo.textContent = 0;
  nextCatIsGolden = false;
  gameRunning = true;
  gameOver.classList.remove("exploded");
  gameOverEyebrow.textContent = "MISSION COMPLETE";
  gameOverTitle.textContent = "Final Score";
  time.textContent = timeLeft;
  score.textContent = points;
  status.textContent = "";
  startScreen.hidden = true;
  gameOver.hidden = true;
  showCat();
  bombInterval = window.setInterval(showBomb, 3000);
  countdownInterval = window.setInterval(() => {
  timeLeft -= 1;
  time.textContent = timeLeft;
  if (timeLeft === 0) {
    gameRunning = false;
    stopGameTimers();
    holes.forEach((hole) => hole.classList.remove("active"));
    finalScore.textContent = points;
    gameOver.hidden = false;
  }
  if (timeLeft > 0 && timeLeft % 5 === 0) showCat(timeLeft % 10 === 0, 2);
  }, 1000);
}

playAgain.addEventListener("click", startGame);
goHome.addEventListener("click", () => {
  stopGameTimers();
  gameRunning = false;
  gameOver.hidden = true;
  startScreen.hidden = false;
  holes.forEach((hole) => hole.classList.remove("active", "golden", "bomb"));
});
startGameButton.addEventListener("click", startGame);
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.difficulty;
    difficultyButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", selected);
    });
  });
});
