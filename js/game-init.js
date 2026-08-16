(function() {
    const btn = document.getElementById('game-theme-toggle');
    btn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
})();

(function() {
    const validTypes = ['kana', 'kotoba', 'kanji', 'mix'];

    function getRootBase() {
        return window.location.pathname.split('/').slice(0, 2).join('/') + '/';
    }

    const typeParam = new URLSearchParams(window.location.search).get('type');
    if (typeParam && validTypes.includes(typeParam)) {
        history.replaceState(null, '', getRootBase() + 'game/' + typeParam + '/');
    }

    document.querySelectorAll('.game-type-btn[data-game-type]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const type = btn.getAttribute('data-game-type');
            if (validTypes.includes(type)) {
                history.replaceState(null, '', getRootBase() + 'game/' + type + '/');
            }
        });
    });
})();
