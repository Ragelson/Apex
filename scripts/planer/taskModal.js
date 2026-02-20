const TaskModalManager = {
    init: function () {
        this.currentTask = null;
        this.subtasks = [];
        this.bindEvents();
        this.setupTabNavigation();
        this.initialized = true;
        this.statusId = null;
    },

    setupTabNavigation: function () {
        // Обработчик клика по вкладкам
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.modal-tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });
    },

    switchTab: function (tabName) {
        // Скрываем все контент
        document.querySelectorAll('.modal-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показываем нужный контент
        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Активируем нужную кнопку
        const activeBtn = document.querySelector(`.modal-tab-btn[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Скролл вверх содержимого
        const tabsContent = document.querySelector('.modal-tabs-content');
        if (tabsContent) {
            tabsContent.scrollTop = 0;
        }
    },

    bindEvents: function () {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.add-task-btn') && !e.target.closest('.add-task-btn-global')) {
                await this.openModal();
            }
        });

        document.getElementById('addSubtaskBtn').addEventListener('click', async () => {
            await this.openSubtaskModal();
        });

        document.getElementById('saveSubtaskBtn').addEventListener('click', async () => {
            await this.addSubtask();
        });

        document.getElementById('cancelSubtaskBtn').addEventListener('click', async () => {
            await this.closeSubtaskModal();
        });

        document.getElementById('saveTaskBtn').addEventListener('click', async () => {
            await this.saveTask();
        });

        document.getElementById('sendCommentBtn').addEventListener('click', async () => {
            await this.sendComment();
        });

        // Обработчик для кнопки отметить как выполненную
        document.getElementById('completeTaskBtn').addEventListener('click', async () => {
            if (this.currentTask) {
                await this.currentTask.toggleCompleted();
                this.updateCompleteButtonUI();
            }
        });

        // Позволяем отправку комментария по Ctrl+Enter
        document.getElementById('taskCommentInput').addEventListener('keydown', async (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                await this.sendComment();
            }
        });

        // Авторасширение текстареи для комментариев
        const taskCommentInput = document.getElementById('taskCommentInput');
        if (taskCommentInput) {
            taskCommentInput.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            });
        }

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('modal')) {
                await this.closeModal();
                await this.closeSubtaskModal();
            }
        });

        // Обработчик события для кнопки крестика
        document.getElementById('closeModalBtn').addEventListener('click', async () => {
            await this.closeModal();
            await this.closeSubtaskModal();
        });
    },

    openModal: function (task = null, statusId = null) {
        this.statusId = statusId
        // Проверяем, существует ли модальное окно
        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('Modal element not found');
            return;
        }

        this.resetForm();
        this.currentTask = task;

        if (task) {
            const [startDatePart, startTimePart] = task.start.split('T');
            const [endDatePart, endTimePart] = task.end.split('T');

            // Заполняем форму данными задачи
            document.getElementById('taskTitleInput').value = task.name || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskStartDate').value = startDatePart;
            document.getElementById('taskStartTime').value = startTimePart;
            document.getElementById('taskDueDate').value = endDatePart;
            document.getElementById('taskDueTime').value = endTimePart;

            const subTasks = SubTask.getByTaskId(task.id);
            if (subTasks.length > 0) {
                this.subtasks = [...subTasks];
                this.renderSubtasks();
            }

            // Загружаем комментарии для существующей задачи
            this.loadComments(task.id);
        } else {
            const now = new Date();

            // текущее время
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');

            // +1 час с учётом перехода через 24:00
            let dueHour = (now.getHours() + 1) % 24;
            let dueStr = dueHour.toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');

            document.getElementById('taskStartTime').value = timeStr;
            document.getElementById('taskDueTime').value = dueStr;

            // Очищаем список комментариев для новой задачи
            document.getElementById('taskCommentsList').innerHTML = '';
            document.getElementById('taskCommentInput').value = '';
        }

        let sphereName = "";
        if (task) {
            sphereName = Sphere.getById(task.sphereId).name
        }
        if (statusId) {
            sphereName = Sphere.getById(Status.getById(statusId).sphereId).name;
        }
        document.getElementById('taskSphere').textContent = sphereName;

        // Надежная обработка даты создания
        let creationDate;
        try {
            if (task && task.createdAt) {
                creationDate = new Date(task.createdAt);
                if (isNaN(creationDate.getTime())) throw new Error('Invalid date');
            } else {
                creationDate = new Date();
            }
        } catch (e) {
            creationDate = new Date();
        }
        document.getElementById('taskCreationDate').textContent = creationDate.toLocaleDateString('ru-RU');

        // Обновляем UI кнопки завершения
        this.updateCompleteButtonUI();

        document.getElementById('taskModal').style.display = 'block';

        document.getElementById('taskTitleInput').focus();
    },

    updateCompleteButtonUI: function () {
        const completeBtn = document.getElementById('completeTaskBtn');
        const completeBtnText = document.getElementById('completeTaskBtnText');
        
        if (!this.currentTask) {
            // Скрываем кнопку для новых задач
            completeBtn.style.display = 'none';
        } else {
            // Показываем кнопку для существующих задач
            completeBtn.style.display = 'flex';
            
            if (this.currentTask.completed) {
                completeBtn.classList.add('btn-success');
                completeBtn.classList.remove('btn-secondary');
                completeBtnText.textContent = '✓ Выполненно';
            } else {
                completeBtn.classList.remove('btn-success');
                completeBtn.classList.add('btn-secondary');
                completeBtnText.textContent = '✓ Отметить как выполненную';
            }
        }
    },

    closeModal: function () {
        document.getElementById('taskModal').style.display = 'none';
    },

    openSubtaskModal: function () {
        document.getElementById('subtaskModal').style.display = 'block';

        document.getElementById('subtaskInput').focus();

        // Блокируем закрытие по клику вне модального окна
        const modal = document.getElementById('subtaskModal');
        const blockClose = function (e) {
            if (e.target === modal) {
                e.stopPropagation();
            }
        };
        modal.addEventListener('click', blockClose);

        // Сохраняем функцию для удаления обработчика при закрытии
        modal._blockCloseHandler = blockClose;
    },

    closeSubtaskModal: function () {
        const modal = document.getElementById('subtaskModal');
        modal.style.display = 'none';
        document.getElementById('subtaskInput').value = '';

        // Удаляем обработчик блокировки закрытия
        if (modal._blockCloseHandler) {
            modal.removeEventListener('click', modal._blockCloseHandler);
            delete modal._blockCloseHandler;
        }
    },

    addSubtask: async function () {
        const subtaskText = document.getElementById('subtaskInput').value.trim();
        if (!subtaskText) return;

        let subtask;
        if (this.currentTask) {
            subtask = (await SubTask.add(this.currentTask.id, [subtaskText]))[0];
        }
        else {
            subtask = {
                id: String(Date.now()),
                name: subtaskText,
                completed: false
            };
        }

        this.subtasks.push(subtask);
        this.renderSubtasks();
        this.closeSubtaskModal();
    },

    renderSubtasks: function () {
        const subtasksList = document.getElementById('subtasksList');
        subtasksList.innerHTML = '';

        this.subtasks.forEach(subtask => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-item';
            subtaskItem.dataset.id = subtask.id;

            subtaskItem.innerHTML = `
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <div class="subtask-text" contenteditable="true">${subtask.name}</div>
                <div class="subtask-actions">
                    <button class="btn-icon delete-subtask" title="Удалить">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;

            const checkbox = subtaskItem.querySelector('.subtask-checkbox');
            checkbox.addEventListener('change', async (e) => {
                if (!(typeof subtask.id === "string")) {
                    await subtask.changeCompleted(e.target.checked);
                }
                this.updateSubtasksCount();
            });

            const text = subtaskItem.querySelector('.subtask-text');
            text.addEventListener('blur', async () => {
                const newText = text.textContent.trim();

                if (!(typeof subtask.id === "string")) {
                    await subtask.changeName(newText);
                }
            });

            const deleteBtn = subtaskItem.querySelector('.delete-subtask');
            deleteBtn.addEventListener('click', () => {
                this.subtasks = this.subtasks.filter(s => s.id !== subtask.id);
                if (!(typeof subtask.id === "string")) {
                    subtask.delete();
                }
                this.renderSubtasks();
            });

            subtasksList.appendChild(subtaskItem);
        });

        this.updateSubtasksCount();
    },

    updateSubtasksCount: function () {
        const completed = this.subtasks.filter(s => s.completed).length;
        const total = this.subtasks.length;
        document.getElementById('completedSubtasksCount').textContent = `${completed}/${total}`;
    },

    saveTask: async function () {
        const title = document.getElementById('taskTitleInput').value.trim();
        if (!title) {
            this.showAlertModal('Пожалуйста, введите название задачи');
            return;
        }

        const description = document.getElementById('taskDescription').value.trim();

        const startDate = document.getElementById('taskStartDate').value || formatLocalDateForInput(new Date());
        const startTime = document.getElementById('taskStartTime').value || '00:00';

        const dueDate = document.getElementById('taskDueDate').value || formatLocalDateForInput(new Date());
        const dueTime = document.getElementById('taskDueTime').value || '23:59';

        const taskStart = `${startDate}T${startTime}`;
        const taskEnd = `${dueDate}T${dueTime}`;

        if (this.currentTask) {
            this.currentTask.name = title;
            this.currentTask.start = taskStart;
            this.currentTask.end = taskEnd;
            this.currentTask.description = description;
            await this.currentTask.update();
        } else {
            const task = {
                taskName: title,
                taskStart: taskStart,
                taskEnd: taskEnd,
                taskDesc: description,
                taskColor: Status.getById(this.statusId).color,
                statusId: this.statusId,
                goal_id: Sphere.current.id,
            };
            this.currentTask = await Task.add(task);
            const subTaskNames = this.subtasks.map(subtask => subtask.name);
            if (subTaskNames.length > 0) {
                await SubTask.add(this.currentTask.id, subTaskNames);
            }
        }
        const [category, id] = parseHash();
        switch (category) {
            case "sphere":
                renderTasks();
                window.dayCycleManager.updateUI();
                break;
            case "calendar":
                window.calendarManager.renderCalendar();
        }
        this.closeModal();
    },

    resetForm: function () {
        document.getElementById('taskTitleInput').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskStartDate').value = '';
        document.getElementById('taskStartTime').value = '';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskDueTime').value = '';

        this.subtasks = [];
        this.timeSpent = 0;
        this.renderSubtasks();
    },

    showAlertModal: function (message) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay alert-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <div class="modal-actions2">
                    <button id="closeAlert" class="btn-primary">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('closeAlert').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },

    // НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С КОММЕНТАРИЯМИ

    loadComments: async function (taskId) {
        try {
            const comments = await TaskComment.fetchByTaskId(taskId);
            this.renderComments(comments);
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
            document.getElementById('taskCommentsList').innerHTML = '<p style="color: #999; text-align: center;">Ошибка загрузки комментариев</p>';
        }
    },

        async renderComments() {
        const commentsList = document.getElementById('taskCommentsList');
        if (!commentsList) return;

        try {
            const comments = await TaskComment.fetchByTaskId(this.currentTask.id);
            
            commentsList.innerHTML = comments.map(comment => {
                const isAuthor = comment.authorId === (User.instance?.id || 1);
                const avatar = comment.authorName?.charAt(0).toUpperCase() || '?';
                
                return `
                    <div class="task-comment-item" data-comment-id="${comment.id}">
                        <div class="task-comment-header">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <div class="comment-avatar">${avatar}</div>
                                <span class="task-comment-author">${comment.authorName || 'Пользователь'}</span>
                                <span class="task-comment-time">${comment.formattedDate}</span>
                            </div>
                            ${isAuthor ? `
                                <div class="task-comment-actions">
                                    <button class="task-comment-action-btn edit-btn" 
                                            onclick="TaskModalManager.editComment('${comment.id}')"
                                            title="Редактировать">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                        </svg>
                                    </button>
                                    <button class="task-comment-action-btn delete-btn" 
                                            onclick="TaskModalManager.deleteComment('${comment.id}')"
                                            title="Удалить">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="task-comment-content">
                            ${comment.content.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
            commentsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626;">Ошибка загрузки комментариев</div>';
        }
    },
    sendComment: async function () {
        if (!this.currentTask) {
            this.showAlertModal('Сначала сохраните задачу');
            return;
        }

        const commentInput = document.getElementById('taskCommentInput');
        const content = commentInput.value.trim();

        if (!content) {
            this.showAlertModal('Напишите что-нибудь перед отправкой');
            return;
        }

        try {
            const newComment = await TaskComment.add(this.currentTask.id, content);
            commentInput.value = '';
            commentInput.style.height = 'auto'; // Сбросить высоту текстареи
            
            // Перезагружаем комментарии
            await this.loadComments(this.currentTask.id);
            
            // Скроллим к новому комментарию
            const container = document.querySelector('.task-comments-container');
            if (container) {
                setTimeout(() => {
                    container.scrollTop = 0;
                }, 100);
            }
        } catch (error) {
            this.showAlertModal('Ошибка при отправке комментария: ' + error.message);
        }
    },

    deleteComment: async function (commentId, taskId) {
        this.showConfirmDialog(
            'Удаление комментария',
            'Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.',
            async () => {
                try {
                    const comment = new TaskComment({ id: commentId, taskId: taskId });
                    await comment.delete();
                    await this.loadComments(taskId);
                    this.closeConfirmDialog();
                } catch (error) {
                    this.showAlertModal('Ошибка при удалении комментария: ' + error.message);
                }
            }
        );
    },

    editComment: async function (comment) {
        this.showEditDialog(
            'Редактирование комментария',
            'Отредактируйте текст комментария:',
            comment.content,
            async (newContent) => {
                if (!newContent.trim()) {
                    this.showAlertModal('Комментарий не может быть пустым');
                    return;
                }
                try {
                    await TaskComment.update(this.currentTask.id, comment.id, newContent);
                    await this.loadComments(this.currentTask.id);
                    this.closeEditDialog();
                } catch (error) {
                    this.showAlertModal('Ошибка при редактировании комментария: ' + error.message);
                }
            }
        );
    },

    showConfirmDialog: function (title, message, onConfirm) {
        const dialog = document.getElementById('confirmDialog');
        document.getElementById('confirmDialogTitle').textContent = title;
        document.getElementById('confirmDialogMessage').textContent = message;
        
        const confirmBtn = document.getElementById('confirmDialogConfirmBtn');
        const cancelBtn = document.getElementById('confirmDialogCancelBtn');
        
        confirmBtn.onclick = onConfirm;
        cancelBtn.onclick = () => this.closeConfirmDialog();
        
        dialog.style.display = 'flex';
        dialog.classList.add('active');
    },

    closeConfirmDialog: function () {
        const dialog = document.getElementById('confirmDialog');
        dialog.style.display = 'none';
        dialog.classList.remove('active');
    },

    showEditDialog: function (title, message, defaultText, onSave) {
        const dialog = document.getElementById('editDialog');
        document.getElementById('editDialogTitle').textContent = title;
        document.getElementById('editDialogLabel').textContent = message;
        const editInput = document.getElementById('editDialogInput');
        editInput.value = defaultText;
        
        const saveBtn = document.getElementById('editDialogSaveBtn');
        const cancelBtn = document.getElementById('editDialogCancelBtn');
        
        saveBtn.onclick = () => onSave(editInput.value);
        cancelBtn.onclick = () => this.closeEditDialog();
        
        dialog.style.display = 'flex';
        dialog.classList.add('active');
        editInput.focus();
        editInput.select();
    },

    closeEditDialog: function () {
        const dialog = document.getElementById('editDialog');
        dialog.style.display = 'none';
        dialog.classList.remove('active');
    },

    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};