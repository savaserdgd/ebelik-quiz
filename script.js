// ── DOM REFERANSLARI ─────────────────────────────────────
const answersContainer = document.getElementById("answers");
const progressText     = document.getElementById("progress");
const timerBar         = document.getElementById("timer-bar");
const timerText        = document.getElementById("timer-text");

let currentQuestionIndex = 0;
let score        = 0;
let correctCount = 0;
let wrongCount   = 0;
let answered     = false;
let timer;
let timeLeft     = 15;
let currentPlayer = "";

// ── SORULAR ──────────────────────────────────────────────
const questions = [
  {
    question: "Gebelikte ilk kontrol ne zaman yapılır?",
    answers: ["1 hafta", "4-6 hafta", "3 ay", "6 ay"],
    correct: 1
  },
  {
    question: "Normal gebelik süresi kaç haftadır?",
    answers: ["30 hafta", "35 hafta", "40 hafta", "45 hafta"],
    correct: 2
  },
  {
    question: "Anne sütü ne kadar süre önerilir?",
    answers: ["3 ay", "6 ay", "1 yıl", "2 yıl"],
    correct: 3
  },
  {
    question: "Gebelikte en önemli vitamin hangisidir?",
    answers: ["C vitamini", "D vitamini", "Folik asit", "B12 vitamini"],
    correct: 2
  },
  {
    question: "Doğum sonrası ilk kontrol ne zaman yapılır?",
    answers: ["1 gün sonra", "1 hafta sonra", "6 hafta sonra", "3 ay sonra"],
    correct: 2
  }
];

// ── YARDIMCILAR ──────────────────────────────────────────
function getQuestion() { return document.getElementById("question"); }
function getQuestionBox() { return document.getElementById("question-box"); }
function getButtons()  { return document.querySelectorAll(".answer-btn"); }

// ── EKRAN GEÇİŞİ ─────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ── BAŞLA ─────────────────────────────────────────────────
function handleStart() {
  const input = document.getElementById("username").value.trim();
  currentPlayer = input || "Misafir";

  // Şıkları ÖNCE doldur, oyun ekranı gizliyken
  prepareFirstQuestion();

  // Sonra ekranı göster — şıklar zaten hazır, flash olmaz
  document.getElementById("player-name-display").innerText = "👤 " + currentPlayer;
  showScreen("game-screen");

  // Şimdi süreyi başlat
  startTimer();
}

// ── İLK SORUYU GİZLİYKEN HAZIRLA ────────────────────────
function prepareFirstQuestion() {
  answered = false;
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;

  const q = questions[0];

  // Soruyu ve şıkları doldur (ekran henüz gizli)
  getQuestion().innerText = q.question;
  progressText.innerText = `1 / ${questions.length}`;

  getButtons().forEach((btn, i) => {
    btn.querySelector(".answer-text").innerText = q.answers[i];
    btn.className = "answer-btn";
    btn.disabled  = false;
  });

  // Timer barı sıfırla
  timerBar.style.transition = "none";
  timerBar.style.width = "100%";
  timerBar.classList.remove("warning");
  timerText.classList.remove("warning");
  timerText.innerText = "15s";
}

// ── SORU GÖSTER (2. soru ve sonrası) ─────────────────────
function showQuestion() {
  answered = false;

  const q = questions[currentQuestionIndex];
  const qBox = getQuestionBox();

  // Geçiş animasyonu
  qBox.classList.add("hidden");

  setTimeout(() => {
    getQuestion().innerText = q.question;
    progressText.innerText = `${currentQuestionIndex + 1} / ${questions.length}`;

    getButtons().forEach((btn, i) => {
      btn.querySelector(".answer-text").innerText = q.answers[i];
      btn.className = "answer-btn";
      btn.disabled  = false;
    });

    qBox.classList.remove("hidden");
    startTimer();
  }, 300);
}

// ── SÜRE ─────────────────────────────────────────────────
function startTimer() {
  clearInterval(timer);
  timeLeft = 15;

  // Transition'ı geri aç
  setTimeout(() => {
    timerBar.style.transition = "width 1s linear, background 0.5s";
  }, 50);

  updateTimer();

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) { clearInterval(timer); autoWrong(); }
  }, 1000);
}

function updateTimer() {
  timerBar.style.width = `${(timeLeft / 15) * 100}%`;
  timerText.innerText  = timeLeft + "s";

  if (timeLeft <= 5) {
    timerBar.classList.add("warning");
    timerText.classList.add("warning");
  } else {
    timerBar.classList.remove("warning");
    timerText.classList.remove("warning");
  }
}

// ── SÜRE BİTTİ ───────────────────────────────────────────
function autoWrong() {
  if (answered) return;
  answered = true;
  wrongCount++;

  const btns    = getButtons();
  const correct = questions[currentQuestionIndex].correct;

  btns.forEach(b => { b.disabled = true; b.classList.add("faded"); });
  btns[correct].classList.remove("faded");
  btns[correct].classList.add("correct");

  setTimeout(goNext, 2000);
}

// ── BUTON TIKLAMA ────────────────────────────────────────
answersContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".answer-btn");
  if (!btn || answered) return;

  answered = true;
  clearInterval(timer);

  const btns    = getButtons();
  const index   = parseInt(btn.dataset.index);
  const correct = questions[currentQuestionIndex].correct;

  btns.forEach(b => b.disabled = true);

  btn.classList.add("thinking");
  btns.forEach(b => { if (b !== btn) b.classList.add("faded"); });

  setTimeout(() => {
    btn.classList.remove("thinking");

    if (index === correct) {
      btn.classList.add("correct");
      correctCount++;
      score++;
    } else {
      btn.classList.add("wrong");
      btns[correct].classList.remove("faded");
      btns[correct].classList.add("correct");
      wrongCount++;
    }

    setTimeout(goNext, 2000);
  }, 1500);
});

// ── SONRAKİ SORU ──────────────────────────────────────────
function goNext() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// ── SONUÇ ─────────────────────────────────────────────────
function showResult() {
  clearInterval(timer);

  const pct = Math.round((score / questions.length) * 100);

  let emoji, message;
  if (pct === 100)    { emoji = "🏆"; message = "Mükemmel! Tüm soruları doğru yanıtladın!"; }
  else if (pct >= 80) { emoji = "🌟"; message = "Harika! Ebelik bilgin çok güçlü!"; }
  else if (pct >= 60) { emoji = "👍"; message = "İyi gidiyorsun! Biraz daha çalışırsan mükemmel olursun."; }
  else if (pct >= 40) { emoji = "📚"; message = "Fena değil, ama konulara tekrar göz atmak faydalı olur."; }
  else                { emoji = "💪"; message = "Üzülme, tekrar çalış ve bir daha dene!"; }

  // Skoru kaydet
  saveScore(currentPlayer, score, questions.length);

  const qBox = getQuestionBox();
  qBox.classList.remove("hidden");
  qBox.style.minHeight = "auto";
  qBox.innerHTML = `
    <div class="result-box">
      <div class="emoji">${emoji}</div>
      <h2>Quiz Tamamlandı!</h2>
      <p class="score-detail">👤 ${currentPlayer}</p>
      <p class="score-detail">✅ Doğru: ${correctCount} &nbsp;|&nbsp; ❌ Yanlış: ${wrongCount}</p>
      <p class="score-detail"><strong>${score} / ${questions.length}</strong> soru doğru (${pct}%)</p>
      <div class="motivation">${message}</div>
      <button class="restart-btn" onclick="goToStart()">🔄 Tekrar Oyna</button>
    </div>
  `;

  answersContainer.style.display = "none";
  timerBar.style.width  = "0%";
  timerText.innerText   = "";
  document.querySelector(".top-bar").style.display = "none";
}

// ── BAŞA DÖN ─────────────────────────────────────────────
function goToStart() {
  // Şıkları geri getir
  answersContainer.style.display = "grid";
  document.querySelector(".top-bar").style.display = "flex";

  // Soru kutusunu sıfırla
  const qBox = document.getElementById("question-box");
  qBox.style.minHeight = "";
  qBox.innerHTML = `<h2 id="question"></h2>`;

  showScreen("start-screen");
}

// ── SKOR KAYDET (localStorage) ───────────────────────────
function saveScore(name, score, total) {
  const scores = getScores();
  scores.push({
    name,
    score,
    total,
    pct: Math.round((score / total) * 100),
    date: new Date().toLocaleDateString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric" }),
    time: new Date().toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })
  });
  // En yüksek skora göre sırala, en fazla 20 kayıt
  scores.sort((a, b) => b.pct - a.pct || b.score - a.score);
  localStorage.setItem("ebelik_scores", JSON.stringify(scores.slice(0, 20)));
}

function getScores() {
  try {
    return JSON.parse(localStorage.getItem("ebelik_scores")) || [];
  } catch { return []; }
}

// ── SKOR TABLOSU GÖSTER ───────────────────────────────────
function showScoreboard() {
  const scores = getScores();
  const list   = document.getElementById("scoreboard-list");

  if (scores.length === 0) {
    list.innerHTML = `<p class="empty-scores">Henüz hiç oyun oynanmamış! 🌸</p>`;
  } else {
    list.innerHTML = scores.map((s, i) => {
      const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      const medal     = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      return `
        <div class="score-entry">
          <div class="score-rank ${rankClass}">${medal}</div>
          <div class="score-info">
            <div class="score-name">${s.name}</div>
            <div class="score-date">${s.date} – ${s.time}</div>
          </div>
          <div class="score-points">${s.score}/${s.total} <span style="font-size:0.75rem;color:#b09090">(${s.pct}%)</span></div>
        </div>
      `;
    }).join("");
  }

  showScreen("scoreboard-screen");
}

// Skor tablosu butonuna tıklanınca listeyi güncelle
document.querySelector(".scoreboard-btn")?.addEventListener("click", () => {
  showScoreboard();
});