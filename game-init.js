// ==== Dark Mode Toggle (halaman game) ====
(function() {
    const btn = document.getElementById('game-theme-toggle');
    btn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
})();

// ==== Pretty URL untuk halaman game ====
// Kalau halaman ini kebuka lewat ?type=..., address bar-nya diganti diam-diam
// jadi game/<tipe>/ lewat replaceState (bukan reload, jadi game-nya tetap
// jalan normal). Kalau user milih tipe game langsung dari selection screen,
// URL-nya juga ikut diperbarui pas itu. rootBase dihitung dari pathname asli
// halaman (sama seperti error-redirect.js) biar selalu ke folder root situs.
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
