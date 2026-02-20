class Chat {
    constructor({ id, participants, messages }) {
        const friend = participants.find(p => p.id !== User.instance.id);

        this.id = id;
        this.friendId = friend.id;
        this.friendMail = friend.email;
        this.friendFullName = friend.fullName;
        this.friendAvatarUrl = friend.avatarUrl;
        this.messages = Message.fromList(messages, id);
        this.subscribeToMessages();
        this.unread = 0;
    }

    static all = [];
    static stompClient = null;
    static current;

    static getById(id) {
        return this.all.find(c => c.id === id);
    }

    static connectWebSocket() {
        return new Promise((resolve, reject) => {
            if (Chat.stompClient && Chat.stompClient.connected) {
                resolve(Chat.stompClient);
                return;
            }

            const socket = new SockJS(`${API_BASE_URL}/ws`);
            const stompClient = Stomp.over(socket);
            stompClient.debug = null; // отключить лог

            stompClient.connect({}, () => {
                Chat.stompClient = stompClient;
                console.log('WebSocket подключен');
                resolve(stompClient);
            }, (err) => {
                console.error('Ошибка подключения WebSocket', err);
                reject(err);
            });
        });
    }

    subscribeToMessages() {
        Chat.connectWebSocket().then(stomp => {
            stomp.subscribe(`/topic/chat/${this.id}`, message => {
                const data = JSON.parse(message.body);
                const newMsg = new Message({ ...data, chatId: this.id });
                this.messages.push(newMsg);
                this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                if (typeof this.onNewMessage === 'function') {
                    this.onNewMessage(newMsg);
                }
            });
        });
    }

    static async fetchAll() {
        try {
            const chats = await apiGet('/v1/chat');
            Chat.all = chats.map(chat => new Chat(chat));
        } catch (e) {
            console.error('Ошибка при загрузке чатов:', e);
        }
    }

    static async add(recipientEmail) {
        const result = await apiPost('/v1/chat', { recipientEmail });
        const chat = new Chat(result);
        Chat.all.push(chat);
        return chat;
    }

    sendMessage(content, messageType = 'TEXT', audioUrl = null) {
        if (!Chat.stompClient || !Chat.stompClient.connected) {
            console.error('WebSocket не подключён');
            return;
        }

        const timestamp = new Date().toISOString();

        const payload = {
            chatId: this.id,
            content: content,
            messageType: messageType,
            audioUrl: audioUrl
        };

        // Отправка на сервер
        Chat.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(payload));

        // Добавляем локально в this.messages
        const localMessage = new Message({
            id: null, // ID пока нет, т.к. сервер не ответил
            content: content,
            timestamp: timestamp,
            sender: {
                id: User.instance.id,
                email: User.instance.email
            },
            messageType,
            audioUrl,
            chatId: this.id
        });

        this.messages.push(localMessage);
        this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return localMessage
    }
}

// chat.onNewMessage = (msg) => {
//     console.log('Новое сообщение в чате:', msg);
// };
