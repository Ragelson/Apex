class Sphere {
    constructor({ id, goalName, color, shared, participants }) {
        this.id = id;
        this.name = goalName;
        this.color = color;
        this.shared = shared;
        this.participantEmails = Array.isArray(participants)
            ? participants.map(p => p.email)
            : [];
    }

    static all = [];
    
    static current;

    static getMy() {
        return this.all.filter(s => !s.shared);
    }

    static getShared() {
        return this.all.filter(s => s.shared);
    }

    static getById(id) {
        return this.all.find(s => s.id === id);
    }

    static async fetchAll() {
        try {
            const goals = await apiGet('/v1/goals');
            this.all = goals.map(goal => new Sphere(goal));
            const sharedGoals = await apiGet('/v1/goals/shared');
            sharedGoals.map(goal => Sphere.all.push(new Sphere(goal)));
        } catch (e) {
            console.error('Ошибка при загрузке сфер:', e);
        }
    }

    static async add(data) {
        data["isDefault"] = false;
        const result = await apiPost('/v1/goals', data);
        const sphere = new Sphere(result);
        Sphere.all.push(sphere);
        await Status.fetchAll(sphere.id);
        return sphere;
    }

    async delete() {
        await apiDelete(`/v1/goals/${this.id}`);
        Sphere.all = Sphere.all.filter(s => s.id !== this.id);
        Status.all = Status.all.filter(s => s.sphereId !== this.id);
        Task.all = Task.all.filter(t => t.sphereId !== this.id);
    }

    async update() {
        const data = {
            goalName: this.name,
            color: this.color,
            participantEmails: this.participantEmails
        };
        const result = await apiPut(`/v1/goals/${this.id}`, data);

        this.name = result.goalName;
        this.color = result.color;
        this.shared = result.shared;
        this.participants = Array.isArray(result.participants)
            ? result.participants.map(p => p.email)
            : [];

        return this;
    }
}
