class TaskComment {
    constructor({ id, taskId, content, authorId, authorName, authorEmail, createdAt }) {
        this.id = id;
        this.taskId = taskId;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.createdAt = createdAt;
        this.formattedDate = this.formatDate(createdAt);
    }

    formatDate(dateString) {
        if (!dateString) return 'неизвестно';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins}м назад`;
        if (diffHours < 24) return `${diffHours}ч назад`;
        if (diffDays < 7) return `${diffDays}д назад`;

        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('ru-RU', options);
    }

    static all = [];
    static mockComments = {};

    // Mock данные для тестирования стилей
    static getMockComments(taskId) {
        if (!this.mockComments[taskId]) {
            this.mockComments[taskId] = [
                new TaskComment({
                    id: 'mock-1',
                    taskId: taskId,
                    content: 'Начал работу над задачей. Разбираюсь с требованиями.',
                    authorId: 1,
                    authorName: 'Александр Петров',
                    authorEmail: 'alex.petrov@example.com',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                }),
                new TaskComment({
                    id: 'mock-2',
                    taskId: taskId,
                    content: 'Выполнена первая часть. Ожидаю проверки от клиента на соответствие требованиям.',
                    authorId: 2,
                    authorName: 'Мария Сидорова',
                    authorEmail: 'maria.sidorova@example.com',
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                }),
                new TaskComment({
                    id: 'mock-3',
                    taskId: taskId,
                    content: 'Клиент согласен с реализацией. Даём зелёный свет на интеграцию.',
                    authorId: 1,
                    authorName: 'Александр Петров',
                    authorEmail: 'alex.petrov@example.com',
                    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                }),
                new TaskComment({
                    id: 'mock-4',
                    taskId: taskId,
                    content: 'Готово! Задача закрыта и развёрнута на production.',
                    authorId: 3,
                    authorName: 'Иван Иванов',
                    authorEmail: 'ivan.ivanov@example.com',
                    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                })
            ];
        }
        return this.mockComments[taskId];
    }

    static async fetchByTaskId(taskId) {
        const mockData = this.getMockComments(taskId);
        return mockData.slice().reverse();
    }

    static async add(taskId, content) {
        const newComment = new TaskComment({
            id: `mock-${Date.now()}`,
            taskId: taskId,
            content: content,
            authorId: User.instance?.id || 1,
            authorName: User.instance?.fullName || 'Текущий пользователь',
            authorEmail: User.instance?.email || 'user@example.com',
            createdAt: new Date().toISOString()
        });

        if (!this.mockComments[taskId]) {
            this.mockComments[taskId] = [];
        }
        this.mockComments[taskId].push(newComment);
        return newComment;
    }

    async delete() {
        if (TaskComment.mockComments[this.taskId]) {
            TaskComment.mockComments[this.taskId] = TaskComment.mockComments[this.taskId]
                .filter(c => c.id !== this.id);
        }
    }

    static async update(taskId, commentId, newContent) {
        if (this.mockComments[taskId]) {
            const comment = this.mockComments[taskId].find(c => c.id === commentId);
            if (comment) {
                comment.content = newContent;
                return comment;
            }
        }
        throw new Error('Комментарий не найден');
    }

    // ============ КАСТОМНЫЕ ДИАЛОГОВЫЕ ОКНА ============

    static showDeleteDialog(taskId, commentId, commentContent, onConfirm) {
        const dialog = document.getElementById('confirmDialog');
        if (!dialog) return;

        const titleEl = document.getElementById('confirmDialogTitle');
        const messageEl = document.getElementById('confirmDialogMessage');
        const confirmBtn = document.getElementById('confirmDialogConfirmBtn');
        const cancelBtn = document.getElementById('confirmDialogCancelBtn');
        const closeBtn = dialog.querySelector('.dialog-close-btn');

        // Устанавливаем текст
        if (titleEl) titleEl.textContent = 'Удаление комментария';
        if (messageEl) messageEl.textContent = 'Вы действительно хотите удалить этот комментарий?';

        // Меняем кнопку подтверждения на красную
        confirmBtn.className = 'btn-danger dialog-btn';
        confirmBtn.textContent = 'Удалить';

        // Функция закрытия
        const closeDialog = () => {
            dialog.classList.remove('active');
            // Убираем обработчики
            confirmBtn.removeEventListener('click', onConfirmHandler);
            cancelBtn.removeEventListener('click', closeHandler);
            closeBtn.removeEventListener('click', closeHandler);
        };

        // Обработчик подтверждения
        const onConfirmHandler = async () => {
            await onConfirm();
            closeDialog();
        };

        // Обработчик закрытия
        const closeHandler = closeDialog;

        // Добавляем обработчики
        confirmBtn.addEventListener('click', onConfirmHandler);
        cancelBtn.addEventListener('click', closeHandler);
        if (closeBtn) closeBtn.addEventListener('click', closeHandler);

        // Показываем диалог
        dialog.classList.add('active');
    }

    static showEditDialog(taskId, commentId, currentContent, onSave) {
        const dialog = document.getElementById('editDialog');
        if (!dialog) return;

        const titleEl = document.getElementById('editDialogTitle');
        const labelEl = document.getElementById('editDialogLabel');
        const inputEl = document.getElementById('editDialogInput');
        const saveBtn = document.getElementById('editDialogSaveBtn');
        const cancelBtn = document.getElementById('editDialogCancelBtn');
        const closeBtn = dialog.querySelector('.dialog-close-btn');

        // Устанавливаем текст и значение
        if (titleEl) titleEl.textContent = 'Редактирование комментария';
        if (labelEl) labelEl.textContent = 'Отредактируйте текст комментария:';
        if (inputEl) {
            inputEl.value = currentContent;
            // Автофокус через setTimeout
            setTimeout(() => inputEl.focus(), 100);
        }

        // Меняем кнопку сохранения
        saveBtn.className = 'btn-primary dialog-btn';
        saveBtn.textContent = 'Сохранить';

        // Функция закрытия
        const closeDialog = () => {
            dialog.classList.remove('active');
            // Убираем обработчики
            saveBtn.removeEventListener('click', onSaveHandler);
            cancelBtn.removeEventListener('click', closeHandler);
            closeBtn.removeEventListener('click', closeHandler);
        };

        // Обработчик сохранения
        const onSaveHandler = async () => {
            const newContent = inputEl.value.trim();
            if (newContent && newContent !== currentContent) {
                await onSave(newContent);
            }
            closeDialog();
        };

        // Обработчик закрытия
        const closeHandler = closeDialog;

        // Добавляем обработчики
        saveBtn.addEventListener('click', onSaveHandler);
        cancelBtn.addEventListener('click', closeHandler);
        if (closeBtn) closeBtn.addEventListener('click', closeHandler);

        // Закрытие по Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Убираем обработчик Escape при закрытии
        const originalCloseHandler = closeHandler;
        const wrappedCloseHandler = () => {
            document.removeEventListener('keydown', escHandler);
            originalCloseHandler();
        };
        
        // Переопределяем обработчики
        cancelBtn.removeEventListener('click', closeHandler);
        if (closeBtn) closeBtn.removeEventListener('click', closeHandler);
        
        cancelBtn.addEventListener('click', wrappedCloseHandler);
        if (closeBtn) closeBtn.addEventListener('click', wrappedCloseHandler);

        // Показываем диалог
        dialog.classList.add('active');
    }
}