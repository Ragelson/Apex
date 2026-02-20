const sphereManager = {
    async init() {
        this.renderMenu();
    },

    updateHeaderTitle(title) {
        const headerTitle = document.querySelector('.header-title');
        headerTitle.textContent = title || "Сферы";
    },

    async setCurrentSphere(sphere) {
        // Принудительное обновление иконки если требуется
        const spheresIcon = document.querySelector('.toolbar-icon[title="Сферы"]');
        if (spheresIcon && !spheresIcon.classList.contains('active')) {
            document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
            spheresIcon.classList.add('active');
        }
        
        if (sphere) {
            Sphere.current = sphere;
        }
        else if(!Sphere.current){
            Sphere.current = Sphere.all[0];
        }

        setHash("sphere", Sphere.current.id)
        // Обновляем путь
        this.updateHeaderTitle(Sphere.current.name);
        await initTaskBoard();
    },

    renderMenu() {
        const menuSection = document.querySelector('.right-menu .menu-section');
        if (!menuSection) return;

        // Сохраняем ссылки на существующие контейнеры
        const existingTimeline = document.querySelector('.timeline-container');
        const existingCalendar = document.querySelector('.mini-calendar-container');

        // Создаем только categories-container, остальное оставляем как есть
        menuSection.innerHTML = `
        <div class="categories-container"></div>
        ${existingCalendar ? existingCalendar.outerHTML : '<div class="mini-calendar-container" style="display: none;"></div>'}
        ${existingTimeline ? existingTimeline.outerHTML : `
            <div class="timeline-container">
                <div class="today-tasks-container">
                    <h3 class="tasks-title">Задачи на сегодня</h3>
                    <div class="timeline"></div>
                </div>
            </div>
        `}`;

        const categoriesContainer = menuSection.querySelector('.categories-container');
        this.addSection('Мои сферы', 'my-spheres', Sphere.getMy(), true, '', 'my', categoriesContainer);
        this.addSection('Общие сферы', 'shared-spheres', Sphere.getShared(), true, '', 'shared', categoriesContainer);
    },

    addSection(title, id, items, isCollapsible, buttonText, sectionType, container, initiallyCollapsed = false) {
        const sectionWrapper = document.createElement('div');
        sectionWrapper.className = 'section-wrapper';

        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'section-title';

        const titleText = document.createElement('span');
        titleText.textContent = title;
        sectionTitle.appendChild(titleText);

        if (isCollapsible) {
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.innerHTML = `
                <svg class="toggle-icon-svg up" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <path class="toggle-icon-path" d="m32.707 25.581c-.188-.188-.441-.293-.707-.293s-.52.105-.707.293l-12.502 12.501c-.391.391-.391 1.023 0 1.414s1.023.391 1.414 0l11.795-11.794 11.793 11.794c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023 0-1.414z"/>
                    <path class="toggle-icon-path" d="m32 3.008c-15.994 0-29.006 13-29.006 28.979 0 15.993 13.012 29.005 29.006 29.005s29.006-13.012 29.006-29.006c0-15.978-13.012-28.978-29.006-28.978zm0 55.984c-14.891 0-27.006-12.115-27.006-27.006 0-14.876 12.115-26.978 27.006-26.978s27.006 12.102 27.006 26.978c0 14.891-12.115 27.006-27.006 27.006z"/>
                </svg>
                <svg class="toggle-icon-svg down" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <path class="toggle-icon-path" d="m43.809 27.41-11.795 11.794-11.822-11.795c-.392-.391-1.026-.389-1.415.001-.39.391-.389 1.024.001 1.415l12.529 12.501c.195.195.451.292.707.292s.512-.098.707-.293l12.501-12.501c.391-.391.391-1.023 0-1.414s-1.023-.391-1.413 0z"/>
                    <path class="toggle-icon-path" d="m31.986 2.994c-15.979 0-28.978 13.012-28.978 29.006s13 29.006 28.979 29.006c15.994 0 29.006-13.012 29.006-29.006-.001-15.994-13.013-29.006-29.007-29.006zm0 56.012c-14.876 0-26.978-12.114-26.978-27.006s12.103-27.007 26.979-27.007c14.891 0 27.006 12.115 27.006 27.007-.001 14.892-12.116 27.006-27.007 27.006z"/>
                </svg>
            `;
            sectionTitle.appendChild(toggleIcon);

            const updateIconState = () => {
                const isCollapsed = sectionTitle.classList.contains('collapsed');
                toggleIcon.querySelector('.up').style.display = isCollapsed ? 'none' : 'block';
                toggleIcon.querySelector('.down').style.display = isCollapsed ? 'block' : 'none';
            };

            sectionTitle.addEventListener('click', () => {
                this.toggleSection(id);
                localStorage.setItem(`section_${id}_collapsed`, document.getElementById(id).classList.contains('collapsed'));
                updateIconState();
            });

            const wasCollapsed = initiallyCollapsed || localStorage.getItem(`section_${id}_collapsed`) === 'true';
            if (wasCollapsed) {
                sectionTitle.classList.add('collapsed');
            }
            updateIconState();
        }
        sectionWrapper.appendChild(sectionTitle);

        const sectionContainer = document.createElement('div');
        sectionContainer.id = id;
        sectionContainer.className = 'section-container';

        if (isCollapsible) {
            sectionContainer.classList.add('collapsible');
            if (sectionTitle.classList.contains('collapsed')) {
                sectionContainer.classList.add('collapsed');
            }
        }

        if (items.length > 0) {
            items.forEach((item, index) => {
                this.addItem(sectionContainer, item, sectionType, index);
            });
        } else {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Пусто';
            sectionContainer.appendChild(emptyMessage);
        }

        const addButton = document.createElement('button');
        addButton.className = 'add-sphere-button';
        addButton.dataset.sectionType = sectionType;
        addButton.innerHTML = `<span class="plus-icon">+</span><span>${buttonText}</span>`;
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.createSphereModal(sectionType);
        });

        sectionContainer.appendChild(addButton);
        sectionWrapper.appendChild(sectionContainer);
        container.appendChild(sectionWrapper);
    },

    addItem(container, item, sectionType, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'sphere-item';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.justifyContent = 'space-between';

        itemElement.dataset.sphereType = item.type;

        const itemContent = document.createElement('button');
        itemContent.type = 'button';
        itemContent.className = 'category-item';
        itemContent.style.flexGrow = '1';
        itemContent.style.marginRight = '5px';

        const color = item.color;
        const displayName = item.name;

        itemContent.innerHTML = `
            <span class="category-icon" style="color: ${color}">●</span>
            <span class="sphere-text" style="color: ${color}" data-type="${sectionType}" data-index="${index}">${displayName}</span>
        `;

        const editButton = document.createElement('button');
        editButton.className = 'edit-sphere-btn';
        editButton.innerHTML = `
        <svg class="edit-icon" width="16" height="16" viewBox="0 0 488.877 488.877">
            <path class="edit-icon-path" d="m488.3,100.567c-0.7-1.6-1.1-3.6-1.5-5.6c-1.1-5.3-2.3-11.2-5-17.2c-15-34.2-39.8-58.5-73.7-72.2c-7.3-3-14.6-3.9-21-4.6 l-1.6-0.2c-7.4-0.9-18.4,0.1-28.7,10.6c-43.7,43.9-88.2,88.4-131.3,131.5l-31.6,31.5c-7.1,7.1-10,10-11.5,11.5s-1.5,1.5-2.7,2.7 c-1.3,1.3-4,4.1-11.8,12c-7,7.1-6.9,18.5,0.2,25.5c7.1,7,18.5,6.9,25.5-0.2c7.9-8,10.6-10.8,11.9-12.1c1.1-1.1,1.1-1.1,2.4-2.4 c1.5-1.5,4.4-4.4,11.5-11.5l31.6-31.6c43.1-43.1,87.6-87.6,131.4-131.6l0.1-0.1h0.3c4.6,0.6,9,1.1,11.9,2.3 c25.3,10.2,43,27.7,54.3,53.3c1.1,2.6,1.9,6.2,2.7,10.1c0.2,1,0.4,1.9,0.6,2.9c-0.1,0.1-0.2,0.2-0.4,0.4 c-72,71.8-146.9,146.7-229.2,229.1c-0.4,0.4-0.4,0.4-1.1,0.6c-27.6,5.8-55.6,11.7-82.6,17.4l-4.3,0.9l0.8-3.7 c5.8-27.5,11.8-55.9,17.9-83.8c2.1-9.7-4-19.3-13.7-21.4c-9.7-2.1-19.3,4-21.4,13.7c-6.1,28-12.1,56.5-17.9,84.1l-3.3,15.6 c-2,9.6,0.7,19.3,7.3,25.9c5.2,5.2,12.2,8,19.7,8c2.1,0,4.2-0.2,6.3-0.7l16.3-3.4c27.1-5.7,55-11.6,82.5-17.4 c7.6-1.6,13.9-5,19.2-10.4c82.2-82.4,157.2-157.3,229.1-229.1c6.7-6.7,10.4-14.7,11.3-24.3 C489,104.667,488.8,102.567,488.3,100.567z"/>
            <path class="edit-icon-path" d="m387.7,263.767c-9.9,0-18 18v162.7c0,4.4-3.5,7.9-7.9,7.9H43.9c-4.4,0-7.9-3.5-7.9-7.9v-317.9 c0-4.4,3.5-7.9,7.9-7.9h169.6c9.9,0,18-8.1,18-18c0-9.9-8.1-18-18-18H43.9c-24.2,0-43.9,19.7-43.9,43.9v317.9 c0,24.2,19.7,43.9,43.9,43.9h317.9c24.2,0,43.9-19.7,43.9-43.9v-162.7C405.7,271.867,397.6,263.767,387.7,263.767z"/>
        </svg>
        `;
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editSphereModal(index, sectionType);
        });
        itemElement.appendChild(editButton);

        itemContent.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setCurrentSphere(item);

            // Скрываем меню на мобильном
            if (window.innerWidth <= 768) {
                document.body.classList.remove('menu-open');
                const mobileDrawer = document.querySelector('.mobile-drawer');
                const menuToggle = document.querySelector('.mobile-menu-toggle');
                const overlay = document.querySelector('.mobile-menu-overlay');
                if (mobileDrawer) mobileDrawer.setAttribute('aria-hidden', 'true');
                if (menuToggle) menuToggle.classList.remove('is-active');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                if (overlay) overlay.setAttribute('aria-hidden', 'true');
            }

            const calendarContainer = document.querySelector('.mini-calendar-container');
            const timelineContainer = document.querySelector('.timeline-container');
            if (calendarContainer && timelineContainer) {
                calendarContainer.style.display = 'none';
                timelineContainer.style.display = 'block';
            }

            const calendarIcon = document.querySelector('.toolbar-icon[title="Календарь"]');
            if (calendarIcon) {
                calendarIcon.classList.remove('active');
            }
        });

        itemElement.insertBefore(itemContent, itemElement.firstChild);
        container.appendChild(itemElement);
    },

    createConfirmModal(title, message, confirmCallback, cancelCallback) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay1 confirm-modal1';

        modalOverlay.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-actions1">
                    <button class="btn-danger confirm-btn">Удалить</button>
                    <button class="btn-secondary cancel-btn">Отмена</button>
                </div>
            </div>
        `;

        const closeModal = () => closeModalSmoothly(modalOverlay);

        modalOverlay.querySelector('.cancel-btn').addEventListener('click', () => {
            closeModal();
            if (typeof cancelCallback === 'function') cancelCallback();
        });
        modalOverlay.querySelector('.confirm-btn').addEventListener('click', () => {
            confirmCallback();
            closeModal();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
                if (typeof cancelCallback === 'function') cancelCallback();
            }
        });

        return modalOverlay;
    },

    editSphereModal(index, sectionType) {
        const sphere = sectionType === 'my' ? Sphere.getMy()[index] : Sphere.getShared()[index];
        const modal = document.createElement('div');
        modal.className = 'sphere-modal-overlay';

        modal.innerHTML = `
            <div class="sphere-modal-box">
                <div class="sphere-modal-header">
                    <h3>Изменить сферу</h3>
                    <button class="sphere-modal-close" aria-label="Закрыть">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div class="sphere-modal-body">
                    <div class="form-group">
                        <label class="form-label">Название сферы</label>
                        <input type="text" class="form-input sphere-name-input" placeholder="Введите своё название" value="${sphere.name}">
                        <div class="form-hint">Обязательное поле</div>
                    </div>

                    <div class="form-group color-group">
                        <label class="form-label">Цвет сферы</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="sphereColor" value="${sphere.color}">
                            <label for="sphereColor" class="color-preview" style="--selected-color: ${sphere.color}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="var(--selected-color)"/>
                                </svg>
                                Выбрать цвет
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Участники</label>
                        <div class="email-tags-container"></div>
                        <input type="email" class="form-input email-input" placeholder="Введите e-mail участника">
                        <button class="btn btn-small add-email-btn">Добавить</button>
                    </div>
                </div>

                <div class="sphere-modal-footer">
                    <button class="btn btn-primary save-btn" >Сохранить</button>
                    <button class="btn btn-danger delete-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
                        </svg>
                        Удалить
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Загружаем список участников
        const emailTagsContainer = modal.querySelector('.email-tags-container');
        if (sphere.participantEmails && Array.isArray(sphere.participantEmails)) {
            sphere.participantEmails.forEach(email => {
                this.addEmailTag(emailTagsContainer, email);
            });
        }

        // Обработчики кнопок
        modal.querySelector('.sphere-modal-close').addEventListener('click', () => closeModalSmoothly(modal));

        modal.querySelector('.save-btn').addEventListener('click', async () => {
            const name = modal.querySelector('.sphere-name-input').value.trim();
            const color = modal.querySelector('#sphereColor').value;
            const emailTags = modal.querySelectorAll('.email-tag');
            const emails = Array.from(emailTags).map(tag => tag.dataset.email);

            if (!name) {
                alert("Введите название сферы!");
                return;
            }

            if (sectionType === 'my' && emails.length > 0) {
                // Переносим сферу в общие
                try {
                    sphere.shared = true;
                    sphere.participantEmails = emails;
                    await sphere.update();
                    this.renderMenu();
                    closeModalSmoothly(modal);
                } catch (error) {
                    console.error("Ошибка при переносе сферы:", error);
                    alert("Произошла ошибка при переносе сферы");
                }
            } else {
                // Обновляем сферу
                sphere.name = name;
                sphere.color = color;
                if (sectionType === 'shared') {
                    sphere.participantEmails = emails;
                }
                await sphere.update();
                this.renderMenu();
                this.updateHeaderTitle(sphere.name);
                window.dayCycleManager.updateUI();
                closeModalSmoothly(modal);
            }
        });

        // Обработчик добавления email
        const addEmailBtn = modal.querySelector('.add-email-btn');
        const emailInput = modal.querySelector('.email-input');

        addEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            if (email && this.validateEmail(email)) {
                this.addEmailTag(emailTagsContainer, email);
                emailInput.value = '';
                if (sectionType === 'shared') {
                    if (!sphere.participantEmails) sphere.participantEmails = [];
                    sphere.participantEmails.push(email);
                }
            } else {
                alert("Введите корректный e-mail!");
            }
        });

        // Обработчик удаления сферы
        modal.querySelector('.delete-btn').addEventListener('click', () => {
            // Скрываем модалку изменения сферы
            modal.style.display = 'none';

            const confirmModal = this.createConfirmModal(
                `Подтверждение удаления`,
                'Все данные, связанные с этой сферой, будут безвозвратно удалены.',
                async () => {
                    await sphere.delete();
                    this.renderMenu();
                    closeModalSmoothly(modal);
                },
                // Новый параметр: отмена
                () => {
                    closeModalSmoothly(confirmModal);
                    modal.style.display = ''; // Показываем обратно модалку изменения
                }
            );
            document.body.appendChild(confirmModal);
        });

        modal.addEventListener('click', e => {
            if (e.target === modal) closeModalSmoothly(modal);
        });
    },

    createSphereModal(sectionType) {
        const isShared = sectionType === 'shared';
        const modal = document.createElement('div');
        modal.className = 'sphere-modal-overlay';


        modal.innerHTML = `
            <div class="sphere-modal-box">
                <div class="sphere-modal-header">
                    <h3>Создать ${isShared ? 'общую' : ''} сферу</h3>
                    <button class="sphere-modal-close" aria-label="Закрыть">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div class="sphere-modal-body">
                    <div class="form-group">
                        <label class="form-label">Название сферы</label>
                        <input type="text" class="form-input sphere-name-input" placeholder="Введите своё название">
                        <div class="form-hint">Обязательное поле</div>
                    </div>

                    <div class="form-group color-group">
                        <label class="form-label">Цвет сферы</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="sphereColor" value="${getRandomColor()}">
                            <label for="sphereColor" class="color-preview" style="--selected-color: #000000">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="var(--selected-color)"/>
                                </svg>
                                Выбрать цвет
                            </label>
                        </div>
                    </div>

                    ${isShared ? `
                    <div class="form-group">
                        <label class="form-label">Участники</label>
                        <div class="email-tags-container"></div>
                        <input type="email" class="form-input email-input" placeholder="Введите e-mail участника">
                        <button class="btn btn-small add-email-btn">Добавить</button>
                    </div>
                    ` : ''}
                </div>

                <div class="sphere-modal-footer">
                    <button class="btn btn-primary save-btn" >Создать</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики кнопок
        modal.querySelector('.sphere-modal-close').addEventListener('click', () => closeModalSmoothly(modal));

        modal.querySelector('.save-btn').addEventListener('click', async () => {
            const name = modal.querySelector('.sphere-name-input').value.trim();
            const color = modal.querySelector('#sphereColor').value;

            if (!name) {
                alert("Введите название сферы!");
                return;
            }

            const data = {
                goalName: name,
                color: color,
                participantEmails: []
            };

            if (isShared) {
                const emailTags = modal.querySelectorAll('.email-tag');
                emailTags.forEach(tag => {
                    const email = tag.dataset.email;
                    if (email) data.participantEmails.push(email);
                });
            }

            try {
                await Sphere.add(data);
                this.renderMenu();
                closeModalSmoothly(modal);
            } catch (error) {
                console.error("Ошибка при создании сферы:", error);
                alert("Произошла ошибка при создании сферы");
            }
        });

        if (isShared) {
            const addEmailBtn = modal.querySelector('.add-email-btn');
            const emailInput = modal.querySelector('.email-input');
            const emailTagsContainer = modal.querySelector('.email-tags-container');

            addEmailBtn.addEventListener('click', () => {
                const email = emailInput.value.trim();
                if (email && this.validateEmail(email)) {
                    this.addEmailTag(emailTagsContainer, email);
                    emailInput.value = '';
                } else {
                    alert("Введите корректный email!");
                }
            });
        }

        modal.addEventListener('click', e => {
            if (e.target === modal) closeModalSmoothly(modal);
        });
    },

    addEmailTag(container, email) {
        if (!container || !email) return;

        const tag = document.createElement('div');
        tag.className = 'email-tag';
        tag.dataset.email = email;
        tag.innerHTML = `
            <span>${email}</span>
            <button class="remove-email-btn">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        `;

        tag.querySelector('.remove-email-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            tag.remove();
        });

        container.appendChild(tag);
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const sectionTitle = section.parentElement.querySelector('.section-title');

        const isNowCollapsed = !section.classList.contains('collapsed');

        section.classList.toggle('collapsed');
        sectionTitle.classList.toggle('collapsed', isNowCollapsed);

        localStorage.setItem(`section_${sectionId}_collapsed`, isNowCollapsed);
    }
};

// Функция для плавного закрытия модальных окон (добавляем в конец файла)
function closeModalSmoothly(modal) {
    if (!modal) return;
    
    modal.classList.add('closing');
    const modalBox = modal.querySelector('.sphere-modal-box') || modal.querySelector('.modal-content');
    if (modalBox) modalBox.classList.add('closing');
    
    setTimeout(() => {
        if (modal && modal.parentNode) {
            modal.remove();
        }
    }, 200);
}