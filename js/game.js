let gameType = '';
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let skippedCount = 0;
let hintsUsed = 0;
let timeLimit = 60;
let timeRemaining = 60;
let timerInterval = null;
let startTime = null;
let endTime = null;
let noTimeLimit = false;
let isGameInProgress = false;
let kanaFocus = 'all';

const initialTypeParam = new URLSearchParams(window.location.search).get('type');

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

document.addEventListener('DOMContentLoaded', () => {
    const typeParam = initialTypeParam;
    
    if (typeParam) {
        gameType = typeParam;
        const kanaFocusGroup = document.getElementById('kana-focus-group');
        if (kanaFocusGroup) {
            kanaFocusGroup.classList.toggle('hidden', typeParam !== 'kana');
        }
        showScreen('settings-screen');
        document.documentElement.classList.remove('has-type-param');
        updateQuestionCountLimits();
    }
    
    const answerInput = document.getElementById('answer-input');
    answerInput.addEventListener('input', checkAnswer);
    
    answerInput.addEventListener('focus', () => {
        initAudio();
    });

    document.querySelectorAll('.game-type-btn[data-game-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            selectGameType(btn.getAttribute('data-game-type'));
        });
    });

    const noTimeLimitCheckbox = document.getElementById('no-time-limit');
    if (noTimeLimitCheckbox) {
        noTimeLimitCheckbox.addEventListener('change', toggleTimeLimit);
    }

    document.querySelectorAll('[data-kana-focus]').forEach((btn) => {
        btn.addEventListener('click', () => {
            kanaFocus = btn.getAttribute('data-kana-focus');
            document.querySelectorAll('[data-kana-focus]').forEach((b) => {
                b.classList.toggle('active', b === btn);
            });
            updateQuestionCountLimits();
        });
    });

    const questionCountMaxBtn = document.getElementById('question-count-max-btn');
    const questionCountInput = document.getElementById('question-count');
    if (questionCountMaxBtn && questionCountInput) {
        questionCountMaxBtn.addEventListener('click', () => {
            questionCountInput.value = getMaxQuestionCount();
            questionCountMaxBtn.classList.add('active');
        });
        questionCountInput.addEventListener('input', () => {
            questionCountMaxBtn.classList.remove('active');
        });
    }

    const timeLimitMaxBtn = document.getElementById('time-limit-max-btn');
    const timeLimitInput = document.getElementById('time-limit');
    if (timeLimitMaxBtn && timeLimitInput) {
        timeLimitMaxBtn.addEventListener('click', () => {
            timeLimitInput.value = 600;
            timeLimitMaxBtn.classList.add('active');
        });
        timeLimitInput.addEventListener('input', () => {
            timeLimitMaxBtn.classList.remove('active');
        });
    }

    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', playAgain);
    }

    const settingsBackBtn = document.getElementById('settings-back-btn');
    if (settingsBackBtn) {
        settingsBackBtn.addEventListener('click', goToGamesHome);
    }

    document.querySelectorAll('.back-to-selection-btn').forEach((btn) => {
        btn.addEventListener('click', backToSelection);
    });

    const gameBackBtn = document.getElementById('game-back-btn');
    if (gameBackBtn) {
        gameBackBtn.addEventListener('click', () => {
            if (isGameInProgress) {
                showGameBackConfirm();
            } else {
                goToGamesHome();
            }
        });
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', useHint);
    }

    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipQuestion);
    }

    const surrenderBtn = document.getElementById('surrender-btn');
    if (surrenderBtn) {
        surrenderBtn.addEventListener('click', showSurrenderConfirm);
    }

    document.addEventListener('keydown', (e) => {
        const isRefreshShortcut = e.key === 'F5' ||
            ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));

        if (isRefreshShortcut && isGameInProgress) {
            e.preventDefault();
            showLeaveConfirm();
        }
    });
});

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
        const rootBase = window.location.pathname.split('/').slice(0, 2).join('/') + '/';
        const target = gameType ? `${rootBase}game.html?type=${gameType}` : `${rootBase}game.html`;
        window.location.href = target;
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

function goToGamesHome() {
    const rootBase = window.location.pathname.split('/').slice(0, 2).join('/') + '/';
    window.location.href = `${rootBase}index.html#games`;
}

function showGameBackConfirm() {
    const overlay = document.getElementById('game-back-confirm-overlay');
    const confirmBtn = document.getElementById('game-back-confirm-yes');
    const cancelBtn = document.getElementById('game-back-confirm-cancel');

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
        clearInterval(timerInterval);
        isGameInProgress = false;
        showScreen('settings-screen');
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

function showSurrenderConfirm() {
    const overlay = document.getElementById('surrender-confirm-overlay');
    const confirmBtn = document.getElementById('surrender-confirm-yes');
    const cancelBtn = document.getElementById('surrender-confirm-cancel');

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
        surrenderGame();
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

function surrenderGame() {
    endGame();
}

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

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectGameType(type) {
    gameType = type;

    const kanaFocusGroup = document.getElementById('kana-focus-group');
    if (kanaFocusGroup) {
        kanaFocusGroup.classList.toggle('hidden', type !== 'kana');
    }

    updateQuestionCountLimits();
    showScreen('settings-screen');
}

function updateQuestionCountLimits() {
    const max = getMaxQuestionCount();
    const input = document.getElementById('question-count');
    const info = document.getElementById('question-count-info');
    const maxBtn = document.getElementById('question-count-max-btn');

    input.max = max;
    if (parseInt(input.value) > max) {
        input.value = max;
    }
    if (maxBtn) {
        maxBtn.classList.toggle('active', parseInt(input.value) === max);
    }

    if (info) {
        info.textContent = `Maksimal ${max} soal`;
    }
}

function backToSelection() {
    showScreen('selection-screen');
    resetGame();
}

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

function startGame() {
    const questionCount = parseInt(document.getElementById('question-count').value);
    const maxQuestions = getMaxQuestionCount();
    if (isNaN(questionCount) || questionCount < 5 || questionCount > maxQuestions) {
        showAlert(`Jumlah soal harus antara 5 dan ${maxQuestions}`);
        return;
    }

    const noTimeLimitCheck = document.getElementById('no-time-limit').checked;
    if (!noTimeLimitCheck) {
        const tl = parseInt(document.getElementById('time-limit').value);
        if (isNaN(tl) || tl < 10 || tl > 600) {
            showAlert('Batas waktu harus antara 10 dan 600 detik');
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
    const questionCount = parseInt(document.getElementById('question-count').value);
    noTimeLimit = document.getElementById('no-time-limit').checked;

    if (noTimeLimit) {
        timeLimit = null;
    } else {
        timeLimit = parseInt(document.getElementById('time-limit').value);
    }
    
    generateQuestions(questionCount);
    
    currentQuestionIndex = 0;
    correctAnswers = 0;
    skippedCount = 0;
    timeRemaining = timeLimit;
    
    document.getElementById('total-questions').textContent = questions.length;
    updateTimerDisplay();
    document.getElementById('current-question').textContent = 1;
    document.getElementById('correct-count').textContent = 0;
    
    showQuestion();
    
    startTime = Date.now();
    startTimer();
    
    showScreen('game-screen');
    
    document.getElementById('answer-input').focus();

    isGameInProgress = true;
}

function generateQuestions(count) {
    let pool = [];
    
    if (gameType === 'kana') {
        pool = getKanaPool();
    } else if (gameType === 'kotoba') {
        pool = [...kotoba];
    } else if (gameType === 'kanji') {
        pool = [...kanji];
    } else if (gameType === 'mix') {
        questions = generateMixQuestions(count);
        return;
    }
    
    questions = shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

function getKanaPool() {
    const hiraganaPool = [
        ...hiragana_dasar,
        ...hiragana_dakuten,
        ...hiragana_handakuten,
        ...hiragana_youon
    ];
    const katakanaPool = [
        ...katakana_dasar,
        ...katakana_dakuten,
        ...katakana_handakuten,
        ...katakana_youon,
        ...katakana_modern
    ];

    if (kanaFocus === 'hiragana') return hiraganaPool;
    if (kanaFocus === 'katakana') return katakanaPool;
    return [...hiraganaPool, ...katakanaPool];
}

function getMaxQuestionCount() {
    if (gameType === 'kana') return getKanaPool().length;
    if (gameType === 'kotoba') return kotoba.length;
    if (gameType === 'kanji') return kanji.length;
    if (gameType === 'mix') {
        const kanaAll = [
            ...hiragana_dasar, ...hiragana_dakuten, ...hiragana_handakuten, ...hiragana_youon,
            ...katakana_dasar, ...katakana_dakuten, ...katakana_handakuten, ...katakana_youon, ...katakana_modern
        ];
        return kanaAll.length + kotoba.length + kanji.length;
    }
    return 100;
}

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

    const groups = [shuffleArray(kanaPool), shuffleArray(kotobaPool), shuffleArray(kanjiPool)];
    const quotas = groups.map(() => 0);
    let remaining = count;
    let active = groups.map((_, i) => i);

    while (remaining > 0 && active.length > 0) {
        const share = Math.ceil(remaining / active.length);
        const stillActive = [];

        for (const i of active) {
            if (remaining <= 0) break;
            const room = groups[i].length - quotas[i];
            const take = Math.min(share, room, remaining);
            quotas[i] += take;
            remaining -= take;
            if (quotas[i] < groups[i].length) stillActive.push(i);
        }

        active = stillActive;
    }

    let selected = [];
    groups.forEach((pool, i) => {
        selected = selected.concat(pool.slice(0, quotas[i]));
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
    
    const questionSource = question.source || gameType;
    
    if (questionSource === 'kana') {
        questionChar.textContent = question.char;
    } else {
        questionChar.textContent = question.jp;
    }
    
    if (questionSource === 'kanji' && question.jp.length > 2) {
        questionChar.classList.add('question-text-small');
    } else {
        questionChar.classList.remove('question-text-small');
    }
    
    if (questionLabel) {
        if (questionSource === 'kana') {
            questionLabel.textContent = 'Tuliskan bacaan huruf di atas (romaji)';
        } else if (questionSource === 'kotoba') {
            questionLabel.textContent = 'Tuliskan cara baca kosakata di atas (romaji)';
        } else if (questionSource === 'kanji') {
            questionLabel.textContent = 'Tuliskan cara baca kanji di atas (romaji)';
        }
    }
    
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'answer-feedback';
    
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;

    hintsUsed = 0;
    document.getElementById('hint-display').textContent = '';
    updateHintButton();
}

function updateHintButton() {
    const hintBtn = document.getElementById('hint-btn');
    if (!hintBtn) return;

    const remaining = 3 - hintsUsed;
    hintBtn.querySelector('span').textContent = `Hint (${remaining})`;
    hintBtn.disabled = remaining <= 0;
}

function useHint() {
    if (hintsUsed >= 3) return;

    const question = questions[currentQuestionIndex];
    const answer = getAcceptedAnswers(question)[0];
    const letterCount = answer.replace(/\s/g, '').length;

    if (hintsUsed >= letterCount) return;

    hintsUsed++;

    const revealed = answer.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        return i < hintsUsed ? ch : '_';
    }).join(' ');

    document.getElementById('hint-display').textContent = `Petunjuk: ${revealed}`;
    updateHintButton();
}

function skipQuestion() {
    skippedCount++;
    currentQuestionIndex++;
    showQuestion();
}

function getAcceptedAnswers(question) {
    const romaji = question.romaji;
    const list = Array.isArray(romaji) ? romaji : [romaji];

    const answers = new Set();
    list.forEach(r => {
        const normalized = r.toLowerCase().trim().replace(/\s+/g, ' ');
        answers.add(normalized);

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
    
    if (acceptedAnswers.includes(userAnswer)) {
        correctAnswers++;
        document.getElementById('correct-count').textContent = correctAnswers;
        
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = iconSvg('icon-check') + 'Benar!';
        feedback.className = 'answer-feedback feedback-correct';
        
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 300);
    }
}

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

    if (noTimeLimit) {
        updateTimerDisplay();
        return;
    }

    timerInterval = setInterval(() => {
        timeRemaining--;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = timeRemaining;
        
        if (timeRemaining <= 10) {
            timerElement.classList.add('timer-warning');
            playTickSound();
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            playTimeUpSound();
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    endTime = Date.now();
    isGameInProgress = false;
    
    const timeUsed = Math.floor((endTime - startTime) / 1000);
    const totalQuestions = questions.length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    const grade = calculateGrade(accuracy);
    const icon = getGradeIcon(grade);
    
    document.getElementById('result-icon').innerHTML = iconSvg(icon);
    document.getElementById('result-grade').textContent = grade;
    document.getElementById('final-correct').textContent = correctAnswers;
    document.getElementById('final-total').textContent = totalQuestions;
    document.getElementById('stat-total').textContent = totalQuestions;
    document.getElementById('stat-correct').textContent = correctAnswers;
    document.getElementById('stat-skipped').textContent = skippedCount;
    document.getElementById('stat-wrong').textContent = wrongAnswers;
    document.getElementById('stat-accuracy').textContent = accuracy + '%';
    document.getElementById('stat-time').textContent = timeUsed + ' detik';
    
    showScreen('result-screen');
}

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

function playAgain() {
    const questionCount = questions.length;
    generateQuestions(questionCount);
    
    currentQuestionIndex = 0;
    correctAnswers = 0;
    skippedCount = 0;
    timeRemaining = timeLimit;
    
    document.getElementById('timer').classList.remove('timer-warning');
    updateTimerDisplay();
    document.getElementById('current-question').textContent = 1;
    document.getElementById('correct-count').textContent = 0;
    
    showQuestion();
    
    startTime = Date.now();
    startTimer();
    
    showScreen('game-screen');
    
    document.getElementById('answer-input').focus();

    isGameInProgress = true;
}
function resetGame() {
    clearInterval(timerInterval);
    questions = [];
    currentQuestionIndex = 0;
    correctAnswers = 0;
    skippedCount = 0;
    timeRemaining = 60;
    gameType = '';
    noTimeLimit = false;
    isGameInProgress = false;
    kanaFocus = 'all';

    const checkbox = document.getElementById('no-time-limit');
    const group = document.getElementById('time-limit-group');
    const timeInput = document.getElementById('time-limit');
    if (checkbox) checkbox.checked = false;
    if (group) group.classList.remove('disabled');
    if (timeInput) timeInput.disabled = false;

    document.querySelectorAll('[data-kana-focus]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-kana-focus') === 'all');
    });

    const questionCountInput = document.getElementById('question-count');
    const questionCountInfo = document.getElementById('question-count-info');
    const questionCountMaxBtn = document.getElementById('question-count-max-btn');
    if (questionCountInput) {
        questionCountInput.max = 100;
        questionCountInput.value = 20;
    }
    if (questionCountInfo) {
        questionCountInfo.textContent = 'Maksimal 100 soal';
    }
    if (questionCountMaxBtn) questionCountMaxBtn.classList.remove('active');

    const timeLimitMaxBtn = document.getElementById('time-limit-max-btn');
    if (timeLimitMaxBtn) timeLimitMaxBtn.classList.remove('active');
    if (timeInput) timeInput.value = 60;
}
