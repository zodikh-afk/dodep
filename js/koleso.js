let angle = 0;
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const wheel = document.getElementById("koleso");
const betType = document.getElementById("betType");
const betNumber = document.getElementById("betNumber");

betType.addEventListener("change", () => {
  betNumber.style.display = betType.value === "number" ? "inline-block" : "none";
});

spinBtn.addEventListener("click", spin);

function spin() {
  const min = 5;
  const max = 10;
  const extra = Math.floor(Math.random() * 360);
  const spins = Math.floor(Math.random() * (max - min + 1)) + min;
  angle += spins * 360 + extra;
  wheel.style.transform = `rotate(${angle}deg)`;

  spinBtn.disabled = true;
  result.textContent = "Крутиться колесо...";
  setTimeout(() => {
    const actualAngle = angle % 360;
    const segment = Math.floor(actualAngle / 30); // 12 секторів
    const colors = [
      "red",
      "black",
      "red",
      "black",
      "red",
      "black",
      "red",
      "black",
      "red",
      "black",
      "red",
      "black",
    ];

    const color = colors[(12 - segment) % 12];
    const number = (12 - segment) % 12;

    checkBet(color, number);
    spinBtn.disabled = false;
  }, 4500);
}

function checkBet(color, number) {
  const type = betType.value;
  const amount = parseInt(document.getElementById("betAmount").value);
  let message = "";

  if (type === "red" || type === "black") {
    if (type === color) {
      message = `🎉 Випало ${number} (${color}) — Ви виграли ${amount * 2}₴!`;
    } else {
      message = `❌ Випало ${number} (${color}) — Ви програли ${amount}₴.`;
    }
  } else if (type === "number") {
    const chosen = parseInt(betNumber.value);
    if (chosen === number) {
      message = `💰 Точно! Випало ${number}! Ваш виграш: ${amount * 12}₴`;
    } else {
      message = `😢 Випало ${number} (${color}) — не вгадали.`;
    }
  }
  result.textContent = message;
}
