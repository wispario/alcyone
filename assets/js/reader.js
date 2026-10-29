document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = parseInt(urlParams.get('ch')) || 1;
    const pageNum = parseInt(urlParams.get('p')) || 1;

    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error('Failed to load config.json');
        const data = await response.json();
        
        const chapterIndex = data.chapters.findIndex(ch => ch.id === chapterId);
        if (chapterIndex === -1) {
            alert('Chapter not found!');
            window.location.href = 'index.html';
            return;
        }

        const chapter = data.chapters[chapterIndex];
        const prevChapter = data.chapters[chapterIndex - 1] || null;
        const nextChapter = data.chapters[chapterIndex + 1] || null;

        initReader(chapter, prevChapter, nextChapter, pageNum, data.chapters);
    } catch (error) {
        console.error('Error loading config:', error);
    }
});

function initReader(chapter, prevChapter, nextChapter, currentPage, allChapters) {
    const imgElement = document.getElementById('comic-page-img');
    const progressBtn = document.getElementById('progress-btn');
    const backBtn = document.getElementById('back-btn');
    const nextChapterBtn = document.getElementById('next-chapter-btn');
    const comicView = document.getElementById('comic-view');
    
    const modal = document.getElementById('pages-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const pagesGrid = document.getElementById('pages-grid');

    // Элементы бокового меню глав (Drawer)
    const chaptersBtn = document.getElementById('chapters-btn');
    const chaptersDrawer = document.getElementById('chapters-drawer');
    const chaptersOverlay = document.getElementById('chapters-overlay');
    const chaptersClose = document.getElementById('chapters-close');
    const chaptersList = document.getElementById('chapters-list');
    const chaptersDrawerTitle = document.getElementById('chapters-drawer-title');

    const isEnglish = window.location.pathname.includes('/en/');

    // Локализация текстов панели глав
    if (chaptersDrawerTitle) chaptersDrawerTitle.textContent = isEnglish ? 'Chapters' : 'Главы';
    if (chaptersBtn) chaptersBtn.textContent = isEnglish ? 'Chapters' : 'Главы';

    // Функция управления боковым меню глав
    function toggleChaptersDrawer() {
        chaptersDrawer.classList.toggle('active');
        chaptersOverlay.classList.toggle('active');
    }

    if (chaptersBtn) chaptersBtn.addEventListener('click', toggleChaptersDrawer);
    if (chaptersClose) chaptersClose.addEventListener('click', toggleChaptersDrawer);
    if (chaptersOverlay) chaptersOverlay.addEventListener('click', toggleChaptersDrawer);

    // Заполнение текстового списка глав
    if (chaptersList) {
        chaptersList.innerHTML = '';
        allChapters.forEach(ch => {
            const item = document.createElement('a');
            item.href = `reader.html?ch=${ch.id}&p=1`;
            item.className = `chapter-drawer-item ${ch.id === chapter.id ? 'active' : ''}`;
            item.textContent = ch.title;
            chaptersList.appendChild(item);
        });
    }

    if (backBtn) {
        if (prevChapter) {
            backBtn.textContent = isEnglish ? '← Previous' : '← Предыдущая';
            backBtn.addEventListener('click', () => {
                window.location.href = `reader.html?ch=${prevChapter.id}&p=1`;
            });
        } else {
            backBtn.textContent = isEnglish ? '← Chapters' : '← Главы';
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    if (nextChapterBtn) {
        if (nextChapter) {
            nextChapterBtn.classList.remove('hidden');
            nextChapterBtn.addEventListener('click', () => {
                window.location.href = `reader.html?ch=${nextChapter.id}&p=1`;
            });
        } else {
            nextChapterBtn.classList.add('hidden');
        }
    }

    function getPageImageUrl(page) {
        const paddedPage = String(page).padStart(2, '0');
        return `chapters/${chapter.folder}/${paddedPage}.${chapter.ext || 'jpg'}`;
    }

    function renderPage(page) {
        if (page > chapter.totalPages) {
            if (nextChapter) {
                window.location.href = `reader.html?ch=${nextChapter.id}&p=1`;
            } else {
                window.location.href = 'index.html';
            }
            return;
        }
        
        if (page < 1) {
            if (prevChapter) {
                window.location.href = `reader.html?ch=${prevChapter.id}&p=${prevChapter.totalPages}`;
            }
            return;
        }

        const newUrl = `?ch=${chapter.id}&p=${page}`;
        window.history.replaceState({ ch: chapter.id, p: page }, '', newUrl);

        currentPage = page;
        imgElement.src = getPageImageUrl(currentPage);
        progressBtn.textContent = `${currentPage} / ${chapter.totalPages}`;
    }

    renderPage(currentPage);

    comicView.addEventListener('click', (e) => {
        const rect = comicView.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        if (clickX < rect.width / 2) {
            renderPage(currentPage - 1);
        } else {
            renderPage(currentPage + 1);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active') || (chaptersDrawer && chaptersDrawer.classList.contains('active'))) return;

        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            renderPage(currentPage + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            renderPage(currentPage - 1);
        }
    });

    let touchStartX = 0;
    comicView.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    comicView.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                renderPage(currentPage + 1);
            } else {
                renderPage(currentPage - 1);
            }
        }
    }, { passive: true });

    progressBtn.addEventListener('click', () => {
        pagesGrid.innerHTML = '';
        for (let i = 1; i <= chapter.totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-jump-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                renderPage(i);
                modal.classList.remove('active');
            });
            pagesGrid.appendChild(btn);
        }
        modal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}