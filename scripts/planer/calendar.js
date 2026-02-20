class CalendarManager {
    constructor() {
        this.config = {
            view: 'day', // По умолчанию месяц, как в первом файле
            currentDate: new Date(),
            miniCalendarDate: new Date()
        };
        this.isCalendarView = false;
        this.dragState = {
            isDragging: false,
            dragElement: null,
            startElement: null,
            startDate: null,
            startHour: null,
            endElement: null,
            selectedElements: [],
            startCell: null,
            selectedCells: []
        };
        this.init();
    }

    // Main methods
    init() {
        this.renderCalendar();
        this.setupEventListeners();
        this.setupResponsiveGrid();
        this.toggleRightMenu(true);
        if (!CalendarModalManager.initialized) {
            CalendarModalManager.init();
        }
    }

    /**
     * Настраивает адаптивную сетку календаря для разных размеров экрана
     * Высчитывает высоту одного слота на основе доступной высоты контейнера
     * Формула: Доступная высота ÷ 24 часа = высота одного слота
     */
    setupResponsiveGrid() {
        const updateGridHeight = () => {
            const calendarBody = document.querySelector('.calendar-body');
            const calendarContainer = document.querySelector('.calendar-container');
            
            if (!calendarBody || !calendarContainer) return;

            const headerHeight = document.querySelector('.calendar-header')?.offsetHeight || 60;
            const availableHeight = calendarContainer.offsetHeight - headerHeight;

            // 24 часа в дне
            const hoursInDay = 24;
            const slotHeight = Math.max(40, availableHeight / hoursInDay); // минимум 40px на слот

            // Устанавливаем CSS переменную
            document.documentElement.style.setProperty('--hour-slot-height', `${slotHeight}px`);
        };

        // Обновляем при загрузке
        setTimeout(updateGridHeight, 100);

        // Обновляем при изменении размера окна (с throttling для производительности)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateGridHeight, 150);
        });

        // Сохраняем ссылку на функцию для вызова при переключении представлений
        this.updateGridHeight = updateGridHeight;
    }

    /**
     * Обновляет высоту сетки при переключении представлений
     */
    updateCalendarGridHeight() {
        if (this.updateGridHeight) {
            setTimeout(this.updateGridHeight, 50);
        }
    }

    toggleRightMenu(showCalendar) {
        this.isCalendarView = showCalendar;
        document.dispatchEvent(new CustomEvent(showCalendar ? 'calendarTabActivated' : 'tasksTabActivated'));
        this.updateRightMenuCalendar();
    }

    updateRightMenuCalendar() {
        const rightMenu = document.querySelector('.right-menu');
        if (!rightMenu) return;

        const calendarContainer = rightMenu.querySelector('.mini-calendar-container') ||
            this.createCalendarContainer(rightMenu);
        const timelineContainer = rightMenu.querySelector('.timeline-container');

        calendarContainer.style.display = this.isCalendarView ? 'block' : 'none';
        if (timelineContainer) timelineContainer.style.display = this.isCalendarView ? 'none' : 'block';

        if (this.isCalendarView) {
            calendarContainer.innerHTML = this.generateMiniCalendarHTML();
            this.setupMiniCalendarListeners(calendarContainer);
            this.highlightSelectedDay();
        }
    }

    createCalendarContainer(rightMenu) {
        const container = document.createElement('div');
        container.className = 'mini-calendar-container';
        rightMenu.appendChild(container);
        return container;
    }

    generateMiniCalendarHTML() {
        const monthName = this.config.miniCalendarDate.toLocaleDateString('ru-RU', {
            month: 'long',
            year: 'numeric'
        });

        return `
                <div class="mini-calendar-header">
                    <button class="mini-nav-btn prev-month" aria-label="Previous month">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h3>${monthName}</h3>
                    <button class="mini-nav-btn next-month" aria-label="Next month">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                <div class="mini-calendar">
                    <div class="mini-weekdays">
                        ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day =>
            `<div class="mini-weekday">${day}</div>`
        ).join('')}
                    </div>
                    <div class="mini-calendar-days">
                        ${this.generateMiniCalendarDays(this.config.miniCalendarDate)}
                    </div>
                </div>
            `;
    }

    setupMiniCalendarListeners(container) {
        container.querySelector('.prev-month').addEventListener('click', () => {
            this.config.miniCalendarDate.setMonth(this.config.miniCalendarDate.getMonth() - 1);
            this.updateRightMenuCalendar();
        });

        container.querySelector('.next-month').addEventListener('click', () => {
            this.config.miniCalendarDate.setMonth(this.config.miniCalendarDate.getMonth() + 1);
            this.updateRightMenuCalendar();
        });

        container.querySelectorAll('.mini-day').forEach(day => {
            day.addEventListener('click', () => {
                this.config.currentDate = new Date(day.dataset.date);
                this.config.view = 'day'; // Переключаем на день при клике
                this.renderCalendar();
                this.highlightSelectedDay();
            });
        });
    }

    generateMiniCalendarDays(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDay = getStartOfWeek(firstDay);
        const endDay = new Date(startDay);
        endDay.setDate(startDay.getDate() + 41);

        let html = '';
        const currentDate = new Date(startDay);

        while (currentDate <= endDay) {
            const isCurrentMonth = currentDate.getMonth() === date.getMonth();
            const isItToday = isToday(currentDate);
            const dateStr = formatDate(currentDate);
            const hasTasks = Task.all.some(task =>
                formatDate(new Date(task.date)) === dateStr
            );

            html += `
                    <div class="mini-day 
                        ${isCurrentMonth ? 'current-month' : 'other-month'} 
                        ${isItToday ? 'today' : ''}
                        ${hasTasks ? 'has-events' : ''}" 
                        data-date="${dateStr}"
                        aria-label="${currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}">
                        ${currentDate.getDate()}
                    </div>
                `;

            currentDate.setDate(currentDate.getDate() + 1);
        }
        return html;
    }

    // ===== modal helpers =====
    ensureCalendarEventModal() {
        let modal = document.querySelector('.calendar-event-modal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.className = 'calendar-event-modal hidden';
        modal.innerHTML = `
        <div class="calendar-event-modal__content">
            <button class="calendar-event-modal__close" aria-label="Закрыть">×</button>
            <h3 class="calendar-event-modal__title">События недели</h3>
            <ul class="calendar-event-modal__list"></ul>
        </div>
        `;
        document.body.appendChild(modal);

        // закрытие
        const close = () => modal.classList.add('hidden');
        modal.querySelector('.calendar-event-modal__close').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        return modal;
    }

    openCalendarEventModal(events) {
        const modal = this.ensureCalendarEventModal();
        const ul = modal.querySelector('.calendar-event-modal__list');
        ul.innerHTML = '';

        events.forEach(task => {
            const li = document.createElement('li');
            const start = new Date(task.start);
            const end = new Date(task.end || task.start);
            const range = `${start.toLocaleDateString('ru-RU')} — ${end.toLocaleDateString('ru-RU')}`;
            li.innerHTML = `
            <div class="cem-item">
                <div class="cem-item__title">${task.name}</div>
                <div class="cem-item__range">${range}</div>
            </div>
            `;
            li.addEventListener('click', () => {
                modal.classList.add('hidden');
                TaskModalManager.openModal(task);
            });
            ul.appendChild(li);
        });

        modal.classList.remove('hidden');
    }

    renderCalendar() {
        sphereManager.updateHeaderTitle("Календарь");
        // Принудительное обновление иконки если требуется
        const spheresIcon = document.querySelector('.toolbar-icon[title="Календарь"]');
        if (spheresIcon && !spheresIcon.classList.contains('active')) {
            document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
            spheresIcon.classList.add('active');
        }
        const content = document.querySelector('.content');
        if (!content) return;
        
        content.innerHTML = `
    <div class="calendar-container">
        <div class="calendar-header">
            <div class="calendar-views">
                <button class="view-btn ${this.config.view === 'day' ? 'active' : ''}" data-view="day">День</button>
                <button class="view-btn ${this.config.view === 'week' ? 'active' : ''}" data-view="week">Неделя</button>
                <button class="view-btn ${this.config.view === 'month' ? 'active' : ''}" data-view="month">Месяц</button>
                <button class="view-btn ${this.config.view === 'year' ? 'active' : ''}" data-view="year">Год</button>
            </div>

            <div class="calendar-nav" style="flex-direction:column;align-items:center;">
                <div style="display:flex;align-items:center;justify-content:center;">
                    <button class="nav-btn prev-btn" aria-label="Previous">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h2 class="current-period"></h2>
                    <button class="nav-btn next-btn" aria-label="Next">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                <button class="today-btn" style="margin-top:-8px;">Сегодня</button>
            </div>
            <button class="add-task-calendar-btn">
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                Создать
            </button>
        </div>
        <div class="calendar-body"></div>
    </div>
`;


        this.updateCalendarTitle();
        this.renderCalendarBody();
        this.updateCalendarGridHeight();
        this.setupDragToCreate();
        this.setupAddTaskButton();
        this.setupTodayButton();
        this.setupViewButtons();
    }

    setupAddTaskButton() {
        const btn = document.querySelector('.add-task-calendar-btn');
        if (btn) {
            btn.addEventListener('click', () => CalendarModalManager.openModal());
        }
    }

    setupTodayButton() {
        const btn = document.querySelector('.today-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.config.currentDate = new Date();
                this.renderCalendar();
                this.highlightSelectedDay();
            });
        }
    }

    setupViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.config.view = btn.dataset.view;
                this.renderCalendar();
            });
        });
    }

    setupDragToCreate() {
        const calendarBody = document.querySelector('.calendar-body');
        if (!calendarBody) return;

        calendarBody.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            if (this.config.view === 'month') {
                const target = e.target.closest('.day-cell');
                if (!target) return;

                this.dragState.isDragging = true;
                this.dragState.startCell = target;
                this.dragState.selectedCells = [target];
                target.classList.add('drag-selected');

                e.preventDefault();
            } else {
                const target = e.target.closest('.hour-slot');
                if (!target) return;

                this.dragState.isDragging = true;
                this.dragState.startElement = target;
                this.dragState.startDate = new Date(target.dataset.date);
                this.dragState.startHour = parseInt(target.dataset.hour);
                this.dragState.selectedElements = [target];
                target.classList.add('drag-selected');

                e.preventDefault();
            }
        });

        calendarBody.addEventListener('mousemove', (e) => {
            if (!this.dragState.isDragging) return;

            if (this.config.view === 'month') {
                const target = e.target.closest('.day-cell');
                if (!target) return;

                document.querySelectorAll('.day-cell.drag-selected').forEach(cell => {
                    if (!this.dragState.selectedCells.includes(cell)) {
                        cell.classList.remove('drag-selected');
                    }
                });

                const startDate = new Date(this.dragState.startCell.dataset.date);
                const endDate = new Date(target.dataset.date);

                const sortedDates = [startDate, endDate].sort((a, b) => a - b);
                const [start, end] = sortedDates;

                document.querySelectorAll('.day-cell').forEach(cell => {
                    const cellDate = new Date(cell.dataset.date);
                    if (cellDate >= start && cellDate <= end) {
                        cell.classList.add('drag-selected');
                        if (!this.dragState.selectedCells.includes(cell)) {
                            this.dragState.selectedCells.push(cell);
                        }
                    }
                });
            } else {
                const target = e.target.closest('.hour-slot');
                if (!target) return;

                document.querySelectorAll('.hour-slot.drag-selected').forEach(el => {
                    if (!this.dragState.selectedElements.includes(el)) {
                        el.classList.remove('drag-selected');
                    }
                });

                const endDate = new Date(target.dataset.date);
                const endHour = parseInt(target.dataset.hour);

                if (this.config.view === 'week') {
                    const startDateTime = new Date(this.dragState.startDate);
                    startDateTime.setHours(this.dragState.startHour, 0, 0, 0);

                    const endDateTime = new Date(endDate);
                    endDateTime.setHours(endHour, 0, 0, 0);

                    const sortedDates = [startDateTime, endDateTime].sort((a, b) => a - b);
                    const [start, end] = sortedDates;

                    document.querySelectorAll('.hour-slot').forEach(slot => {
                        const slotDate = new Date(slot.dataset.date);
                        const slotHour = parseInt(slot.dataset.hour);
                        slotDate.setHours(slotHour, 0, 0, 0);

                        if (slotDate >= start && slotDate <= end) {
                            slot.classList.add('drag-selected');
                            if (!this.dragState.selectedElements.includes(slot)) {
                                this.dragState.selectedElements.push(slot);
                            }
                        }
                    });
                }
                else if (this.config.view === 'day') {
                    const startTime = this.dragState.startHour;
                    const endTime = endHour;

                    if (endTime < startTime && Math.abs(endTime - startTime) > 12) {
                        document.querySelectorAll('.hour-slot').forEach(slot => {
                            const slotTime = parseInt(slot.dataset.hour);
                            if (slotTime >= startTime || slotTime <= endTime) {
                                slot.classList.add('drag-selected');
                                if (!this.dragState.selectedElements.includes(slot)) {
                                    this.dragState.selectedElements.push(slot);
                                }
                            }
                        });
                    } else {
                        const sortedTimes = [startTime, endTime].sort((a, b) => a - b);
                        const [start, end] = sortedTimes;

                        document.querySelectorAll('.hour-slot').forEach(slot => {
                            const slotTime = parseInt(slot.dataset.hour);
                            if (slotTime >= start && slotTime <= end) {
                                slot.classList.add('drag-selected');
                                if (!this.dragState.selectedElements.includes(slot)) {
                                    this.dragState.selectedElements.push(slot);
                                }
                            }
                        });
                    }
                }
            }
        });

        calendarBody.addEventListener('mouseup', (e) => {
            if (!this.dragState.isDragging) {
                this.cleanupDrag();
                return;
            }

            if (this.config.view === 'month') {
                const target = e.target.closest('.day-cell');
                if (!target) {
                    this.cleanupDrag();
                    return;
                }

                const startDate = new Date(this.dragState.startCell.dataset.date);
                const endDate = new Date(target.dataset.date);

                const sortedDates = [startDate, endDate].sort((a, b) => a - b);
                const [start, end] = sortedDates;

                this.cleanupDrag();
                CalendarModalManager.openModalWithRange(
                    new Date(start.setHours(12, 0, 0, 0)),
                    new Date(end.setHours(12, 0, 0, 0))
                );
            } else {
                const target = e.target.closest('.hour-slot');
                if (!target) {
                    this.cleanupDrag();
                    return;
                }

                this.dragState.endElement = target;
                const endDate = new Date(target.dataset.date);
                const endHour = parseInt(target.dataset.hour);

                let startDateTime, endDateTime;

                if (this.config.view === 'day') {
                    startDateTime = new Date(this.dragState.startDate);
                    startDateTime.setHours(this.dragState.startHour, 0, 0, 0);

                    endDateTime = new Date(endDate);
                    endDateTime.setHours(endHour + 1, 0, 0, 0);

                    if (endHour < this.dragState.startHour) {
                        endDateTime.setDate(endDateTime.getDate() + 1);
                    }
                } else if (this.config.view === 'week') {
                    startDateTime = new Date(this.dragState.startDate);
                    startDateTime.setHours(this.dragState.startHour, 0, 0, 0);

                    endDateTime = new Date(endDate);
                    endDateTime.setHours(endHour + 1, 0, 0, 0);

                    if (endDate.getTime() === this.dragState.startDate.getTime() && endHour < this.dragState.startHour) {
                        endDateTime.setDate(endDateTime.getDate() + 1);
                    }
                }

                this.cleanupDrag();
                CalendarModalManager.openModalWithRange(startDateTime, endDateTime);
            }
        });

        calendarBody.addEventListener('mouseleave', () => {
            this.cleanupDrag();
        });
    }

    cleanupDrag() {
        this.dragState.isDragging = false;
        this.dragState.startElement = null;
        this.dragState.startDate = null;
        this.dragState.startHour = null;
        this.dragState.endElement = null;
        this.dragState.selectedElements = [];
        this.dragState.startCell = null;
        this.dragState.selectedCells = [];

        if (this.dragState.dragElement) {
            document.body.removeChild(this.dragState.dragElement);
            this.dragState.dragElement = null;
        }

        document.querySelectorAll('.hour-slot.drag-selected, .day-cell.drag-selected').forEach(el => {
            el.classList.remove('drag-selected');
        });
    }

    updateCalendarTitle() {
        const titleEl = document.querySelector('.current-period');
        if (!titleEl) return;
        const date = this.config.currentDate;
        const options = { month: 'long', year: 'numeric' };

        switch (this.config.view) {
            case 'day':
                titleEl.textContent = date.toLocaleDateString('ru-RU', {
                    weekday: 'long', day: 'numeric', ...options
                });
                break;
            case 'week':
                const start = getStartOfWeek(date);
                const end = new Date(start);
                end.setDate(start.getDate() + 6);

                if (start.getMonth() === end.getMonth()) {
                    titleEl.textContent = `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('ru-RU', options)}`;
                } else {
                    titleEl.textContent = `${start.getDate()} ${start.toLocaleDateString('ru-RU', { month: 'short' })} - 
                            ${end.getDate()} ${end.toLocaleDateString('ru-RU', options)}`;
                }
                break;
            case 'month':
                titleEl.textContent = date.toLocaleDateString('ru-RU', options);
                break;
            case 'year':
                titleEl.textContent = date.getFullYear();
                break;
        }
    }

    renderCalendarBody() {
        const calendarBody = document.querySelector('.calendar-body');
        if (!calendarBody) return;

        calendarBody.innerHTML = '';

        switch (this.config.view) {
            case 'day':
                this.renderDayView(calendarBody);
                break;
            case 'week':
                this.renderWeekView(calendarBody);
                break;
            case 'month':
                this.renderMonthView(calendarBody);
                break;
            case 'year':
                this.renderYearView(calendarBody);
                break;
        }

        this.renderEvents();
    }

    renderDayView(container) {
        container.innerHTML = `
            <div class="day-view">
                <div class="time-column">
                    ${Array.from({ length: 24 }, (_, i) => {
                        return `<div class="time-slot" data-hour="${i}">
                            <span class="hour-label">${i.toString().padStart(2, '0')}:00</span>
                            <div class="hour-line"></div>
                        </div>`;
                    }).join('')}
                </div>
                <div class="events-column" data-date="${formatDate(this.config.currentDate)}">
                    <div class="all-day-events">
                        <div class="all-day-slots"></div>
                    </div>
                    ${Array.from({ length: 24 }, (_, i) => {
                        return `<div class="hour-slot" data-hour="${i}" data-date="${formatDate(this.config.currentDate)}"></div>`;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Прокрутка к 10:00
        this.scrollToTime(10, container);
    }

    scrollToTime(hour, container) {
        // Ждем немного, чтобы DOM полностью отрендерился
        setTimeout(() => {
            const hourSlot = container.querySelector(`.hour-slot[data-hour="${hour}"]`);
            if (hourSlot) {
                const scrollPosition = hourSlot.offsetTop;
                container.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth' // Это делает прокрутку плавной
                });
            }
        }, 300);
    }

renderWeekView(container) {
    const startOfWeek = getStartOfWeek(this.config.currentDate);

    container.innerHTML = `
        <div class="week-view">
            <div class="weekdays-header1">
                <!-- Добавляем пустой элемент для выравнивания -->
                <div class="time-column-spacer"></div>
                ${Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    return `
                        <div class="weekday">
                            <div class="weekday-name">${date.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                            <div class="weekday-date ${isToday(date) ? 'today' : ''}">${date.getDate()}</div>
                        </div>`;
                }).join('')}
            </div>
            <div class="week-body">
                <div class="all-day-events">
                    <!-- Также добавляем спейсер для all-day событий -->
                    <div class="time-column-spacer"></div>
                    ${Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        return `<div class="all-day-slot" data-date="${formatDate(date)}"></div>`;
                    }).join('')}
                </div>
                <div class="time-grid">
                    <div class="time-column">
                        ${Array.from({ length: 24 }, (_, i) => {
                            return `<div class="time-slot" data-hour="${i}">
                                <span class="hour-label">${i.toString().padStart(2, '0')}:00</span>
                                <div class="hour-line"></div>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="events-grid">
                        ${Array.from({ length: 7 }, (_, i) => {
                            const date = new Date(startOfWeek);
                            date.setDate(startOfWeek.getDate() + i);
                            return `<div class="day-column" data-date="${formatDate(date)}">
                                ${Array.from({ length: 24 }, (_, j) => {
                                    return `<div class="hour-slot" data-hour="${j}" data-date="${formatDate(date)}"></div>`;
                                }).join('')}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.scrollToTime(10, container);
}

    renderMonthView(container) {
        const firstDay = new Date(
            this.config.currentDate.getFullYear(),
            this.config.currentDate.getMonth(),
            1
        );
        const lastDay = new Date(
            this.config.currentDate.getFullYear(),
            this.config.currentDate.getMonth() + 1,
            0
        );
        const startDay = getStartOfWeek(firstDay);
        const endDay = getEndOfWeek(lastDay);

        container.innerHTML = `
                <div class="month-view">
                    <div class="weekdays-header">
                        ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day =>
            `<div class="weekday">${day}</div>`
        ).join('')}
                    </div>
                    <div class="month-grid-container">
                        <div class="days-grid">${this.generateMonthDays(startDay, endDay)}</div>
                        <div class="month-events-layer"></div>
                    </div>
                </div>
            `;
    }

    renderYearView(container) {
        const year = this.config.currentDate.getFullYear();
        container.innerHTML = `
                <div class="year-view">
                    <div class="year-grid">
                        ${Array.from({ length: 12 }, (_, month) => {
            const date = new Date(year, month, 1);
            return `
                                <div class="year-month">
                                    <h3>${date.toLocaleDateString('ru-RU', { month: 'long' })}</h3>
                                    <div class="year-month-grid">
                                        ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Ср', 'Вс'].map(day =>
                `<div class="year-weekday">${day}</div>`
            ).join('')}
                                        ${this.generateYearMonthDays(year, month)}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            `;
    }

    renderEvents() {
        switch (this.config.view) {
            case 'day':
                this.renderDayEvents();
                break;
            case 'week':
                this.renderWeekEvents();
                break;
            case 'month':
                this.renderMonthEvents();
                break;
        }
    }


renderDayEvents() {
    const eventsColumn = document.querySelector('.events-column');
    if (!eventsColumn) return;

    const dateStr = eventsColumn.dataset.date;
    const dayTasks = Task.all.filter(task => {
        const start = new Date(task.start);
        const end = new Date(task.end || task.start);
        const durationHours = (end - start) / (1000 * 60 * 60);
        return formatDate(start) === dateStr && durationHours <= 24;
    });

    this.clearEvents();

    const tasks = dayTasks.map(task => ({
        task,
        start: new Date(task.start),
        end: new Date(task.end || task.start)
    })).sort((a, b) => a.start - b.start);

    // Построение сетки перекрытий
    const groups = [];
    tasks.forEach(t => {
        let placed = false;
        for (const group of groups) {
            if (group.some(g => t.start < g.end && g.start < t.end)) {
                group.push(t);
                placed = true;
                break;
            }
        }
        if (!placed) groups.push([t]);
    });

    // Распределяем слоты внутри каждой группы
    groups.forEach(group => {
        group.sort((a, b) => a.start - b.start);
        const slots = [];
        group.forEach(event => {
            let slotIndex = 0;
            while (slots[slotIndex] && slots[slotIndex].some(e => e.start < event.end && event.start < e.end)) {
                slotIndex++;
            }
            event.slot = slotIndex;
            if (!slots[slotIndex]) slots[slotIndex] = [];
            slots[slotIndex].push(event);
        });

        const totalSlots = slots.length;
        group.forEach(event => {
            const widthPercent = 85 / totalSlots;
            const leftPercent = event.slot * widthPercent;

            const startPixel = timeToPixel(event.start);
            const endPixel = timeToPixel(event.end);
            const height = Math.max(40, endPixel - startPixel);

            const el = this.createEventElement(event.task);

            this.applyEventStyles(el, {
                position: 'absolute',
                top: `${startPixel}px`,
                height: `${height}px`,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                boxSizing: 'border-box',
                marginLeft: '30px',
                paddingRight: '2px'
            });

            eventsColumn.appendChild(el);
        });
    });
}



renderWeekEvents() {
    this.clearEvents();

    const dayColumns = document.querySelectorAll('.day-column');

    dayColumns.forEach(column => {
        const dateStr = column.dataset.date;
        const columnDate = new Date(dateStr);
        columnDate.setHours(0, 0, 0, 0);

        const dayTasks = Task.all.filter(task => {
            const start = new Date(task.start);
            const end = new Date(task.end || task.start);

            const dayStart = new Date(columnDate);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(columnDate);
            dayEnd.setHours(23, 59, 59, 999);

            return start <= dayEnd && end >= dayStart;
        });

        
        dayTasks.forEach(task => {
            const start = new Date(task.start);
            const end = new Date(task.end || task.start);

            let startHour, endHour;

            // если задача начинается и заканчивается в этот же день
            if (formatDate(start) === dateStr && formatDate(end) === dateStr) {
                startHour = start.getHours() + start.getMinutes() / 60;
                endHour = end.getHours() + end.getMinutes() / 60;
            }
            // первый день многодневного события
            else if (formatDate(start) === dateStr) {
                startHour = start.getHours() + start.getMinutes() / 60;
                endHour = end.getHours() + end.getMinutes() / 60;

            }
            // последний день многодневного события
            else if (formatDate(end) === dateStr) {
                startHour = start.getHours() + start.getMinutes() / 60;
                endHour = end.getHours() + end.getMinutes() / 60;
            }
            // промежуточный день
            else {
                startHour = start.getHours() + start.getMinutes() / 60;
                endHour = end.getHours() + end.getMinutes() / 60;
            }

            const durationHours = endHour - startHour;

            const eventEl = this.createEventElement(task);
            this.applyEventStyles(eventEl, {
                position: 'absolute',
                top: `${startHour * 60}px`,
                height: `${durationHours * 60}px`,
                left: '4px',
                right: '4px'
            });

            column.appendChild(eventEl);
        });
    });
}


placeWeekAllDayEvent(task, allDaySlots, start, end) {
  const slots = Array.from(allDaySlots).filter(slot => {
    const d = new Date(slot.dataset.date);
    return d >= stripTime(start) && d <= stripTime(end);
  });
  if (slots.length === 0) return;

  const first = slots[0];
  const last = slots[slots.length - 1];

  const el = this.createEventElement(task, true);
  el.classList.add('multiday');
  el.style.position = 'absolute';
  el.style.top = `${first.offsetTop + 4}px`;
  el.style.left = `${first.offsetLeft + 4}px`;
  el.style.width = (last.offsetLeft + last.offsetWidth - first.offsetLeft - 8) + 'px';
  el.style.height = '22px';  // Высота для мультизадачи
  el.style.lineHeight = '22px';

  first.parentElement.appendChild(el);
}


stripTime(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}


// Вспомогательные методы
clearEvents() {
  document.querySelectorAll('.calendar-event').forEach(el => el.remove());
}

applyEventStyles(element, styles) {
  Object.keys(styles).forEach(property => {
    element.style[property] = styles[property];
  });
}


    renderMonthEvents() {
        const eventsLayer = document.querySelector('.month-events-layer');
        if (!eventsLayer) return;
        eventsLayer.innerHTML = '';

        // чтобы элементы были кликабельны
        eventsLayer.style.pointerEvents = 'none';

        const allCells = Array.from(document.querySelectorAll('.day-cell.current-month'));

        // сгруппируем ячейки по строкам (неделям)
        const rows = {};
        allCells.forEach(c => {
            const k = c.offsetTop;
            if (!rows[k]) rows[k] = [];
            rows[k].push(c);
        });
        Object.values(rows).forEach(arr => arr.sort((a,b) => a.offsetLeft - b.offsetLeft));

        // Параметры раскладки
        const maxLevels = 3;        // максимум видимых строк-событий на неделю
        const rowHeight = 22;
        const topOffset = 30;
        const sidePad = 8;

        // Группы по строкам: слоты по уровням и переполнения
        const rowGroups = {}; // { [rowKey]: { levels: Array<Array<[startPx,endPx]>>, placed:Set<id>, overflow:Set<task>, anchor:{top,left} } }

        // Стабильный порядок — по дате старта
        const tasks = [...Task.all].sort((a,b) => new Date(a.start) - new Date(b.start));

        tasks.forEach(task => {
            const start = new Date(task.start); start.setHours(0,0,0,0);
            const end = new Date(task.end || task.start); end.setHours(23,59,59,999);

            // ячейки в диапазоне задачи
            const taskCells = allCells.filter(cell => {
                const d = new Date(cell.dataset.date);
                return d >= start && d <= end;
            });
            if (taskCells.length === 0) return;

            // разбивка на недели (строки)
            let chunk = [];
            let currentTop = taskCells[0].offsetTop;

            const flush = () => {
                if (chunk.length === 0) return;
                this.placeEventSegment({
                    task, cells: chunk, eventsLayer, rowGroups,
                    maxLevels, rowHeight, topOffset, sidePad
                });
                chunk = [];
            };

            taskCells.forEach((cell, i) => {
                if (cell.offsetTop !== currentTop) {
                    flush();
                    currentTop = cell.offsetTop;
                }
                chunk.push(cell);
                if (i === taskCells.length - 1) flush();
            });
        });

        // Рендерим "+N ещё" по строкам
        Object.entries(rowGroups).forEach(([rowKey, group]) => {
            if (!group || !group.overflow || group.overflow.size === 0) return;

            const n = group.overflow.size;

            // Берём первую и последнюю ячейку строки (недели)
            const weekCells = group.weekCells || [];
            if (weekCells.length === 0) return;

            const firstCell = weekCells[0];
            const lastCell  = weekCells[weekCells.length - 1];

            const segStart = firstCell.offsetLeft + sidePad;
            const segEnd   = lastCell.offsetLeft + lastCell.offsetWidth - sidePad;

            const moreBtn = document.createElement('div');
            moreBtn.className = 'calendar-event more-events';
            moreBtn.textContent = `+${n} ещё`;

            moreBtn.style.position = 'absolute';
            moreBtn.style.top = `${Number(rowKey) + topOffset + (maxLevels) * rowHeight}px`;
            moreBtn.style.left = `${segStart}px`;
            moreBtn.style.width = 'auto'; // ширина всей недели
            moreBtn.style.height = `${rowHeight - 2}px`;
            moreBtn.style.lineHeight = `${rowHeight - 2}px`;
            moreBtn.style.textAlign = 'center';
            moreBtn.style.justifyItems = 'center';
            moreBtn.style.cursor = 'pointer';
            moreBtn.style.pointerEvents = 'auto';
            moreBtn.style.background = 'rgba(255,255,255,0.85)'; // чтобы область была видна и кликабельна
            moreBtn.style.borderRadius = '6px';
            moreBtn.style.border = '1px solid #1a73e8';
            moreBtn.style.zIndex = 10;

            const allWeekTasks = new Map();
            if (group.placed) group.placed.forEach(t => allWeekTasks.set(t.id, t));
            group.overflow.forEach(t => allWeekTasks.set(t.id, t));

            moreBtn.addEventListener('click', () => {
                this.openCalendarEventModal(Array.from(allWeekTasks.values()));
            });

            eventsLayer.appendChild(moreBtn);
        });
    }

    placeEventSegment({ task, cells, eventsLayer, rowGroups, maxLevels, rowHeight, topOffset, sidePad }) {
        const first = cells[0];
        const last  = cells[cells.length - 1];
        const rowKey = first.offsetTop;

        // Инициализация группы строки
        if (!rowGroups[rowKey]) {
            rowGroups[rowKey] = {
                levels: [],
                placed: new Set(),
                overflow: new Set(),
                anchor: { top: rowKey, left: first.offsetLeft },
                weekCells: [] // 👈 добавим
            };
        }
        const group = rowGroups[rowKey];
        // Запомним все ячейки этой недели
        rowGroups[rowKey].weekCells = rowGroups[rowKey].weekCells.concat(cells);
        
        // границы сегмента в пикселях
        const segStart = first.offsetLeft + sidePad;
        const segEnd   = last.offsetLeft + last.offsetWidth - sidePad;

        // ищем первый свободный уровень без горизонтального пересечения
        let levelIndex = -1;
        for (let i = 0; i < Math.max(group.levels.length, maxLevels); i++) {
            if (i >= maxLevels) break; // не показываем больше лимита
            if (!group.levels[i]) group.levels[i] = [];
            const occupied = group.levels[i];

            const overlaps = occupied.some(([a,b]) => !(segEnd <= a || segStart >= b));
            if (!overlaps) {
                levelIndex = i;
                occupied.push([segStart, segEnd]);
                break;
            }
        }

        if (levelIndex === -1) {
            // места нет — в переполнение
            group.overflow.add(task);
            return;
        }

        // рисуем сегмент
        const el = this.createEventElement(task, true);
        el.classList.add('multiday');
        el.style.position = 'absolute';
        el.style.top = `${first.offsetTop + topOffset + levelIndex * rowHeight}px`;
        el.style.left = `${first.offsetLeft + sidePad}px`;
        el.style.width = (segEnd - segStart) + 'px';
        el.style.height = `${rowHeight}px`; // Увеличиваем высоту для лучшей кликабельности
        el.style.lineHeight = `${rowHeight}px`;
        el.style.pointerEvents = 'auto';
        
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            TaskModalManager.openModal(task);
        });

        eventsLayer.appendChild(el);
        group.placed.add(task);
    }

    createEventElement(task, isCompact = false) {
    const eventEl = document.createElement('div');
    const color = task.color || getRandomColor();
    const completedClass = task.completed ? 'completed' : '';
    eventEl.className = `calendar-event ${isCompact ? 'compact-event' : ''} ${completedClass}`.trim();
    // пометка что на элементе есть кастомный чекбокс — чтобы отключать ::before
    eventEl.classList.add('has-checkbox');
    eventEl.dataset.taskId = task.id;
    eventEl.style.backgroundColor = color;
    eventEl.style.borderLeft = `3px solid ${color}`;
    eventEl.style.cursor = "pointer";
    
    // Используем выравнивание слева, чтобы разместить чекбокс и текст
    eventEl.style.display = 'flex';
    eventEl.style.alignItems = 'center';
    eventEl.style.justifyContent = 'flex-start';
    eventEl.style.paddingLeft = '8px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'event-complete-checkbox';
    checkbox.checked = !!task.completed;
    checkbox.title = task.completed ? 'Отметка: выполнено' : 'Отметить как выполненную';
    // Небольшие inline-стили, чтобы не править CSS-файлы
    checkbox.style.width = '16px';
    checkbox.style.height = '16px';
    checkbox.style.marginRight = '6px';
    checkbox.style.flex = '0 0 auto';

    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        checkbox.disabled = true;
        task.toggleCompleted().then(() => {
            // Обновляем все вхождения этой задачи на странице
            const nodes = document.querySelectorAll(`.calendar-event[data-task-id="${task.id}"]`);
            nodes.forEach(n => {
                if (task.completed) n.classList.add('completed'); else n.classList.remove('completed');
                const cb = n.querySelector('.event-complete-checkbox');
                if (cb) cb.checked = !!task.completed;
                if (cb) cb.title = task.completed ? 'Отметка: выполнено' : 'Отметить как выполненную';
            });
        }).catch(err => {
            // В случае ошибки откатываем чекбокс
            checkbox.checked = !checkbox.checked;
            console.error('Failed to toggle completion', err);
        }).finally(() => {
            checkbox.disabled = false;
        });
    });

    const titleEl = document.createElement('div');
    titleEl.className = 'event-title';
    titleEl.textContent = task.name;
    titleEl.style.whiteSpace = isCompact ? 'nowrap' : 'normal';
    titleEl.style.overflow = 'hidden';
    titleEl.style.textOverflow = 'ellipsis';
    titleEl.style.width = 'calc(100% - 22px)'; // Учитываем место под чекбокс

    eventEl.appendChild(checkbox);
    eventEl.appendChild(titleEl);

    // Функция для адаптации высоты строки
    const adjustLineHeight = () => {
        const containerHeight = eventEl.offsetHeight;
        
        if (containerHeight < 25) {
            titleEl.style.lineHeight = '1.0';
        } else if (containerHeight < 35) {
            titleEl.style.lineHeight = '1.2';
        } else if (containerHeight < 50) {
            titleEl.style.lineHeight = '1.4';
        } else {
            titleEl.style.lineHeight = '1.6';
        }
        
        if (containerHeight < 20) {
            titleEl.style.fontSize = '10px';
        } else if (containerHeight < 30) {
            titleEl.style.fontSize = '12px';
        } else if (containerHeight < 45) {
            titleEl.style.fontSize = '14px';
        } else {
            titleEl.style.fontSize = '16px';
        }
    };

    setTimeout(adjustLineHeight, 0);

    const resizeObserver = new ResizeObserver(adjustLineHeight);
    resizeObserver.observe(eventEl);
    eventEl._resizeObserver = resizeObserver;

    // Обработчик клика на всем элементе события
    eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        // Двойной клик для переключения состояния завершения
        if (e.detail === 2) {
            task.toggleCompleted().then(() => {
                const nodes = document.querySelectorAll(`.calendar-event[data-task-id="${task.id}"]`);
                nodes.forEach(n => {
                    if (task.completed) n.classList.add('completed'); else n.classList.remove('completed');
                    const cb = n.querySelector('.event-complete-checkbox');
                    if (cb) cb.checked = !!task.completed;
                });
            });
        } else {
            // Одинарный клик - открыть модальное окно
            TaskModalManager.openModal(task);
        }
    });

    return eventEl;
}

    generateMonthDays(startDay, endDay) {
        let html = '';
        const currentDate = new Date(startDay);

        while (currentDate <= endDay) {
            const dateStr = formatDate(currentDate);
            const isCurrentMonth = currentDate.getMonth() === this.config.currentDate.getMonth();
            const isItToday = isToday(currentDate);
            const hasTasks = Task.all.some(task =>
                formatDate(new Date(task.start)) === dateStr
            );

            html += `
                    <div class="day-cell 
                        ${isCurrentMonth ? 'current-month' : 'other-month'}
                        ${isItToday ? 'today' : ''}" 
                        data-date="${dateStr}"
                        aria-label="${currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}">
                        <div class="day-number">${currentDate.getDate()}</div>
                        <div class="day-events">
                        </div>
                    </div>
                `;

            currentDate.setDate(currentDate.getDate() + 1);
        }
        return html;
    }

    generateYearMonthDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = getStartOfWeek(firstDay);
        const endDay = getEndOfWeek(lastDay);

        let html = '';
        const currentDate = new Date(startDay);

        while (currentDate <= endDay) {
            const isCurrentMonth = currentDate.getMonth() === month;
            const isItToday = isToday(currentDate);
            const dateStr = formatDate(currentDate);
            
            // Считаем количество событий на этот день
            const dayTasks = Task.all.filter(task => {
                const taskStart = new Date(task.start);
                return formatDate(taskStart) === dateStr;
            });
            const taskCount = dayTasks.length;
            const completedCount = dayTasks.filter(t => t.completed).length;
            const hasTasks = taskCount > 0;
            
            // Формируем title с информацией о завершении
            let titleText = 'Нет событий';
            if (hasTasks) {
                if (completedCount > 0) {
                    titleText = `${taskCount} задач${taskCount === 1 ? 'а' : 'и'} (${completedCount} выполнено)`;
                } else {
                    titleText = `${taskCount} задач${taskCount === 1 ? 'а' : 'и'}`;
                }
            }

            html += `
                    <div class="year-day 
                        ${isCurrentMonth ? 'current-month' : 'other-month'} 
                        ${isItToday ? 'today' : ''}
                        ${hasTasks ? 'has-events' : ''}" 
                        data-date="${dateStr}"
                        title="${titleText}">
                        <span class="year-day__number">${currentDate.getDate()}</span>
                        ${hasTasks ? `<span class="year-day__count">${taskCount > 9 ? '9+' : taskCount}</span>` : ''}
                    </div>
                `;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return html;
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.closest('.view-btn')) {
                this.config.view = e.target.closest('.view-btn').dataset.view;
                this.renderCalendar();
            }
        });

        document.addEventListener('click', e => {
            if (e.target.closest('.prev-btn')) {
                this.navigate(-1);
            } else if (e.target.closest('.next-btn')) {
                this.navigate(1);
            }
        });

        document.addEventListener('click', e => {
            const dayCell = e.target.closest('.day-cell');
            if (dayCell) {
                this.config.currentDate = new Date(dayCell.dataset.date);
                this.config.view = 'day';
                this.renderCalendar();
                this.highlightSelectedDay();
            }
        });

        document.addEventListener('click', e => {
            const yearDay = e.target.closest('.year-day');
            if (yearDay) {
                this.config.currentDate = new Date(yearDay.dataset.date);
                this.config.view = 'month';
                this.renderCalendar();
                this.highlightSelectedDay();
            }
        });
    }

    highlightSelectedDay() {
        const dateStr = formatDate(this.config.currentDate);

        document.querySelectorAll('.day-cell, .mini-day, .year-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateStr) {
                day.classList.add('selected');
            }
        });
    }

    navigate(direction) {
        const date = this.config.currentDate;
        switch (this.config.view) {
            case 'day': date.setDate(date.getDate() + direction); break;
            case 'week': date.setDate(date.getDate() + (direction * 7)); break;
            case 'month': date.setMonth(date.getMonth() + direction); break;
            case 'year': date.setFullYear(date.getFullYear() + direction); break;
        }
        this.renderCalendar();
        this.highlightSelectedDay();
    }
}

// Initialize calendar when toolbar icon is clicked
document.querySelector('.toolbar-icon[title="Календарь"]').addEventListener('click', function () {
    if (!document.querySelector('.calendar-container')) {
        if (!window.calendarManager) {
            window.calendarManager = new CalendarManager();
            window.calendarManager.init();
        } else {
            window.calendarManager.toggleRightMenu(true);
            window.calendarManager.renderCalendar();
        }
    }
});
