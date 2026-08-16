// ==== Dark Mode Toggle (halaman game) ====
(function() {
    const btn = document.getElementById('game-theme-toggle');
    btn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
})();
