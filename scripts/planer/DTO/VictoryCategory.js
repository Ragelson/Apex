class VictoryCategory {
    constructor({ id, categoryName, owner, goal, color }) {
        this.id = id;
        this.name = categoryName;
        this.sphereId = goal ? goal.id : 0;
        this.color = color
    }

    static all = [];

    static current;

    static getById(id) {
        return this.all.find(c => c.id === id);
    }

    static getByName(name) {
        return this.all.find(c => c.name === name);
    }

    static async fetchAll() {
        try {
            const victoryCategories = await apiGet('/v1/victory-categories');
            this.all = victoryCategories.map(category => new VictoryCategory(category));
        } catch (e) {
            console.error('Ошибка при загрузке категорий побед:', e);
        }
        VictoryCategory.sortAll();
    }

    static async add(name, color) {
        const data = {
            "categoryName": name,
            "color": color
        }
        const result = await apiPost('/v1/victory-categories', data);
        const category = new VictoryCategory(result);
        this.all.push(category);
        VictoryCategory.sortAll();
        return category;
    }

    async delete() {
        //TODO убрать после обновления бэка
        const victories = [...await Victory.getByCategoryId(this.id)]; // или без await, если sync
        await Promise.all(victories.map(v => v.delete())); // ждём все удаления

        await apiDelete(`/v1/victory-categories/${this.id}`);
        VictoryCategory.all = VictoryCategory.all.filter(c => c.id !== this.id);
        VictoryCategory.sortAll();
    }


    async update(newName, color) {
        const data = {
            "newName": newName,
            "color": color
        }
        await apiPut(`/v1/victory-categories/${this.id}`, data);
        this.name = newName;
        this.color = color;
        VictoryCategory.sortAll();
        return this;
    }

    static sortAll() {
        this.all.sort((a, b) => a.id - b.id);
    }
}
