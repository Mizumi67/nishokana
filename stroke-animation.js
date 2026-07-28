// =========================================================================
// Stroke Animation Module
// -------------------------------------------------------------------------
// Menampilkan animasi urutan goresan (stroke order) untuk setiap karakter
// Hiragana / Katakana di dalam modal, menggantikan bagian "Buy E-Book".
//
// PENTING: setiap file SVG di folder stroke-svgs/ dinamai sesuai KODE
// UNICODE (code point) desimal dari karakternya sendiri (contoh: karakter
// 'あ' = U+3042 = 12354, jadi file-nya adalah stroke-svgs/12354.svg).
// Ini menjamin animasi yang ditampilkan SELALU sesuai dengan huruf yang
// sedang dibuka user, tidak akan pernah tertukar dengan huruf lain.
// =========================================================================

(function () {
    const SVG_FOLDER = 'stroke-svgs';

    // Cache supaya file SVG yang sama tidak di-fetch berulang kali
    const strokeSvgCache = {};

    // Menyimpan karakter yang sedang aktif di modal (dipakai untuk validasi
    // race-condition saat fetch, dan untuk tombol "Ulangi")
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
            console.warn('Gagal memuat animasi stroke order untuk code point', codePoint, err);
            strokeSvgCache[codePoint] = null;
            return null;
        }
    }

    // Membuat ulang elemen SVG dari teks mentah agar animasi CSS di dalamnya
    // (yang berjalan sekali via "forwards") selalu mulai dari awal setiap
    // kali dirender / di-replay.
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

        // Pisahkan per karakter unicode (menangani kombinasi youon seperti きゃ)
        const chars = Array.from(char);
        const codePoints = chars.map((c) => c.codePointAt(0));

        const svgTexts = await Promise.all(codePoints.map((cp) => fetchStrokeSvg(cp)));

        // Jika user sudah membuka huruf lain sebelum fetch selesai, batalkan
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

    // Ekspos ke global scope supaya bisa dipanggil dari script.js
    window.renderStrokeAnimation = renderStrokeAnimation;
})();
