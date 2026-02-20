class Status {
    constructor({ id, statusName, goal, goalId, color, sortOrder }) {
        this.id = id;
        this.name = statusName;
        this.color = color;
        this.sphereId = goal || goalId;
        this.sort = sortOrder;
    }

    static all = [];

    static async fetchAll(sphereId) {
        const raw = await apiGet(`/v1/status/${sphereId}`);
        const newStatuses = raw.map(status => new Status(status));

        // Удаляем старые статусы этой сферы
        this.all = this.all.filter(s => s.sphereId !== sphereId);

        // Добавляем обновлённые статусы
        this.all.push(...newStatuses);
        return Status.sort(newStatuses);
    }

    static async add({ statusName, color, sphereId }) {
        const data = { statusName, color, goalId: sphereId };
        const result = await apiPost('/v1/status', data);
        const status = new Status(result);
        this.all.push(status);
        Status.sort();
        return status;
    }

    async delete() {
        await apiDelete(`/v1/status/${this.id}`);
        Status.all = Status.all.filter(s => s.id !== this.id);
        Status.sort();
    }

    async update() {
        const data = {
            newName: this.name,
            color: this.color
        }
        for (const task of Task.getByStatusId(this.id)) {
            task.color = this.color;
            await task.update();
        }
        await apiPut(`/v1/status/${this.id}`, data);
        Status.sort();
        return this;
    }

    static getById(id) {
        return this.all.find(s => s.id === id);
    }

    static getBySphereId(sphereId) {
        return Status.sort(
            this.all.filter(s => s.sphereId === sphereId)
        );
    }

static sort(list = null) {
    const target = list ?? this.all;

    if (!target || target.length === 0) return target;

    const allZero = target.every(s => !s.sort || s.sort === 0);
    const allNonZero = target.every(s => s.sort && s.sort > 0);

    if (allZero) {
        // все sort = 0 → сортируем по id
        target.sort((a, b) => a.id - b.id);
    } else if (allNonZero) {
        // все sort > 0 → сортируем по sort
        target.sort((a, b) => a.sort - b.sort);
    } else {
        // смешанный случай → сортируем сначала по sort (0 = в конец), потом по id
        target.sort((a, b) => {
            const sortA = a.sort && a.sort > 0 ? a.sort : Number.MAX_SAFE_INTEGER;
            const sortB = b.sort && b.sort > 0 ? b.sort : Number.MAX_SAFE_INTEGER;

            if (sortA !== sortB) return sortA - sortB;
            return a.id - b.id;
        });
    }

    return target;
}


    static async updateOrder(newOrder) {
        for (let i = 0; i < newOrder.length; i++) {
            const statusId = newOrder[i];
            const status = this.getById(statusId);
            if (status) {
                status.sort = i + 1;
            }
        }
        await apiPost(`/v1/status/reorder?goalId=${Sphere.current.id}`, newOrder);
        Status.sort();
    }
}
