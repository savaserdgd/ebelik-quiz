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
let streak       = 0;
let maxStreak    = 0;
let totalPoints  = 0;

// Joker durumları
let joker5050Used    = false;
let jokerDoubleUsed  = false;
let doubleAnswerMode = false;
let doubleFirstPick  = null;

// Karıştırılmış soru listesi ve şık haritası
let shuffledQuestions = [];
let answerMap = []; // her soru için [0..3] -> orijinal index

// ── SORU BANKASI ─────────────────────────────────────────
const allQuestions = [
  {
    question: "Kombine Oral Kontraseptif (KOK) haplarının içinde hangi hormonlar bulunur?",
    answers: ["Sadece östrojen", "Sadece progesteron", "Östrojen ve progesteron", "İnsülin ve adrenalin"],
    correct: 2,
    explanation: "KOK hapları, östrojen ve progesteron olmak üzere iki hormon içerir. Bu kombinasyon yumurtlamayı baskılayarak gebeliği önler."
  },
  {
    question: "Doğru ve düzenli kullanıldığında KOK'ların gebeliği önleme başarı oranı (etki düzeyi) yaklaşık kaçtır?",
    answers: ["%50", "%75", "%90", "%99.9"],
    correct: 3,
    explanation: "KOK hapları doğru ve düzenli kullanıldığında %99.9 oranında gebeliği önler; bu oran hormonal kontraseptifler arasında en yükseklerden biridir."
  },
  {
    question: "Hormonal kontraseptif yöntemlerin (hap, iğne, yama vb.) ortak dezavantajı nedir?",
    answers: ["Çok kilo verdirirler.", "Cinsel yolla bulaşan enfeksiyonlara (CYBE) karşı korumazlar.", "Sadece hastanede yatarken kullanılırlar.", "Saç dökülmesine neden olurlar."],
    correct: 1,
    explanation: "Tüm hormonal kontraseptif yöntemler gebeliği önler; ancak HIV başta olmak üzere cinsel yolla bulaşan enfeksiyonlara (CYBE) karşı herhangi bir koruma sağlamazlar."
  },
  {
    question: "Kombine Oral Kontraseptiflerin (KOK) en temel gebelik önleme mekanizması aşağıdakilerden hangisidir?",
    answers: [
      "Rahim ağzı mukusunu inceltmek",
      "Gonadotropin salınımını baskılayarak yumurtlamayı (ovulasyonu) engellemek",
      "Spermleri doğrudan yok etmek",
      "Sadece rahim iç tabakasını kalınlaştırmak"
    ],
    correct: 1,
    explanation: "KOK'ların en temel etkisi; FSH ve LH gibi gonadotropinlerin salınımını baskılayarak ovulasyonu (yumurtlamayı) engellemektir."
  },
  {
    question: "35 yaş üzerinde olan ve günde 15'ten fazla sigara içen bir kadın için KOK kullanımı hakkında ne söylenebilir?",
    answers: [
      "Güvenle kullanabilir.",
      "Dozu artırarak kullanmalıdır.",
      "Kullanımı tıbbi olarak sakıncalıdır (kontraendikedir).",
      "Sadece emzirme döneminde kullanabilir."
    ],
    correct: 2,
    explanation: "35 yaş üstü yoğun sigara kullanımı, KOK ile birleştiğinde tromboembolik (pıhtılaşma) riski ciddi ölçüde artırır ve bu durum KOK için kesin bir kontraendikasyon oluşturur."
  },
  {
    question: "Deri altı implantın (Implanon) toplam koruma süresi ne kadardır?",
    answers: ["1 yıl", "2 yıl", "3 yıl", "5 yıl"],
    correct: 2,
    explanation: "Etonogestrel içeren deri altı implant (Implanon), doğru yerleştirildikten sonra 3 yıl süreyle etkili gebelik koruması sağlar."
  },
  {
    question: "Vajinal halka (Vajinal Ring) kullanım döngüsü nasıldır?",
    answers: [
      "7 gün vajinada kalır, 21 gün ara verilir.",
      "21 gün vajinada kalır, 7 gün ara verilir.",
      "Her cinsel ilişkiden önce takılır.",
      "Sadece adet döneminde takılır."
    ],
    correct: 1,
    explanation: "Vajinal halka 21 gün süreyle vajinada bırakılır, ardından 7 günlük ara verilir; bu 7 gün içinde adet kanaması gerçekleşir."
  },
  {
    question: "Sadece progesteron içeren mini haplarda (POP), hap alımı kaç saatten fazla gecikirse ek bir korunma yöntemi gerekir?",
    answers: ["48 saat", "12 saat", "3 saat", "24 saat"],
    correct: 2,
    explanation: "Mini haplar (POP) için 3 saatin üzerindeki gecikmeler, servikal mukus üzerindeki koruyucu etkiyi azaltır ve ek bariyer yöntemi kullanımını zorunlu kılar."
  },
  {
    question: "Transdermal kontraseptif bant (yama) ile ilgili hangi fiziksel özellik yöntemin başarısızlık riskini artırabilir?",
    answers: [
      "90 kg üzerindeki vücut ağırlığı",
      "150 cm'den kısa boy uzunluğu",
      "Düzenli olarak güneş koruyucu kullanmak",
      "Açık ten rengine sahip olmak"
    ],
    correct: 0,
    explanation: "90 kg üzerindeki vücut ağırlığında transdermal yamadan emilen hormon miktarı yetersiz kalabilir ve bu durum yöntemin etkinliğini önemli ölçüde düşürür."
  },
  {
    question: "Aşağıdakilerden hangisi Kombine Oral Kontraseptiflerin gebeliği önleme mekanizmalarından biri değildir?",
    answers: [
      "Endometriyumun inceltilmesi",
      "Servikal mukusun kalınlaşması",
      "Yumurtlamanın (ovulasyon) engellenmesi",
      "Sperm hücrelerinin sayısını kalıcı olarak sıfırlamak"
    ],
    correct: 3,
    explanation: "KOK'lar ovulasyonu engeller, servikal mukusu kalınlaştırır ve endometriyumu inceltir; ancak sperm üretimini kalıcı olarak durdurmak KOK'ların bir etkisi değildir."
  },
  {
    question: "Kombine oral kontraseptif haplar kullanılmaya başlanırken, en geç siklusun kaçıncı günü başlanmalıdır?",
    answers: [
      "Siklusun 14. gününde",
      "Adet bitiminden hemen sonraki gün",
      "Beklenen adet tarihinden bir hafta önce",
      "Siklusun ilk 5 günü içerisinde"
    ],
    correct: 3,
    explanation: "KOK'lara siklusun 1-5. günleri arasında başlanması önerilir; bu pencerede ek korunmaya gerek kalmadan hemen etki sağlanır."
  },
  {
    question: "Aşağıdaki durumlardan hangisi KOK kullanımı için kesin bir kontraendikasyon (engel) teşkil eder?",
    answers: [
      "35 yaş üzerinde olup günde 15'ten fazla sigara içmek",
      "20 yaşın altında aktif cinsel yaşam",
      "Adet sancılarının (dismenore) şiddetli olması",
      "Ailede sadece bir kişide diyabet öyküsü bulunması"
    ],
    correct: 0,
    explanation: "35 yaş üstü yoğun sigara kullanımı (günde ≥15 adet), KOK'larla birlikte tromboz ve kardiyovasküler komplikasyon riskini ciddi biçimde artırdığından kesin kontraendikasyon sayılır."
  }
];

// ── YARDIMCILAR ──────────────────────────────────────────
function getQuestion()   { return document.getElementById("question"); }
function getQuestionBox(){ return document.getElementById("question-box"); }
function getButtons()    { return document.querySelectorAll(".answer-btn"); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── EKRAN GEÇİŞİ ─────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ── BAŞLA ─────────────────────────────────────────────────
function handleStart() {
  const input = document.getElementById("username").value.trim();
  currentPlayer = input || "Misafir";

  // Soruları karıştır, ilk 8 tanesini al
  shuffledQuestions = shuffle(allQuestions).slice(0, 8);

  prepareFirstQuestion();
  document.getElementById("player-name-display").innerText = "👤 " + currentPlayer;
  showScreen("game-screen");
  startTimer();
}

// ── ŞIKLARI KARIŞTIR ────────────────────────────────────
function buildShuffledAnswers(q) {
  const indices = shuffle([0, 1, 2, 3]);
  answerMap = indices;
  return {
    texts: indices.map(i => q.answers[i]),
    correctVisualPos: indices.indexOf(q.correct)
  };
}

// ── İLK SORUYU HAZIRLA ───────────────────────────────────
function prepareFirstQuestion() {
  answered = false;
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  maxStreak = 0;
  totalPoints = 0;
  joker5050Used = false;
  jokerDoubleUsed = false;
  doubleAnswerMode = false;
  doubleFirstPick = null;

  updateJokerUI();
  updateStreakUI();

  const q = shuffledQuestions[0];
  const { texts, correctVisualPos } = buildShuffledAnswers(q);

  getQuestion().innerText = q.question;
  progressText.innerText = `1 / ${shuffledQuestions.length}`;

  const letters = ["A", "B", "C", "D"];
  getButtons().forEach((btn, i) => {
    btn.querySelector(".answer-text").innerText = texts[i];
    btn.querySelector(".letter").innerText = letters[i];
    btn.className = "answer-btn";
    btn.disabled = false;
    btn.dataset.visualCorrect = correctVisualPos;
  });

  timerBar.style.transition = "none";
  timerBar.style.width = "100%";
  timerBar.classList.remove("warning");
  timerText.classList.remove("warning");
  timerText.innerText = "15s";
}

// ── SORU GÖSTER (2. soru+) ────────────────────────────────
function showQuestion() {
  answered = false;
  doubleAnswerMode = false;
  doubleFirstPick = null;

  const q = shuffledQuestions[currentQuestionIndex];
  const qBox = getQuestionBox();
  const { texts, correctVisualPos } = buildShuffledAnswers(q);

  qBox.classList.add("slide-out");

  setTimeout(() => {
    getQuestion().innerText = q.question;
    progressText.innerText = `${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;

    const letters = ["A", "B", "C", "D"];
    getButtons().forEach((btn, i) => {
      btn.querySelector(".answer-text").innerText = texts[i];
      btn.querySelector(".letter").innerText = letters[i];
      btn.className = "answer-btn";
      btn.disabled = false;
      btn.dataset.visualCorrect = correctVisualPos;
    });

    qBox.classList.remove("slide-out");
    qBox.classList.add("slide-in");
    setTimeout(() => qBox.classList.remove("slide-in"), 350);

    updateJokerUI();
    startTimer();
  }, 300);
}

// ── JOKER UI ─────────────────────────────────────────────
function updateJokerUI() {
  const btn5050  = document.getElementById("joker-5050");
  const btnDouble = document.getElementById("joker-double");
  if (btn5050)   btn5050.classList.toggle("used", joker5050Used);
  if (btnDouble) btnDouble.classList.toggle("used", jokerDoubleUsed);
  if (btnDouble) btnDouble.classList.toggle("active", doubleAnswerMode);
}

// ── 50:50 JOKER ──────────────────────────────────────────
function use5050() {
  if (joker5050Used || answered) return;
  joker5050Used = true;

  const btns = getButtons();
  const correctVisualPos = parseInt(btns[0].dataset.visualCorrect);

  let wrong = [];
  btns.forEach((btn, i) => {
    if (i !== correctVisualPos && !btn.classList.contains("eliminated")) wrong.push(i);
  });

  const toEliminate = shuffle(wrong).slice(0, 2);
  toEliminate.forEach(i => {
    btns[i].classList.add("eliminated");
    btns[i].disabled = true;
  });

  updateJokerUI();

  document.getElementById("joker-5050").classList.add("joker-flash");
  setTimeout(() => document.getElementById("joker-5050").classList.remove("joker-flash"), 600);
}

// ── ÇİFT CEVAP JOKER ────────────────────────────────────
function useDouble() {
  if (jokerDoubleUsed || answered) return;
  jokerDoubleUsed = true;
  doubleAnswerMode = true;
  doubleFirstPick = null;
  updateJokerUI();

  document.getElementById("joker-double").classList.add("joker-flash");
  setTimeout(() => document.getElementById("joker-double").classList.remove("joker-flash"), 600);

  showToast("✌️ Bu soruda 2 şık seçebilirsin!");
}

// ── TOAST BİLDİRİMİ ─────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.remove("toast-hide");
  toast.classList.add("toast-show");
  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
  }, 2000);
}

// ── STREAK UI ────────────────────────────────────────────
function updateStreakUI() {
  const el = document.getElementById("streak-display");
  if (!el) return;
  if (streak >= 2) {
    el.innerText = `🔥 ${streak} seri`;
    el.style.display = "flex";
  } else {
    el.style.display = "none";
  }
}

// ── PUAN HESAPLA ─────────────────────────────────────────
function calcPoints() {
  let pts = 100;
  pts += timeLeft * 10;
  if (streak >= 4) pts = Math.round(pts * 2.0);
  else if (streak >= 3) pts = Math.round(pts * 1.5);
  else if (streak >= 2) pts = Math.round(pts * 1.2);
  return pts;
}

// ── SÜRE ─────────────────────────────────────────────────
function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
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

function autoWrong() {
  if (answered) return;
  answered = true;
  streak = 0;
  wrongCount++;
  updateStreakUI();

  const btns = getButtons();
  const correctVisualPos = parseInt(btns[0].dataset.visualCorrect);

  btns.forEach(b => { b.disabled = true; b.classList.add("faded"); });
  btns[correctVisualPos].classList.remove("faded");
  btns[correctVisualPos].classList.add("correct");

  showExplanation();
  setTimeout(goNext, 2500);
}

// ── AÇIKLAMA GÖSTEr ──────────────────────────────────────
function showExplanation() {
  const q = shuffledQuestions[currentQuestionIndex];
  if (!q.explanation) return;
  let expEl = document.getElementById("explanation-box");
  if (!expEl) {
    expEl = document.createElement("div");
    expEl.id = "explanation-box";
    answersContainer.after(expEl);
  }
  expEl.innerText = "💡 " + q.explanation;
  expEl.classList.add("show");
}

function hideExplanation() {
  const expEl = document.getElementById("explanation-box");
  if (expEl) {
    expEl.classList.remove("show");
    expEl.innerText = "";
  }
}

// ── BUTON TIKLAMA ────────────────────────────────────────
answersContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".answer-btn");
  if (!btn || answered) return;
  if (btn.classList.contains("eliminated")) return;

  const btns = getButtons();
  const index = parseInt(btn.dataset.index);
  const correctVisualPos = parseInt(btn.dataset.visualCorrect);

  // ── ÇİFT CEVAP MODU ──────────────────────────────────
  if (doubleAnswerMode) {
    if (doubleFirstPick === null) {
      doubleFirstPick = index;
      btn.classList.add("thinking");
      return;
    } else {
      answered = true;
      clearInterval(timer);
      doubleAnswerMode = false;

      const firstBtn = btns[doubleFirstPick];
      firstBtn.classList.remove("thinking");
      btns.forEach(b => b.disabled = true);

      const firstCorrect  = doubleFirstPick === correctVisualPos;
      const secondCorrect = index === correctVisualPos;

      if (firstCorrect || secondCorrect) {
        const winBtn = firstCorrect ? firstBtn : btn;
        winBtn.classList.add("correct");
        if (!firstCorrect) firstBtn.classList.add("faded");
        if (!secondCorrect) btn.classList.add("faded");

        correctCount++;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        const pts = calcPoints();
        totalPoints += pts;
        score++;
        showPointsPopup(winBtn, pts);
        updateStreakUI();
      } else {
        firstBtn.classList.add("wrong");
        btn.classList.add("wrong");
        btns[correctVisualPos].classList.add("correct");
        btns.forEach(b => { if (b !== firstBtn && b !== btn && b !== btns[correctVisualPos]) b.classList.add("faded"); });
        streak = 0;
        wrongCount++;
        updateStreakUI();
      }

      showExplanation();
      setTimeout(goNext, 2500);
      return;
    }
  }

  // ── NORMAL MOD ────────────────────────────────────────
  answered = true;
  clearInterval(timer);

  btns.forEach(b => b.disabled = true);
  btn.classList.add("thinking");
  btns.forEach(b => { if (b !== btn) b.classList.add("faded"); });

  setTimeout(() => {
    btn.classList.remove("thinking");

    if (index === correctVisualPos) {
      btn.classList.add("correct");
      correctCount++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      const pts = calcPoints();
      totalPoints += pts;
      score++;
      showPointsPopup(btn, pts);
      updateStreakUI();
    } else {
      btn.classList.add("wrong");
      btns[correctVisualPos].classList.remove("faded");
      btns[correctVisualPos].classList.add("correct");
      streak = 0;
      wrongCount++;
      updateStreakUI();
    }

    showExplanation();
    setTimeout(goNext, 2500);
  }, 1000);
});

// ── PUAN POPUP ───────────────────────────────────────────
function showPointsPopup(btn, pts) {
  const rect = btn.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.className = "points-popup";
  popup.innerText = "+" + pts;
  if (streak >= 2) popup.innerText += " 🔥";
  popup.style.left = (rect.left + rect.width / 2) + "px";
  popup.style.top  = rect.top + "px";
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1200);
}

// ── SONRAKİ SORU ─────────────────────────────────────────
function goNext() {
  hideExplanation();
  currentQuestionIndex++;
  if (currentQuestionIndex < shuffledQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// ── SONUÇ ─────────────────────────────────────────────────
function showResult() {
  clearInterval(timer);

  answersContainer.style.display = "none";
  timerBar.style.width = "0%";
  timerText.innerText  = "";
  document.querySelector(".top-bar").style.display   = "none";
  const jokerBar = document.getElementById("joker-bar");
  if (jokerBar) jokerBar.style.display = "none";
  const streakEl = document.getElementById("streak-display");
  if (streakEl) streakEl.style.display = "none";

  const pct = Math.round((score / shuffledQuestions.length) * 100);
  let emoji, message;
  if (pct === 100)    { emoji = "🏆"; message = "Mükemmel! Tüm soruları doğru yanıtladın!"; }
  else if (pct >= 80) { emoji = "🌟"; message = "Harika! Hormonal kontraseptifler konusunda bilgin çok güçlü!"; }
  else if (pct >= 60) { emoji = "👍"; message = "İyi gidiyorsun! Biraz daha çalışırsan mükemmel olursun."; }
  else if (pct >= 40) { emoji = "📚"; message = "Fena değil, ama konulara tekrar göz atmak faydalı olur."; }
  else                { emoji = "💪"; message = "Üzülme, tekrar çalış ve bir daha dene!"; }

  saveScore(currentPlayer, score, shuffledQuestions.length, totalPoints);

  if (pct >= 80) launchConfetti();

  const qBox = getQuestionBox();
  qBox.classList.remove("hidden", "slide-out", "slide-in");
  qBox.style.minHeight = "auto";
  qBox.innerHTML = `
    <div class="result-box">
      <div class="emoji">${emoji}</div>
      <h2>Quiz Tamamlandı!</h2>
      <p class="score-detail">👤 ${currentPlayer}</p>
      <p class="score-detail">✅ Doğru: ${correctCount} &nbsp;|&nbsp; ❌ Yanlış: ${wrongCount}</p>
      <p class="score-detail"><strong>${score} / ${shuffledQuestions.length}</strong> soru doğru (${pct}%)</p>
      <p class="score-detail">⭐ Toplam Puan: <strong>${totalPoints}</strong></p>
      ${maxStreak >= 2 ? `<p class="score-detail">🔥 En uzun seri: <strong>${maxStreak}</strong></p>` : ""}
      <div class="motivation">${message}</div>
      <button class="restart-btn" onclick="goToStart()">🔄 Tekrar Oyna</button>
    </div>
  `;
}

// ── KONFETİ ──────────────────────────────────────────────
function launchConfetti() {
  const colors = ["#f48fb1","#ff6f91","#ffd6e0","#fff59d","#c8e6c9","#b3e5fc","#e1bee7"];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const c = document.createElement("div");
      c.className = "confetti-piece";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = (1.5 + Math.random() * 2) + "s";
      c.style.animationDelay = (Math.random() * 0.5) + "s";
      c.style.width  = (8 + Math.random() * 8) + "px";
      c.style.height = (8 + Math.random() * 8) + "px";
      c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }, i * 30);
  }
}

// ── BAŞA DÖN ─────────────────────────────────────────────
function goToStart() {
  answersContainer.style.display = "grid";
  document.querySelector(".top-bar").style.display = "flex";
  const jokerBar = document.getElementById("joker-bar");
  if (jokerBar) jokerBar.style.display = "flex";

  const qBox = document.getElementById("question-box");
  qBox.style.minHeight = "";
  qBox.innerHTML = `<h2 id="question"></h2>`;

  hideExplanation();
  showScreen("start-screen");
}

// ── SKOR KAYDET ──────────────────────────────────────────
function saveScore(name, score, total, pts) {
  const scores = getScores();
  scores.push({
    name,
    score,
    total,
    pts: pts || 0,
    pct: Math.round((score / total) * 100),
    date: new Date().toLocaleDateString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric" }),
    time: new Date().toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })
  });
  scores.sort((a, b) => b.pts - a.pts || b.pct - a.pct);
  localStorage.setItem("ebelik_scores", JSON.stringify(scores.slice(0, 20)));
}

function getScores() {
  try { return JSON.parse(localStorage.getItem("ebelik_scores")) || []; }
  catch { return []; }
}

// ── SKOR TABLOSU ─────────────────────────────────────────
function showScoreboard() {
  const scores = getScores();
  const list = document.getElementById("scoreboard-list");

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
          <div class="score-points-col">
            <div class="score-pts">⭐ ${s.pts || 0}</div>
            <div class="score-frac">${s.score}/${s.total} <span>(${s.pct}%)</span></div>
          </div>
        </div>
      `;
    }).join("");
  }
  showScreen("scoreboard-screen");
}

document.querySelector(".scoreboard-btn")?.addEventListener("click", () => showScoreboard());