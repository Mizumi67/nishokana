(function () {
    // Base folder di-hitung dari lokasi file script ini sendiri, bukan dari
    // URL halaman saat ini. Soalnya address bar bisa aja udah diubah jadi
    // path yang lebih rapi (lihat script.js / game-init.js), jadi kalau
    // fetch-nya pakai path relatif ke URL halaman bisa salah folder.
    const scriptSrc = document.currentScript.src;
    const SVG_FOLDER = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1) + 'stroke-svgs';
    const strokeSvgCache = {};

    // File SVG dari AnimCJK ikut nyimpen <style> sendiri di dalamnya buat
    // ngatur animasi goresan. Situs ini makein CSP yang ngelarang inline
    // style, jadi <style> itu kepotong browser dan animasinya nggak pernah
    // jalan (hurufnya cuma nongol diem, nggak gerak). CSS yang setara sudah
    // dipindah ke styles.css (yang aman lewat CSP), makanya di sini
    // <style>-nya dibuang dari markup sebelum ditempel ke halaman.
    function stripEmbeddedStyle(svgText) {
        return svgText.replace(/<style[\s\S]*?<\/style>/i, '');
    }

    let activeChar = '';
    let requestToken = 0;

    async function fetchStrokeSvg(codePoint) {
        if (strokeSvgCache[codePoint] !== undefined) {
            return strokeSvgCache[codePoint];
        }

        const pending = fetch(`${SVG_FOLDER}/${codePoint}.svg`)
            .then((response) => (response.ok ? response.text() : null))
            .then((svgText) => (svgText ? stripEmbeddedStyle(svgText) : null))
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

    // Ambil semua huruf yang udah kelihatan di kartu-kartu kana pada halaman
    // (hiragana/katakana) dan mulai unduh SVG-nya di belakang layar begitu
    // halaman selesai dimuat. Jadi pas modal dibuka, animasinya udah siap di
    // cache dan langsung nongol tanpa jeda "memuat".
    function prefetchVisibleCharacters() {
        const chars = new Set();
        document.querySelectorAll('.kana-char').forEach((el) => {
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
