function getVideoPlayerHTML() {
    return `
        <div class="instruction">
            <div class="player-container responsive-player-container">
                <video class="player-background" id="instructionVideo">
                    <source src="assets/test.mp4" type="video/mp4">
                    Ваш браузер не поддерживает видео тег.
                </video>
                <div class="player-overlay">
                    <div class="video-content">
                        <h3>Как пользоваться планером</h3>
                        <p>Краткое руководство по основным функциям</p>
                        <button class="play-button" id="playButton">
                            <svg class="play-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M8 5v14l11-7z" fill="currentColor"/>
                            </svg>
                            Смотреть инструкцию
                        </button>
                    </div>
                </div>
                <div class="video-controls" id="videoControls">
                    <button class="control-btn video-control-icon" id="playPauseBtn">
                        <span class="icon play-icon">▶</span>
                        <span class="icon pause-icon" style="display: none;">⏸</span>
                        <span class="btn-text">Воспр.</span>
                    </button>
                    <div class="progress-container">
                        <div class="progress-bar" id="progressBar">
                            <div class="progress-fill" id="progressFill"></div>
                            <div class="progress-thumb"></div>
                        </div>
                    </div>
                    <div class="time-display">
                        <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                    </div>
                    <div class="volume-controls">
                        <button class="control-btn video-control-icon" id="muteBtn">
                            <span class="icon volume-on">🔊</span>
                            <span class="icon volume-off" style="display: none;">🔇</span>
                            <span class="btn-text">Выкл звук</span>
                        </button>
                    </div>
                    <button class="control-btn video-control-icon" id="fullscreenBtn">
                        <span class="icon fullscreen-icon">⛶</span>
                        <span class="btn-text">Полный экран</span>
                    </button>
                </div>
                <div class="touch-controls-overlay"></div>
            </div>
        </div>
    `;
}

function loadInfoPage() {
    const spheresIcon = document.querySelector('.toolbar-icon[title="Информация"]');
    if (spheresIcon && !spheresIcon.classList.contains('active')) {
        document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
        spheresIcon.classList.add('active');
    }
    // Заголовок
    document.querySelector('.header-title').textContent = 'О компании';
    setHash("info");

    // Хлебные крошки
    const breadcrumbs = document.querySelector('.breadcrumbs');
    breadcrumbs.innerHTML = `
        <div class="breadcrumb-item">Главная</div>
        <div class="breadcrumb-separator">›</div>
        <div class="breadcrumb-item">О компании</div>
    `;

    // Контент основной
    const content = document.querySelector('.content');
    content.innerHTML = `
        <div class="company-info-page">
            <div class="company-info-card">
                <h2>О компании Vincere Psychology</h2>
                <p>Мы создаем инструменты для личностного роста и психологического благополучия. <br> Наше приложение Vinc помогает людям организовывать свою жизнь, ставить цели и достигать их.</p>
                
                <div class="info-section">
                    <h3>Наша миссия</h3>
                    <p>Сделать психологические инструменты доступными для каждого, кто стремится к саморазвитию и личностному росту.</p>
                </div>
                
                <div class="info-section">
                    <h3>Контакты</h3>
                    <div class="contact-item">
                        <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>Email: Vincteam@mail.ru</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Реквизиты компании</h3>
                    <div class="requisites-grid">
                        <div class="requisite-item">
                            <span class="requisite-label">Полное наименование:</span>
                            <span class="requisite-value">ООО «ВИНЦЕРЕ ПСИХОЛОДЖИ»</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">ИНН:</span>
                            <span class="requisite-value">5030109290</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">КПП:</span>
                            <span class="requisite-value">503001001</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">ОГРН:</span>
                            <span class="requisite-value">1255000060171</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">Расчетный счет:</span>
                            <span class="requisite-value">40702810240070001142</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">Банк:</span>
                            <span class="requisite-value">ПАО «Сбербанк»</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">БИК:</span>
                            <span class="requisite-value">044525225</span>
                        </div>
                        <div class="requisite-item">
                            <span class="requisite-label">Корр. счет:</span>
                            <span class="requisite-value">30101810400000000225</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Документы</h3>
                    <div class="documents-list">
                        <a href="privacy.html" target="_blank" class="document-btn">
                            <svg class="document-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Политика конфиденциальности
                        </a>
                        <a href="license.html" target="_blank" class="document-btn">
                            <svg class="document-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Лицензионное соглашение
                        </a>
                        <a href="offert.html" target="_blank" class="document-btn">
                            <svg class="document-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Публичная оферта
                        </a>
                    </div>
                </div>
                <!-- Здесь вставляем плеер -->
                ${getVideoPlayerHTML()}
            </div>
        </div>
    `;

    // Дополнительно вставляем в instruction-container, если он есть
    const instructionContainer = document.querySelector('.instruction-container');
    if (instructionContainer) {
        instructionContainer.innerHTML = getVideoPlayerHTML();
    }

    // Инициализация
    setTimeout(initVideoPlayer, 100);
}

function initVideoPlayer() {
    const video = document.getElementById('instructionVideo');
    const playButton = document.getElementById('playButton');
    const videoOverlay = document.querySelector('.player-overlay');
    const videoControls = document.getElementById('videoControls');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    // Получаем элементы иконок
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    const volumeOn = muteBtn.querySelector('.volume-on');
    const volumeOff = muteBtn.querySelector('.volume-off');
    const playPauseText = playPauseBtn.querySelector('.btn-text');
    const muteText = muteBtn.querySelector('.btn-text');

    // Защита от ошибок
    if (!video || !playButton || !videoControls) {
        console.error('Основные элементы видеоплеера не найдены');
        return;
    }

    const videoContainer = document.querySelector('.player-container');
    let controlsTimeout;
    let isVolumeSliderHovered = false;
    let isSeeking = false;

    // ========== ИНИЦИАЛИЗАЦИЯ МОБИЛЬНОЙ АДАПТАЦИИ ==========
    function updateMobileClasses() {
        if (window.innerWidth <= 768) {
            if (window.innerHeight > window.innerWidth) {
                // Портретная ориентация
                videoContainer.classList.add('mobile-portrait');
                videoContainer.classList.remove('mobile-landscape');
            } else {
                // Ландшафтная ориентация (YT Shorts-style)
                videoContainer.classList.add('mobile-landscape');
                videoContainer.classList.remove('mobile-portrait');
                videoControls.classList.add('visible');
            }
        } else {
            videoContainer.classList.remove('mobile-portrait', 'mobile-landscape');
        }
    }

    // Инициализация и обновление при изменении ориентации
    updateMobileClasses();
    window.addEventListener('resize', updateMobileClasses);
    window.addEventListener('orientationchange', function () {
        setTimeout(updateMobileClasses, 100);
    });

    // ========== СОЗДАНИЕ ПОЛЗУНКА ГРОМКОСТИ ==========
    const volumeSliderContainer = document.createElement('div');
    volumeSliderContainer.className = 'volume-slider-container';
    volumeSliderContainer.innerHTML = `
        <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.1" value="0.7">
    `;
    muteBtn.parentNode.insertBefore(volumeSliderContainer, muteBtn.nextSibling);
    const volumeSlider = document.getElementById('volumeSlider');

    // ========== НАСТРОЙКА ВИДЕО ==========
    // ФИКС: Убираем muted и устанавливаем нормальную громкость
    video.muted = false;
    video.volume = 0.7;
    video.preload = 'metadata';
    video.playsInline = true;

    // ФИКС: Правильное отображение видео
    video.style.objectFit = 'contain';
    video.style.backgroundColor = '#000';

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ВИДЕО ==========
    video.addEventListener('loadedmetadata', function () {
        console.log('Метаданные видео загружены, продолжительность:', video.duration);
        durationEl.textContent = formatTime(video.duration);
        updateMuteButton();
    });

    video.addEventListener('canplaythrough', function () {
        console.log('Видео можно воспроизводить');
    });

    video.addEventListener('waiting', function () {
        showLoading();
    });

    video.addEventListener('playing', function () {
        hideLoading();
    });

    video.addEventListener('error', function (e) {
        console.error('Ошибка видео:', video.error);
        showError('Ошибка загрузки видео');
    });

    video.addEventListener('timeupdate', function () {
        if (!isSeeking && video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            progressFill.style.width = percent + '%';
            currentTimeEl.textContent = formatTime(video.currentTime);
        }
    });

    video.addEventListener('ended', function () {
        videoOverlay.classList.remove('hidden');
        videoControls.classList.remove('visible');
        updatePlayPauseButton(true);
        video.currentTime = 0;
        progressFill.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        if (window.innerWidth > 768) {
            hideControls();
        }
    });

    // ========== ОБРАБОТЧИКИ ЭЛЕМЕНТОВ УПРАВЛЕНИЯ ==========
    // Большая кнопка воспроизведения
    playButton.addEventListener('click', function (e) {
        e.stopPropagation();
        playVideo();
    });

    // Кнопка play/pause
    playPauseBtn.addEventListener('click', togglePlayPause);

    // Кнопка звука
    muteBtn.addEventListener('click', toggleMute);

    // Ползунок громкости
    volumeSlider.addEventListener('input', function () {
        video.volume = volumeSlider.value;
        video.muted = (video.volume === 0);
        updateMuteButton();
    });

    video.addEventListener('volumechange', function () {
        if (!video.muted) {
            volumeSlider.value = video.volume;
        }
        updateMuteButton();
    });

    // Полноэкранный режим
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Прогресс-бар
    progressBar.addEventListener('click', function (e) {
        if (!video.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    });

    // Перетаскивание прогресс-бара
    let isDragging = false;
    progressBar.addEventListener('mousedown', startDragging);
    progressBar.addEventListener('touchstart', startDragging);

    function startDragging(e) {
        if (!video.duration) return;
        isDragging = true;
        isSeeking = true;
        document.addEventListener('mousemove', whileDragging);
        document.addEventListener('touchmove', whileDragging);
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('touchend', stopDragging);
        updateProgress(e);
    }

    function whileDragging(e) {
        if (!isDragging) return;
        updateProgress(e);
    }

    function stopDragging() {
        isDragging = false;
        isSeeking = false;
        document.removeEventListener('mousemove', whileDragging);
        document.removeEventListener('touchmove', whileDragging);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchend', stopDragging);
    }

    function updateProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        let clientX;

        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        progressFill.style.width = (percent * 100) + '%';
        video.currentTime = percent * video.duration;
        currentTimeEl.textContent = formatTime(video.currentTime);
    }

    // ========== УПРАВЛЕНИЕ ОТОБРАЖЕНИЕМ КОНТРОЛОВ ==========
    function showControls() {
        videoControls.classList.add('visible');
        clearTimeout(controlsTimeout);

        if (!video.paused && window.innerWidth > 768) {
            controlsTimeout = setTimeout(hideControls, 3000);
        }
    }

    function hideControls() {
        if (window.innerWidth <= 768 || video.paused || isDragging) return;
        videoControls.classList.remove('visible');
    }

    // События для показа/скрытия контролов
    videoContainer.addEventListener('mouseenter', showControls);
    videoContainer.addEventListener('mouseleave', function () {
        if (!video.paused && window.innerWidth > 768) {
            controlsTimeout = setTimeout(hideControls, 1000);
        }
    });

    videoContainer.addEventListener('mousemove', function () {
        if (window.innerWidth > 768) {
            showControls();
        }
    });

    videoContainer.addEventListener('click', function (e) {
        if (e.target === video || e.target.classList.contains('touch-controls-overlay')) {
            togglePlayPause();
        }
    });

    video.addEventListener('dblclick', toggleFullscreen);

    // Сенсорные события для мобильных
    videoContainer.addEventListener('touchstart', function () {
        videoContainer.classList.add('controls-visible');
        showControls();
        clearTimeout(controlsTimeout);

        if (!video.paused) {
            controlsTimeout = setTimeout(function () {
                videoContainer.classList.remove('controls-visible');
                if (window.innerWidth > 768) hideControls();
            }, 3000);
        }
    });

    // ========== ГОРЯЧИЕ КЛАВИШИ ==========
    document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!videoContainer.contains(document.activeElement) && document.activeElement !== document.body) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 5);
                showControls();
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                showControls();
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume;
                updateMuteButton();
                showControls();
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume;
                updateMuteButton();
                showControls();
                break;
        }
    });

    // ========== ПОЛНОЭКРАННЫЙ РЕЖИМ ==========
    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

        if (isFullscreen) {
            videoContainer.classList.add('fullscreen');
            showControls();
        } else {
            videoContainer.classList.remove('fullscreen');
            if (window.innerWidth > 768 && !video.paused) {
                controlsTimeout = setTimeout(hideControls, 3000);
            }
        }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // ========== УПРАВЛЕНИЕ ПОЛЗУНКОМ ГРОМКОСТИ ==========
    muteBtn.addEventListener('mouseenter', function () {
        volumeSliderContainer.classList.add('visible');
    });

    muteBtn.addEventListener('mouseleave', function () {
        if (!isVolumeSliderHovered) {
            volumeSliderContainer.classList.remove('visible');
        }
    });

    volumeSliderContainer.addEventListener('mouseenter', function () {
        isVolumeSliderHovered = true;
        volumeSliderContainer.classList.add('visible');
    });

    volumeSliderContainer.addEventListener('mouseleave', function () {
        isVolumeSliderHovered = false;
        volumeSliderContainer.classList.remove('visible');
    });

    // ========== ОСНОВНЫЕ ФУНКЦИИ ВОСПРОИЗВЕДЕНИЯ ==========
    function playVideo() {
        console.log('Запуск видео...');

        // Включаем звук
        video.muted = false;
        video.volume = 0.7;
        volumeSlider.value = 0.7;

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Видео успешно запущено');
                videoOverlay.classList.add('hidden');
                videoControls.classList.add('visible');
                updatePlayPauseButton(false);
                updateMuteButton();

                if (window.innerWidth > 768) {
                    controlsTimeout = setTimeout(hideControls, 3000);
                }
            }).catch(error => {
                console.error('Ошибка воспроизведения:', error);
                // Пробуем с autoplay и muted
                video.muted = true;
                video.play().then(() => {
                    console.log('Видео запущено без звука (autoplay fallback)');
                    videoOverlay.classList.add('hidden');
                    videoControls.classList.add('visible');
                    updatePlayPauseButton(false);
                    updateMuteButton();
                }).catch(error => {
                    console.error('Полная ошибка воспроизведения:', error);
                    showError('Не удалось воспроизвести видео. Нажмите на кнопку воспроизведения.');
                });
            });
        }
    }

    function togglePlayPause() {
        if (video.paused || video.ended) {
            video.play().then(() => {
                updatePlayPauseButton(false);
                if (window.innerWidth > 768) {
                    controlsTimeout = setTimeout(hideControls, 3000);
                }
            }).catch(error => {
                console.error('Ошибка при воспроизведении:', error);
            });
        } else {
            video.pause();
            updatePlayPauseButton(true);
            showControls();
        }
    }

    function toggleMute() {
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) {
            video.volume = 0.5;
            volumeSlider.value = 0.5;
        }
        updateMuteButton();
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function updatePlayPauseButton(isPaused) {
        if (isPaused) {
            if (playIcon) playIcon.style.display = 'inline';
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (playPauseText) playPauseText.textContent = 'Воспр.';
        } else {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'inline';
            if (playPauseText) playPauseText.textContent = 'Пауза';
        }
    }

    function updateMuteButton() {
        if (video.muted || video.volume === 0) {
            if (volumeOn) volumeOn.style.display = 'none';
            if (volumeOff) volumeOff.style.display = 'inline';
            if (muteText) muteText.textContent = 'Вкл звук';
            if (volumeSlider) volumeSlider.value = 0;
        } else {
            if (volumeOn) volumeOn.style.display = 'inline';
            if (volumeOff) volumeOff.style.display = 'none';
            if (muteText) muteText.textContent = 'Выкл звук';
            if (volumeSlider) volumeSlider.value = video.volume;
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function showLoading() {
        if (!document.querySelector('.loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner"></div>
                <span>Загрузка...</span>
            `;
            videoContainer.appendChild(spinner);
        }
    }

    function hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    function showError(message) {
        hideLoading();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">OK</button>
        `;
        videoContainer.appendChild(errorDiv);
    }

    // Инициализация завершена
    console.log('Видеоплеер инициализирован');
}
