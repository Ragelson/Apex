class Message {
    constructor({ id, content, timestamp, sender, messageType, audioUrl, chatId }) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.formattedTimestamp = formatTimestamp(timestamp);
        this.senderId = sender.id;
        this.senderEmail = sender.email;
        this.messageType = messageType;
        this.audioUrl = audioUrl;
        this.chatId = chatId
        this.type = this.senderId === User.instance.id ? "outgoing" : "incoming";
    }

    static fromList(messageArray, chatId) {
        return messageArray
            .map(data => new Message({ ...data, chatId }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // сортировка по дате
    }
}