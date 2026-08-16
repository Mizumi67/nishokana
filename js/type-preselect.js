(function () {
    var type = new URLSearchParams(window.location.search).get('type');
    if (type) {
        document.documentElement.classList.add('has-type-param');
    }
})();
