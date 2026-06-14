const canvas = document.getElementById("lantern-canvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let lanterns = [];
let frameId = null;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createLantern(index) {
  return {
    x: Math.random() * width,
    y: height + Math.random() * height,
    size: 10 + Math.random() * 24,
    speed: reduceMotion.matches ? 0 : 0.18 + Math.random() * 0.38,
    drift: 0.25 + Math.random() * 0.7,
    phase: index + Math.random() * Math.PI * 2,
    alpha: 0.25 + Math.random() * 0.5,
  };
}

function resetLanterns() {
  const count = Math.max(18, Math.min(42, Math.floor(width / 34)));
  lanterns = Array.from({ length: count }, (_, index) => createLantern(index));
}

function drawLantern(lantern, time) {
  const sway = Math.sin(time / 1600 + lantern.phase) * lantern.drift * 10;
  const x = lantern.x + sway;
  const y = lantern.y;
  const size = lantern.size;
  const glow = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 2.2);

  glow.addColorStop(0, `rgba(255, 215, 0, ${lantern.alpha})`);
  glow.addColorStop(0.45, `rgba(255, 174, 66, ${lantern.alpha * 0.28})`);
  glow.addColorStop(1, "rgba(255, 215, 0, 0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 226, 122, ${Math.min(0.95, lantern.alpha + 0.22)})`;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x - size * 0.42, y - size * 0.58, size * 0.84, size * 1.08, size * 0.25);
  } else {
    ctx.rect(x - size * 0.42, y - size * 0.58, size * 0.84, size * 1.08);
  }
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 247, 190, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y - size * 0.08);
  ctx.lineTo(x + size * 0.27, y - size * 0.08);
  ctx.stroke();
}

function draw(time = 0) {
  ctx.clearRect(0, 0, width, height);

  for (const lantern of lanterns) {
    drawLantern(lantern, time);
    lantern.y -= lantern.speed;

    if (lantern.y < -lantern.size * 5) {
      Object.assign(lantern, createLantern(lantern.phase));
      lantern.y = height + lantern.size * 4;
    }
  }

  if (!reduceMotion.matches) {
    frameId = window.requestAnimationFrame(draw);
  }
}

function start() {
  if (frameId) {
    window.cancelAnimationFrame(frameId);
  }
  resizeCanvas();
  resetLanterns();
  draw();
}

window.addEventListener("resize", start);
if (typeof reduceMotion.addEventListener === "function") {
  reduceMotion.addEventListener("change", start);
} else {
  reduceMotion.addListener(start);
}
start();
