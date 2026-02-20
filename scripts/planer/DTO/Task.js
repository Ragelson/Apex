class Task {
    constructor({ id, taskName, taskStart, taskEnd, taskDesc, taskColor, goal_id, status, archived, completed }) {
        this.id = id;
        this.name = taskName;
        this.start = taskStart;
        this.end = taskEnd;
        this.description = taskDesc;
        this.color = taskColor;
        this.sphereId = goal_id;
        this.statusId = status?.id;
        this.archived = archived;
        this.completed = completed || false;
    }

    static all = [];

    static async fetchAll() {
        const raw = await apiGet('/v1/task/all');
        this.all = raw.map(t => new Task(t));
        return this.all;
    }

    static async fetchAllBySphereId(sphereId) {
        const raw = await apiGet(`/v1/task/goal/${sphereId}`);
        const newTasks = raw.map(task => new Task(task));
        this.all = this.all.filter(t => t.sphereId !== sphereId);
        this.all.push(...newTasks);
        return newTasks;
    }

    static async fetchAllByStatusId(statusId) {
        const raw = await apiGet(`/v1/task/status/${statusId}`);
        const newTasks = raw.map(task => new Task(task));
        this.all = this.all.filter(t => t.statusId !== statusId);
        this.all.push(...newTasks);
        return newTasks;
    }


    static async add(data) {
        const result = await apiPost('/v1/task', data);
        const task = new Task(result);
        this.all.push(task);
        return task;
    }

    async delete() {
        await apiDelete(`/v1/task/${this.id}`);
        Task.all = Task.all.filter(t => t.id !== this.id);
    }

    async update() {
        const data = {
            id: this.id,
            taskName: this.name,
            taskStart: this.start,
            taskEnd: this.end,
            taskDesc: this.description,
            taskColor: this.color,
            statusId: this.statusId,
            goal_id: this.sphereId,
            completed: this.completed
        };
        await apiPut('/v1/task/update', data);
        return this;
    }

    async archive() {
        await apiPut(`/v1/task/task/${this.id}/archive`);
        this.archived = true;
    }

    async toggleCompleted() {
        this.completed = !this.completed;
        await this.update();
        return this;
    }

    async changeStatus(statusName) {
        await apiPut(`/v1/task/${this.id}/status`, { status: statusName });
        const status = Status.all.find(s => s.name === statusName);
        if (status) {
            this.statusId = status.id;
        }
        return this;
    }

    static getBySphereId(sphereId) {
        return this.all.filter(t => t.sphereId === sphereId);
    }

    static getByStatusId(statusId) {
        return this.all.filter(t => t.statusId === statusId);
    }

    static getById(id) {
        return this.all.find(t => t.id === id);
    }

    static getTodayTasks() {
        // Локальная дата YYYY-MM-DD (без UTC-сдвига)
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const today = `${yyyy}-${mm}-${dd}`;

        return Task.all.filter(task => {
            if (!task) return false;

            const startDate = task.start ? String(task.start).split('T')[0] : null;
            const endDate = task.end ? String(task.end).split('T')[0] : null;

            return (
                // началась и ещё не закончилась (границы включительно)
                (startDate && startDate <= today && (!endDate || today <= endDate))
                ||
                // или дедлайн ровно сегодня
                (endDate && endDate === today)
            );
        });
    }

    getStartTime(){
        return this.start.split('T')[1];
    }

    getStartHour(){
        return parseInt(this.start.split('T')[1].split(':')[0], 10);
    }

}