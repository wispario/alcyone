document.addEventListener('DOMContentLoaded', () => {
    // Инициализация темы
    const savedTheme = localStorage.getItem('comic_theme') || 'light';
    applyTheme(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('comic_theme', newTheme);
            updateThemeButtonText(themeToggleBtn, newTheme === 'dark');
        });
        updateThemeButtonText(themeToggleBtn, document.documentElement.classList.contains('dark-theme'));
    }

    // Инициализация кнопки переключения режима отображения
    const modeToggleBtn = document.getElementById('mode-toggle');
    if (modeToggleBtn) {
        let currentMode = localStorage.getItem('comic_view_mode') || 'full';
        updateModeButtonText(modeToggleBtn, currentMode);

        modeToggleBtn.addEventListener('click', () => {
            currentMode = currentMode === 'full' ? 'classic' : 'full';
            localStorage.setItem('comic_view_mode', currentMode);
            updateModeButtonText(modeToggleBtn, currentMode);
            
            // Если находимся на странице читалки, применяем режим на лету
            const imgElement = document.getElementById('comic-page-img');
            if (imgElement) {
                applyViewMode(imgElement, currentMode);
            }
        });
    }

    // Проверка шлюза (/index.html)
    const langButtons = document.querySelectorAll('.lang-btn');
    if (langButtons.length > 0) {
        const savedLang = localStorage.getItem('comic_lang');
        if (savedLang === 'ru') {
            window.location.href = './ru/index.html';
            return;
        } else if (savedLang === 'en') {
            window.location.href = './en/index.html';
            return;
        }

        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                localStorage.setItem('comic_lang', lang);
                window.location.href = `./${lang}/index.html`;
            });
        });
    }

    // Динамический переключатель языка в шапке
    const langSwitchBtn = document.getElementById('lang-switch');
    if (langSwitchBtn) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/ru/')) {
            langSwitchBtn.textContent = 'RU';
        } else if (currentPath.includes('/en/')) {
            langSwitchBtn.textContent = 'EN';
        }

        langSwitchBtn.addEventListener('click', () => {
            if (currentPath.includes('/ru/')) {
                localStorage.setItem('comic_lang', 'en');
                window.location.href = currentPath.replace('/ru/', '/en/');
            } else if (currentPath.includes('/en/')) {
                localStorage.setItem('comic_lang', 'ru');
                window.location.href = currentPath.replace('/en/', '/ru/');
            }
        });
    }
});

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
    }
}

function updateThemeButtonText(btn, isDark) {
    const isRu = window.location.pathname.includes('/ru/');
    if (isDark) {
        btn.textContent = isRu ? '🌙 Темная' : '🌙 Dark';
    } else {
        btn.textContent = isRu ? '☀️ Светлая' : '☀️ Light';
    }
}

function updateModeButtonText(btn, mode) {
    const isRu = window.location.pathname.includes('/ru/');
    if (mode === 'full') {
        btn.textContent = isRu ? '↔️ Ширина' : '↔️ Full';
    } else {
        btn.textContent = isRu ? '🖼️ Обычный' : '🖼️ Fit';
    }
}

function applyViewMode(imgElement, mode) {
    imgElement.classList.remove('mode-full', 'mode-classic');
    if (mode === 'classic') {
        imgElement.classList.add('mode-classic');
    } else {
        imgElement.classList.add('mode-full');
    }
}