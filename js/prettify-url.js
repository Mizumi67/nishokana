(function() {
    const prettySections = ['home', 'hiragana', 'katakana', 'kotoba', 'kanji', 'games'];

    function getRootBase() {
        return window.location.pathname.split('/').slice(0, 2).join('/') + '/';
    }

    function prettifyUrl() {
        const id = window.location.hash.replace('#', '');
        if (!prettySections.includes(id)) return;
        const rootBase = getRootBase();
        const newPath = id === 'home' ? rootBase : rootBase + id + '/';
        history.replaceState(null, '', newPath);
    }

    if (window.location.hash) {
        prettifyUrl();
    }
    window.addEventListener('hashchange', prettifyUrl);
})();
