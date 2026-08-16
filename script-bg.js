// ==== Background Character Animation ====
(function() {
    const kanaChars = [
        // Hiragana
        'あ', 'い', 'う', 'え', 'お',
        'か', 'き', 'く', 'け', 'こ',
        'さ', 'し', 'す', 'せ', 'そ',
        'た', 'ち', 'つ', 'て', 'と',
        'な', 'に', 'ぬ', 'ね', 'の',
        'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ま', 'み', 'む', 'め', 'も',
        'や', 'ゆ', 'よ',
        'ら', 'り', 'る', 'れ', 'ろ',
        'わ', 'を', 'ん',
        // Katakana
        'ア', 'イ', 'ウ', 'エ', 'オ',
        'カ', 'キ', 'ク', 'ケ', 'コ',
        'サ', 'シ', 'ス', 'セ', 'ソ',
        'タ', 'チ', 'ツ', 'テ', 'ト',
        'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
        'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
        'マ', 'ミ', 'ム', 'メ', 'モ',
        'ヤ', 'ユ', 'ヨ',
        'ラ', 'リ', 'ル', 'レ', 'ロ',
        'ワ', 'ヲ', 'ン'
    ];
    
    function createFloatingChar() {
        const container = document.getElementById('bg-characters');
        if (!container) return;
        
        const char = document.createElement('div');
        char.className = 'floating-char-bg';
        char.textContent = kanaChars[Math.floor(Math.random() * kanaChars.length)];
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        char.style.left = x + '%';
        char.style.top = y + '%';
        
        container.appendChild(char);
        
        // Remove after animation
        setTimeout(() => {
            if (char.parentNode) {
                char.parentNode.removeChild(char);
            }
        }, 8000);
    }
    
    // Start animation when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Create initial characters
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createFloatingChar(), i * 1000);
        }
        
        // Continue creating characters
        setInterval(createFloatingChar, 2500);
    });
})();
