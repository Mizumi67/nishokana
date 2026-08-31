(function () {
    const rootBase = window.location.pathname.split('/').slice(0, 2).join('/') + '/';
    const SVG_FOLDER = rootBase + 'assets/stroke-svgs';
    const strokeSvgCache = {};

    function sanitizeStrokeSvg(svgText) {
        return svgText
            .replace(/<style[\s\S]*?<\/style>/i, '')
            .replace(/style="--d:([^;"]+);?"/g, 'data-delay="$1"');
    }

    function applyStrokeDelays(root) {
        root.querySelectorAll('[data-delay]').forEach((el) => {
            el.style.setProperty('--d', el.getAttribute('data-delay'));
        });
    }

    let activeChar = '';
    let requestToken = 0;

    async function fetchStrokeSvg(codePoint) {
        if (strokeSvgCache[codePoint] !== undefined) {
            return strokeSvgCache[codePoint];
        }

        const pending = fetch(`${SVG_FOLDER}/${codePoint}.svg`)
            .then((response) => (response.ok ? response.text() : null))
            .then((svgText) => (svgText ? sanitizeStrokeSvg(svgText) : null))
            .catch(() => null);

        strokeSvgCache[codePoint] = pending;
        const resolved = await pending;
        strokeSvgCache[codePoint] = resolved;
        return resolved;
    }

    function buildAnimationCard(char, svgText) {
        const card = document.createElement('div');
        card.className = 'stroke-anim-card';

        if (svgText) {
            card.innerHTML = svgText;
            applyStrokeDelays(card);
        } else {
            card.classList.add('stroke-anim-missing');
            card.innerHTML = '<span>Animasi belum tersedia untuk huruf ini</span>';
        }

        const label = document.createElement('div');
        label.className = 'stroke-anim-card-label';
        label.textContent = char;
        card.appendChild(label);

        return card;
    }

    async function renderStrokeAnimation(char) {
        const grid = document.getElementById('stroke-anim-grid');
        if (!grid || !char) return;

        activeChar = char;
        const myToken = ++requestToken;

        const chars = Array.from(char);
        const codePoints = chars.map((c) => c.codePointAt(0));
        const svgTexts = await Promise.all(codePoints.map((cp) => fetchStrokeSvg(cp)));

        if (myToken !== requestToken || activeChar !== char) {
            return;
        }

        grid.innerHTML = '';
        chars.forEach((c, idx) => {
            grid.appendChild(buildAnimationCard(c, svgTexts[idx]));
        });
    }

    function replayStrokeAnimation() {
        if (activeChar) {
            renderStrokeAnimation(activeChar);
        }
    }

    function prefetchVisibleCharacters() {
        const chars = new Set();
        document.querySelectorAll('.kana-char').forEach((el) => {
            Array.from(el.textContent || '').forEach((c) => chars.add(c));
        });
        document.querySelectorAll('.kanji-jp').forEach((el) => {
            Array.from(el.textContent || '').forEach((c) => chars.add(c));
        });
        chars.forEach((c) => fetchStrokeSvg(c.codePointAt(0)));
    }

    document.addEventListener('DOMContentLoaded', function () {
        const replayBtn = document.getElementById('stroke-anim-replay');
        if (replayBtn) {
            replayBtn.addEventListener('click', replayStrokeAnimation);
        }
        prefetchVisibleCharacters();
    });

    window.renderStrokeAnimation = renderStrokeAnimation;
})();
