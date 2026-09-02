const initialHash = window.location.hash;

const romajiKanaTable = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
    sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
    ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
    cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
    ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
    hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
    wa: 'わ', wo: 'を',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
    za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ'
};

const kanaOverrides = {
    kinyoubi: 'きんようび',
    senen: 'せんえん',
    ichimanen: 'いちまんえん'
};

function romajiToHiragana(text) {
    const s = text.toLowerCase().replace(/[^a-z]/g, '');

    if (kanaOverrides[s]) {
        return kanaOverrides[s];
    }

    let out = '';
    let i = 0;

    while (i < s.length) {
        const c = s[i];
        const nextChar = s[i + 1];

        if (c === nextChar && c !== 'n' && 'kstpgzdb'.includes(c)) {
            out += 'っ';
            i += 1;
            continue;
        }

        let found = false;
        for (let len = 3; len >= 1; len--) {
            const chunk = s.substr(i, len);
            if (romajiKanaTable[chunk]) {
                out += romajiKanaTable[chunk];
                i += len;
                found = true;
                break;
            }
        }
        if (found) continue;

        if (c === 'n') {
            out += 'ん';
            i += 1;
            continue;
        }

        i += 1;
    }

    return out;
}

function romajiToKanaDisplay(romaji) {
    const list = Array.isArray(romaji) ? romaji : [romaji];
    return list.map(romajiToHiragana).join(' / ');
}

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
    
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('[data-game-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            openGame(btn.getAttribute('data-game-type'));
        });
    });

    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    renderKana('hiragana-dasar', hiragana_dasar);
    renderKana('hiragana-dakuten', hiragana_dakuten);
    renderKana('hiragana-handakuten', hiragana_handakuten);
    renderKana('hiragana-youon', hiragana_youon);
    
    renderKana('katakana-dasar', katakana_dasar);
    renderKana('katakana-dakuten', katakana_dakuten);
    renderKana('katakana-handakuten', katakana_handakuten);
    renderKana('katakana-youon', katakana_youon);
    renderKana('katakana-modern', katakana_modern);
    
    renderKotoba();
    setupKotobaFilters();
    setupKotobaSearch();

    renderKanjiFilters();
    renderKanjiList();
    setupKanjiSearch();

    try {
        if (initialHash) {
            const target = document.querySelector(initialHash);
            if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    } finally {
        document.documentElement.classList.remove('has-hash-target');
    }
});

const gojuonRows = [
    { label: 'A', count: 5 },
    { label: 'K', count: 5 },
    { label: 'S', count: 5 },
    { label: 'T', count: 5 },
    { label: 'N', count: 5 },
    { label: 'H', count: 5 },
    { label: 'M', count: 5 },
    { label: 'Y', count: 3 },
    { label: 'R', count: 5 },
    { label: 'W', count: 2 },
    { label: 'N', count: 1 }
];

const dakutenRows = [
    { label: 'G', count: 5 },
    { label: 'Z', count: 5 },
    { label: 'D', count: 5 },
    { label: 'B', count: 5 }
];

const handakutenRows = [
    { label: 'P', count: 5 }
];

const youonRows = [
    { label: 'K', count: 3 },
    { label: 'S', count: 3 },
    { label: 'T', count: 3 },
    { label: 'N', count: 3 },
    { label: 'H', count: 3 },
    { label: 'M', count: 3 },
    { label: 'R', count: 3 },
    { label: 'G', count: 3 },
    { label: 'Z', count: 3 },
    { label: 'D', count: 3 },
    { label: 'B', count: 3 },
    { label: 'P', count: 3 }
];

const modernRows = [
    { label: 'W', count: 3 },
    { label: 'V', count: 5 },
    { label: 'F', count: 5 },
    { label: 'TS', count: 4 },
    { label: 'T', count: 2 },
    { label: 'D', count: 3 },
    { label: '・', count: 3 }
];

function buildKanaItem(item) {
    const kanaItem = document.createElement('div');
    kanaItem.className = 'kana-item';
    kanaItem.innerHTML = `
        <span class="kana-char">${item.char}</span>
        <span class="kana-romaji">${item.romaji}</span>
    `;
    kanaItem.addEventListener('click', () => {
        showCharacterModal(item);
    });
    return kanaItem;
}

function renderKana(containerId, dataArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const rowsByGroup = {
        dasar: gojuonRows,
        dakuten: dakutenRows,
        handakuten: handakutenRows,
        youon: youonRows,
        modern: modernRows
    };
    const group = containerId.split('-')[1];
    const rows = rowsByGroup[group];

    if (rows) {
        let cursor = 0;
        rows.forEach(rowInfo => {
            const rowItems = dataArray.slice(cursor, cursor + rowInfo.count);
            cursor += rowInfo.count;
            if (rowItems.length === 0) return;

            const row = document.createElement('div');
            row.className = 'gojuon-row';

            const label = document.createElement('div');
            label.className = 'gojuon-row-label';
            label.textContent = rowInfo.label;
            row.appendChild(label);

            const itemsWrap = document.createElement('div');
            itemsWrap.className = 'gojuon-row-items';
            rowItems.forEach(item => {
                itemsWrap.appendChild(buildKanaItem(item));
            });
            row.appendChild(itemsWrap);

            container.appendChild(row);
        });
        return;
    }

    dataArray.forEach(item => {
        container.appendChild(buildKanaItem(item));
    });
}

function showCharacterModal(charData) {
    const modal = document.getElementById('char-modal');
    const modalChar = document.getElementById('modal-char');
    const modalRomaji = document.getElementById('modal-romaji');
    const modalMeaning = document.getElementById('modal-meaning');
    
    modalChar.textContent = charData.char;
    modalRomaji.textContent = charData.romaji.toUpperCase();
    modalMeaning.textContent = '';
    modalMeaning.style.display = 'none';
    
    modal.classList.add('active');

    if (typeof renderStrokeAnimation === 'function') {
        renderStrokeAnimation(charData.char);
    }
}

function closeModal() {
    document.getElementById('char-modal').classList.remove('active');
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('char-modal');
    if (e.target === modal) {
        closeModal();
    }
});

let currentKotoba = [...kotoba];
let currentFilter = 'all';
let currentPage = 0;
const ITEMS_PER_PAGE = 18;
let kotobaGridFullHeight = 0;

function isKatakanaWord(text) {
    return Array.from(text).some(ch => ch >= '\u30A0' && ch <= '\u30FF');
}

function matchesKotobaFilter(item, filter) {
    if (item.category === filter) return true;
    if (filter === 'katakana' && isKatakanaWord(item.jp)) return true;
    return false;
}

function renderKotoba(kotobaList = currentKotoba) {
    const container = document.getElementById('kotoba-list');
    if (!container) return;

    container.innerHTML = '';

    if (kotobaList.length === 0) {
        container.innerHTML = '<p class="kotoba-empty">Tidak ada kotoba yang ditemukan</p>';
        removePagination();
        container.style.minHeight = '';
        return;
    }

    if (currentFilter === 'all') {
        const totalPages = Math.ceil(kotobaList.length / ITEMS_PER_PAGE);
        if (currentPage >= totalPages) currentPage = 0;

        const start = currentPage * ITEMS_PER_PAGE;
        const pageItems = kotobaList.slice(start, start + ITEMS_PER_PAGE);

        pageItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kotoba-card';
            card.innerHTML = `
                <div class="kotoba-jp">${item.jp}</div>
                <div class="kotoba-romaji">${romajiText(item.romaji)}</div>
                <div class="kotoba-meaning">${item.meaning}</div>
            `;
            container.appendChild(card);
        });

        if (pageItems.length === ITEMS_PER_PAGE) {
            container.style.minHeight = '';
            kotobaGridFullHeight = container.scrollHeight;
        }
        if (kotobaGridFullHeight) {
            container.style.minHeight = kotobaGridFullHeight + 'px';
        }

        renderPagination(totalPages, kotobaList);
    } else {
        removePagination();
        container.style.minHeight = '';
        kotobaList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kotoba-card';
            card.innerHTML = `
                <div class="kotoba-jp">${item.jp}</div>
                <div class="kotoba-romaji">${romajiText(item.romaji)}</div>
                <div class="kotoba-meaning">${item.meaning}</div>
            `;
            container.appendChild(card);
        });
    }
}

function renderPagination(totalPages, kotobaList) {
    removePagination();
    if (totalPages <= 1) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'kotoba-pagination';
    wrapper.id = 'kotoba-pagination';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'pagination-btn' + (currentPage === 0 ? ' disabled' : '');
    prevBtn.innerHTML = '&#8592;';
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentPage > 0) {
            const scrollY = window.scrollY;
            currentPage--;
            renderKotoba(kotobaList);
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
    });

    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'pagination-btn' + (currentPage === totalPages - 1 ? ' disabled' : '');
    nextBtn.innerHTML = '&#8594;';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentPage < totalPages - 1) {
            const scrollY = window.scrollY;
            currentPage++;
            renderKotoba(kotobaList);
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
    });

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(pageInfo);
    wrapper.appendChild(nextBtn);

    const gridContainer = document.getElementById('kotoba-list');
    gridContainer.insertAdjacentElement('afterend', wrapper);
}

function removePagination() {
    const existing = document.getElementById('kotoba-pagination');
    if (existing) existing.remove();
}

function romajiText(romaji) {
    return Array.isArray(romaji) ? romaji.join(' / ') : romaji;
}

function setupKotobaFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-filter');
            currentPage = 0;

            const searchTerm = document.getElementById('kotoba-search').value.toLowerCase();

            if (currentFilter === 'all') {
                currentKotoba = [...kotoba];
            } else {
                currentKotoba = kotoba.filter(k => matchesKotobaFilter(k, currentFilter));
            }

            let displayed = currentKotoba;
            if (searchTerm) {
                displayed = currentKotoba.filter(k =>
                    k.jp.includes(searchTerm) ||
                    romajiText(k.romaji).toLowerCase().includes(searchTerm) ||
                    k.meaning.toLowerCase().includes(searchTerm)
                );
            }
            
            renderKotoba(displayed);
        });
    });
}

function setupKotobaSearch() {
    const searchInput = document.getElementById('kotoba-search');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        currentPage = 0;
        
        const filtered = currentKotoba.filter(k => {
            return k.jp.includes(searchTerm) ||
                   romajiText(k.romaji).toLowerCase().includes(searchTerm) ||
                   k.meaning.toLowerCase().includes(searchTerm);
        });
        
        renderKotoba(filtered);
    });
}

function openGame(gameType) {
    const rootBase = window.location.pathname.split('/').slice(0, 2).join('/') + '/';
    window.location.href = `${rootBase}game.html?type=${gameType}`;
}

function normalizeKanjiCategory(category) {
    return category.replace(/_/g, ' ').trim().toLowerCase();
}

function prettifyKanjiCategory(category) {
    const normalized = normalizeKanjiCategory(category);
    return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
}

let currentKanjiFilter = 'all';
let currentKanjiPage = 0;
let kanjiGridFullHeight = 0;

function renderKanjiFilters() {
    const container = document.getElementById('kanji-filters');
    if (!container) return;

    const seen = new Map();
    kanji.forEach((item) => {
        const key = normalizeKanjiCategory(item.category);
        if (!seen.has(key)) {
            seen.set(key, prettifyKanjiCategory(item.category));
        }
    });

    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'kanji-filter-btn active';
    allBtn.setAttribute('data-filter', 'all');
    allBtn.textContent = 'Semua';
    container.appendChild(allBtn);

    Array.from(seen.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .forEach(([key, label]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'kanji-filter-btn';
            btn.setAttribute('data-filter', key);
            btn.textContent = label;
            container.appendChild(btn);
        });

    container.querySelectorAll('.kanji-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.kanji-filter-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentKanjiFilter = btn.getAttribute('data-filter');
            currentKanjiPage = 0;
            renderKanjiList();
        });
    });
}

function buildKanjiCard(item) {
    const card = document.createElement('div');
    card.className = 'kanji-card';
    card.innerHTML = `
        <div class="kanji-jp">${item.jp}</div>
        <div class="kanji-romaji">${romajiText(item.romaji)}</div>
        <div class="kanji-meaning">${item.meaning}</div>
    `;
    card.addEventListener('click', () => {
        showKanjiModal(item);
    });
    return card;
}

function renderKanjiList() {
    const container = document.getElementById('kanji-list');
    if (!container) return;

    const searchInput = document.getElementById('kanji-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let list = currentKanjiFilter === 'all'
        ? [...kanji]
        : kanji.filter((k) => normalizeKanjiCategory(k.category) === currentKanjiFilter);

    if (searchTerm) {
        list = list.filter((k) =>
            k.jp.includes(searchTerm) ||
            romajiText(k.romaji).toLowerCase().includes(searchTerm) ||
            k.meaning.toLowerCase().includes(searchTerm)
        );
    }

    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="kanji-empty">Tidak ada kanji yang ditemukan</p>';
        removeKanjiPagination();
        container.style.minHeight = '';
        return;
    }

    if (currentKanjiFilter === 'all' && !searchTerm) {
        const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
        if (currentKanjiPage >= totalPages) currentKanjiPage = 0;

        const start = currentKanjiPage * ITEMS_PER_PAGE;
        const pageItems = list.slice(start, start + ITEMS_PER_PAGE);

        pageItems.forEach((item) => {
            container.appendChild(buildKanjiCard(item));
        });

        if (pageItems.length === ITEMS_PER_PAGE) {
            container.style.minHeight = '';
            kanjiGridFullHeight = container.scrollHeight;
        }
        if (kanjiGridFullHeight) {
            container.style.minHeight = kanjiGridFullHeight + 'px';
        }

        renderKanjiPagination(totalPages);
    } else {
        removeKanjiPagination();
        container.style.minHeight = '';
        list.forEach((item) => {
            container.appendChild(buildKanjiCard(item));
        });
    }
}

function renderKanjiPagination(totalPages) {
    removeKanjiPagination();
    if (totalPages <= 1) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'kanji-pagination';
    wrapper.id = 'kanji-pagination';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'pagination-btn' + (currentKanjiPage === 0 ? ' disabled' : '');
    prevBtn.innerHTML = '&#8592;';
    prevBtn.disabled = currentKanjiPage === 0;
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentKanjiPage > 0) {
            const scrollY = window.scrollY;
            currentKanjiPage--;
            renderKanjiList();
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
    });

    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${currentKanjiPage + 1} / ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'pagination-btn' + (currentKanjiPage === totalPages - 1 ? ' disabled' : '');
    nextBtn.innerHTML = '&#8594;';
    nextBtn.disabled = currentKanjiPage === totalPages - 1;
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentKanjiPage < totalPages - 1) {
            const scrollY = window.scrollY;
            currentKanjiPage++;
            renderKanjiList();
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
    });

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(pageInfo);
    wrapper.appendChild(nextBtn);

    const gridContainer = document.getElementById('kanji-list');
    gridContainer.insertAdjacentElement('afterend', wrapper);
}

function removeKanjiPagination() {
    const existing = document.getElementById('kanji-pagination');
    if (existing) existing.remove();
}

function setupKanjiSearch() {
    const searchInput = document.getElementById('kanji-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        currentKanjiPage = 0;
        renderKanjiList();
    });
}

function showKanjiModal(item) {
    const modal = document.getElementById('char-modal');
    const modalChar = document.getElementById('modal-char');
    const modalRomaji = document.getElementById('modal-romaji');
    const modalMeaning = document.getElementById('modal-meaning');

    modalChar.textContent = item.jp;
    modalChar.classList.toggle('char-big-small', Array.from(item.jp).length > 2);
    modalRomaji.textContent = romajiText(item.romaji).toUpperCase() + ' / ' + romajiToKanaDisplay(item.romaji);

    if (item.meaning) {
        modalMeaning.textContent = item.meaning;
        modalMeaning.style.display = '';
    } else {
        modalMeaning.textContent = '';
        modalMeaning.style.display = 'none';
    }

    modal.classList.add('active');

    if (typeof renderStrokeAnimation === 'function') {
        renderStrokeAnimation(item.jp);
    }
}
