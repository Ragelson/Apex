document.addEventListener('DOMContentLoaded', async () => {
  await User.fetchUserData();
  /* -------------------------------------------------
       1.  HTML-шаблон 
  ------------------------------------------------- */
  const profileTemplate = /* html */`
    <div class="profile-settings-container">
      
      <div class="profile-content">
        <!-- Левая колонка -->
        <div class="profile-left">
          <div class="profile-photo-container">
            <img src="https://via.placeholder.com/170" class="profile-photo">
            <label class="photo-upload">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <input type="file" accept="image/*">
            </label>
            <div class="photo-hint">Нажмите для загрузки фото</div>
          </div>

          <div class="profile-status-container">
            <div class="profile-status" contenteditable="false">
              Здесь будет ваш статус
            </div>
            <button class="edit-status-btn" title="Редактировать статус">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15c4c4" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Правая колонка -->
        <div class="profile-details">
          <div class="details-header">
            <h3>Личная информация</h3>
            <button class="edit-button" title="Редактировать профиль">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15c4c4" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          ${[
      {
        field: 'fullName', label: 'ФИО', value: '', type: 'text', placeholder: 'Введите ФИО',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>'
      },
      {
        field: 'birthDate', label: 'Дата рождения', value: '', type: 'date', placeholder: 'Выберите дату',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
      },
      {
        field: 'phone', label: 'Телефон', value: '', type: 'tel', placeholder: 'Введите телефон',
        pattern: '\\+7\\s\\d{3}\\s\\d{3}\\s\\d{2}\\-\\d{2}',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
      },
      {
        field: 'email', label: 'Email', value: '', type: 'email', placeholder: 'Введите email',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
      },

      {
        field: 'country', label: 'Страна', value: '', type: 'select', placeholder: 'Выберите страну',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        options: [
          { value: 'Российская Федерация', icon: '🇷🇺' },
          { value: 'Украина', icon: '🇺🇦' },
          { value: 'Беларусь', icon: '🇧🇾' },
          { value: 'Казахстан', icon: '🇰🇿' },
          { value: 'Армения', icon: '🇦🇲' },
          { value: 'Азербайджан', icon: '🇦🇿' },
          { value: 'Грузия', icon: '🇬🇪' },
          { value: 'Молдова', icon: '🇲🇩' },
          { value: 'Кыргызстан', icon: '🇰🇬' },
          { value: 'Таджикистан', icon: '🇹🇯' },
          { value: 'Туркменистан', icon: '🇹🇲' },
          { value: 'Узбекистан', icon: '🇺🇿' },
          { value: 'Латвия', icon: '🇱🇻' },
          { value: 'Литва', icon: '🇱🇹' },
          { value: 'Эстония', icon: '🇪🇪' }
        ]
      },

      {
        field: 'timezone', label: 'Часовой пояс', value: '', type: 'select', placeholder: 'Выберите часовой пояс',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        options: [
          { value: 'Калининград (GMT+2)' },
          { value: 'Москва (GMT+3)' },
          { value: 'Самара (GMT+4)' },
          { value: 'Екатеринбург (GMT+5)' },
          { value: 'Омск (GMT+6)' },
          { value: 'Красноярск (GMT+7)' },
          { value: 'Иркутск (GMT+8)' },
          { value: 'Якутск (GMT+9)' },
          { value: 'Владивосток (GMT+10)' },
          { value: 'Магадан (GMT+11)' },
          { value: 'Камчатка (GMT+12)' },
          { value: 'Киев (GMT+2)' },
          { value: 'Минск (GMT+3)' },
          { value: 'Тбилиси (GMT+4)' },
          { value: 'Ереван (GMT+4)' },
          { value: 'Баку (GMT+4)' },
          { value: 'Астана (GMT+6)' },
          { value: 'Ташкент (GMT+5)' },
          { value: 'Душанбе (GMT+5)' },
          { value: 'Ашхабад (GMT+5)' },
          { value: 'Бишкек (GMT+6)' }
        ]
      },
    ].map(item => `
              <div class="detail-row" data-field="${item.field}">
                <div class="detail-icon">${item.icon}</div>
                <div class="detail-info">
                  <div class="detail-label">${item.label}</div>
                  <div class="detail-value">${item.value}</div>
                  ${item.type === 'select' ? `
                    <select class="detail-input">
                    ${item.options.map(opt => `
                      <option value="${opt.value}" ${opt.icon ? `data-icon="${opt.icon}"` : ''}>
                        ${opt.icon ? opt.icon + ' ' : ''}${opt.value}
                      </option>
                    `).join('')}
                    </select>
                  ` : `
                    <input type="${item.type}" class="detail-input" value="${item.value}"
                           ${item.pattern ? `pattern="${item.pattern}"` : ''}
                           ${item.placeholder ? `placeholder="${item.placeholder}"` : ''}>
                  `}
                </div>
              </div>
            `).join('')}

          <!-- Язык -->
          <div class="detail-row" data-field="language">
            <div class="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 128 128" fill="currentColor"><g>
<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg id="Capa_1" enable-background="new 0 0 510 510" viewBox="0 0 510 510" xmlns="http://www.w3.org/2000/svg"><g><g><g><g><path d="m360 405h30v45h30v-105c0-24.814-20.186-45-45-45-24.812 0-45 20.186-45 45v105h30zm15-75c8.271 0 15 6.728 15 15v30h-30v-30c0-8.272 6.728-15 15-15z"/><path d="m270 240v-240h-270v270h240v240h270v-270zm-240 0v-210h210v210zm450 240h-210v-210h210z"/><path d="m150 60h-30v30h-60v30h31.22c2.679 16.445 9.694 31.885 20.119 44.705l-29.057 17.433 15.435 25.725c19.71-11.834 35.05-21.015 37.282-22.39 2.359 1.453 10.448 6.278 37.282 22.39l15.436-25.725-29.057-17.433c10.425-12.82 17.44-28.26 20.119-44.705h31.221v-30h-60zm-15 86.276c-6.325-7.612-10.867-16.619-13.201-26.276h26.403c-2.334 9.657-6.876 18.664-13.202 26.276z"/><path d="m361.48 141.68-14.453-21.68h3.643c32.811 0 60.538 23.489 65.932 55.852l3.603 21.613 29.593-4.932-3.604-21.613c-7.815-46.888-47.989-80.92-95.524-80.92h-3.643l14.453-21.68-24.96-16.64-35.547 53.32 35.547 53.32z"/><path d="m148.52 368.32 14.453 21.68h-3.643c-32.809 0-60.538-23.489-65.932-55.853l-3.603-21.613-29.592 4.932 3.601 21.614c7.816 46.888 47.99 80.92 95.524 80.92h3.643l-14.453 21.68 24.961 16.641 35.548-53.321-35.547-53.32z"/></g></g></g></g></svg>              </g></svg>
            </div>
            <div class="detail-info">
              <div class="detail-label">Язык</div>
              <div class="detail-value">🇷🇺 Русский</div>
              <select class="detail-input">
                <option value="Русский" data-icon="🇷🇺">Русский</option>
                <option value="English" data-icon="🇬🇧">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="save-button">Сохранить изменения</button>
        <button class="cancel-button">Отменить</button>
      </div>
    </div>


       <!-- Модальное окно для выбора страны -->
    <div class="profile-modal country-modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Выберите страну</h3>
          <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <input type="text" class="search-input" placeholder="Поиск страны...">
          </div>
          <div class="countries-list">
            <!-- Список стран будет заполнен динамически -->
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для выбора часового пояса -->
    <div class="profile-modal timezone-modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Выберите часовой пояс</h3>
          <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <input type="text" class="search-input" placeholder="Поиск часового пояса...">
          </div>
          <div class="timezones-list">
            <!-- Список часовых поясов будет заполнен динамически -->
          </div>
        </div>
      </div>
    </div>`;
  /* -------------------------------------------------
       2.  Интегрируем шаблон по нажатию .settings-btn
  ------------------------------------------------- */
  const settingsBtn = document.querySelector('.settings-btn');
  const profileSettingsBtn = document.querySelector('.profile-settings-btn'); // Ваша новая кнопка
  const contentPane = document.querySelector('.content');
  const rightMenu = document.querySelector('.right-menu');
  const headerTitle = document.querySelector('.header-title');

  // Вынесем логику открытия профиля в отдельную функцию
  function openProfileSettings() {
    // 2.1 Выводим профиль
    contentPane.innerHTML = profileTemplate;
    initProfileLogic(contentPane.querySelector('.profile-settings-container'));

    // 2.2 Обновляем UI приложения (заголовок, тулбар, меню)
    headerTitle.textContent = 'Настройки профиля';
    document.body.classList.add('profile-open');

    // Добавьте это для корректировки контента
    contentPane.style.marginLeft = '0';
    contentPane.style.width = '100%';

    document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
    settingsBtn.classList.add('active');

    // 2.3 При выходе из профиля возвращаем меню
    document.querySelectorAll('.toolbar-icon:not(.settings-btn)')
      .forEach(icon => icon.addEventListener('click', restoreUI, { once: true }));
  }

  // Используем функцию в обработчике кнопки settingsBtn
  settingsBtn.addEventListener('click', () => {
    openProfileSettings();
  });

  // Добавляем обработчик для profileSettingsBtn
  if (profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault(); // чтобы ссылка не переходила по href="#"
      openProfileSettings();
    });
  }

  function restoreUI() {
    document.body.classList.remove('profile-open');
    // Восстанавливаем оригинальные стили контента
    contentPane.style.marginLeft = '';
    contentPane.style.width = '';
  }

  function loadProfileData() {
    // Реализация должна включать:
    // 1. Запрос к API (/api/profile)
    // 2. Обработку ответа (успех/ошибка)
    // 3. Возврат данных в формате, совместимом с текущей структурой profileData
  }

  /* 
    (!!!БЭК!!!) Функция для сохранения данных профиля на сервере
    Принимает объект с данными профиля
    Должна делать PUT/POST-запрос к API для обновления данных
    Возвращает Promise с обновленными данными или ошибкой
  */
  function saveProfileData(profileData) {
    // Реализация должна включать:
    // 1. Отправку данных на сервер (/api/profile)
    // 2. Валидацию данных перед отправкой
    // 3. Обработку ответа сервера
    // 4. Обновление локального хранилища при успешном сохранении
  }

  /* 
    (!!!БЭК!!!) Функция для загрузки аватара на сервер
    Принимает файл изображения
    Должна делать POST-запрос с FormData к API
    Возвращает Promise с URL загруженного изображения или ошибкой
  */
  function uploadAvatar(file) {
    // Реализация должна включать:
    // 1. Создание FormData и добавление файла
    // 2. Отправку на сервер (/api/upload-avatar)
    // 3. Проверку типа и размера файла
    // 4. Обработку прогресса загрузки (опционально)
    // 5. Возврат URL нового аватара
  }

  /* 
    (!!!БЭК!!!) Функция для получения списка стран с сервера
    Возвращает Promise с массивом стран в формате {value, icon}
  */
  function fetchCountries() {
    // Реализация должна включать:
    // 1. Запрос к API (/api/countries)
    // 2. Кэширование результата (опционально)
    // 3. Преобразование данных в нужный формат
  }

  /* 
    (!!!БЭК!!!) Функция для получения списка часовых поясов с сервера
    Возвращает Promise с массивом часовых поясов
  */
  function fetchTimezones() {
    // Реализация должна включать:
    // 1. Запрос к API (/api/timezones)
    // 2. Фильтрацию по стране (опционально)
    // 3. Преобразование данных в нужный формат
  }


  /* -------------------------------------------------
       3.  Внутренняя логика профиля
  ------------------------------------------------- */


  async function initProfileLogic(root) {
    /* ---------- DOM ---------- */
    const editButton = root.querySelector('.edit-button');
    const saveButton = root.querySelector('.save-button');
    const cancelButton = root.querySelector('.cancel-button');
    const photoUpload = root.querySelector('.photo-upload input');
    const profilePhoto = root.querySelector('.profile-photo');
    const profileRows = root.querySelectorAll('.detail-row');
    const profileStatus = root.querySelector('.profile-status');
    const editStatusBtn = root.querySelector('.edit-status-btn');
    let isStatusEditing = false;

    // SVG для галочки
    const checkIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15c4c4" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;

    /* ---------- Данные ---------- */
    // (!!!БЭК!!!) Заменить на загрузку данных с сервера
    const profileData = {
      fullName: User.instance.fullName,
      birthDate: User.instance.birthDate || '',
      phone: User.instance.phoneNumber,
      country: User.instance.location,
      timezone: User.instance.timeZone,
      email: User.instance.email,
      //TODO сделать выбор языка
      language: 'Русский',
      avatar: '',
      status: User.instance.status || 'Здесь будет ваш статус'
    };

    /* ---------- Helpers ---------- */
  const renderData = () => {
    profileRows.forEach(row => {
      const field = row.dataset.field;
      const value = profileData[field];
      if (value !== undefined && value !== null) {
        const input = row.querySelector('.detail-input');
        if (input) {
          if (input.tagName === 'SELECT') {
            input.value = value;
            const selectedOption = input.options[input.selectedIndex];
            const icon = selectedOption.getAttribute('data-icon') || '';
            row.querySelector('.detail-value').textContent = 
              `${icon} ${value}`.trim();
          } else {
            input.value = value;
          }
        }
        
        // Обновляем .detail-value для всех полей
        if (field === 'birthDate') {
          // Изменяем обработку даты рождения
          const dateValue = value ? new Date(value).toLocaleDateString('ru-RU') : 'Не указана';
          row.querySelector('.detail-value').textContent = dateValue;
        } else {
          row.querySelector('.detail-value').textContent = value;
        }
      }
    });
    
    profileStatus.textContent = profileData.status || '';
    if (profileData.avatar) profilePhoto.src = profileData.avatar;
  };

    const toggleEdit = () => {
      const isEditMode = !root.classList.contains('edit-mode');
      root.classList.toggle('edit-mode', isEditMode);

      // Скрываем или показываем кнопку редактирования
      if (isEditMode) {
        editButton.style.display = 'none';
        saveButton.style.display = '';
        cancelButton.style.display = '';
        // Вход в режим редактирования
        profileRows.forEach(row => {
          const field = row.dataset.field;
          const input = row.querySelector('.detail-input');
          if (input) input.value = profileData[field];
        });
      } else {
        editButton.style.display = '';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        // Выход из режима редактирования
        renderData();
      }
    };

    const saveProfile = async () => {
      //TODO: ... валидация ...

      // (!!!БЭК!!!) Заменить на вызов API для сохранения
      const phoneInput = root.querySelector('[data-field="phone"] .detail-input');
      const emailInput = root.querySelector('[data-field="email"] .detail-input');

      if (!phoneInput.checkValidity()) {
        phoneInput.reportValidity();
        return;
      }

      if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }

      /* Сохранение полей */
        profileRows.forEach(row => {
          const field = row.dataset.field;
          const input = row.querySelector('.detail-input');
          if (input) {
            if (input.tagName === 'SELECT') {
            const selectedOption = input.options[input.selectedIndex];
            if (selectedOption) {
              profileData[field] = selectedOption.value;
              const icon = selectedOption.getAttribute('data-icon') || '';
              row.querySelector('.detail-value').textContent =
                `${icon} ${selectedOption.value}`.trim();
            }
            else {
              profileData[field] = '';
            }
            } else {
        profileData[field] = input.value;
            }
          }
        });
        User.instance.fullName = profileData["fullName"];
        User.instance.phoneNumber = profileData["phone"];
        User.instance.email = profileData["email"];
        User.instance.location = profileData["country"];
        User.instance.timeZone = profileData["timezone"];
        User.instance.birthDate = profileData["birthDate"];

      await User.update();
      showToast('Профиль успешно обновлён');
      
      // Добавьте эту строку для выхода из режима редактирования после сохранения
      toggleEdit();
    };
    const photoPreview = e => {

      // ... проверка файла ...

      // (!!!БЭК!!!) Заменить на вызов API для загрузки аватара

      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.match('image.*')) {
        showToast('Пожалуйста, выберите изображение');
        return;
      }

      const reader = new FileReader();
      reader.onload = ev => {
        profilePhoto.src = ev.target.result;
        profileData.avatar = ev.target.result;
        showToast('Фото профиля обновлено');
      };
      reader.readAsDataURL(file);
    };

    const showToast = (text, isError = false) => {
      const toast = document.createElement('div');
      toast.className = `toast ${isError ? 'error' : ''}`;
      toast.textContent = text;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };

    const toggleStatusEdit = async () => {
      if (!isStatusEditing) {
        // Вход в режим редактирования
        isStatusEditing = true;
        profileStatus.contentEditable = true;
        profileStatus.classList.add('editing');
        editStatusBtn.innerHTML = checkIconSVG;
        profileStatus.focus();
        // Помещаем курсор в конец
        const range = document.createRange();
        range.selectNodeContents(profileStatus);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Сохраняем статус и выходим из режима редактирования
        isStatusEditing = false;
        profileStatus.contentEditable = false;
        profileStatus.classList.remove('editing');
        editStatusBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15c4c4" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>`;
        const newStatus = profileStatus.textContent.trim();
        if (newStatus && newStatus !== 'Здесь будет ваш статус') {
          profileData.status = newStatus;
          User.instance.status = newStatus;
          await User.update();
          showToast('Статус обновлён');
        }
      }
    };

    /* ---------- Init ---------- */
    renderData();
    // После рендера данных, скрываем кнопки по умолчанию
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';

    /* ---------- Events ---------- */
    editButton.addEventListener('click', toggleEdit);
    saveButton.addEventListener('click', saveProfile);
    cancelButton.addEventListener('click', toggleEdit);
    photoUpload.addEventListener('change', photoPreview);
    editStatusBtn.addEventListener('click', toggleStatusEdit);

    // Отключаем сохранение статуса по blur и Enter
    profileStatus.addEventListener('blur', (e) => {
      if (isStatusEditing) {
        // Не сохраняем по blur
        profileStatus.focus();
      }
    });
    profileStatus.addEventListener('keydown', (e) => {
      if (isStatusEditing && e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

});