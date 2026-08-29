const initialHash = window.location.hash;

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
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
        youon: youonRows
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
    const strokeDesc = document.getElementById('stroke-desc');
    const strokeVisual = document.getElementById('stroke-visual');
    
    modalChar.textContent = charData.char;
    modalRomaji.textContent = charData.romaji.toUpperCase();
    
    if (charData.strokes) {
        strokeDesc.textContent = charData.strokes;
        strokeVisual.innerHTML = iconSvg('icon-pencil') + 'Tulis huruf ini dengan mengikuti urutan goresan dari atas ke bawah dan kiri ke kanan';
    } else {
        strokeDesc.textContent = 'Urutan penulisan sama dengan huruf dasarnya';
        strokeVisual.innerHTML = iconSvg('icon-bulb') + 'Ikuti urutan penulisan huruf dasar, lalu tambahkan tanda dakuten/handakuten di akhir';
    }
    
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
const ITEMS_PER_PAGE = 20;
let kotobaGridFullHeight = 0;

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
                currentKotoba = kotoba.filter(k => k.category === currentFilter);
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
