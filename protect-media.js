(function () {
    'use strict';

    function isProtectedTarget(el) {
        if (!el || typeof el.closest !== 'function') return false;
        return !!el.closest('img, svg, .stroke-anim-card, .logo-img');
    }

    document.addEventListener('contextmenu', function (e) {
        if (isProtectedTarget(e.target)) {
            e.preventDefault();
        }
    }, true);

    document.addEventListener('dragstart', function (e) {
        if (isProtectedTarget(e.target)) {
            e.preventDefault();
        }
    }, true);
})();
