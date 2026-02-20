class ChatManager {
    constructor() {
        this.originalContent = null;
        this.originalRightMenu = null;
        this.callState = {
            active: false,
            type: null, // 'audio' или 'video'
            timer: null,
            duration: 0,
            accepted: false
        };
        this.setupToolbarListeners();
        this.isChatOpen = false; // Флаг для отслеживания открытого чата
        this.currentChatId = null; // ID текущего открытого чата
    }

    // (!!!БЭК!!!) Инициализация данных чатов - здесь должна быть загрузка данных с сервера
    // Вместо хардкодинга данных нужно сделать запрос к API для получения списка чатов
    // Пример: GET /api/chats

    async initChats() {
        if (Chat.all.length === 0) {
            await Chat.fetchAll();
            Chat.all.forEach(chat => {
                chat.onNewMessage = (msg) => this.showNewMessage(msg);
            });
        }
    }

    setupToolbarListeners() {
        // Закрываем чат при клике на любую иконку тулбара, кроме чата
        document.querySelectorAll('.toolbar-icon:not([title="Чат"])').forEach(icon => {
            icon.addEventListener('click', () => this.closeChatIfOpen());
        });
    }

    closeChatIfOpen() {
        if (document.querySelector('.chat-container')) {
            this.resetChatState();
            const chatIcon = document.querySelector('.toolbar-icon[title="Чат"]');
            if (chatIcon) chatIcon.classList.remove('active');
        }
    }

    toggleChat(e) {
        e.preventDefault();
        e.stopPropagation();

        const chatIcon = e.currentTarget;
        const isChatOpen = document.querySelector('.chat-container');

        // Удаляем active у всех иконок
        document.querySelectorAll('.toolbar-icon').forEach(icon => {
            icon.classList.remove('active');
        });

        if (isChatOpen) {
            this.resetChatState();
        } else {
            this.loadChatPage();
            chatIcon.classList.add('active');
        }
    }

    resetChatState() {
        // Удаляем контейнер чата и список чатов
        document.querySelectorAll('.chat-container, .chat-list-container').forEach(el => el.remove());

        // Удаляем стили чатов
        document.querySelectorAll('style[data-chat-style]').forEach(s => s.remove());

        // Обновляем заголовок
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = 'Сферы';
        }

        // Возвращаем URL к предыдущему состоянию
        if (window.location.hash === '#chats') {
            history.replaceState(null, '', '#sphere-health');
        }

        // Сбрасываем активность иконки чата
        const chatIcon = document.querySelector('.toolbar-icon[title="Чат"]');
        if (chatIcon) {
            chatIcon.classList.remove('active');
        }
    }

    loadChatPage() {
        const spheresIcon = document.querySelector('.toolbar-icon[title="Чат"]');
        if (spheresIcon && !spheresIcon.classList.contains('active')) {
            document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
            spheresIcon.classList.add('active');
        }
        sphereManager.updateHeaderTitle("Чаты");
        setHash("chats");

        // Сохраняем оригинальное содержимое, если еще не сохранено
        if (!this.originalContent) {
            const content = document.querySelector('.content');
            this.originalContent = {
                html: content.innerHTML,
                class: content.className
            };
        }

        // Сохраняем оригинальное правое меню, если еще не сохранено
        if (!this.originalRightMenu) {
            const rightMenu = document.querySelector('.right-menu');
            this.originalRightMenu = {
                html: rightMenu.innerHTML,
                class: rightMenu.className
            };
        }

        // Очищаем основное содержимое
        const content = document.querySelector('.content');
        content.innerHTML = '';
        content.className = 'content'; // Сбрасываем классы

        // Обновляем заголовок в хедере
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = 'Чаты';
        }

        // Загружаем страницу-заглушку вместо интерфейса чатов
        this.loadComingSoonPage();

        // Обновляем URL без перезагрузки страницы
        if (window.location.hash !== '#chats') {
            history.pushState(null, '', '#chats');
        }
    }

    loadComingSoonPage() {
        const content = document.querySelector('.content');
        
        // Вставляем HTML страницы-заглушки
        content.innerHTML = `
            <div class="coming-soon-wrapper">

                              <div class="container">
                <a href="landing.html" class="logo-link" style="display: contents;">
                  <img class="logo" style="                
                  width: 100%;
                  max-width: 290px;
                  height: auto;
                  margin-bottom: 1.5rem;" 
                  src="assets/landing/Vinc-main-light.png" alt="Vinc Logo">
                </a>    
                
                <h1 class="coming-soon-title">Скоро мы запустим этот раздел</h1>
                
                <p class="coming-soon-subtitle">Где вы сможете связаться с выбранным специалистом для решения ваших вопросов.</p>
                
                <div class="features">
                  <div class="feature">
                    <div class="feature-icon">⚡️</div>
                    <div class="feature-title">Мгновенно</div>
                    <div class="feature-desc">Быстрая отправка и доставка сообщений</div>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Конфиденциально</div>
                    <div class="feature-desc">Все сообщения защищены шифрованием</div>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">Простое общение</div>
                    <div class="feature-desc">Общайтесь в любое время с любого устройства</div>
                  </div>
                </div>
                
                <h2 class="contact-title">Свяжитесь с нами</h2>
                
                <div class="social-links">
                  <a href="https://vk.com/vincere.psychology" class="social-link"><img src="assets/landing/vk-icon.svg" alt="Вконтакте"></a>
                  <a href="https://t.me/+36yqFws00fAyYWIy" class="social-link"><img src="assets/landing/telegram-icon.svg" alt="Telegram"></a>
                  <a href="Vincteam@mail.ru" class="social-link"><img src="assets/landing/email-icon.svg" alt="E-mail"></a>
                  <a href="https://www.youtube.com/channel/UCC_A_tpczf9aT3HHFYgLtYA" class="social-link"><img src="assets/landing/youtube-icon.svg" alt="YouTube"></a>
                  <a href="https://www.instagram.com/vincere.psy?igsh=MWppZjJjZTc3dXo2cg%3D%3D&utm_source=qr" class="social-link"><img src="assets/landing/instagram-icon.svg" alt="Instagram"></a>
                </div>
              </div>
            </div>
        `;

        // Добавляем стили для страницы-заглушки
        this.addComingSoonStyles();

        // Инициализируем функциональность страницы-заглушки
        this.initComingSoonFunctionality();
    }

    addComingSoonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .coming-soon-wrapper {
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                color: #00394C;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
            }

            /* Видеофон */
            .coming-soon-wrapper .video-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                overflow: hidden;
            }

            .coming-soon-wrapper .video-background {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                min-width: 100%;
                min-height: 100%;
                width: auto;
                height: auto;
                object-fit: cover;
                opacity: 0.7;
            }

            .coming-soon-wrapper .video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                background-color: rgba(255, 255, 255, 0.6);
            }
            
            /* Скрытие на мобильных устройствах */
            @media (max-width: 768px) {
                .coming-soon-wrapper .video-container {
                    display: none;
                }
                
                .coming-soon-wrapper .video-overlay {
                    display: none;
                }
            }

            .coming-soon-wrapper .container {
                width: 90%;
                max-width: 1200px;
                margin: 0 auto;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 2rem 0;
                position: relative;
                z-index: 3;
            }

            .coming-soon-wrapper .logo {
                width: 100%;
                max-width: 290px;
                height: auto;
                margin-bottom: 1.5rem;
            }

            .coming-soon-wrapper .coming-soon-title {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: #00394C;
                line-height: 1.2;
            }

            .coming-soon-wrapper .coming-soon-subtitle {
                font-size: 1.3rem;
                margin-bottom: 1.5rem;
                color: #00394C;
                max-width: 600px;
                line-height: 1.5;
            }

            .coming-soon-wrapper .features {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }

            .coming-soon-wrapper .feature {
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                padding: 1.5rem;
                width: 180px;
                box-shadow: 0 4px 12px rgba(0, 57, 76, 0.1);
            }

            .coming-soon-wrapper .feature-icon {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }

            .coming-soon-wrapper .feature-title {
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .coming-soon-wrapper .countdown {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }

            .coming-soon-wrapper .countdown-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                padding: 1rem;
                min-width: 80px;
                box-shadow: 0 4px 12px rgba(0, 57, 76, 0.1);
            }

            .coming-soon-wrapper .countdown-value {
                font-size: 2rem;
                font-weight: 700;
                color: #00394C;
            }

            .coming-soon-wrapper .countdown-label {
                font-size: 0.9rem;
                color: #666;
            }

            .coming-soon-wrapper .email-form {
                width: 100%;
                max-width: 500px;
                margin-bottom: 2rem;
            }

            .coming-soon-wrapper .email-input {
                width: 100%;
                padding: 0.8rem;
                border: 2px solid #00394C;
                border-radius: 12px;
                font-size: 1rem;
                margin-bottom: 1rem;
                font-family: 'Inter', sans-serif;
                box-sizing: border-box;
                transition: all 0.3s ease;
            }

            .coming-soon-wrapper .email-input:focus {
                outline: none;
                border-color: #0077B6;
                box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2);
            }

            .coming-soon-wrapper .submit-btn {
                width: 100%;
                background-color: #0077B6;
                color: white;
                border: none;
                padding: 0.8rem;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
            }

            .coming-soon-wrapper .submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 119, 182, 0.3);
                background-color: #005A87;
            }

            .coming-soon-wrapper .contact-title {
                font-size: 1.3rem;
                margin-bottom: 1.2rem;
                color: #00394C;
            }

            .coming-soon-wrapper .social-links {
                display: flex;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .coming-soon-wrapper .social-link img {
                width: 40px;
                height: 40px;
                transition: transform 0.3s ease;
            }

            .coming-soon-wrapper .social-link:hover img {
                transform: translateY(-5px);
            }

            /* Мобильная адаптация */
            @media (max-width: 768px) {
                .coming-soon-wrapper .container {
                    padding: 1.5rem 0;
                }
                
                .coming-soon-wrapper .logo {
                    max-width: 220px;
                    margin-bottom: 1rem;
                }
                
                .coming-soon-wrapper .coming-soon-title {
                    font-size: 1.8rem;
                    margin-bottom: 0.8rem;
                }
                
                .coming-soon-wrapper .coming-soon-subtitle {
                    font-size: 1.1rem;
                    margin-bottom: 1.2rem;
                }
                
                .coming-soon-wrapper .features {
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .coming-soon-wrapper .feature {
                    width: 140px;
                    padding: 1rem;
                }
                
                .coming-soon-wrapper .feature-icon {
                    font-size: 2rem;
                }
                
                .coming-soon-wrapper .countdown {
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                
                .coming-soon-wrapper .countdown-item {
                    min-width: 60px;
                    padding: 0.8rem;
                }
                
                .coming-soon-wrapper .countdown-value {
                    font-size: 1.5rem;
                }
                
                .coming-soon-wrapper .countdown-label {
                    font-size: 0.7rem;
                }
                
                .coming-soon-wrapper .email-form {
                    margin-bottom: 1.5rem;
                }
                
                .coming-soon-wrapper .email-input, .coming-soon-wrapper .submit-btn {
                    padding: 0.7rem;
                }
                
                .coming-soon-wrapper .contact-title {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                }
                
                .coming-soon-wrapper .social-link img {
                    width: 35px;
                    height: 35px;
                }
            }

            @media (max-width: 480px) {
                .coming-soon-wrapper .coming-soon-title {
                    font-size: 1.5rem;
                }
                
                .coming-soon-wrapper .features {
                    flex-direction: column;
                    align-items: center;
                }
                
                .coming-soon-wrapper .feature {
                    width: 100%;
                    max-width: 250px;
                }
                
                .coming-soon-wrapper .countdown-value {
                    font-size: 1.2rem;
                }
                
                .coming-soon-wrapper .social-links {
                    gap: 0.8rem;
                }
                
                .coming-soon-wrapper .social-link img {
                    width: 30px;
                    height: 30px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initComingSoonFunctionality() {
        // Обратный отсчет до 15 октября 2025 года
        const updateCountdown = () => {
            const targetDate = new Date('October 15, 2025 00:00:00').getTime();
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                document.getElementById('days').innerText = '00';
                document.getElementById('hours').innerText = '00';
                document.getElementById('minutes').innerText = '00';
                document.getElementById('seconds').innerText = '00';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('days').innerText = days.toString().padStart(2, '0');
            document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
        };

        // Обновляем счетчик каждую секунду
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Обработка формы подписки
        const submitBtn = document.querySelector('.coming-soon-wrapper .submit-btn');
        const emailInput = document.querySelector('.coming-soon-wrapper .email-input');

        if (submitBtn && emailInput) {
            submitBtn.addEventListener('click', function() {
                const email = emailInput.value;
                if (email && email.includes('@')) {
                    alert('Спасибо за интерес к нашему сервису! Мы сообщим вам о запуске подбора психологов.');
                    emailInput.value = '';
                } else {
                    alert('Пожалуйста, введите корректный email адрес.');
                }
            });

            // Обработка нажатия Enter в поле email
            emailInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitBtn.click();
                }
            });
        }
    }

    // Остальные методы класса остаются без изменений, но не используются при показе заглушки

    loadMobileChatInterface() {
        // Этот метод больше не используется, так как показываем заглушку
        this.loadComingSoonPage();
    }

    loadDesktopChatInterface() {
        // Этот метод больше не используется, так как показываем заглушку
        this.loadComingSoonPage();
    }

    createChatList() {
        // Этот метод больше не используется, так как показываем заглушку
        return document.createElement('div');
    }

    createChatListItem(chat) {
        // Этот метод больше не используется, так как показываем заглушку
        return document.createElement('div');
    }

    showChatConversation(chatId) {
        // Этот метод больше не используется, так как показываем заглушку
    }

    showChatList() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    createChatContainer() {
        // Этот метод больше не используется, так как показываем заглушку
        return document.createElement('div');
    }

    addChatEventListeners() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    showCallModal(type) {
        // Этот метод больше не используется, так как показываем заглушку
    }

    acceptCall() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    endCall() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    sendMessage() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    showNewMessage(message) {
        // Этот метод больше не используется, так как показываем заглушку
    }

    loadChat(chat) {
        // Этот метод больше не используется, так как показываем заглушку
    }

    updateChatList() {
        // Этот метод больше не используется, так как показываем заглушку
    }

    showAddChatModal() {
        // Этот метод больше не используется, так как показываем заглушку
    }
}