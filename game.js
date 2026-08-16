// ===== Game Variables =====
let gameType = '';
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let timeLimit = 60;
let timeRemaining = 60;
let timerInterval = null;
let startTime = null;
let endTime = null;
let noTimeLimit = false;
let isGameInProgress = false;

// ===== Audio Context for Timer Sounds =====
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTickSound() {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playTimeUpSound() {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ===== Initialize Game =====
document.addEventListener('DOMContentLoaded', () => {
    // Get game type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam) {
        gameType = typeParam;
        showScreen('settings-screen');
    }
    
    // Setup answer input listener
    const answerInput = document.getElementById('answer-input');
    answerInput.addEventListener('input', checkAnswer);
    
    // Focus on input when game starts
    answerInput.addEventListener('focus', () => {
        initAudio();
    });

    // Tombol pilihan jenis game di selection screen
    document.querySelectorAll('.game-type-btn[data-game-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            selectGameType(btn.getAttribute('data-game-type'));
        });
    });

    // Checkbox "Tanpa Batas Waktu"
    const noTimeLimitCheckbox = document.getElementById('no-time-limit');
    if (noTimeLimitCheckbox) {
        noTimeLimitCheckbox.addEventListener('change', toggleTimeLimit);
    }

    // Tombol "Mulai Game!"
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    // Tombol "Main Lagi"
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', playAgain);
    }

    // Tombol "Kembali" / "Pilih Game Lain" (muncul di beberapa screen)
    document.querySelectorAll('.back-to-selection-btn').forEach((btn) => {
        btn.addEventListener('click', backToSelection);
    });

    // Lapisan tambahan: kalau user coba refresh pakai keyboard (F5 /
    // Ctrl+R / Cmd+R) saat game masih berlangsung, tampilkan modal
    // konfirmasi custom (bukan dialog bawaan browser) dulu.
    document.addEventListener('keydown', (e) => {
        const isRefreshShortcut = e.key === 'F5' ||
            ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));

        if (isRefreshShortcut && isGameInProgress) {
            e.preventDefault();
            showLeaveConfirm();
        }
    });
});

// ===== Leave/Refresh Confirm Modal (custom, bukan dialog bawaan browser) =====
function showLeaveConfirm() {
    const overlay = document.getElementById('leave-confirm-overlay');
    const confirmBtn = document.getElementById('leave-confirm-yes');
    const cancelBtn = document.getElementById('leave-confirm-cancel');

    overlay.classList.add('active');
    cancelBtn.focus();

    function close() {
        overlay.classList.remove('active');
        confirmBtn.removeEventListener('click', onConfirm);
        cancelBtn.removeEventListener('click', close);
        overlay.removeEventListener('click', overlayClick);
        document.removeEventListener('keydown', escClose);
    }

    function onConfirm() {
        close();
        isGameInProgress = false;
        window.location.reload();
    }

    function overlayClick(e) {
        if (e.target === overlay) close();
    }

    function escClose(e) {
        if (e.key === 'Escape') close();
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', overlayClick);
    document.addEventListener('keydown', escClose);
}

// ===== Custom Alert Modal (pengganti alert() bawaan browser) =====
function showAlert(message) {
    const overlay = document.getElementById('custom-alert-overlay');
    const messageEl = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');

    messageEl.textContent = message;
    overlay.classList.add('active');
    okBtn.focus();

    function closeAlert() {
        overlay.classList.remove('active');
        okBtn.removeEventListener('click', closeAlert);
        overlay.removeEventListener('click', overlayClick);
        document.removeEventListener('keydown', escClose);
    }

    function overlayClick(e) {
        if (e.target === overlay) closeAlert();
    }

    function escClose(e) {
        if (e.key === 'Escape' || e.key === 'Enter') closeAlert();
    }

    okBtn.addEventListener('click', closeAlert);
    overlay.addEventListener('click', overlayClick);
    document.addEventListener('keydown', escClose);
}

// ===== Screen Navigation =====
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectGameType(type) {
    gameType = type;
    showScreen('settings-screen');
}

function backToSelection() {
    showScreen('selection-screen');
    resetGame();
}

// ===== Toggle Time Limit =====
function toggleTimeLimit() {
    const checkbox = document.getElementById('no-time-limit');
    const group = document.getElementById('time-limit-group');
    const timeInput = document.getElementById('time-limit');

    if (checkbox.checked) {
        group.classList.add('disabled');
        timeInput.disabled = true;
    } else {
        group.classList.remove('disabled');
        timeInput.disabled = false;
    }
}

// ===== Start Game =====
// Sebelum benar-benar memulai game, tampilkan peringatan dulu bahwa
// refresh/menutup halaman akan menghilangkan progres. Peringatan ini
// cukup ditampilkan sekali per sesi tab (tersimpan di sessionStorage)
// supaya tidak mengganggu kalau user main berkali-kali.
function startGame() {
    // Validate settings dulu sebelum munculin peringatan, biar user
    // gak diminta konfirmasi kalau settingannya aja belum valid.
    const questionCount = parseInt(document.getElementById('question-count').value);
    if (questionCount < 5 || questionCount > 100) {
        showAlert('Jumlah soal harus antara 5 dan 100');
        return;
    }

    const noTimeLimitCheck = document.getElementById('no-time-limit').checked;
    if (!noTimeLimitCheck) {
        const tl = parseInt(document.getElementById('time-limit').value);
        if (tl < 10 || tl > 180) {
            showAlert('Batas waktu harus antara 10 dan 180 detik');
            return;
        }
    }

    if (sessionStorage.getItem('nishokana_refresh_warning_seen') === '1') {
        actuallyStartGame();
    } else {
        showRefreshWarning();
    }
}

function showRefreshWarning() {
    const overlay = document.getElementById('refresh-warning-overlay');
    const okBtn = document.getElementById('refresh-warning-ok');

    overlay.classList.add('active');
    okBtn.focus();

    function closeAndStart() {
        overlay.classList.remove('active');
        okBtn.removeEventListener('click', closeAndStart);
        overlay.removeEventListener('click', overlayClick);
        document.removeEventListener('keydown', enterClose);
        sessionStorage.setItem('nishokana_refresh_warning_seen', '1');
        actuallyStartGame();
    }

    function overlayClick(e) {
        if (e.target === overlay) closeAndStart();
    }

    function enterClose(e) {
        if (e.key === 'Enter' || e.key === 'Escape') closeAndStart();
    }

    okBtn.addEventListener('click', closeAndStart);
    overlay.addEventListener('click', overlayClick);
    document.addEventListener('keydown', enterClose);
}

function actuallyStartGame() {
    // Get settings
    const questionCount = parseInt(document.getElementById('question-count').value);
    noTimeLimit = document.getElementById('no-time-limit').checked;

    if (noTimeLimit) {
        timeLimit = null;
    } else {
        timeLimit = parseInt(document.getElementById('time-limit').value);
    }
    
    // Generate questions
    generateQuestions(questionCount);
    
    // Reset game state
    currentQuestionIndex = 0;
    correctAnswers = 0;
    timeRemaining = timeLimit;
    
    // Update UI
    document.getElementById('total-questions').textContent = questions.length;
    updateTimerDisplay();
    document.getElementById('current-question').textContent = 1;
    document.getElementById('correct-count').textContent = 0;
    
    // Show first question
    showQuestion();
    
    // Start timer
    startTime = Date.now();
    startTimer();
    
    // Show game screen
    showScreen('game-screen');
    
    // Focus on input
    document.getElementById('answer-input').focus();

    // Aktifkan peringatan browser bawaan kalau user coba refresh/nutup tab
    // di tengah game supaya ada lapisan pengingat tambahan selain modal.
    isGameInProgress = true;
}

// ===== Generate Questions =====
function generateQuestions(count) {
    let pool = [];
    
    if (gameType === 'kana') {
        // Combine all hiragana and katakana
        pool = [
            ...hiragana_dasar,
            ...hiragana_dakuten,
            ...hiragana_handakuten,
            ...hiragana_youon,
            ...katakana_dasar,
            ...katakana_dakuten,
            ...katakana_handakuten,
            ...katakana_youon,
            ...katakana_modern
        ];
    } else if (gameType === 'kotoba') {
        pool = [...kotoba];
    } else if (gameType === 'kanji') {
        pool = [...kanji];
    } else if (gameType === 'mix') {
        questions = generateMixQuestions(count);
        return;
    }
    
    // Shuffle and take count
    questions = shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

// Ambil soal campuran dari kana, kotoba, dan kanji dengan porsi rata
function generateMixQuestions(count) {
    const kanaPool = [
        ...hiragana_dasar,
        ...hiragana_dakuten,
        ...hiragana_handakuten,
        ...hiragana_youon,
        ...katakana_dasar,
        ...katakana_dakuten,
        ...katakana_handakuten,
        ...katakana_youon,
        ...katakana_modern
    ].map(item => ({ ...item, source: 'kana' }));

    const kotobaPool = kotoba.map(item => ({ ...item, source: 'kotoba' }));
    const kanjiPool = kanji.map(item => ({ ...item, source: 'kanji' }));

    const groups = [kanaPool, kotobaPool, kanjiPool];
    const base = Math.floor(count / groups.length);
    let remainder = count % groups.length;

    let selected = [];
    groups.forEach(pool => {
        let take = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        take = Math.min(take, pool.length);
        selected = selected.concat(shuffleArray(pool).slice(0, take));
    });

    return shuffleArray(selected);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===== Show Question =====
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    const questionChar = document.getElementById('question-char');
    const answerInput = document.getElementById('answer-input');
    const feedback = document.getElementById('feedback');
    const questionLabel = document.getElementById('question-label');
    
    // Untuk mode mix, tiap soal bisa berasal dari sumber berbeda (kana/kotoba/kanji)
    const questionSource = question.source || gameType;
    
    // Set question
    if (questionSource === 'kana') {
        questionChar.textContent = question.char;
    } else {
        questionChar.textContent = question.jp;
    }
    
    // Adjust font size for longer kanji words so they still fit nicely
    if (questionSource === 'kanji' && question.jp.length > 2) {
        questionChar.classList.add('question-text-small');
    } else {
        questionChar.classList.remove('question-text-small');
    }
    
    // Adjust instruction label per game type
    if (questionLabel) {
        if (questionSource === 'kana') {
            questionLabel.textContent = 'Tuliskan bacaan huruf di atas (romaji)';
        } else if (questionSource === 'kotoba') {
            questionLabel.textContent = 'Tuliskan cara baca kosakata di atas (romaji)';
        } else if (questionSource === 'kanji') {
            questionLabel.textContent = 'Tuliskan cara baca kanji di atas (romaji)';
        }
    }
    
    // Clear input and feedback
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'answer-feedback';
    
    // Update question number
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
}

// ===== Check Answer =====
// Mendapatkan semua kemungkinan jawaban yang benar untuk satu soal.
// Mendukung romaji berupa string tunggal ATAU array (untuk kanji/kata yang
// punya lebih dari satu cara baca yang sama-sama benar, mis. 何人 -> nanijin/nannin)
function getAcceptedAnswers(question) {
    const romaji = question.romaji;
    const list = Array.isArray(romaji) ? romaji : [romaji];

    const answers = new Set();
    list.forEach(r => {
        const normalized = r.toLowerCase().trim().replace(/\s+/g, ' ');
        answers.add(normalized);

        // Untuk kotoba/kanji yang terdiri dari lebih dari satu kata
        // (mis. "ohayou gozaimasu"), terima juga versi tanpa spasi
        // ("ohayougozaimasu") supaya user tidak perlu repot mengetik spasi.
        if (normalized.includes(' ')) {
            answers.add(normalized.replace(/\s+/g, ''));
        }
    });

    return Array.from(answers);
}

function checkAnswer() {
    const answerInput = document.getElementById('answer-input');
    const userAnswer = answerInput.value.trim().toLowerCase().replace(/\s+/g, ' ');
    
    if (!userAnswer) return;
    
    const question = questions[currentQuestionIndex];
    const acceptedAnswers = getAcceptedAnswers(question);
    
    // Check if answer is correct (case insensitive, terima semua bacaan yang valid)
    if (acceptedAnswers.includes(userAnswer)) {
        correctAnswers++;
        document.getElementById('correct-count').textContent = correctAnswers;
        
        // Show feedback briefly
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = iconSvg('icon-check') + 'Benar!';
        feedback.className = 'answer-feedback feedback-correct';
        
        // Move to next question
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 300);
    }
}

// ===== Timer =====
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (noTimeLimit) {
        timerElement.textContent = '∞';
        timerElement.classList.remove('timer-warning');
    } else {
        timerElement.textContent = timeRemaining;
    }
}

function startTimer() {
    clearInterval(timerInterval);

    // Mode tanpa batas waktu: jangan jalankan countdown sama sekali
    if (noTimeLimit) {
        updateTimerDisplay();
        return;
    }

    timerInterval = setInterval(() => {
        timeRemaining--;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = timeRemaining;
        
        // Warning when less than 10 seconds
        if (timeRemaining <= 10) {
            timerElement.classList.add('timer-warning');
            playTickSound();
        }
        
        // Time's up
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            playTimeUpSound();
            endGame();
        }
    }, 1000);
}

// ===== End Game =====
function endGame() {
    clearInterval(timerInterval);
    endTime = Date.now();
    isGameInProgress = false;
    
    const timeUsed = Math.floor((endTime - startTime) / 1000);
    const totalQuestions = questions.length;
    const answeredQuestions = currentQuestionIndex;
    const wrongAnswers = answeredQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate grade
    const grade = calculateGrade(accuracy);
    const icon = getGradeIcon(grade);
    
    // Update result screen
    document.getElementById('result-icon').innerHTML = iconSvg(icon);
    document.getElementById('result-grade').textContent = grade;
    document.getElementById('final-correct').textContent = correctAnswers;
    document.getElementById('final-total').textContent = totalQuestions;
    document.getElementById('stat-total').textContent = totalQuestions;
    document.getElementById('stat-correct').textContent = correctAnswers;
    document.getElementById('stat-wrong').textContent = wrongAnswers;
    document.getElementById('stat-accuracy').textContent = accuracy + '%';
    document.getElementById('stat-time').textContent = timeUsed + ' detik';
    
    // Show result screen
    showScreen('result-screen');
}

// ===== Calculate Grade =====
function calculateGrade(accuracy) {
    if (accuracy >= 95) return 'A+';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 85) return 'B+';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 75) return 'C+';
    if (accuracy >= 70) return 'C';
    if (accuracy >= 60) return 'D';
    return 'F';
}

function getGradeIcon(grade) {
    const icons = {
        'A+': 'icon-trophy',
        'A': 'icon-star',
        'B+': 'icon-star',
        'B': 'icon-thumbs-up',
        'C+': 'icon-smile',
        'C': 'icon-meh',
        'D': 'icon-frown',
        'F': 'icon-sad'
    };
    return icons[grade] || 'icon-medal';
}

// ===== Play Again =====
function playAgain() {
    // Generate new questions with same settings
    const questionCount = questions.length;
    generateQuestions(questionCount);
    
    // Reset and start
    currentQuestionIndex = 0;
    correctAnswers = 0;
    timeRemaining = timeLimit;
    
    // Update UI
    document.getElementById('timer').classList.remove('timer-warning');
    updateTimerDisplay();
    document.getElementById('current-question').textContent = 1;
    document.getElementById('correct-count').textContent = 0;
    
    // Show first question
    showQuestion();
    
    // Start timer
    startTime = Date.now();
    startTimer();
    
    // Show game screen
    showScreen('game-screen');
    
    // Focus on input
    document.getElementById('answer-input').focus();

    isGameInProgress = true;
}
function resetGame() {
    clearInterval(timerInterval);
    questions = [];
    currentQuestionIndex = 0;
    correctAnswers = 0;
    timeRemaining = 60;
    gameType = '';
    noTimeLimit = false;
    isGameInProgress = false;

    // Reset UI batas waktu ke kondisi awal
    const checkbox = document.getElementById('no-time-limit');
    const group = document.getElementById('time-limit-group');
    const timeInput = document.getElementById('time-limit');
    if (checkbox) checkbox.checked = false;
    if (group) group.classList.remove('disabled');
    if (timeInput) timeInput.disabled = false;
}
