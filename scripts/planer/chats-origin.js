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

        // Проверяем мобильное устройство
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            this.loadMobileChatInterface();
        } else {
            this.loadDesktopChatInterface();
        }

        // Обновляем URL без перезагрузки страницы
        if (window.location.hash !== '#chats') {
            history.pushState(null, '', '#chats');
        }
    }

    loadMobileChatInterface() {
        const content = document.querySelector('.content');
        
        // Создаем контейнер для мобильного интерфейса
        const mobileChatContainer = document.createElement('div');
        mobileChatContainer.className = 'mobile-chat-container';
        
        // Создаем список чатов (всегда виден на мобильном)
        const chatListContainer = this.createChatList();
        chatListContainer.classList.add('mobile-chat-list');
        
        // Создаем контейнер для переписки (изначально скрыт)
        const chatContainer = this.createChatContainer();
        chatContainer.classList.add('mobile-chat-conversation');
        chatContainer.style.display = 'none';
        
        // Добавляем кнопку назад в шапку чата для мобильных
        const chatHeader = chatContainer.querySelector('.chat-header');
        const backButton = document.createElement('button');
        backButton.className = 'chat-back-btn';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
        `;
        backButton.addEventListener('click', () => this.showChatList());
        chatHeader.insertBefore(backButton, chatHeader.firstChild);
        
        mobileChatContainer.appendChild(chatListContainer);
        mobileChatContainer.appendChild(chatContainer);
        content.appendChild(mobileChatContainer);
        
        this.addChatEventListeners();
    }

    loadDesktopChatInterface() {
        const content = document.querySelector('.content');
        const rightMenu = document.querySelector('.right-menu');
        
        // Список чатов для десктопа
        const chatListContainer = this.createChatList();
        chatListContainer.classList.add('chat-list-overlay');
        rightMenu.appendChild(chatListContainer);

        // Основной контейнер чата
        content.appendChild(this.createChatContainer());
        this.addChatEventListeners();

        // Загружаем первый чат по умолчанию
        if (Chat.all.length > 0) {
            this.loadChat(Chat.all[0]);
        }
    }

    createChatList() {
        const chatListContainer = document.createElement('div');
        chatListContainer.className = 'chat-list-container';

        // Кнопка "Добавить собеседника"
        const addBtn = document.createElement('button');
        addBtn.className = 'add-chat-btn';
        addBtn.title = 'Добавить собеседника';
        addBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 512 512" fill="#1a73e8" style="margin-left:-8px;">
                <path d="m512 412c0 11.046875-8.953125 20-20 20h-60v60c0 11.046875-8.953125 20-20 20s-20-8.953125-20-20v-60h-60c-11.046875 0-20-8.953125-20-20s8.953125-20 20-20h60v-60c0-11.046875 8.953125-20 20-20s20 8.953125 20 20v60h60c11.046875 0 20 8.953125 20 20zm-160 80c0 11.046875-8.953125 20-20 20h-272c-33.085938 0-60-26.914062-60-60v-37c0-34.515625 14.804688-67.3125 40.613281-89.988281 20.894531-18.363281 60.910157-45.578125 125.238281-59.722657-35.15625-27.082031-57.851562-69.582031-57.851562-117.289062 0-81.605469 66.394531-148 148-148s148 66.394531 148 148-66.394531 148-148 148c-109.902344 0-168.777344 41.300781-188.984375 59.058594-17.167969 15.085937-27.015625 36.929687-27.015625 59.941406v37c0 11.027344 8.972656 20 20 20h272c11.046875 0 20 8.953125 20 20zm-96-236c59.550781 0 108-48.449219 108-108s-48.449219-108-108-108-108 48.449219-108 108 48.449219 108 108 108z"/>
            </svg>
            <span>Добавить</span>
        `;
        addBtn.style.display = 'flex';
        addBtn.style.alignItems = 'center';
        addBtn.style.justifyContent = 'center';
        addBtn.style.gap = '8px';
        addBtn.style.marginBottom = '12px';
        addBtn.style.background = '#e3f2fd';
        addBtn.style.border = 'none';
        addBtn.style.borderRadius = '20px';
        addBtn.style.padding = '8px 16px';
        addBtn.style.cursor = 'pointer';
        addBtn.style.fontWeight = '500';
        addBtn.style.color = '#1a73e8';
        addBtn.style.transition = 'background 0.2s';

        addBtn.addEventListener('mouseenter', () => addBtn.style.background = '#bbdefb');
        addBtn.addEventListener('mouseleave', () => addBtn.style.background = '#e3f2fd');
        addBtn.addEventListener('click', () => this.showAddChatModal());

        chatListContainer.appendChild(addBtn);

        // Поиск в списке чатов
        const chatSearch = document.createElement('div');
        chatSearch.className = 'chat-search';
        chatSearch.innerHTML = `       
            <input type="text" placeholder="Поиск в чатах" class="chat-search-input">
        `;
        chatListContainer.appendChild(chatSearch);

        // Список чатов
        const chatList = document.createElement('div');
        chatList.className = 'chat-list';

        Chat.all.forEach(chat => {
            const chatItem = this.createChatListItem(chat);
            chatList.appendChild(chatItem);
        });

        chatListContainer.appendChild(chatList);
        return chatListContainer;
    }
createChatListItem(chat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        
        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        const lastMessageTime = lastMessage ? lastMessage.formattedTimestamp.split(" ")[0] : "";
        const lastMessageText = lastMessage ? lastMessage.content : "";
        
        chatItem.innerHTML = `          
            <div class="chat-avatar" style="background-color: #98d09cff">${chat.friendFullName.charAt(0)}</div>           
            <div class="chat-info">               
                <div class="chat-name">${chat.friendFullName}</div>               
                <div class="chat-last-message">${lastMessageText}</div>           
            </div>           
            <div class="chat-meta">               
                <div class="chat-time">${lastMessageTime}</div>
                ${chat.unread > 0 ? `<div class="chat-unread">${chat.unread}</div>` : ''}           
            </div>
        `;
        
        // Обработчик клика для мобильных устройств
        chatItem.addEventListener('click', () => {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (isMobile) {
                this.showChatConversation(chat.id);
            } else {
                this.loadChat(chat);
            }
        });
        
        return chatItem;
    }

    showChatConversation(chatId) {
        const chat = Chat.getById(chatId);
        if (!chat) return;

        this.isChatOpen = true;
        this.currentChatId = chatId;

        // На мобильных устройствах переключаем вид
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            const chatList = document.querySelector('.mobile-chat-list');
            const chatConversation = document.querySelector('.mobile-chat-conversation');
            
            if (chatList && chatConversation) {
                chatList.style.display = 'none';
                chatConversation.style.display = 'block';
                
                // Обновляем заголовок
                const headerTitle = document.querySelector('.header-title');
                if (headerTitle) {
                    headerTitle.textContent = chat.friendFullName;
                }
            }
        }

        this.loadChat(chat);
    }

    showChatList() {
        this.isChatOpen = false;
        this.currentChatId = null;

        // На мобильных устройствах переключаем вид
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            const chatList = document.querySelector('.mobile-chat-list');
            const chatConversation = document.querySelector('.mobile-chat-conversation');
            
            if (chatList && chatConversation) {
                chatList.style.display = 'block';
                chatConversation.style.display = 'none';
                
                // Возвращаем заголовок
                const headerTitle = document.querySelector('.header-title');
                if (headerTitle) {
                    headerTitle.textContent = 'Чаты';
                }
            }
        }
    }

    createChatContainer() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';

        // Шапка чата
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.innerHTML = `       
            <div class="chat-user">
                <div class="chat-user-avatar">И</div>
                <div class="chat-user-info">
                    <div class="chat-user-name">Иван Иванов</div>
                    <div class="chat-user-status">online</div>
                </div>
            </div>
            <div class="chat-actions">
                <button class="chat-action-btn call-btn" title="Аудиозвонок">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                </button>
                <button class="chat-action-btn video-call-btn" title="Видеозвонок">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                </button>
                <button class="chat-action-btn more-btn" title="Дополнительно">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        `;
        chatContainer.appendChild(chatHeader);

        // Тело чата с сообщениями
        const chatBody = document.createElement('div');
        chatBody.className = 'chat-body';
        chatContainer.appendChild(chatBody);

        // Панель ввода сообщения (обновленный дизайн в стиле Telegram)
        const chatFooter = document.createElement('div');
        chatFooter.className = 'chat-footer';
        chatFooter.innerHTML = `       
            <div class="message-input-wrapper">
                <button class="attachment-btn" title="Прикрепить файл">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
                <div class="message-input-container">
                    <div class="message-input" contenteditable="true" placeholder="Написать сообщение..."></div>
                    <button class="emoji-btn" title="Эмодзи">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                    </button>
                </div>
                <button class="voice-btn" title="Голосовое сообщение">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>
                <button class="send-btn" title="Отправить">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        chatContainer.appendChild(chatFooter);
        return chatContainer;
    }

    addChatEventListeners() {
        // Обработчики для списка чатов
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.addEventListener('click', () => {
                this.loadChat(Chat.all[0]);
            });
        });

        // Элементы ввода и кнопки
        const messageInput = document.querySelector('.message-input');
        const sendBtn = document.querySelector('.send-btn');
        const voiceBtn = document.querySelector('.voice-btn');

        // Функция для обновления видимости кнопок
        function updateActionButtons() {
            const hasText = messageInput.textContent.trim().length > 0;
            if (hasText) {
                sendBtn.style.display = 'flex';
                voiceBtn.style.display = 'none';
            } else {
                sendBtn.style.display = 'none';
                voiceBtn.style.display = 'flex';
            }
        }

        // Инициализация состояния кнопок
        updateActionButtons();

        // Обработчик для отправки сообщения
        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
            updateActionButtons();
        });

        // Обработка ввода текста
        messageInput?.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight > 120 ? 120 : this.scrollHeight) + 'px';
            updateActionButtons();
        });

        // Обработка Enter
        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.textContent.trim().length > 0) {
                    this.sendMessage();
                    updateActionButtons();
                }
            }
        });

        // Голосовая кнопка (пример: просто алерт)
        voiceBtn?.addEventListener('click', () => {
            alert('Голосовое сообщение: функция в разработке');
        });

        // Обработчики для кнопок звонков
        document.querySelector('.call-btn')?.addEventListener('click', () => {
            this.showCallModal('audio');
        });

        document.querySelector('.video-call-btn')?.addEventListener('click', () => {
            this.showCallModal('video');
        });
    }

    // (!!!БЭК!!!) Инициализация звонка - должна отправлять запрос на сервер
    // Пример: POST /api/calls

    showCallModal(type) {
        // Если уже есть активный звонок, не показываем модальное окно
        if (this.callState.active) return;
        if (!Chat.current) return;
        const chat = Chat.current

        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'call-modal';
        modal.innerHTML = `
            <div class="call-modal-content">
                <div class="call-header">
                    <div class="call-title">${type === 'audio' ? 'Аудиозвонок' : 'Видеозвонок'}</div>
                    <div class="call-subtitle">${type === 'audio' ? 'Исходящий аудиозвонок' : 'Исходящий видеозвонок'}</div>
                </div>
                <div class="call-body">
                    ${type === 'video' ? `
                    <div class="video-preview">
                        <video muted autoplay playsinline></video>
                        <div class="video-preview-label">Вы</div>
                    </div>
                    ` : ''}
                    <div class="call-avatar" style="background-color: #98d09cff">${chat.friendFullName.charAt(0)}</div>
                    <div class="call-name">${chat.friendFullName}</div>
                    <div class="call-status">Звонок...</div>
                    <div class="call-timer">00:00</div>
                    <div class="call-controls">
                        <button class="call-control-btn call-decline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                                <line x1="23" y1="1" x2="1" y2="23"></line>
                            </svg>
                        </button>
                        <button class="call-control-btn call-accept">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        </button>
                    </div>
                    <button class="call-control-btn call-end">Завершить</button>
                    ${type === 'video' ? `
                    <div class="call-actions">
                        <button class="call-action-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                            <span>Микрофон</span>
                        </button>
                        <button class="call-action-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                            <span>Камера</span>
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Устанавливаем состояние звонка
        this.callState = {
            active: true,
            type: type,
            timer: null,
            duration: 0,
            accepted: false,
            modal: modal
        };

        // Скрываем кнопку "Завершить" при старте звонка
        modal.querySelector('.call-end').style.display = 'none';

        // Показываем модальное окно
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Обработчики для кнопок модального окна
        modal.querySelector('.call-decline')?.addEventListener('click', () => {
            this.endCall();
        });

        modal.querySelector('.call-accept')?.addEventListener('click', () => {
            this.acceptCall();
        });

        modal.querySelector('.call-end')?.addEventListener('click', () => {
            this.endCall();
        });

        // Имитируем ответ на звонок через 3 секунды
        setTimeout(() => {
            if (this.callState.active && !this.callState.accepted) {
                this.acceptCall();
            }
        }, 3000);
    }


    // (!!!БЭК!!!) Принятие звонка - должно уведомлять сервер

    acceptCall() {
        if (!this.callState.active || this.callState.accepted) return;

        this.callState.accepted = true;
        const modal = this.callState.modal;

        // Обновляем интерфейс
        modal.querySelector('.call-status').textContent = 'Разговор';
        modal.querySelector('.call-decline').style.display = 'none';
        modal.querySelector('.call-accept').style.display = 'none';
        modal.querySelector('.call-end').style.display = 'block';
        modal.querySelector('.call-timer').style.display = 'block';

        // Запускаем таймер
        this.callState.timer = setInterval(() => {
            this.callState.duration++;
            const minutes = Math.floor(this.callState.duration / 60).toString().padStart(2, '0');
            const seconds = (this.callState.duration % 60).toString().padStart(2, '0');
            modal.querySelector('.call-timer').textContent = `${minutes}:${seconds}`;
        }, 1000);

        // Добавляем сообщение о звонке в чат
        const now = new Date();
        const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        const callType = this.callState.type === 'audio' ? 'аудиозвонок' : 'видеозвонок';

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message info-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Вы начали ${callType} · ${timeString}</span>
            </div>
        `;
        document.querySelector('.chat-body').appendChild(messageElement);
    }


    endCall() {
        if (!this.callState.active) return;

        // Останавливаем таймер
        if (this.callState.timer) {
            clearInterval(this.callState.timer);
        }

        // Добавляем сообщение о продолжительности звонка
        if (this.callState.accepted && this.callState.duration > 0) {
            const now = new Date();
            const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
            const minutes = Math.floor(this.callState.duration / 60).toString().padStart(2, '0');
            const seconds = (this.callState.duration % 60).toString().padStart(2, '0');
            const callType = this.callState.type === 'audio' ? 'аудиозвонок' : 'видеозвонок';

            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message info-message';
            messageElement.innerHTML = `
                <div class="message-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>${callType} завершён · ${minutes}:${seconds} · ${timeString}</span>
                </div>
            `;
            document.querySelector('.chat-body').appendChild(messageElement);
        }

        // Удаляем модальное окно
        const modal = this.callState.modal;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);

        // Сбрасываем состояние звонка
        this.callState = {
            active: false,
            type: null,
            timer: null,
            duration: 0,
            accepted: false
        };
    }


    sendMessage() {
        const messageInput = document.querySelector('.message-input');
        const chatBody = document.querySelector('.chat-body');

        const text = messageInput.textContent.trim();
        if (text) {
            //TODO: добавить обработку ошибки
            Chat.current.sendMessage(text);
            this.updateChatList();

            // Прокрутка к новому сообщению
            chatBody.scrollTop = chatBody.scrollHeight;

            // Очищаем поле ввода
            messageInput.textContent = '';
            messageInput.style.height = 'auto';
        }
    }

    showNewMessage(message) {
        const chat = Chat.getById(message.chatId);
        if (!chat) return;

        // Если активен именно этот чат — отображаем сообщение
        if (Chat.current && Chat.current.id === chat.id) {
            const chatBody = document.querySelector('.chat-body');

            // Проверка и добавление разделителя даты
            const lastDivider = [...chatBody.querySelectorAll('.chat-date-divider')].pop();
            const lastDate = lastDivider ? lastDivider.textContent : null;
            const msgDate = message.formattedTimestamp.split(" ")[1];
            if (lastDate !== msgDate) {
                const divider = document.createElement('div');
                divider.className = 'chat-date-divider';
                divider.textContent = msgDate;
                chatBody.appendChild(divider);
            }

            // Контейнер сообщения
            const messageContainer = document.createElement('div');
            messageContainer.className = `message-container ${message.type}`;

            if (message.type === 'incoming') {
                const sender = document.createElement('div');
                sender.className = 'message-sender';
                sender.textContent = chat.friendFullName;
                messageContainer.appendChild(sender);
            }

            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${message.type}`;
            messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${message.formattedTimestamp.split(" ")[0]}</div>
        `;

            messageContainer.appendChild(messageElement);
            chatBody.appendChild(messageContainer);

            // Прокрутка вниз
            chatBody.scrollTop = chatBody.scrollHeight;
        } else {
            // Если чат не открыт — просто увеличим счётчик непрочитанных
            chat.unread++;
        }

        // Обновим список чатов
        this.updateChatList();
    }


    loadChat(chat) {
        if (!chat) return;

        Chat.current = chat;

        // Обновляем активный элемент в списке чатов
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.chatId) === chat.id) {
                item.classList.add('active');
            }
        });

        // Обновляем шапку чата
        const chatUserName = document.querySelector('.chat-user-name');
        const chatUserAvatar = document.querySelector('.chat-user-avatar');
        const chatUserStatus = document.querySelector('.chat-user-status');
        
        if (chatUserName) chatUserName.textContent = chat.friendFullName;
        if (chatUserAvatar) {
            chatUserAvatar.textContent = chat.friendFullName.charAt(0);
            chatUserAvatar.style.backgroundColor = "#98d09cff";
        }
        if (chatUserStatus) chatUserStatus.textContent = chat.online ? "online" : "";

        // Загружаем сообщения
        const chatBody = document.querySelector('.chat-body');
        if (chatBody) {
            chatBody.innerHTML = '';

            let currentDate = '';
            chat.messages.forEach(message => {
                if (message.formattedTimestamp.split(" ")[1] !== currentDate) {
                    const dateDivider = document.createElement('div');
                    dateDivider.className = 'chat-date-divider';
                    dateDivider.textContent = message.formattedTimestamp.split(" ")[1];
                    chatBody.appendChild(dateDivider);
                    currentDate = message.formattedTimestamp.split(" ")[1];
                }

                const messageContainer = document.createElement('div');
                messageContainer.className = `message-container ${message.type}`;

                if (message.type === 'incoming') {
                    const senderElement = document.createElement('div');
                    senderElement.className = 'message-sender';
                    senderElement.textContent = chat.friendFullName;
                    messageContainer.appendChild(senderElement);
                }

                const messageElement = document.createElement('div');
                messageElement.className = `chat-message ${message.type}`;
                messageElement.innerHTML = `
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${message.formattedTimestamp.split(" ")[0]}</div>
                `;

                messageContainer.appendChild(messageElement);
                chatBody.appendChild(messageContainer);
            });

            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Сбрасываем непрочитанные сообщения
        chat.unread = 0;
        this.updateChatList();
    }



    updateChatList() {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;

        chatList.innerHTML = '';

        Chat.all.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.chatId = chat.id;
            const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            const lastMessageTime = lastMessage ? lastMessage.formattedTimestamp.split(" ")[0] : "";
            const lastMessageText = lastMessage ? lastMessage.content : "";
            chatItem.innerHTML = `          
                <div class="chat-avatar ${''}" style="background-color: #98d09cff">${chat.friendFullName.charAt(0)}</div>           
                <div class="chat-info">               
                    <div class="chat-name">${chat.friendFullName}</div>               
                    <div class="chat-last-message">${lastMessageText}</div>           
                </div>           
                <div class="chat-meta">               
                    <div class="chat-time">${lastMessageTime}</div>
                    ${chat.unread > 0 ? `<div class="chat-unread">${chat.unread}</div>` : ''}           
                </div>
            `;
            chatList.appendChild(chatItem);
        });

        // Добавляем обработчики событий для новых элементов
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = parseInt(item.dataset.chatId);
                this.loadChat(Chat.getById(chatId));
            });
        });
    }

    showAddChatModal() {
        // Модалка для добавления собеседника
        let modal = document.querySelector('.add-chat-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.className = 'add-chat-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1001';

        modal.innerHTML = `
            <div style="
                background:#fff;
                border-radius:16px;
                padding:32px 28px 24px 28px;
                min-width:320px;
                box-shadow:0 8px 32px rgba(26,115,232,0.12);
                display:flex;
                flex-direction:column;
                align-items:center;
                position:relative;
            ">
                <button class="close-add-chat-modal" style="
                    position:absolute;
                    top:12px; right:12px;
                    background:none; border:none; font-size:22px; color:#757575; cursor:pointer;
                " title="Закрыть">&times;</button>
                <h2 style="margin-bottom:18px;font-size:20px;font-weight:600;color:#00394C;">Добавить собеседника</h2>
                <input type="email" class="add-chat-email" placeholder="Email" style="
                    width:100%;padding:12px 16px;border-radius:8px;border:1px solid #e3e7ef;font-size:15px;margin-bottom:18px;
                ">
                <button class="add-chat-confirm" style="
                    background:#1a73e8;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:15px;font-weight:500;cursor:pointer;
                    transition:background 0.2s;
                ">Добавить</button>
                <div class="add-chat-error" style="color:#d32f2f;font-size:13px;margin-top:10px;display:none;"></div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-add-chat-modal').onclick = () => modal.remove();

        modal.querySelector('.add-chat-confirm').onclick = async () => {
            const email = modal.querySelector('.add-chat-email').value.trim();
            const errorDiv = modal.querySelector('.add-chat-error');
            errorDiv.style.display = 'none';
            let newChat = null;
            if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
                errorDiv.textContent = 'Введите корректный email';
                errorDiv.style.display = 'block';
                return;
            }
            try{
                newChat = await Chat.add(email);
            }
            catch(error){
                console.log(error);
                errorDiv.textContent = 'Не удалось найти собеседника с таким email';
                errorDiv.style.display = 'block';
                return;
            }
            if(!newChat){
                return;
            }
            this.updateChatList();
            this.loadChat(newChat);
            modal.remove();
        };
    }
}
