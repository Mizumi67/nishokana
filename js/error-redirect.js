(function () {
    var path = window.location.pathname;
    var rootBase = path.split('/').slice(0, 2).join('/') + '/';
    document.write('<base href="' + rootBase + '">');

    var sections = ['hiragana', 'katakana', 'kotoba', 'games'];
    var gameTypes = ['kana', 'kotoba', 'kanji', 'mix'];

    var gameMatch = path.match(/\/game\/([a-z]+)\/?$/);
    if (gameMatch) {
        if (gameTypes.indexOf(gameMatch[1]) !== -1) {
            window.location.replace(rootBase + 'game.html?type=' + gameMatch[1]);
            return;
        }
        window.NISHO_ERROR = {
            label: 'Tipe Game Salah',
            title: 'Game-nya Nggak Ada',
            desc: 'Tipe game "' + gameMatch[1] + '" nggak dikenal sama NishoKana. Yang ada cuma kana, kotoba, kanji, sama mix.'
        };
    }

    if (!window.NISHO_ERROR && path.match(/\/game\/?$/)) {
        window.location.replace(rootBase + 'game.html');
        return;
    }

    if (!window.NISHO_ERROR) {
        for (var i = 0; i < sections.length; i++) {
            if (path.match(new RegExp('/' + sections[i] + '/?$'))) {
                window.location.replace(rootBase + '#' + sections[i]);
                return;
            }
        }
    }

    if (!window.NISHO_ERROR) {
        window.NISHO_ERROR = {
            label: 'Halaman Nggak Ada',
            title: 'Alamatnya Nyasar',
            desc: 'Halaman yang kamu tuju nggak ketemu di NishoKana. Coba cek lagi ejaan link-nya, atau mungkin halamannya emang udah dipindah.'
        };
    }

    window.NISHO_PATH = path;
})();
