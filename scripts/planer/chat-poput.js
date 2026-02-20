// chat-popup.js
document.addEventListener('DOMContentLoaded', function() {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');

    if (!chatToggleBtn) return;

    chatToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!document.querySelector('.chat-popup-container')) {
            openChatPopup();
            this.classList.add('active');
        } else {
            closeChatPopup();
            this.classList.remove('active');
        }
    });

    // Функция создания и открытия чата
    function openChatPopup() {
        // Контейнер чата
        const chatContainer = createChatContainer();
        document.body.appendChild(chatContainer);

        // Добавляем слушатели событий чата
        addChatEventListeners();

        // Загружаем чат (здесь первый чат по умолчанию)
        loadChat(1);
    }

    // Закрытие и удаление окна
    function closeChatPopup() {
        const container = document.querySelector('.chat-popup-container');
        if (container) container.remove();
    }

    // Создание контейнера чата
    function createChatContainer() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-popup-container';

        // Шапка чата
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

        // Тело чата
        const chatBody = document.createElement('div');
        chatBody.className = 'chat-body';
        chatContainer.appendChild(chatBody);

        // Футер с вводом сообщения
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

        // Добавляем стили для всплывающего чата
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
                    background-color: #4285f4;
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
                    width: 24px;
                    height: 24px;
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
                    width: 24px;
                    height: 24px;
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
                    background-color: #4285f4;
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

        // Добавляем обработчик закрытия чата
        chatHeader.querySelector('.chat-close-btn').addEventListener('click', function() {
            closeChatPopup();
            chatToggleBtn.classList.remove('active');
        });

        return chatContainer;
    }

    // Добавление обработчиков событий чата
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

    // Загрузка чата
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