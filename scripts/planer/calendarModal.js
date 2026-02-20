const CalendarModalManager = {
    init: function () {
        this.selectedColor = '#4CAF50';
        this.bindEvents();
        this.loadSpheres();
        this.initialized = true
    },

    bindEvents: async function () {
        document.getElementById('saveCalendarTaskBtn').addEventListener('click', async () => {
            await this.saveTask();
        });
        document.getElementById('closeCalendarTaskBtn').addEventListener('click', async () => {
            await this.closeModal();
        });

        document.getElementById('calendarTaskModal').addEventListener('click', async (e) => {
            if (e.target === document.getElementById('calendarTaskModal')) {
                await this.closeModal();
            }
        });

        document.getElementById("calendarTaskSphere").addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            this.loadStatuses(parseInt(selectedValue));
        });
    },

    loadSpheres: async function () {
        const select = document.getElementById('calendarTaskSphere');
        select.innerHTML = '<option value="all"></option>';

        // (!!!БЭК!!!) Здесь должен быть запрос к API для получения сфер
        // const response = await fetch('/api/spheres');
        // const spheres = await response.json();

        // Временное решение с localStorage
        const mySpheres = Sphere.all || [];

        [...mySpheres].forEach(sphere => {
            const option = document.createElement('option');
            option.value = sphere.id;
            option.textContent = sphere.name;
            select.appendChild(option);
        });
    },

    openModalWithRange: async function (startDateTime, endDateTime) {
        await this.resetForm();

        document.getElementById('calendarStartDate').value = formatLocalDateForInput(startDateTime);
        document.getElementById('calendarStartTime').value = formatLocalTimeForInput(startDateTime);

        document.getElementById('calendarDueDate').value = formatLocalDateForInput(endDateTime);
        document.getElementById('calendarDueTime').value = formatLocalTimeForInput(endDateTime);

        document.getElementById('calendarTaskModal').style.display = 'block';
        document.getElementById('calendarTaskTitle').focus();
    },

    openModal: async function () {
        await this.resetForm();
        const now = new Date();
        
        document.getElementById('calendarStartDate').value = formatLocalDateForInput(now);
        document.getElementById('calendarDueDate').value = formatLocalDateForInput(now);
        document.getElementById('calendarStartTime').value = '09:00';
        document.getElementById('calendarDueTime').value = '18:00';
        document.getElementById('calendarTaskModal').style.display = 'block';
        document.getElementById('calendarTaskTitle').focus();
    },

    // (!!!БЭК!!!) Загрузка статусов задач из сервера/БД
    loadStatuses: async function (sphereId) {
        const statusSelect = document.getElementById('calendarTaskStatus');
        statusSelect.innerHTML = '';

        // Временное решение с фиксированным статусом
        const statuses = Status.getBySphereId(sphereId);

        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.id;
            option.textContent = status.name;
            statusSelect.appendChild(option);
        });
    },

    calculateEndTime: function (startTime, duration) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [durationHours, durationMinutes] = duration.split(':').map(Number);

        let endHours = startHours + durationHours;
        let endMinutes = startMinutes + durationMinutes;

        if (endMinutes >= 60) {
            endHours += Math.floor(endMinutes / 60);
            endMinutes = endMinutes % 60;
        }

        if (endHours >= 24) {
            endHours = endHours % 24;
        }

        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    },

    closeModal: async function () {
        document.getElementById('calendarTaskModal').style.display = 'none';
    },

    saveTask: async function () {
        const title = document.getElementById('calendarTaskTitle').value.trim();
        if (!title) {
            await this.showError('Пожалуйста, введите название задачи');
            return;
        }

        const description = document.getElementById('calendarTaskDescription').value.trim();

        const startDate = document.getElementById('calendarStartDate').value || formatLocalDateForInput(new Date());
        const startTime = document.getElementById('calendarStartTime').value || '00:00';

        const dueDate = document.getElementById('calendarDueDate').value || formatLocalDateForInput(new Date());
        const dueTime = document.getElementById('calendarDueTime').value || '23:59';

        const taskStart = `${startDate}T${startTime}`;
        const taskEnd = `${dueDate}T${dueTime}`;

        const sphere = parseInt(document.getElementById('calendarTaskSphere').value) || null;

        if (!sphere) {
            await this.showError('Пожалуйста, укажите сферу для задачи');
            return;
        }

        const status = parseInt(document.getElementById('calendarTaskStatus').value) || null;

        if (!status) {
            await this.showError('Пожалуйста, укажите статус для задачи');
            return;
        }

        const task = {
            taskName: title,
            taskStart: taskStart,
            taskEnd: taskEnd,
            taskDesc: description,
            taskColor: Status.getById(status).color,
            statusId: status,
            goal_id: sphere,
        };
        await Task.add(task);

        await this.closeModal();
        //TODO: переделать уведомление, чтобы работало нормально, а не просто останавливала действие кода
        //await this.showNotification(`Задача "${title}" успешно сохранена!`);

        if (window.calendarManager) {
            window.calendarManager.renderCalendar();
        }
    },

    showError: async function (message) {
        const errorElement = document.getElementById('calendarError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        await new Promise(resolve => setTimeout(resolve, 3000));
        errorElement.style.display = 'none';
    },

    showNotification: async function (message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        await new Promise(resolve => setTimeout(resolve, 10));
        notification.classList.add('show');

        await new Promise(resolve => setTimeout(resolve, 3000));
        notification.classList.remove('show');
        await new Promise(resolve => setTimeout(resolve, 300));
        document.body.removeChild(notification);
    },

    calculateDuration: function (startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        if (totalMinutes < 0) totalMinutes += 24 * 60;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },

    resetForm: async function () {
        this.currentTask = null;
        document.getElementById('calendarTaskTitle').value = '';
        document.getElementById('calendarTaskDescription').value = '';
        document.getElementById('calendarStartDate').value = '';
        document.getElementById('calendarStartTime').value = '';
        document.getElementById('calendarDueDate').value = '';
        document.getElementById('calendarDueTime').value = '';
        document.getElementById('calendarTaskSphere').value = 'all';
        this.selectedColor = '#4CAF50';
        this.timeSpent = 0;
    }
};