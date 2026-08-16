// Nentuin dari AWAL BANGET (sebelum body sempat digambar) apakah halaman ini
// dibuka lewat ?type=..., biar game.css bisa langsung nampilin settings-screen
// dari awal tanpa acara "kedip" nampilin selection-screen dulu sekilas.
// File terpisah (bukan inline <script>) soalnya CSP situs ini nge-block script inline.
(function () {
    var type = new URLSearchParams(window.location.search).get('type');
    if (type) {
        document.documentElement.classList.add('has-type-param');
    }
})();
