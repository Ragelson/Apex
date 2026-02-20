class SubTask {
    constructor({ id, subTaskName, completed, taskId }) {
        this.id = id;
        this.name = subTaskName;
        this.completed = completed;
        this.taskId = taskId;
    }

    static all = [];

    static async fetchAllByTaskId(taskId) {
        const raw = await apiGet(`/v1/subtask/get-tasks-by-task-id/${taskId}`);
        const newSubTasks = raw.map(subTask => new SubTask(subTask));

        // Удаляем старые статусы этой сферы
        SubTask.all = this.all.filter(s => s.taskId !== taskId);

        // Добавляем обновлённые статусы
        SubTask.all.push(...newSubTasks);

        return newSubTasks;
    }

    static async add(taskId, nameList) {
        const data = {
            taskId: taskId,
            subTaskNames: nameList
        };
        const result = await apiPost('/v1/subtask', data);
        let newSubTasks = [];
        for(const subTask of result.subTasks){
            const newSubTask = new SubTask({
                id: subTask.id,
                subTaskName: subTask.subTaskName,
                completed: subTask.completed,
                taskId: result.taskId
            });
            newSubTasks.push(newSubTask);
            SubTask.all.push(newSubTask);
        }
        return newSubTasks;
    }

    async changeCompleted(completed) {
        this.completed = completed;
        await apiPut(`/v1/subtask/${this.id}`, {completed: completed});
    }

    async changeName(newName){
        this.name = newName;
        //TODO поменять на нормальный endpoint
        await apiPut(`/v1/subtask/v1/subtask/change-name/${this.id}`, {subTaskName: newName})
    }

    static getById(id) {
        return SubTask.all.find(s => s.id === id);
    }

    static getByTaskId(taskId) {
        return SubTask.all.filter(s => s.taskId === taskId);
    }

    async delete(){
        await apiDelete(`/v1/subtask/${this.id}`);
        return SubTask.all.filter(s => s.taskId !== this.taskId)
    }
}