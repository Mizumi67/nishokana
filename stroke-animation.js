(function () {
    // Base folder di-hitung dari lokasi file script ini sendiri, bukan dari
    // URL halaman saat ini. Soalnya address bar bisa aja udah diubah jadi
    // path yang lebih rapi (lihat script.js / game-init.js), jadi kalau
    // fetch-nya pakai path relatif ke URL halaman bisa salah folder.
    const scriptSrc = document.currentScript.src;
    const SVG_FOLDER = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1) + 'stroke-svgs';
    const strokeSvgCache = {};

    let activeChar = '';
    let requestToken = 0;

    async function fetchStrokeSvg(codePoint) {
        if (strokeSvgCache[codePoint] !== undefined) {
            return strokeSvgCache[codePoint];
        }

        try {
            const response = await fetch(`${SVG_FOLDER}/${codePoint}.svg`);
            if (!response.ok) {
                strokeSvgCache[codePoint] = null;
                return null;
            }
            const svgText = await response.text();
            strokeSvgCache[codePoint] = svgText;
            return svgText;
        } catch (err) {
            strokeSvgCache[codePoint] = null;
            return null;
        }
    }

    function buildAnimationCard(char, svgText) {
        const card = document.createElement('div');
        card.className = 'stroke-anim-card';

        if (svgText) {
            card.innerHTML = svgText;
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

        grid.innerHTML = '<div class="stroke-anim-loading">Memuat animasi...</div>';

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

    document.addEventListener('DOMContentLoaded', function () {
        const replayBtn = document.getElementById('stroke-anim-replay');
        if (replayBtn) {
            replayBtn.addEventListener('click', replayStrokeAnimation);
        }
    });

    window.renderStrokeAnimation = renderStrokeAnimation;
})();
