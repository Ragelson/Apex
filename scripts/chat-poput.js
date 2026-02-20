// chat-popup.js
document.addEventListener('DOMContentLoaded', function() {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');

    if (!chatToggleBtn) return;

    // Создаем выпадающее меню
    const dropdownMenu = createDropdownMenu();
    document.body.appendChild(dropdownMenu);

    let isDropdownVisible = false;

    chatToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Если меню уже видимо, скрываем его
        if (isDropdownVisible) {
            dropdownMenu.style.display = 'none';
            isDropdownVisible = false;
            return;
        }

        // Показываем меню
        const rect = chatToggleBtn.getBoundingClientRect();
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.right = (window.innerWidth - rect.right) + 'px';
        dropdownMenu.style.bottom = (window.innerHeight - rect.top) + 'px';
        isDropdownVisible = true;
    });

    // Закрываем меню при клике вне его
    document.addEventListener('click', function() {
        if (isDropdownVisible) {
            dropdownMenu.style.display = 'none';
            isDropdownVisible = false;
        }
    });

    // Предотвращаем закрытие при клике внутри меню
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Функция создания выпадающего меню
    function createDropdownMenu() {
        const menu = document.createElement('div');
        menu.className = 'chat-dropdown-menu';
        menu.style.display = 'none';
        
        menu.innerHTML = `
            <ul class="chat-dropdown-list">
                <li class="chat-dropdown-item" data-type="telegram">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    <span>Telegram</span>
                </li>
                <li class="chat-dropdown-item" data-type="gmail">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.387l-9 6.463-9-6.463V21H1.5C.649 21 0 20.35 0 19.5v-15c0-.425.162-.8.431-1.068C.7 3.16 1.076 3 1.5 3H2l10 7.25L22 3h.5c.425 0 .8.162 1.069.432.27.268.431.643.431 1.068z"/>
                    </svg>
                    <span>Gmail</span>
                </li>
                <li class="chat-dropdown-item" data-type="instagram">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                </li>
                <li class="chat-dropdown-item" data-type="vk">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.344 16.163h-1.867c-1.055 0-1.232-.601-2.102-1.469-.785-.785-1.22-.183-1.202.935.006.297-.141.534-.495.534-1.105 0-2.694.156-4.304-1.58-1.647-1.764-3.14-5.078-3.14-5.964 0-.272.192-.452.495-.452h1.865c.451 0 .622.234.78.601.366.844 1.533 3.527 1.733 3.747.297.339.512.339.512.183 0-.297-.297-2.096.297-2.814.297-.356.891-.47 1.331-.156.668.475 2.347 2.655 2.609 3.363.192.508.128.79.495.79h2.131c.623 0 .818-.409.524-1.174-.297-.767-1-1.603-1.732-2.383-.495-.508-.371-.713 0-1.147 0 0 2.555-3.454 2.86-4.638.128-.426-.192-.779-.669-.779h-2.129c-.395 0-.576.192-.703.401-.239.396-.891 1.374-1.176 1.83-.297.475-.396.475-.396.254 0-.339.239-1.547.239-2.253 0-.66-.201-1.14-.891-1.14-.396 0-.818.156-1.024.526-.668 1.22-1.943 4.252-2.38 5.666-.201.66-.356.908-.861.908h-.891c-.339 0-.495-.192-.495-.534 0-.396.239-1.054.396-1.492.396-1.054 1.176-2.963 1.176-2.963.143-.339.285-.508.624-.508h2.383c.339 0 .508.169.396.508-.109.339-.534 1.354-.534 1.354-.191.66.128.79.534.254.396-.527 1.733-2.383 1.733-2.383.285-.475.508-.66.908-.66h3.522c.66 0 .734.339.619.79-.143.601-1.354 3.363-1.354 3.363-.143.339-.016.623.356.623h1.867c.818 0 .891-.475.758-.935-.143-.46-.669-1.28-1.354-2.146-.451-.601-1.105-1.261-1.331-1.587-.239-.339-.143-.508 0-.791.012-.012 1.354-1.897 1.881-2.589.451-.601.908-1.354.908-1.354.191-.339.063-.79-.572-.79h-3.522c-.396 0-.572.169-.769.475 0 0-.908 1.354-1.105 1.696-.285.475-.191.66 0 1.067.012.012 2.38 3.539 2.38 3.539.143.226.285.339.572.339.191 0 .396-.084.396-.084.396-.226.239-.713-.143-1.147-.356-.401-1.354-1.492-1.354-1.492-.239-.272-.143-.401 0-.66.012-.012.572-.828 1.105-1.547.451-.577.908-1.169.908-1.169.191-.272.063-.79-.572-.79h-5.19c-.451 0-.572.297-.572.508 0 .527 1.354 3.363 1.354 3.363.143.339.063.601-.396.601h-1.867c-.339 0-.508-.192-.396-.508.109-.339.534-1.354.534-1.354.191-.66-.128-.79-.534-.254-.396.527-1.733 2.383-1.733 2.383-.285.475-.508.66-.908.66h-2.383c-.339 0-.508-.169-.396-.508.109-.339.534-1.354.534-1.354.191-.66-.128-.79-.534-.254-.396.527-1.733 2.383-1.733 2.383-.285.475-.508.66-.908.66h-1.867c-.339 0-.508-.192-.396-.508 1.354-3.363 2.38-5.666 2.38-5.666.143-.339.285-.508.624-.508h5.19c.339 0 .572.297.572.508 0 .527-1.354 3.363-1.354 3.363-.143.339-.063.601.396.601h1.867c.339 0 .508-.192.396-.508-.109-.339-.534-1.354-.534-1.354-.191-.66.128-.79.534-.254.396.527 1.733 2.383 1.733 2.383.285.475.508.66.908.66h3.522c.339 0 .508-.169.396-.508-.109-.339-.534-1.354-.534-1.354-.191-.66.128-.79.534-.254.396.527 1.733 2.383 1.733 2.383.285.475.508.66.908.66h1.867c.339 0 .508-.192.396-.508-.109-.339-.534-1.354-.534-1.354-.191-.66.128-.79.534-.254.396.527 1.733 2.383 1.733 2.383.285.475.508.66.908.66h1.867c.818 0 .891-.475.758-.935-.143-.46-.669-1.28-1.354-2.146-.451-.601-1.105-1.261-1.331-1.587-.239-.339-.143-.508 0-.791.012-.012 1.354-1.897 1.881-2.589.451-.601.908-1.354.908-1.354.191-.339.063-.79-.572-.79z"/>
                    </svg>
                    <span>ВКонтакте</span>
                </li>
                <li class="chat-dropdown-item" data-type="chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Онлайн-чат</span>
                </li>
            </ul>
        `;

        // Добавляем стили для выпадающего меню
        if (!document.querySelector('style[data-chat-dropdown-style]')) {
            const style = document.createElement('style');
            style.setAttribute('data-chat-dropdown-style', 'true');
            style.textContent = `
                .chat-dropdown-menu {
                    position: fixed;
                    z-index: 10000;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    min-width: 200px;
                    overflow: hidden;
                    animation: fadeIn 0.2s ease forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                body.dark-theme .chat-dropdown-menu {
                    background: #0f172a;
                }
                .chat-dropdown-list {
                    list-style: none;
                    margin: 0;
                    padding: 8px 0;
                }
                .chat-dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #00394C;
                    gap: 12px;
                }
                .chat-dropdown-item:hover {
                    background-color: rgba(0, 57, 76, 0.1);
                }
                body.dark-theme .chat-dropdown-item {
                    color: #f1f5f9;
                }
                body.dark-theme .chat-dropdown-item:hover {
                    background-color: rgba(241, 245, 249, 0.1);
                }
                .chat-dropdown-item svg {
                    flex-shrink: 0;
                }
            `;
            document.head.appendChild(style);
        }

        // Обработчики для пунктов меню
        const items = menu.querySelectorAll('.chat-dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                dropdownMenu.style.display = 'none';
                isDropdownVisible = false;
                
                if (type === 'chat') {
                    if (!document.querySelector('.chat-popup-container')) {
                        openChatPopup();
                        chatToggleBtn.classList.add('active');
                    }
                } else {
                    // Здесь можно добавить логику для других способов связи
                    switch(type) {
                        case 'telegram':
                            window.open('https://t.me/your_telegram', '_blank');
                            break;
                        case 'gmail':
                            window.open('mailto:your_email@gmail.com', '_blank');
                            break;
                        case 'instagram':
                            window.open('https://instagram.com/your_instagram', '_blank');
                            break;
                        case 'vk':
                            window.open('https://vk.com/your_vk', '_blank');
                            break;
                    }
                }
            });
        });

        return menu;
    }

    // Остальной код остается без изменений
    function openChatPopup() {
        const chatContainer = createChatContainer();
        document.body.appendChild(chatContainer);
        addChatEventListeners();
        loadChat(1);
    }

    function closeChatPopup() {
        const container = document.querySelector('.chat-popup-container');
        if (container) container.remove();
    }

    function createChatContainer() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-popup-container';

        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.innerHTML = `
            <div class="chat-user">
                <div class="chat-user-avatar">И</div>
                <div class="chat-user-name">Техническая поддержка</div>
            </div>
            <div class="chat-actions">
                <button class="chat-close-btn" title="Закрыть">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        chatContainer.appendChild(chatHeader);

        const chatBody = document.createElement('div');
        chatBody.className = 'chat-body';
        chatContainer.appendChild(chatBody);

        const chatFooter = document.createElement('div');
        chatFooter.className = 'chat-footer';
        chatFooter.innerHTML = `
            <div class="message-input-container">
                <button class="attachment-btn" title="Прикрепить">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
                <div class="message-input" contenteditable="true" placeholder="Написать сообщение..."></div>
                <button class="send-btn" title="Отправить">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        chatContainer.appendChild(chatFooter);

        if (!document.querySelector('style[data-chat-popup-style]')) {
            const style = document.createElement('style');
            style.setAttribute('data-chat-popup-style', 'true');
            style.textContent = `
                .chat-popup-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 360px;
                    height: 500px;
                    background-color: #fff;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    border-radius: 12px;
                    overflow: hidden;
                    z-index: 9999;
                    animation: slideInFromBottom 0.3s ease forwards;
                    transform-origin: bottom right;
                }
                @keyframes slideInFromBottom {
                    from { 
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to { 
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                body.dark-theme .chat-popup-container {
                    background-color: #0f172a;
                }
                .chat-header {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                }
                .chat-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .chat-user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #00394C;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .chat-user-name {
                    font-weight: 600;
                    color: #00394C;
                }
                .chat-actions {
                    display: flex;
                    gap: 8px;
                }
                .chat-close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #757575;

                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .chat-close-btn:hover {
                    background-color: rgba(0, 57, 76, 0.1);
                }
                .chat-body {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .chat-footer {
                    padding: 12px 16px;
                    border-top: 1px solid #eee;
                }
                .message-input-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .message-input {
                    flex: 1;
                    min-height: 40px;
                    max-height: 120px;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    outline: none;
                    overflow-y: auto;
                    font-size: 14px;
                }
                .message-input:empty:before {
                    content: attr(placeholder);
                    color: #757575;
                }
                .attachment-btn, .send-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #00394C;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .attachment-btn:hover, .send-btn:hover {
                    background-color: rgba(0, 57, 76, 0.1);
                }
                .chat-message {
                    max-width: 80%;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .chat-message.incoming {
                    background-color: #f1f5f9;
                    align-self: flex-start;
                    color: #00394C;
                }
                .chat-message.outgoing {
                    background-color: #00394C;
                    align-self: flex-end;
                    color: white;
                }
                .message-content {
                    word-wrap: break-word;
                }
                .message-time {
                    font-size: 11px;
                    margin-top: 4px;
                    text-align: right;
                    opacity: 0.7;
                }
                .chat-date-divider {
                    text-align: center;
                    margin: 12px 0;
                    font-size: 12px;
                    color: #757575;
                    position: relative;
                }
            `;
            document.head.appendChild(style);
        }

        chatHeader.querySelector('.chat-close-btn').addEventListener('click', function() {
            closeChatPopup();
            chatToggleBtn.classList.remove('active');
        });

        return chatContainer;
    }

    function addChatEventListeners() {
        const messageInput = document.querySelector('.chat-popup-container .message-input');
        const sendBtn = document.querySelector('.chat-popup-container .send-btn');
        const chatBody = document.querySelector('.chat-popup-container .chat-body');

        sendBtn?.addEventListener('click', function() {
            sendMessage();
        });

        messageInput?.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        function sendMessage() {
            const text = messageInput.textContent.trim();
            if (text) {
                const now = new Date();
                const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message outgoing';
                messageElement.innerHTML = `
                    <div class="message-content">${text}</div>
                    <div class="message-time">${timeString}</div>
                `;
                chatBody.appendChild(messageElement);

                chatBody.scrollTop = chatBody.scrollHeight;
                messageInput.textContent = '';
            }
        }

        messageInput?.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight > 200 ? 200 : this.scrollHeight) + 'px';
        });
    }

    function loadChat(chatId) {
        const chatsData = [
            {
                id: 1,
                name: 'Техническая поддержка',
                messages: [
                    { date: 'Сегодня', type: 'outgoing', text: 'Здраствуйте. У меня возникла проблема с выбором психолога.', time: '10:30' },
                    { date: 'Сегодня', type: 'incoming', text: 'Добрый день! Подскажите пожалуйста, какая именна проблема у Вас возникла?', time: '10:33' },
                    { date: 'Сегодня', type: 'outgoing', text: 'Я не понимаю, как будет происходить консультация после оплаты.', time: '10:35' },
                ],
                lastMessage: 'Отлично, буду ждать. Спасибо за оперативный ответ!',
                time: '10:36',
                unread: 2,
                avatar: 'ТП'
            }
        ];

        const chat = chatsData.find(c => c.id === chatId);
        if (!chat) return;

        document.querySelector('.chat-popup-container .chat-user-name').textContent = chat.name;
        document.querySelector('.chat-popup-container .chat-user-avatar').textContent = chat.avatar;

        const chatBody = document.querySelector('.chat-popup-container .chat-body');
        chatBody.innerHTML = '';

        let currentDate = '';
        chat.messages.forEach(message => {
            if (message.date !== currentDate) {
                const dateDivider = document.createElement('div');
                dateDivider.className = 'chat-date-divider';
                dateDivider.textContent = message.date;
                chatBody.appendChild(dateDivider);
                currentDate = message.date;
            }

            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${message.type}`;
            messageElement.innerHTML = `
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}</div>
            `;
            chatBody.appendChild(messageElement);
        });

        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
