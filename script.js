// ===== Wait for DOM to load =====
document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Save preference
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Close mobile menu when clicking nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Section links without hash in the URL
    const basePath = window.location.pathname.replace(/index\.html$/, '');
    const sectionIds = ['home', 'hiragana', 'katakana', 'kotoba', 'games'];

    function sectionUrl(id) {
        return id === 'home' ? basePath : basePath + id;
    }

    function goToSection(id, push) {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const url = sectionUrl(id);
        if (push) {
            history.pushState({ section: id }, '', url);
        } else {
            history.replaceState({ section: id }, '', url);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href').slice(1);
            if (!sectionIds.includes(id)) return;
            e.preventDefault();
            goToSection(id, true);
        });
    });

    window.addEventListener('popstate', () => {
        const id = window.location.pathname.replace(basePath, '').replace(/\/$/, '') || 'home';
        goToSection(id, false);
    });

    if (window.location.hash) {
        const id = window.location.hash.slice(1);
        if (sectionIds.includes(id)) {
            setTimeout(() => goToSection(id, false), 0);
        }
    } else {
        const id = window.location.pathname.replace(basePath, '').replace(/\/$/, '');
        if (sectionIds.includes(id)) {
            setTimeout(() => goToSection(id, false), 0);
        }
    }
    
    // Render all kana
    renderKana('hiragana-dasar', hiragana_dasar);
    renderKana('hiragana-dakuten', hiragana_dakuten);
    renderKana('hiragana-handakuten', hiragana_handakuten);
    renderKana('hiragana-youon', hiragana_youon);
    
    renderKana('katakana-dasar', katakana_dasar);
    renderKana('katakana-dakuten', katakana_dakuten);
    renderKana('katakana-handakuten', katakana_handakuten);
    renderKana('katakana-youon', katakana_youon);
    renderKana('katakana-modern', katakana_modern);
    
    // Render kotoba
    renderKotoba();
    setupKotobaFilters();
    setupKotobaSearch();
});

// ===== Render Kana =====
function renderKana(containerId, dataArray) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    dataArray.forEach(item => {
        const kanaItem = document.createElement('div');
        kanaItem.className = 'kana-item';
        kanaItem.innerHTML = `
            <span class="kana-char">${item.char}</span>
            <span class="kana-romaji">${item.romaji}</span>
        `;
        
        kanaItem.addEventListener('click', () => {
            showCharacterModal(item);
        });
        
        container.appendChild(kanaItem);
    });
}

// ===== Character Modal =====
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

    // Render animasi urutan goresan (stroke order) untuk karakter yang dipilih
    if (typeof renderStrokeAnimation === 'function') {
        renderStrokeAnimation(charData.char);
    }
}

function closeModal() {
    document.getElementById('char-modal').classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('char-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// ===== Render Kotoba =====
let currentKotoba = [...kotoba];
let currentFilter = 'all';
let currentPage = 0;
const ITEMS_PER_PAGE = 20; // 20 cards per page (5 kolom x 4 baris)
let kotobaGridFullHeight = 0; // tinggi grid saat halaman penuh, dipakai biar tinggi antar halaman konsisten

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
        // Mode pagination untuk tab Semua
        const totalPages = Math.ceil(kotobaList.length / ITEMS_PER_PAGE);
        if (currentPage >= totalPages) currentPage = 0;

        const start = currentPage * ITEMS_PER_PAGE;
        const pageItems = kotobaList.slice(start, start + ITEMS_PER_PAGE);

        pageItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kotoba-card';
            card.innerHTML = `
                <div class="kotoba-jp">${item.jp}</div>
                <div class="kotoba-romaji">${item.romaji}</div>
                <div class="kotoba-meaning">${item.meaning}</div>
            `;
            container.appendChild(card);
        });

        // Samakan tinggi grid di setiap halaman supaya halaman terakhir yang
        // jumlah kartunya lebih sedikit tidak bikin tinggi halaman menyusut
        // mendadak (ini yang bikin posisi scroll lompat ke section bawahnya)
        if (pageItems.length === ITEMS_PER_PAGE) {
            container.style.minHeight = '';
            kotobaGridFullHeight = container.scrollHeight;
        }
        if (kotobaGridFullHeight) {
            container.style.minHeight = kotobaGridFullHeight + 'px';
        }

        renderPagination(totalPages, kotobaList);
    } else {
        // Mode normal untuk tab kategori — tampil semua tanpa pagination
        removePagination();
        container.style.minHeight = '';
        kotobaList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kotoba-card';
            card.innerHTML = `
                <div class="kotoba-jp">${item.jp}</div>
                <div class="kotoba-romaji">${item.romaji}</div>
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

// ===== Kotoba Filters =====
function setupKotobaFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-filter');
            currentPage = 0; // reset ke halaman pertama saat ganti filter

            // Jika ada pencarian aktif, tetap filter berdasarkan search
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
                    k.romaji.toLowerCase().includes(searchTerm) ||
                    k.meaning.toLowerCase().includes(searchTerm)
                );
            }
            
            renderKotoba(displayed);
        });
    });
}

// ===== Kotoba Search =====
function setupKotobaSearch() {
    const searchInput = document.getElementById('kotoba-search');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        currentPage = 0; // reset halaman saat search
        
        const filtered = currentKotoba.filter(k => {
            return k.jp.includes(searchTerm) ||
                   k.romaji.toLowerCase().includes(searchTerm) ||
                   k.meaning.toLowerCase().includes(searchTerm);
        });
        
        renderKotoba(filtered);
    });
}

// ===== Open Game =====
function openGame(gameType) {
    const base = window.location.pathname.replace(/index\.html$/, '');
    window.open(`${base}game.html?type=${gameType}`, '_blank');
}
