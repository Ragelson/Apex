class Note {
    constructor({ id, text, color, createdAt}) {
        this.id = id;
        this.text = text;
        this.color = color;
        this.createdAt = createdAt;
    }

    static all = [];

    static getById(id) {
        return this.all.find(n => n.id === id);
    }

    static async fetchAll() {
        try {
            const notes = await apiGet('/v1/notes');
            this.all = notes.map(note => new Note(note));
        } catch (e) {
            console.error('Ошибка при загрузке заметок:', e);
        }
    }

    static async add(data) {
        const result = await apiPost('/v1/notes', data);
        const note = new Note(result);
        this.all.push(note);
        return note;
    }

    async delete() {
        await apiDelete(`/v1/notes/${this.id}`);
        Note.all = Note.all.filter(n => n.id !== this.id);
    }

    async update() {
        const data = {
            text: this.text,
            color: this.color,
            createdAt: this.createdAt
        };
        await apiPut(`/v1/notes/${this.id}`, data);
        return this;
    }
}
