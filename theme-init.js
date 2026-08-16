// Nerapin tema (dark/light) ke halaman game ini SEDINI MUNGKIN - persis di
// awal <body>, sebelum konten lain sempat digambar. Preferensinya diambil
// dari localStorage key "theme" yang SAMA dipakai di halaman utama
// (lihat script.js), jadi kalau di halaman utama lagi dark mode, halaman
// game ini kebuka dark mode juga, dan sebaliknya - bukan selalu dark mode
// kayak sebelumnya. Ditaruh di file terpisah (bukan inline <script>) soalnya
// CSP situs ini nge-block script inline, dan ditaruh di awal <body> (bukan
// <head>) soalnya elemen <body> harus udah ada dulu baru bisa dikasih class.
(function () {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();
