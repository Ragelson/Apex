// Основные переменные
let draggedItem = null;
let dragStartColumn = null;
let dropIndicator = null;
let mobileActiveStatus = null; // Добавлено для мобильной версии

const contentArea = document.querySelector('.content');

// Инициализация доски
async function initTaskBoard() {
    // Инициализируем модальное окно, если оно еще не инициализировано
    if (!TaskModalManager.initialized) {
        TaskModalManager.init();
    }

    contentArea.innerHTML = `<div class="home-content" id="home-content">
                            <img class="main-logo main-logo-light" src="assets/planer/Vinc-main-light.png"
                                alt="Vinc Logo">
                            <p class="main-slogan">планер твоих побед</p>
                        </div>`;

    contentArea.innerHTML = "";

    const MAX_TASK_TITLE_LENGTH = 80;
    const MAX_TASK_DESCRIPTION_LENGTH = 254;
    const MAX_SUBTASK_NAME_LENGTH = 20;

    // Создаем контейнер для статусов
    const statusContainer = document.createElement('div');
    statusContainer.className = 'status-container';

    // Добавляем колонки для каждого статуса
    Status.getBySphereId(Sphere.current.id).forEach((status, index) => {
        const column = createStatusColumn(status, index);
        statusContainer.appendChild(column);
    });

    // Добавляем кнопку создания нового статуса (если не "Все сферы")
    const addStatusColumn = document.createElement('div');
    addStatusColumn.className = 'status-column add-status-column';

    const addStatusBtn = document.createElement('button');
    addStatusBtn.className = 'add-status-btn';
    addStatusBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 6v12M6 12h12"/>
            </svg>
        `;
    addStatusBtn.addEventListener('click', openAddStatusModal);

    addStatusColumn.appendChild(addStatusBtn);
    statusContainer.appendChild(addStatusColumn);

    function setupHorizontalScroll() {
        const statusHeaders = document.querySelectorAll('.status-header');

        statusHeaders.forEach(header => {
            header.addEventListener('wheel', (e) => {
                if (e.shiftKey) { // Только при зажатом Shift
                    const container = header.closest('.status-container');
                    if (container) {
                        e.preventDefault();
                        container.scrollLeft += e.deltaY;
                    }
                }
            });
        });
    }


    contentArea.appendChild(statusContainer);
    renderTasks();
    setupInputLimitations(); // Ограничение ввода в реальном времени
    initDragAndDrop();
    setupHorizontalScroll();
    
    // Инициализация мобильного режима
    initMobileMode(); 
      // Добавляем обработчик для скрытия меню при клике на сферу
    setupMobileMenuAutoClose();
  // В конце функции добавим:
    setTimeout(() => {
        if (window.innerWidth <= 768) {
            initMobileMode();
        } else {
            // Десктопная инициализация
            document.querySelectorAll('.tasks-container').forEach(container => {
                container.style.display = 'flex';
            });
        }
    }, 250);
}

// НОВАЯ ФУНКЦИЯ: Настройка автоматического закрытия меню при клике на сферу
function setupMobileMenuAutoClose() {
    if (window.innerWidth > 768) return; // Только для мобильных
    
    // Удаляем старые обработчики чтобы избежать дублирования
    document.querySelectorAll('.sphere-item, .sphere-menu-item, [data-sphere-id]').forEach(item => {
        item.removeEventListener('click', handleSphereClick);
    });
    
    // Находим все элементы сфер в меню
    const sphereMenuItems = document.querySelectorAll('.sphere-item, .sphere-menu-item, [data-sphere-id]');
    
    sphereMenuItems.forEach(item => {
        // Добавляем обработчик клика
        item.addEventListener('click', handleSphereClick);
    });
    
    console.log('Mobile menu auto-close initialized'); // Для отладки
}

// НОВАЯ ФУНКЦИЯ: Обработчик клика по сфере
function handleSphereClick(e) {
    if (window.innerWidth > 768) return; // Только для мобильных
    
    console.log('Sphere clicked, closing mobile menu'); // Для отладки
    
    // Закрываем меню
    closeMobileMenu();
}

// НОВАЯ ФУНКЦИЯ: Закрытие мобильного меню
function closeMobileMenu() {
    console.log('Closing mobile menu'); // Для отладки
    
    // Закрываем мобильное меню через существующие механизмы
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenuToggle && mobileMenuToggle.classList.contains('is-active')) {
        mobileMenuToggle.classList.remove('is-active');
    }
    
    if (mobileDrawer) {
        mobileDrawer.style.transform = 'translateX(-100%)';
        mobileDrawer.style.pointerEvents = 'none';
    }
    
    if (mobileOverlay) {
        mobileOverlay.style.opacity = '0';
        mobileOverlay.style.visibility = 'hidden';
        mobileOverlay.style.pointerEvents = 'none';
    }
    
    // Убираем классы с body
    document.body.classList.remove('menu-open', 'nav-open', 'sidebar-open');
    
    // Альтернативный метод: ищем все возможные меню и скрываем их
    const menus = document.querySelectorAll('.navbar-collapse, #mobileMenu, .offcanvas, .menu-container');
    menus.forEach(menu => {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
            menu.classList.add('collapse');
        }
        menu.style.display = 'none';
    });
    
    // Убираем бэкдроп если есть
    const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
}

// Функция для инициализации мобильного режима
function initMobileMode() {
    if (window.innerWidth <= 768) {
        setupMobileStatusInteractions();
        // Инициализируем свайп-жесты
        initSwipeGestures();
        // Настраиваем автоматическое закрытие меню
        setupMobileMenuAutoClose();
        
        // Добавляем обработчик для динамически добавляемых элементов сфер
        observeSphereChanges();
    }
}

// НОВАЯ ФУНКЦИЯ: Наблюдатель за изменениями DOM для динамически добавляемых сфер
function observeSphereChanges() {
    // Создаем наблюдатель за изменениями в DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                // Проверяем, были ли добавлены новые элементы сфер
                const newSphereItems = Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === 1) { // Element node
                        return node.matches && (
                            node.matches('.sphere-item, .sphere-menu-item, [data-sphere-id]') ||
                            node.querySelector('.sphere-item, .sphere-menu-item, [data-sphere-id]')
                        );
                    }
                    return false;
                });
                
                if (newSphereItems) {
                    // Переинициализируем обработчики для новых элементов
                    setTimeout(() => {
                        setupMobileMenuAutoClose();
                    }, 100);
                }
            }
        });
    });
    
    // Начинаем наблюдение за всем документом
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Функция для настройки взаимодействий в мобильном режиме
function setupMobileStatusInteractions() {
    const statusHeaders = document.querySelectorAll('.status-header');
    
    statusHeaders.forEach(header => {
        // Удаляем предыдущие обработчики
        header.removeEventListener('click', handleMobileStatusClick);
        
        // Добавляем новый обработчик клика
        header.addEventListener('click', handleMobileStatusClick);
        
        // Обновляем курсор
        header.style.cursor = 'pointer';
    });
}

// Обработчик клика по статусу в мобильном режиме
function handleMobileStatusClick(e) {
    if (window.innerWidth > 768) return; // Только для мобильных
    
    const header = e.currentTarget;
    const column = header.closest('.status-column');
    const statusId = column.dataset.statusId;
    const tasksContainer = column.querySelector('.tasks-container');
    
    // Если это уже активный статус - закрываем
    if (mobileActiveStatus === statusId) {
        closeStatusContainer(column);
        mobileActiveStatus = null;
        return;
    }
    
    // Закрываем предыдущий активный статус
    closeAllStatusContainers();
    
    // Открываем новый
    openStatusContainer(column, statusId);
    mobileActiveStatus = statusId;
}

// Функция для инициализации свайп-жестов
function initSwipeGestures() {
    const statusContainer = document.querySelector('.status-container');
    if (!statusContainer) return;

    let startX, startY, distX, distY;
    const minSwipeDist = 50;

    statusContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    statusContainer.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;
        
        distX = e.touches[0].clientX - startX;
        distY = e.touches[0].clientY - startY;
    }, { passive: true });

    statusContainer.addEventListener('touchend', () => {
        if (Math.abs(distX) > minSwipeDist && Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                // Свайп вправо
                statusContainer.scrollBy({ left: -200, behavior: 'smooth' });
            } else {
                // Свайп влево
                statusContainer.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }
        startX = startY = distX = distY = null;
    }, { passive: true });
}




// Вспомогательная функция debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Обработчик изменения размера окна
function handleWindowResize() {
    if (window.innerWidth <= 768) {
        // Мобильный режим
        initMobileMode();
    } else {
        // Десктопный режим
        closeAllStatusContainers();
        document.querySelectorAll('.status-header').forEach(header => {
            header.style.cursor = 'grab';
            header.removeEventListener('click', handleMobileStatusClick);
        });
        // Показываем все контейнеры задач для десктопной версии
        document.querySelectorAll('.tasks-container').forEach(container => {
            container.style.display = 'flex';
            container.classList.remove('active');
        });
        // Убираем активные классы
        document.querySelectorAll('.status-header, .status-indicator').forEach(el => {
            el.classList.remove('active');
        });
        mobileActiveStatus = null;
    }
    
    // Всегда настраиваем автоматическое закрытие меню при изменении размера
    setupMobileMenuAutoClose();
    
    initDragAndDrop(); // Переинициализируем drag-and-drop
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик resize
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // Инициализируем соответствующий режим
    setTimeout(() => {
        if (window.innerWidth <= 768) {
            initMobileMode();
        } else {
            // Десктопная инициализация
            document.querySelectorAll('.tasks-container').forEach(container => {
                container.style.display = 'flex';
            });
        }
    }, 100);
});

// Создание колонки статуса
function createStatusColumn(status, index) {
    const column = document.createElement('div');
    column.className = 'status-column';
    column.dataset.statusId = status.id;

    const columnWrapper = document.createElement('div');
    columnWrapper.className = 'status-column-wrapper';
    columnWrapper.style.position = 'relative';

    // Заголовок
    const header = document.createElement('div');
    header.className = 'status-header';
    header.style.borderLeft = `6px solid ${status.color}`;
    header.style.borderTop = `1px solid ${status.color}`;
    header.style.borderRight = `1px solid ${status.color}`;
    header.style.borderBottom = `1px solid ${status.color}`;
    header.style.borderRadius = '6px';
    header.draggable = true;

    // Контейнер для элементов заголовка
    const titleContainer = document.createElement('div');
    titleContainer.className = 'status-title-container';

    // Индикатор статуса
    const indicator = document.createElement('div');
    indicator.className = 'status-indicator';
    indicator.style.backgroundColor = status.color;

    // Название статуса
    const title = document.createElement('span');
    title.className = 'status-text';
    title.textContent = status.name;
    title.contentEditable = true;
    title.addEventListener('blur', () => updateStatusName(status.id, title.textContent));

    // Кнопка "Добавить задачу" (упрощённая)
    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn-global';
    addTaskBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 6v12M6 12h12"/>
        </svg>
    `;
    addTaskBtn.style.border = 'none';
    addTaskBtn.style.marginLeft = 'auto';
    addTaskBtn.addEventListener('click', (e) => {
        const column = e.target.closest('.status-column');
        if (!column) return;

        const statusId = parseInt(column.dataset.statusId);
        TaskModalManager.openModal(null, statusId);
    });


    // Кнопка меню (три точки)
    const menuBtn = document.createElement('button');
    menuBtn.className = 'status-menu-btn';
    menuBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
        </svg>
    `;
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openStatusMenu(status, menuBtn);
    });

    // Собираем заголовок: кнопка добавить -> индикатор -> название -> меню
    titleContainer.appendChild(indicator);
    titleContainer.appendChild(title);
    titleContainer.appendChild(addTaskBtn);
    titleContainer.appendChild(menuBtn);

    header.appendChild(titleContainer);
    column.appendChild(header);

    // Контейнер задач
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';

    columnWrapper.appendChild(header);
    columnWrapper.appendChild(tasksContainer);
    column.appendChild(columnWrapper);

    return column;
}

// Функция для обновления цвета границы кнопки "+Добавить задачу"
function updateAddTaskBtnBorderColor(todoColor) {
    const btn = document.querySelector('.add-task-btn-global');
    if (btn && todoColor) {
        btn.style.border = `2px solid ${todoColor}`;
        // Можно сбросить фон, если был установлен ранее
        btn.style.backgroundColor = '';
        btn.style.color = ''; // Оставить стандартный цвет текста
    }
}

// Меню для статуса
function openStatusMenu(status, button) {
    const menu = document.createElement('div');
    menu.className = 'status-context-menu';
    menu.innerHTML = `
        <ul>
            <li class="edit-status">Изменить</li>
            <li class="delete-status">Удалить</li>
        </ul>
    `;

    document.body.appendChild(menu);

    const rect = button.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom}px`;
    menu.style.zIndex = '1000';

    menu.querySelector('.edit-status').addEventListener('click', () => {
        openEditStatusModal(status);
        menu.remove();
    });

    menu.querySelector('.delete-status').addEventListener('click', () => {
        if (Status.getBySphereId(Sphere.current.id).length <= 1) {
            showAlertModal("  ㅤ Вы не можете удалить единственный статус");
            menu.remove();
            return;
        }

        showConfirmModal(
            'Подтверждение удаления',
            'Вы уверены, что хотите удалить этот статус? <br> Все задачи будут перемещены в первый доступный статус.',
            async () => {
                await status.delete();
                initTaskBoard();
                menu.remove();
            },
            () => menu.remove()
        );
    });

    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    document.addEventListener('click', closeMenu);
}

// Открытие модального окна для редактирования статуса
function openEditStatusModal(status) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay1';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Изменить статус</h3>
            <div class="form-group">
                <input type="text" id="statusName" value="${status.name}" placeholder="Введите название статуса">
            </div>
            <div class="form-group">
                <label for="statusColor">Цвет статуса:</label>
                <input type="color" id="statusColor" value="${status.color}">
            </div>
            <div class="modal-actions">
                <button id="confirmEditStatus" class="btn-primary">Сохранить</button>
                <button id="cancelEditStatus" class="btn-secondary">Отмена</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cancelEditStatus').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('confirmEditStatus').addEventListener('click', async () => {
        const statusName = document.getElementById('statusName').value.trim();
        const statusColor = document.getElementById('statusColor').value;

        if (statusName) {
            if (statusName !== status.name || statusColor !== status.color) {
                status.name = statusName;
                status.color = statusColor;
                await status.update();
            }
            document.body.removeChild(modal);
            initTaskBoard();
        } else {
            alert('Пожалуйста, введите название статуса');
        }
    });
}

// Обновление названия статуса
async function updateStatusName(statusId, newName) {
    let status = Status.getById(statusId);
    status.name = newName;
    await status.update();
    document.querySelectorAll(`.status-column[data-status-id="${statusId}"] .status-text`)
        .forEach(el => el.textContent = newName);
}

// Отображение задач в колонках
function renderTasks() {
    window.dayCycleManager.updateUI();
    // Сохраняем текущее состояние скролла
    const statusContainer = document.querySelector('.status-container');
    const scrollLeft = statusContainer ? statusContainer.scrollLeft : 0;

    // Сохраняем активный статус при перерисовке
    const currentActiveStatus = mobileActiveStatus;

    // Обновляем только задачи
    document.querySelectorAll('.tasks-container').forEach(container => {
        container.innerHTML = '';
    });

    // Получаем все задачи и сортируем их
    const allTasks = Task.getBySphereId(Sphere.current.id);
    const sortedTasks = allTasks.sort((a, b) => {
        const priorityA = getTaskPriority(a);
        const priorityB = getTaskPriority(b);
        return priorityB - priorityA; // Сортируем по убыванию приоритета
    });

    // Отображаем отсортированные задачи
    sortedTasks.forEach(task => {
        const container = document.querySelector(`.status-column[data-status-id="${task.statusId}"] .tasks-container`);
        if (container) {
            const taskElement = createTaskElement(task);
            container.appendChild(taskElement);
        }
    });

    // Восстанавливаем положение скролла
    if (statusContainer) {
        statusContainer.scrollLeft = scrollLeft;
    }

    initDragAndDrop();
    
    // Восстанавливаем активный статус если нужно
    if (currentActiveStatus && window.innerWidth <= 768) {
        const activeColumn = document.querySelector(`.status-column[data-status-id="${currentActiveStatus}"]`);
        if (activeColumn) {
            openStatusContainer(activeColumn, currentActiveStatus);
        }
    }
    
    // Инициализируем мобильный режим
    initMobileMode();
}

// Функция для определения приоритета задачи (0 - нормальный, 1 - высокий)
function getTaskPriority(task) {
    if (!task.start || !task.end) return 1; // По умолчанию средний приоритет

    const startDate = new Date(task.start);
    const endDate = new Date(task.end);
    const now = new Date();

    // Если задача уже просрочена - низкий приоритет (0)
    if (now > endDate) return 0;

    const durationMs = endDate - startDate;
    const remainingMs = endDate - now;

    // Если задача еще не началась - средний приоритет (1)
    if (now < startDate) return 1;

    const percentRemaining = (remainingMs / durationMs) * 100;

    // Если осталось меньше 33% времени - высокий приоритет (2)
    return percentRemaining < 33 ? 2 : 1;
}

// Функция для проверки длины строки задачи
function validateTaskTitle(title) {
    if (title.length > MAX_TASK_TITLE_LENGTH) {
        showAlertModal(`Название задачи слишком длинное (максимум ${MAX_TASK_TITLE_LENGTH} символов)`);
        return false;
    }
    return true;
}

// Функция для проверки длины описания задачи
function validateTaskDescription(description) {
    if (description && description.length > MAX_TASK_DESCRIPTION_LENGTH) {
        showAlertModal(`Описание задачи слишком длинное (максимум ${MAX_TASK_DESCRIPTION_LENGTH} символов)`);
        return false;
    }
    return true;
}

// Функция для проверки длины подзадачи
function validateSubtaskName(name) {
    if (name.length > MAX_SUBTASK_NAME_LENGTH) {
        showAlertModal(`Название подзадачи слишком длинное (максимум ${MAX_SUBTASK_NAME_LENGTH} символов)`);
        return false;
    }
    return true;
}
//Обработчик событий для ограничения ввода в реальном времени:
function setupInputLimitations() {
    // Ограничение для названия задачи
    document.querySelectorAll('.task-title[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', () => {
            if (el.textContent.length > MAX_TASK_TITLE_LENGTH) {
                el.textContent = el.textContent.substring(0, MAX_TASK_TITLE_LENGTH);
                showAlertModal(`Достигнут лимит в ${MAX_TASK_TITLE_LENGTH} символов`);
            }
        });
    });

    // Ограничение для описания задачи
    document.querySelectorAll('.task-description[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', () => {
            if (el.textContent.length > MAX_TASK_DESCRIPTION_LENGTH) {
                el.textContent = el.textContent.substring(0, MAX_TASK_DESCRIPTION_LENGTH);
                showAlertModal(`Достигнут лимит в ${MAX_TASK_DESCRIPTION_LENGTH} символов`);
            }
        });
    });

    // Ограничение для подзадач
    document.querySelectorAll('.subtask-text[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', () => {
            if (el.textContent.length > MAX_SUBTASK_NAME_LENGTH) {
                el.textContent = el.textContent.substring(0, MAX_SUBTASK_NAME_LENGTH);
                showAlertModal(`Достигнут лимит в ${MAX_SUBTASK_NAME_LENGTH} символов`);
            }
        });
    });
}


// Создание элемента задачи
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.taskId = task.id;
    taskElement.dataset.statusId = task.statusId;
    taskElement.draggable = true;

    // Получаем текущий статус задачи
    const status = Status.getById(task.statusId);
    const borderColor = status ? status.color : '#ccc';

    taskElement.style.borderLeft = `6px solid ${borderColor}`;
    taskElement.style.borderTop = `1px solid ${borderColor}`;
    taskElement.style.borderBottom = `1px solid ${borderColor}`;
    taskElement.style.borderRight = `1px solid ${borderColor}`;
    taskElement.style.borderRadius = '6px';

    // Определяем, является ли задача срочной
    const isUrgent = getTaskPriority(task) === 2;
    if (isUrgent) {
        taskElement.classList.add('urgent-task');

        // Добавляем анимацию мигания
        taskElement.style.animation = 'pulse 2s infinite';
    }

    // Добавляем проверку на длительность задачи и создаем таймер
    let timerHTML = '';
    if (task.start && task.end) {
        const startDate = new Date(task.start);
        const endDate = new Date(task.end);
        const durationMs = endDate - startDate;

        // Проверяем, что задача длится более 3 часов
        if (durationMs > 3 * 60 * 60 * 1000) {
            const now = new Date();
            const remainingMs = endDate - now;

            if (remainingMs > 0) {
                // Рассчитываем все единицы времени
                const totalSeconds = Math.floor(remainingMs / 1000);
                const totalMinutes = Math.floor(totalSeconds / 60);
                const totalHours = Math.floor(totalMinutes / 60);
                const totalDays = Math.floor(totalHours / 24);

                // Вычисляем остатки для форматирования
                const seconds = totalSeconds % 60;
                const minutes = totalMinutes % 60;
                const hours = totalHours % 24;
                const days = totalDays;

                // Форматируем оставшееся время в удобочитаемый вид
                let remainingTimeText;

                if (days > 0) {
                    remainingTimeText = `${days} д ${hours} ч ${minutes} мин`;
                } else if (hours > 0) {
                    remainingTimeText = `${hours} ч ${minutes} мин`;
                } else if (minutes > 0) {
                    remainingTimeText = `${minutes} мин`;
                } else {
                    remainingTimeText = `${seconds} сек`;
                }

                // Рассчитываем процент оставшегося времени
                const percentRemaining = (remainingMs / durationMs) * 100;

                // Определяем цвет в зависимости от оставшегося времени
                let timerColor;
                if (percentRemaining > 67) {
                    timerColor = '#80868b'; // Стандартный цвет статуса
                } else if (percentRemaining > 33) {
                    timerColor = '#4CAF50'; // Зеленый
                } else {
                    timerColor = '#F44336'; // Красный
                }

                timerHTML = `
                <div class="task-timer" style="color: ${timerColor}; ">
                    Осталось: ${remainingTimeText}
                </div>
            `;
            } else {
                // Если срок истек
                timerHTML = `
                <div class="task-timer" style="color: #F44336; ">
                    Срок истек!
                </div>
            `;
            }
        }
    }

    // Определяем иконку статуса
    let statusIcon;
    //TODO: разобраться с инконками, пока что ставится дефолтная
    switch (task.statusId) {
        case 'waiting':
            statusIcon = '<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg id="Layer_1" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m510.644 326.97-50.71-87.08c-1.78-3.07-5.1-4.97-8.65-4.97-1.76 0-3.49.47-5.02 1.36-4.77 2.77-6.39 8.91-3.61 13.67l45.68 78.44-274.16 159.74-46.953-88.13h122.783c2.652 0 5.196-1.054 7.071-2.929l79.998-80c1.875-1.875 2.927-4.419 2.927-7.071v-167.63l17.362 29.81c1.78 3.06 5.101 4.97 8.651 4.97 1.76 0 3.491-.47 5.02-1.36 2.31-1.34 4.129-3.51 4.819-6.09.68-2.58.148-5.27-.852-7.58 0 0 0 0 0-.01l-35-59.477v-92.633c0-5.523-4.474-10-9.996-10h-360c-5.523 0-10.003 4.477-10.003 10v380c0 5.523 4.481 10 10.004 10h134.561l56.849 106.7c1.27 2.39 3.49 4.18 6.09 4.92.88.25 1.8.38 2.72.38 1.78 0 3.52-.47 5.05-1.36l291.77-170c4.759-2.78 6.369-8.91 3.599-13.67zm-210.643 38.888v-45.858h45.861zm-280-345.858h340v280h-69.996c-5.523 0-10.004 4.477-10.004 10v70h-260v-360z"/><circle cx="90.004" cy="90" r="10"/><path d="m135.004 100h155c5.51 0 10-4.49 10-10s-4.49-10-10-10h-155c-5.51 0-10 4.49-10 10s4.49 10 10 10z"/><path d="m135.004 200h155c5.51 0 10-4.49 10-10s-4.49-10-10-10h-155c-5.51 0-10 4.49-10 10s4.49 10 10 10z"/><circle cx="90.004" cy="190" r="10"/><path d="m250.004 280h-95c-5.523 0-10 4.477-10 10s4.477 10 10 10h95c5.523 0 10-4.477 10-10s-4.477-10-10-10z"/><path d="m122.933 242.929-31.375 31.375-13.234-19.851c-3.063-4.595-9.271-5.837-13.867-2.773-4.595 3.063-5.837 9.272-2.773 13.867l20 30c1.662 2.493 4.354 4.109 7.335 4.404.329.033.658.049.986.049 2.639 0 5.186-1.044 7.071-2.929l40-40c3.905-3.905 3.905-10.237 0-14.143-3.906-3.905-10.238-3.905-14.143.001z"/><circle cx="428.651" cy="206.03" r="10"/></g></svg>';
            break;
        case 'in-progress':
            statusIcon = '<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg id="Capa_1" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m256 266c-44.388 0-80.5 36.112-80.5 80.5s36.112 80.5 80.5 80.5 80.5-36.112 80.5-80.5-36.112-80.5-80.5-80.5zm0 131c-27.846 0-50.5-22.654-50.5-50.5s22.654-50.5 50.5-50.5 50.5 22.654 50.5 50.5-22.654 50.5-50.5 50.5z"/><path d="m512 60h-166v-30h30v-30h-240v30h30v30h-166v386h122.344l16.579 28.716 30.472-17.593c10.385 8.123 21.926 14.798 34.105 19.724v35.153h105v-35.152c12.179-4.927 23.72-11.601 34.104-19.725l30.473 17.594 16.58-28.717h122.343zm-316-30h120v30h-120zm-166 60h452v96.326h-.001c0 37.164-30.235 67.399-67.399 67.399h-21.060l-20.462-35.441-30.473 17.593c-10.385-8.123-21.925-14.798-34.104-19.724v-35.153h-105v35.152c-12.179 4.927-23.72 11.601-34.104 19.725l-30.473-17.594-20.463 35.442h-21.061c-37.165 0-67.4-30.235-67.4-67.399zm0 326v-159.428c17.511 16.808 41.269 27.154 67.4 27.154h3.74l-14.717 25.49 30.457 17.585c-.917 6.518-1.379 13.109-1.379 19.699s.463 13.182 1.38 19.699l-30.457 17.584 18.6 32.217zm332.097 17.736-23.179-13.382-8.111 7.465c-11.947 10.996-26.396 19.352-41.784 24.164l-10.522 3.291v26.726h-45v-26.728l-10.523-3.29c-15.388-4.812-29.836-13.167-41.784-24.164l-8.111-7.466-23.178 13.383-22.500-38.972 23.145-13.361-2.395-10.748c-1.761-7.9-2.653-16.026-2.653-24.154s.893-16.255 2.653-24.154l2.396-10.747-23.145-13.363 22.5-38.972 23.179 13.382 8.111-7.465c11.947-10.996 26.396-19.352 41.784-24.164l10.523-3.291v-26.726h45v26.728l10.523 3.29c15.388 4.812 29.836 13.167 41.783 24.163l8.11 7.467 23.18-13.383 22.5 38.972-23.146 13.362 2.396 10.748c1.761 7.897 2.653 16.023 2.653 24.153 0 8.131-.893 16.257-2.653 24.152l-2.396 10.749 23.146 13.363zm44.88-17.736 18.6-32.216-30.457-17.585c.917-6.517 1.38-13.107 1.38-19.699 0-6.591-.463-13.183-1.38-19.699l30.457-17.584-14.717-25.491h3.74c26.131 0 49.89-10.346 67.4-27.155v159.429z"/></g></g></svg>';
            break;
        case 'done':
            statusIcon = '<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 416 416" style="enable-background:new 0 0 416 416;" xml:space="preserve"><g><g><path d="M0,0v416h416V0H0z M384,384H32V32h352V384z"/></g></g><g><g><polygon points="307.2,116.64 174.56,249.44 123.36,198.24 100.64,220.8 174.56,294.56 329.76,139.36 "/></g></g></svg>';
            break;
        default:
            statusIcon = '<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g><path d="M377.964,247.188l123.259-123.316c6.738-6.742,10.447-15.705,10.443-25.235c-0.004-9.53-3.721-18.489-10.465-25.226 l-62.697-62.633c-13.928-13.913-36.58-13.903-50.499,0.021L264.656,134.201L130.075,0L0.098,131.251l133.973,133.595 l-81.275,81.312c-10.474,10.464-18.474,23.420-23.132,37.470l-0.299,0.901L0.224,511.759l127.346-29.087l0.899-0.298 c14.061-4.65,27.029-12.638,37.515-23.111l81.394-81.431L381.924,512l129.978-131.252L377.964,247.188z M413.267,42.032 l56.681,56.622l-22.678,22.688l-56.681-56.622L413.267,42.032z M56.495,131.073l73.758-74.481l38.783,38.674l-38.648,39.384 l28.514,27.981l38.423-39.155l39.091,38.98l-74.103,74.136L56.495,131.073z M53.374,458.643l11.904-51.967l40.125,40.084 L53.374,458.643z M141.948,426.802l-56.68-56.622l277.08-277.205l56.68,56.622L141.948,426.802z M381.747,455.407L275.619,349.579 l74.103-74.136l38.841,38.732L350.6,352.867l28.516,27.978l37.736-38.462l38.653,38.544L381.747,455.407z"/></g></g></svg>';
    }

    // Определяем цвет иконки статуса
    let iconColor = borderColor; // По умолчанию цвет как у границы

    if (task.start && task.end) {
        const startDate = new Date(task.start);
        const endDate = new Date(task.end);
        const now = new Date();
        const durationMs = endDate - startDate;
        const remainingMs = endDate - now;

        // Только если задача еще не истекла и осталось мало времени
        if (remainingMs > 0) {
            const percentRemaining = (remainingMs / durationMs) * 100;
            if (percentRemaining < 33) {
                iconColor = '#F44336'; // Красный только когда осталось меньше 33% времени
            }
        }
        // Для истекших задач оставляем стандартный цвет (borderColor)
    }

    let subtasksHTML = '';
    //  TODO: разобраться с subtasks
    const subtasks = SubTask.getByTaskId(task.id);
    if (subtasks.length > 0) {
        const completedCount = subtasks.filter(st => st.completed).length;
        subtasksHTML = `
        <div class="task-subtasks">
        <div class="subtasks-header">
            <span class="subtasks-count">${completedCount}/${subtasks.length}</span>
        </div>
        <div class="subtasks-list">
            ${subtasks.map(subtask => {
            const subtaskName = subtask.name.length > 20
                ? subtask.name.substring(0, 17) + '...'
                : subtask.name;
            return `
                <div class="subtask-item" data-id="${subtask.id}">
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <span class="subtask-text" title="${subtask.name}">${subtaskName}</span>
                </div>
            `;
        }).join('')}
        </div>
        </div>
    `;
    }

    // Обрезаем текст, если он слишком длинный
    const taskTitle = task.name.length > 96 ? task.name.substring(0, 93) + '...' : task.name;
    const taskDescription = task.description && task.description.length > 248
        ? task.description.substring(0, 245) + '...'
        : task.description || '';

    taskElement.innerHTML = `
        <div class="task-meta">
        <div class="status-icon ${task.statusId}" style="color: ${iconColor}">${statusIcon}</div>
        <div class="task-date">${new Date(task.start).toLocaleDateString()}</div>
        </div>
        <div class="task-header">
          <h3 class="task-title" title="${task.name}">${taskTitle}</h3>
        </div>
        <div class="task-description1" title="${task.description || ''}">${taskDescription}</div>
        ${subtasksHTML}
        ${timerHTML}
        <div class="task-actions">
            <button class="task-edit-btn" data-task-id="${task.id}">
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg id="Line" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="rgb(0,0,0)"><path d="m5 15.08984h37.14093a5.2529 5.2529 0 0 0 10.31482 0h6.54425a1 1 0 0 0 0-2h-6.54364a5.25227 5.25227 0 0 0 -10.316 0h-37.14036a1 1 0 0 0 0 2zm42.29834-4.26171a3.25879 3.25879 0 1 1 -3.25842 3.26232l.00012-.00061-.00037-.00189-.00012-.001a3.26251 3.26251 0 0 1 3.25879-3.25882z"/><path d="m59 31h-22.10107a5.25229 5.25229 0 0 0 -10.31493 0h-21.584a1 1 0 0 0 0 2h21.584a5.25229 5.25229 0 0 0 10.315 0h22.101a1 1 0 0 0 0-2zm-27.25879 4.25879a3.25879 3.25879 0 1 1 3.25879-3.25879 3.26241 3.26241 0 0 1 -3.25879 3.25879z"/><path d="m59 48.91016h-34.80353a5.2526 5.2526 0 0 0 -10.31433 0h-8.88214a1 1 0 0 0 0 2h8.88153a5.252 5.252 0 0 0 10.31555 0h34.80292a1 1 0 0 0 0-2zm-39.96094 4.26172a3.25879 3.25879 0 1 1 3.25879-3.25879 3.26242 3.26242 0 0 1 -3.25879 3.25879z"/></g></svg>
                </svg>
            </button>
            <button class="task-delete-btn" data-task-id="${task.id}">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#ff2828">
                    <-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/xlink"><g id="Layer_29" data-name="Layer 29"><path d="m28.7324 5.5186h-7.6015v-1.6846a1.5445 1.5445 0 0 0 -1.5-1.582h-6.0254a1.5445 1.5445 0 0 0 -1.5 1.582v1.6846h-7.6026a.5.5 0 0 0 0 1h1.5125l1.0852 21.2793a1.5154 1.5154 0 0 0 1.498 1.4541h16.09a1.5121 1.5121 0 0 0 1.499-1.4747l.81-21.2587h1.7351a.5.5 0 0 0 0-1zm-15.6269-1.6846a.5463.5463 0 0 1 .5-.582h6.0254a.5463.5463 0 0 1 .5.582v1.6846h-7.0254zm12.082 23.9053a.5151.5151 0 0 1 -.499.5127h-16.0899a.5164.5164 0 0 1 -.5-.5049l-1.082-21.2285h18.9795z"/><path d="m16.6182 8.3535a.5.5 0 0 0 -.5.5v16.93a.5.5 0 0 0 1 0v-16.93a.5.5 0 0 0 -.5-.5z"/><path d="m21.5537 26.2832a.5.5 0 0 0 .5-.5v-16.9297a.5.5 0 0 0 -1 0v16.93a.5.5 0 0 0 .5.4997z"/><path d="m11.541 8.3535a.5.5 0 0 0 -.5.5v16.93a.5.5 0 0 0 1 0v-16.93a.5.5 0 0 0 -.5-.5z"/></g></svg>
                </svg>
            </button>
        </div>
    `;

    if (subtasks.length > 0) {
        taskElement.querySelectorAll('.subtask-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', async (e) => {
                const subtaskDiv = e.target.closest('.subtask-item');
                const subtaskId = parseInt(subtaskDiv.dataset.id);
                const subtask = SubTask.getById(subtaskId)
                await subtask.changeCompleted(e.target.checked);
                const subtasks = SubTask.getByTaskId(subtask.taskId)
                const completedCount = subtasks.filter(s => s.completed).length;
                const countElement = taskElement.querySelector('.subtasks-count');
                if (countElement) {
                    countElement.textContent = `${completedCount}/${subtasks.length}`;
                }
            }
            );
        });
    }

    taskElement.querySelector('.task-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = e.currentTarget.getAttribute('data-task-id');
        const taskToEdit = Task.getById(parseInt(taskId));
        if (taskToEdit) {
            TaskModalManager.openModal(taskToEdit);
        }
    });

    taskElement.querySelector('.task-delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const taskId = e.currentTarget.getAttribute('data-task-id');

        showConfirmModal(
            'Подтверждение удаления',
            'Вы уверены, что хотите удалить эту задачу? <br> Это действие нельзя отменить.',
            async () => {
                await Task.getById(parseInt(taskId)).delete();
                renderTasks();
            }
        );
    });
    return taskElement;
}

// Инициализация drag-and-drop
function initDragAndDrop() {
    document.querySelectorAll('.task-item, .status-header').forEach(item => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
    });

    document.querySelectorAll('.status-column').forEach(column => {
        column.removeEventListener('dragover', handleColumnDragOver);
        column.removeEventListener('dragleave', handleColumnDragLeave);
        column.removeEventListener('drop', handleColumnDrop);

        const tasksContainer = column.querySelector('.tasks-container');
        if (tasksContainer) {
            tasksContainer.removeEventListener('dragover', handleTaskDragOver);
            tasksContainer.removeEventListener('dragleave', handleTaskDragLeave);
            tasksContainer.removeEventListener('drop', handleTaskDrop);
        }
    });

    createDropIndicator();

    document.querySelectorAll('.task-item').forEach(task => {
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
    });

    // Для мобильных устройств настраиваем drag-and-drop на заголовки
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.status-header').forEach(header => {
            header.setAttribute('draggable', 'true');
            header.addEventListener('dragstart', handleDragStart);
            header.addEventListener('dragend', handleDragEnd);
        });
    } else {
        document.querySelectorAll('.status-header').forEach(header => {
            header.setAttribute('draggable', 'true');
            header.addEventListener('dragstart', handleDragStart);
            header.addEventListener('dragend', handleDragEnd);
        });
    }

    document.querySelectorAll('.status-column').forEach(column => {
        column.addEventListener('dragover', handleColumnDragOver);
        column.addEventListener('dragleave', handleColumnDragLeave);
        column.addEventListener('drop', handleColumnDrop);

        const tasksContainer = column.querySelector('.tasks-container');
        if (tasksContainer) {
            tasksContainer.addEventListener('dragover', handleTaskDragOver);
            tasksContainer.addEventListener('dragleave', handleTaskDragLeave);
            tasksContainer.addEventListener('drop', handleTaskDrop);
        }
    });
}

function createDropIndicator() {
    if (dropIndicator) return;

    dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    document.body.appendChild(dropIndicator);
}

function removeDropIndicator() {
    if (dropIndicator) {
        dropIndicator.style.display = 'none';
    }
}

// Обработчики для начала и конца перетаскивания
function handleDragStart(e) {
    draggedItem = this;

    if (this.classList.contains('status-header')) {
        // Для мобильных - цепляемся за status-header
        dragStartColumn = this.closest('.status-column');
        this.classList.add('status-dragging');
        e.dataTransfer.setData('type', 'status');
        e.dataTransfer.setData('status-id', dragStartColumn.dataset.statusId);
        
        // Создаем drag image для лучшего UX на мобильных
        const dragImage = document.createElement('div');
        dragImage.textContent = this.querySelector('.status-text').textContent;
        dragImage.style.padding = '10px';
        dragImage.style.background = 'white';
        dragImage.style.borderRadius = '6px';
        dragImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        setTimeout(() => document.body.removeChild(dragImage), 0);
    } else {
        this.classList.add('task-dragging');
        e.dataTransfer.setData('type', 'task');
        e.dataTransfer.setData('task-id', this.dataset.taskId);
    }
    
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
    if (this.classList.contains('status-header')) {
        this.classList.remove('status-dragging');
    } else {
        this.classList.remove('task-dragging');
    }

    draggedItem = null;
    dragStartColumn = null;
    removeDropIndicator();

    document.querySelectorAll('.status-drag-over, .task-drag-over, .highlight-drop')
        .forEach(el => el.classList.remove('status-drag-over', 'task-drag-over', 'highlight-drop'));
}

function handleColumnDragOver(e) {
    if (!draggedItem) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItem.classList.contains('status-header')) {
        this.classList.add('status-drag-over');

        const rect = this.getBoundingClientRect();
        const isLeftHalf = e.clientX < rect.left + rect.width / 2;

        if (isLeftHalf) {
            dropIndicator.style.left = `${rect.left}px`;
        } else {
            dropIndicator.style.left = `${rect.right}px`;
        }

        dropIndicator.style.top = `${rect.top}px`;
        dropIndicator.style.height = `${rect.height}px`;
        dropIndicator.style.display = 'block';
    }
}

function handleColumnDragLeave() {
    this.classList.remove('status-drag-over');
    removeDropIndicator();
}

async function handleColumnDrop(e) {
    if (!draggedItem || !draggedItem.classList.contains('status-header')) return;
    e.preventDefault();

    this.classList.remove('status-drag-over');
    removeDropIndicator();

    const draggedStatusId = dragStartColumn.dataset.statusId;
    const targetStatusId = this.dataset.statusId;

    if (draggedStatusId === targetStatusId) return;

    const statusContainer = document.querySelector('.status-container');
    if (!statusContainer) return;

    // порядок ДО
    const beforeOrder = Array.from(statusContainer.querySelectorAll('.status-column:not(.add-status-column)'))
        .map(col => col.dataset.statusId);

    const allColumns = Array.from(statusContainer.querySelectorAll('.status-column:not(.add-status-column)'));
    const targetIndex = allColumns.indexOf(this);

    if (targetIndex === -1) return;

    const rect = this.getBoundingClientRect();
    const isLeftHalf = e.clientX < rect.left + rect.width / 2;

    if (isLeftHalf) {
        statusContainer.insertBefore(dragStartColumn, this);
    } else {
        const nextSibling = this.nextElementSibling;
        if (nextSibling) {
            statusContainer.insertBefore(dragStartColumn, nextSibling);
        } else {
            statusContainer.appendChild(dragStartColumn);
        }
    }

    // порядок ПОСЛЕ
    const afterOrder = Array.from(statusContainer.querySelectorAll('.status-column:not(.add-status-column)'))
        .map(col => col.dataset.statusId);

    // сравниваем
    const changed = beforeOrder.some((id, i) => id !== afterOrder[i]);

    if (changed) {
        await saveStatusOrder();
    }
}


async function saveStatusOrder() {
    const statusColumns = document.querySelectorAll(".status-column:not(.add-status-column)");
    const statusIds = Array.from(statusColumns).map(col => parseInt(col.dataset.statusId, 10));
    console.log(statusIds);
    await Status.updateOrder(statusIds);
}

function handleTaskDragOver(e) {
    if (!draggedItem || !draggedItem.classList.contains('task-item')) return;

    e.preventDefault();
    this.classList.add('task-drag-over');
    this.closest('.status-column').querySelector('.status-header').classList.add('highlight-drop');

    if (dropIndicator) {
        const afterElement = getDragAfterElement(this, e.clientY);
        if (afterElement) {
            dropIndicator.style.top = `${afterElement.offsetTop}px`;
            dropIndicator.style.left = `${this.offsetLeft}px`;
            dropIndicator.style.width = `${this.offsetWidth}px`;
            dropIndicator.style.display = 'block';
        } else {
            dropIndicator.style.top = `${this.offsetHeight}px`;
            dropIndicator.style.left = `${this.offsetLeft}px`;
            dropIndicator.style.width = `${this.offsetWidth}px`;
            dropIndicator.style.display = 'block';
        }
    }
}

function handleTaskDragLeave() {
    this.classList.remove('task-drag-over');
    const header = this.closest('.status-column').querySelector('.status-header');
    if (header) {
        header.classList.remove('highlight-drop');
    }
    removeDropIndicator();
}

function handleTaskDrop(e) {
    if (!draggedItem || !draggedItem.classList.contains('task-item')) return;
    e.preventDefault();

    this.classList.remove('task-drag-over');
    const header = this.closest('.status-column').querySelector('.status-header');
    if (header) {
        header.classList.remove('highlight-drop');
    }
    removeDropIndicator();

    const taskId = parseInt(draggedItem.dataset.taskId);
    const newStatusId = parseInt(this.closest('.status-column').dataset.statusId);

    updateTaskStatus(taskId, newStatusId);
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.task-dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Функция для показа модального окна подтверждения
function showConfirmModal(title, message, confirmCallback, cancelCallback = () => { }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay1 confirm-modal1';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-actions1">
                <button id="confirmAction" class="btn-danger">Удалить</button>
                <button id="cancelAction" class="btn-secondary">Отмена</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('confirmAction').addEventListener('click', () => {
        confirmCallback();
        document.body.removeChild(modal);
    });

    document.getElementById('cancelAction').addEventListener('click', () => {
        cancelCallback();
        document.body.removeChild(modal);
    });
}

// Функция для показа модального окна с предупреждением
function showAlertModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay1 alert-modal1';
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
}


async function updateTaskStatus(taskId, newStatusId) {
    const task = Task.getById(taskId);
    const status = Status.getById(newStatusId);
    task.statusId = newStatusId;
    task.color = status.color;
    await task.update();
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskElement && status) {
        taskElement.style.borderLeftColor = status.color;
        taskElement.style.borderTopColor = status.color;
        taskElement.style.borderBottomColor = status.color;
        taskElement.style.borderRightColor = status.color;

        const statusIcon = taskElement.querySelector('.status-icon');
        if (statusIcon) {
            statusIcon.style.color = status.color;
        }
    }
    renderTasks();
    initDragAndDrop();
}

// Открытие модального окна для добавления нового статуса
function openAddStatusModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay1';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Добавить новый статус</h3>
            <div class="form-group">
                <input type="text" id="statusName" placeholder="Введите название статуса">
            </div>
            <div class="form-group">
                <label for="statusColor">Цвет статуса:</label>
                <input type="color" id="statusColor" value="${getRandomColor()}">
            </div>
            <div class="modal-actions">
                <button id="confirmAddStatus" class="btn-primary">Добавить</button>
                <button id="cancelAddStatus" class="btn-secondary">Отмена</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cancelAddStatus').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('confirmAddStatus').addEventListener('click', async () => {
        const statusName = document.getElementById('statusName').value.trim();
        const statusColor = document.getElementById('statusColor').value;
        if (statusName) {
            data = {
                statusName: statusName,
                color: statusColor,
                sphereId: Sphere.current.id
            }
            await Status.add(data);

            document.body.removeChild(modal);
            initTaskBoard();
        } else {
            alert('Пожалуйста, введите название статуса');
        }
    });
}

// Обработчик изменения размера окна
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth <= 768) {
        initMobileMode();
    } else {
        // Возвращаем десктопное поведение
        closeAllStatusContainers();
        document.querySelectorAll('.status-header').forEach(header => {
            header.style.cursor = 'grab';
            header.removeEventListener('click', handleMobileStatusClick);
        });
    }
    initDragAndDrop(); // Переинициализируем drag-and-drop
}, 250));