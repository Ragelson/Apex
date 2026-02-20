class DayCycleManager {
    constructor() {
        this.cycles = ['утро', 'день', 'вечер', 'ночь'];
        this.currentCycleIndex = 0;
        this.isManualSelection = false;
        this.autoUpdateTimeout = null;
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        this.today = `${yyyy}-${mm}-${dd}`;
        
        this.init();
    }

    init() {
        this.renderBaseStructure();
        this.setCurrentCycleByTime();
        this.setupEventListeners();
        this.startAutoUpdate();
        this.checkActiveTab();
    }
    
    setCurrentCycleByTime() {
        const hours = new Date().getHours();
        let index;

        if (hours >= 4 && hours < 10) index = 0;    // утро (4:00-10:00)
        else if (hours >= 10 && hours < 16) index = 1; // день (10:00-16:00)
        else if (hours >= 16 && hours < 22) index = 2; // вечер (16:00-22:00)
        else index = 3;                               // ночь (22:00-4:00)
        if (this.currentCycleIndex !== index) {
            this.currentCycleIndex = index;
            this.updateUI();
        }
    }

    renderBaseStructure() {
        const rightMenu = document.querySelector('.right-menu');
        if (!rightMenu) return;

        rightMenu.innerHTML = `
          <div class="menu-section">
            <div class="categories-container"></div>
            <div class="mini-calendar-container" style="display: none;"></div>
            <div class="timeline-container">
              <div class="today-tasks-container">
                <div class="navigation">
                  <button class="nav-btn prev-cycle-btn" title="Предыдущий цикл"><</button>
                  <h3 class="tasks-title tasks-${this.getCurrentCycle()}">Задачи на ${this.getCurrentCycle()}</h3>
                  <button class="nav-btn next-cycle-btn" title="Следующий цикл">></button>
                </div>
                <div class="timeline"></div>
              </div>
            </div>
          </div>
        `;

        if (typeof MiniCalendarManager !== 'undefined') {
            const calendarContainer = document.querySelector('.mini-calendar-container');
            MiniCalendarManager.init(calendarContainer);
        }
    }

    getCurrentCycle() {
        return this.cycles[this.currentCycleIndex];
    }

    updateUI() {
        const title = document.querySelector('.tasks-title');
        if (title) {
            title.textContent = `Задачи на ${this.getCurrentCycle()}`;
            // Удаляем все классы циклов и добавляем текущий
            this.cycles.forEach(cycle => title.classList.remove(`tasks-${cycle}`));
            title.classList.add(`tasks-${this.getCurrentCycle()}`);
        }
        this.updateTimeline();
        this.renderTimeline();
    }

    updateTimeline() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        timeline.innerHTML = '';

        const hours = this.getHoursForCycle(this.getCurrentCycle());

        hours.forEach(hour => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot-right';

            const timeLabel = document.createElement('span');
            timeLabel.className = 'time';
            timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;

            const dottedLine = document.createElement('div');
            dottedLine.className = 'dotted-line';

            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'tasks-container-timeline';

            timeSlot.appendChild(timeLabel);
            timeSlot.appendChild(dottedLine);
            timeSlot.appendChild(tasksContainer);
            timeline.appendChild(timeSlot);
        });
    }

renderTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    if (timeline.children.length === 0) {
        this.updateTimeline();
    }

    // Очищаем все контейнеры задач перед рендерингом
    document.querySelectorAll('.tasks-container-timeline').forEach(container => {
        container.innerHTML = '';
    });

    // Берём задачи, которые начинаются сегодня
    let tasks = Task.getTodayTasks().filter(task => {
        const startDate = task.start ? String(task.start).split('T')[0] : null;
        return startDate && startDate === this.today;
    });

    // ✅ сортируем по времени начала
    tasks = tasks.filter(t => t.start).sort((a, b) => {
        const dateA = new Date(a.start);
        const dateB = new Date(b.start);
        return dateA - dateB;
    });

    // Группируем задачи по часам
    const tasksByHour = {};
    tasks.forEach(task => {
        const hour = task.getStartHour();
        if (!tasksByHour[hour]) {
            tasksByHour[hour] = [];
        }
        tasksByHour[hour].push(task);
    });

    // Обрабатываем каждую группу задач по часам
    Object.keys(tasksByHour).forEach(hour => {
        const hourTasks = tasksByHour[hour];
        const timeSlot = Array.from(document.querySelectorAll('.time-slot-right'))
            .find(slot => parseInt(slot.querySelector('.time').textContent.split(':')[0]) === parseInt(hour));

        if (timeSlot) {
            const container = timeSlot.querySelector('.tasks-container-timeline');
            container.style.position = 'relative';
            container.style.height = '60px';
            container.style.width = '100%';

            // Сортируем задачи внутри часа по минутам (от 0 до 59)
            hourTasks.sort((a, b) => {
                const dateA = new Date(a.start);
                const dateB = new Date(b.start);
                return dateA.getMinutes() - dateB.getMinutes();
            });

            // Определяем максимальное количество колонок
            const maxColumns = 3;

            hourTasks.forEach((task, index) => {
                const taskElement = this.createTimelineTaskElement(task);
                const startDate = new Date(task.start);
                const minutes = startDate.getMinutes();

                // ВЫЧИСЛЯЕМ ПОЗИЦИЮ ВНУТРИ ЧАСА (0-59 минут → 0-59px)
                const positionTop = minutes;

                // Вычисляем позицию (колонку) для задачи
                const column = index % maxColumns;
                const totalColumns = Math.min(hourTasks.length, maxColumns);
                
                // Ширина одной колонки
                const containerWidth = container.clientWidth || 283;
                const columnWidth = containerWidth / totalColumns;

                // Позиционируем задачу
                taskElement.style.position = 'absolute';
                taskElement.style.top = `${(positionTop/2)+6}px`; // ← ОСНОВНОЕ ИСПРАВЛЕНИЕ
                taskElement.style.left = `${column * columnWidth}px`;
                taskElement.style.width = `${columnWidth - 4}px`;
                taskElement.style.zIndex = '2';
                taskElement.style.height = '20px'; // Фиксированная высота

                container.appendChild(taskElement);
            });
        }
    });

    // Теперь обрабатываем задачи, которые пересекают границу часов
    // (например, задача в 00:58 и 01:05 будут в разных часовых слотах)
    // Это уже правильно работает, так как они находятся в разных контейнерах
}



    getHoursForCycle(cycle) {
            switch (cycle) {
                case 'утро': return [ 6, 7, 8, 9, 10, 11, 12 ];       // 6:00 - 12:00
                case 'день': return [ 12, 13, 15, 14, 16, 17, 18]; // 12:00 - 18:00
                case 'вечер': return [ 18, 19, 20, 21, 22, 23, 0]; // 18:00 - 00:00
                case 'ночь': return [ 0, 1, 2, 3, 4, 5, 6];     // 00:00 - 6:00
                default: return [];
            }
    }

    createTimelineTaskElement(task) {
        const element = document.createElement('div');
        element.className = 'timeline-task';
        element.dataset.taskId = task.id;

        // Получаем цвет статуса (с запасным цветом)
        const sphere = Sphere.getById(task.sphereId) || { color: '#1a73e8' };
        const statusColor = sphere.color;

        // Устанавливаем стили с правильной прозрачностью
        element.style.backgroundColor = `${statusColor}30`; // 15% opacity
        element.style.borderLeft = `3px solid ${statusColor}`;
        element.style.borderTop = `1px solid ${statusColor}`;
        element.style.borderRight = `1px solid ${statusColor}`;
        element.style.borderBottom = `1px solid ${statusColor}`;
        element.style.color = '#1e293b';

        // Создаем контейнер для времени и названия в одну строку
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';

        // Время задачи, если указано
        if (task.start) {
            const time = document.createElement('span');
            time.className = 'task-time';
            time.textContent = task.getStartTime();
            time.style.fontWeight = '500';
            time.style.fontSize = '10px';
            time.style.color = '#1a73e8';
            row.appendChild(time);
        }

        // Название задачи
        const title = document.createElement('span');
        title.className = 'task-title1';
        title.textContent = task.name;
        title.title = task.name; // 👈 подсказка при наведении
        row.appendChild(title);

        element.appendChild(row);

        // Обработчик клика
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleTaskClick(task);
        });

        return element;
    }

    handleTaskClick(task) {
        // Проверяем, существует ли TaskModalManager
        if (TaskModalManager.initialized) {
            TaskModalManager.openModal(task);

            // Переходим к задаче на доске
            setTimeout(() => {
                const taskSphere = Sphere.getById(task.sphereId)
                if(Sphere.current !== taskSphere){
                    sphereManager.setCurrentSphere(taskSphere);
                }
                const taskElement = document.querySelector(`.task-item[data-task-id="${task.id}"]`);
                if (taskElement) {
                    //TODO
                    taskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    taskElement.classList.add('highlighted-task');
                    setTimeout(() => {
                        taskElement.classList.remove('highlighted-task');
                    }, 2000);
                }
            }, 500);
        } else {
            console.error('TaskModalManager is not defined');
        }
    }

    setupEventListeners() {
        // Кнопки переключения циклов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('prev-cycle-btn')) {
                this.switchToPreviousCycle();
            } else if (e.target.classList.contains('next-cycle-btn')) {
                this.switchToNextCycle();
            }
        });

        // Переключение между календарем и таймлайном
        this.setupTabListeners();
    }

    switchToPreviousCycle() {
        this.isManualSelection = true;
        this.currentCycleIndex = (this.currentCycleIndex - 1 + this.cycles.length) % this.cycles.length;
        this.updateUI();
        this.resetAutoUpdate();
    }

    switchToNextCycle() {
        this.isManualSelection = true;
        this.currentCycleIndex = (this.currentCycleIndex + 1) % this.cycles.length;
        this.updateUI();
        this.resetAutoUpdate();
    }

    checkActiveTab() {
        const calendarIcon = document.querySelector('.toolbar-icon[title="Календарь"]');
        if (calendarIcon && calendarIcon.classList.contains('active')) {
            this.showCalendar();
        } else {
            this.showTimeline();
        }
    }

    setupTabListeners() {
        document.addEventListener('calendarTabActivated', () => {
            this.showCalendar();
        });

        document.addEventListener('tasksTabActivated', () => {
            this.showTimeline();
        });

        document.querySelectorAll('.toolbar-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                if (!icon.classList.contains('active')) return;

                const title = icon.getAttribute('title');

                // Исключение для иконки техподдержки
                if (icon.id === 'chat-toggle-btn') {
                    return; // Не делаем ничего при клике на техподдержку
                }

                if (title === 'Календарь') {
                    this.showCalendar();
                } else {
                    this.showTimeline();
                }
            });
        });
    }

    showCalendar() {
        const timelineContainer = document.querySelector('.timeline-container');
        const calendarContainer = document.querySelector('.mini-calendar-container');
        const categoriesContainer = document.querySelector('.categories-container');

        if (timelineContainer && calendarContainer && categoriesContainer) {
            // Скрываем таймлайн и показываем календарь
            timelineContainer.style.display = 'none';
            calendarContainer.style.display = 'flex';

            // Изменяем соотношение пространства (60% сферы, 40% календарь)
            categoriesContainer.style.height = '60%';
            calendarContainer.style.height = '40%';

            // Инициализация календаря при необходимости
            if (typeof MiniCalendarManager !== 'undefined' &&
                !calendarContainer.hasChildNodes()) {
                MiniCalendarManager.init(calendarContainer);
            }
        }
    }

    showTimeline() {
        const timelineContainer = document.querySelector('.timeline-container');
        const calendarContainer = document.querySelector('.mini-calendar-container');
        const categoriesContainer = document.querySelector('.categories-container');

        if (timelineContainer && calendarContainer && categoriesContainer) {
            // Показываем таймлайн и скрываем календарь
            timelineContainer.style.display = 'block';
            calendarContainer.style.display = 'none';

            // Возвращаем стандартное соотношение (50% категории, 50% таймлайн)
            categoriesContainer.style.height = '50%';
            timelineContainer.style.height = 'auto';
        }
    }

    startAutoUpdate() {
        // Проверяем время каждую минуту
        setInterval(() => {
            if (!this.isManualSelection) {
                this.setCurrentCycleByTime();
            }
        }, 60000);
    }

    resetAutoUpdate() {
        // Сбрасываем таймер, если он уже есть
        if (this.autoUpdateTimeout) {
            clearTimeout(this.autoUpdateTimeout);
        }

        // Возвращаем автоматическое обновление через 2 часа
        this.autoUpdateTimeout = setTimeout(() => {
            this.isManualSelection = false;
            this.setCurrentCycleByTime();
        }, 7200000); // 2 часа
    }
}
