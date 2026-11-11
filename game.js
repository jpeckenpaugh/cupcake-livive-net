"use strict";

const size = 4;
const cupcakes = [
  { name: "Vanilla Birthday", kcal: 200, color: "#fff1d2" },
  { name: "Bubblegum Pink", kcal: 250, color: "#ffd4e4" },
  { name: "Sunshine Vanilla", kcal: 320, color: "#ffe38e" },
  { name: "Blonde Ganache", kcal: 400, color: "#f4c99d" },
  { name: "Peanut Butter", kcal: 500, color: "#eab394" },
  { name: "Mint Fudge", kcal: 650, color: "#c3edcf" },
  { name: "Chocolate Spiderweb", kcal: 820, color: "#dab7a8" },
  { name: "Toasted Marshmallow", kcal: 1000, color: "#fff8ed" },
  { name: "Cookies & Cream", kcal: 1200, color: "#e4d9f2" },
  { name: "Chocolate Sundae", kcal: 1500, color: "#e8acc2" },
  { name: "White Choc Peppermint", kcal: 2000, color: "#c6ebf1" },
];

const halloweenToppings = ["🎃", "👻", "🍬", "🦇", "👁️", "🐈‍⬛", "🕸️", "💀", "🌙", "🕷️", "🧙"];
const christmasToppings = ["⭐", "🎀", "🔔", "🍪", "🦌", "🎄", "❄️", "☃️", "🎁", "🍒", "🍬"];

const directions = {
  ArrowLeft: (line, step) => line * size + step,
  ArrowRight: (line, step) => line * size + size - 1 - step,
  ArrowUp: (line, step) => step * size + line,
  ArrowDown: (line, step) => (size - 1 - step) * size + line,
};

// Read each line from the edge it moves toward so every tile merges at most once.
function slide(board, direction) {
  const next = Array(board.length).fill(0);
  const indexAt = directions[direction];
  let points = 0;
  const motions = [];

  for (let line = 0; line < size; line++) {
    const indices = Array.from({ length: size }, (_, step) => indexAt(line, step));
    const occupied = indices.filter(index => board[index]);
    let destination = 0;
    for (let i = 0; i < occupied.length; i++) {
      const target = indices[destination++];
      let tier = board[occupied[i]];
      motions.push([occupied[i], target]);
      if (tier < cupcakes.length && tier === board[occupied[i + 1]]) {
        motions.push([occupied[i + 1], target]);
        tier++;
        points += cupcakes[tier - 1].kcal;
        i++;
      }
      next[target] = tier;
    }
  }

  return { board: next, points, motions, changed: next.some((tier, index) => tier !== board[index]) };
}

const boardElement = document.querySelector("#board");
const stylePicker = document.querySelector("#cupcake-style");
const styleKey = "cupcake-style";

try {
  const savedStyle = localStorage.getItem(styleKey);
  if (Array.from(stylePicker.options).some(option => option.value === savedStyle)) {
    stylePicker.value = savedStyle;
  }
} catch {
  // Some browsers block storage for local files.
}

function applyStyle() {
  boardElement.dataset.style = stylePicker.value;
}

stylePicker.addEventListener("change", () => {
  applyStyle();
  try {
    localStorage.setItem(styleKey, stylePicker.value);
  } catch {
    // The style still works for the current session.
  }
});
applyStyle();

const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const gameOverElement = document.querySelector("#game-over");
const finalScoreElement = document.querySelector("#final-score");
let openingAnimation;
const buttons = document.querySelectorAll("[data-move]");
let board;
let score;
let finished;
let reachedGoal;
let activeMove;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function spawn() {
  const empty = board.flatMap((tier, index) => tier ? [] : [index]);
  if (empty.length) {
    board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 1 : 2;
  }
}

function render() {
  boardElement.replaceChildren(...board.map(tier => {
    const tile = document.createElement("div");
    tile.className = "tile";
    if (!tier) return tile;

    const { name, kcal, color } = cupcakes[tier - 1];
    const value = 2 ** tier;
    tile.style.setProperty("--tile-color", color);
    tile.classList.add("filled");
    tile.dataset.tier = tier;
    tile.setAttribute("aria-label", `${name}, tile ${value}, ${kcal} calories`);
    const icon = document.createElement("span");
    icon.className = "cupcake";
    const photoIndex = tier - 1;
    icon.style.setProperty("--photo-x", `${(photoIndex % 4) * 100 / 3}%`);
    icon.dataset.photoRow = Math.floor(photoIndex / 4);
    icon.setAttribute("aria-hidden", "true");
    const topping = document.createElement("span");
    topping.className = "topping";
    const halloween = document.createElement("span");
    halloween.className = "holiday-topping halloween-topping";
    halloween.textContent = halloweenToppings[tier - 1];
    const christmas = document.createElement("span");
    christmas.className = "holiday-topping christmas-topping";
    christmas.textContent = christmasToppings[tier - 1];
    icon.append(topping, halloween, christmas);
    const label = document.createElement("span");
    label.textContent = value;
    tile.append(icon, label);
    return tile;
  }));
  scoreElement.textContent = score.toLocaleString();
  buttons.forEach(button => { button.disabled = finished; });
}

async function move(direction) {
  if (finished || activeMove) return;
  const result = slide(board, direction);
  if (!result.changed) return;

  if (!reducedMotion.matches) {
    const cells = [...boardElement.children];
    const animations = result.motions.filter(([from, to]) => from !== to).map(([from, to]) => {
      const start = cells[from].getBoundingClientRect();
      const end = cells[to].getBoundingClientRect();
      return cells[from].animate([
        { transform: "translate(0, 0)" },
        { transform: `translate(${end.x - start.x}px, ${end.y - start.y}px)` },
      ], { duration: 130, easing: "cubic-bezier(.22,.72,.25,1)", fill: "forwards" });
    });
    activeMove = animations;
    await Promise.allSettled(animations.map(animation => animation.finished));
    if (activeMove !== animations) return;
    activeMove = null;
  }

  board = result.board;
  score += result.points;
  spawn();
  finished = !Object.keys(directions).some(key => slide(board, key).changed);

  if (!reachedGoal && board.includes(cupcakes.length)) {
    reachedGoal = true;
    statusElement.textContent = "You made White Chocolate Peppermint! Keep playing for a higher score.";
  }
  if (finished) {
    finalScoreElement.textContent = `${score.toLocaleString()} kcal`;
    gameOverElement.hidden = false;
    statusElement.textContent = reachedGoal
      ? "Game over. You reached the goal! No moves left."
      : "Game over. No moves left. Start a new game to try again.";
  }
  render();
}

function restart() {
  activeMove?.forEach(animation => animation.cancel());
  activeMove = null;
  openingAnimation?.cancel();
  gameOverElement.hidden = true;
  board = Array(size * size).fill(0);
  score = 0;
  finished = false;
  reachedGoal = false;
  statusElement.textContent = "";
  spawn();
  spawn();
  render();
  if (!reducedMotion.matches) {
    openingAnimation = boardElement.animate(
      [{ opacity: 0.45, scale: 0.97 }, { opacity: 1, scale: 1 }],
      { duration: 250, easing: "ease-out" },
    );
  }
}

document.addEventListener("keydown", event => {
  if (event.target === stylePicker) return;
  if (!Object.hasOwn(directions, event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  move(event.key);
});
buttons.forEach(button => button.addEventListener("click", () => move(button.dataset.move)));
document.querySelector("#restart").addEventListener("click", restart);
restart();
