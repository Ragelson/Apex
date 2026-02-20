(() => {
  const addSVG = `
    <svg class="victory-add-icon" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 6v12M6 12h12"/>
    </svg>`;
  const addSphereSVG = `
    <svg class="victory-add-sphere-icon" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 8v8M8 12h8"/>
    </svg>`;

  // Функция для плавного закрытия модальных окон
  function closeModalSmoothly(modal) {
    if (!modal) return;
    
    modal.classList.add('closing');
    const modalBox = modal.querySelector('.victory-modal-box');
    if (modalBox) modalBox.classList.add('closing');
    
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.remove();
      }
    }, 200);
  }

  class VictoriesManager {
    constructor() {
      this.initialized = false;
      this._clickBound = false;
      this._onDocClick = null;
      this.sphereChangedHandler = null;
    }

    async init() {
      if (this.initialized) return;
      this.initialized = true;

      await this.loadData();
      this.bindGlobalEvents();

      this.sphereChangedHandler = (e) => {
        VictoryCategory.current = VictoryCategory.getById(parseInt(e.detail.sphereType));
        this.renderSpheres();
        this.renderVictories();
      };
      document.addEventListener('sphereChanged', this.sphereChangedHandler);
    }

    async loadData() {
      if (VictoryCategory.all.length === 0) {
        await VictoryCategory.fetchAll();
      }

      if (Victory.all.length === 0) {
        await Victory.fetchAll();
      }

      if (!VictoryCategory.current) {
        VictoryCategory.current = VictoryCategory.all[0];
      }

      if (Victory.getByCategoryId(VictoryCategory.current.id).length === 0) {
        await Victory.fetchAllByCategoryId(VictoryCategory.current.id);
      }
    }

    destroy() {
      if (this._clickBound && this._onDocClick) {
        document.removeEventListener('click', this._onDocClick);
        this._clickBound = false;
      }
      if (this.sphereChangedHandler) {
        document.removeEventListener('sphereChanged', this.sphereChangedHandler);
        this.sphereChangedHandler = null;
      }
      this.initialized = false;
    }

    async renderPage(id = null) {
      const spheresIcon = document.querySelector('.toolbar-icon[title="Мои победы"]');
      if (spheresIcon && !spheresIcon.classList.contains('active')) {
        document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
        spheresIcon.classList.add('active');
      }
      sphereManager.updateHeaderTitle("Мои победы");
      if(id){
        VictoryCategory.current = VictoryCategory.getById(id);
      }
      if(!VictoryCategory.current){
        VictoryCategory.current = VictoryCategory.all[0];
      }
      setHash("victories", VictoryCategory.current.id);
      if (!this.initialized) await this.init();
      const content = document.querySelector('.content');
      if (!content) return;
      content.innerHTML = `
        <div class="victory-page">
          <div class="victory-toolbar">
            <div class="victory-spheres-container">
              <div class="victory-spheres"></div>
              <button class="victory-add-sphere-btn" title="Добавить сферу">${addSphereSVG}</button>
            </div>
          </div>
          <div class="victory-list"></div>
        </div>`;
      this.renderSpheres();
      this.renderVictories();
    }

    renderSpheres() {
      const wrap = document.querySelector('.victory-spheres');
      if (!wrap) return;

      wrap.innerHTML = VictoryCategory.all.map(vc => {
        const color = vc.color || "#1D5060";
        return `
          <div class="victory-sphere ${vc === VictoryCategory.current ? 'active' : ''}" data-type="${vc.id}">
            <div class="victory-sphere-content" style="--border-color:${color};">
              <div class="victory-sphere-indicator" style="background:${color}"></div>
              <span>${vc.name}</span>
              <button class="victory-sphere-add" title="Добавить победу">${addSVG}</button>
              <button class="victory-sphere-menu" title="Действия">⋮</button>
            </div>
          </div>`;
      }).join('');
    }

    renderVictories() {
      const list = document.querySelector('.victory-list');
      if (!list) return;

      const data = Victory.getByCategoryId(VictoryCategory.current.id);

      if (!data.length) {
        list.innerHTML = `
          <div class="victory-empty">
            <p>Пока нет побед</p>
          </div>`;
        return;
      }

      list.innerHTML = `<div class="victory-grid">
        ${data.map(v => this.renderCard(v)).join('')}
      </div>`;
    }

    renderCard(victory) {
      const clr = victory.color;
      const VictoryIcon = `<svg id="fix_1" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m14.41 20.62c-.116 0-.232-.04-.327-.122-.209-.181-.232-.496-.052-.705 2.42-2.801 4.53-10.2 4.909-17.21l.055-1.057c.007-.137-.042-.271-.136-.37-.094-.099-.226-.156-.362-.156h-12.994c-.136 0-.268.057-.362.156s-.144.234-.137.37l.056 1.058c.378 7.01 2.489 14.409 4.909 17.209.181.209.157.524-.052.705-.208.18-.524.158-.705-.052-2.934-3.394-4.812-11.529-5.151-17.809l-.056-1.059c-.021-.41.128-.814.411-1.111.281-.297.678-.467 1.087-.467h12.993c.41 0 .806.17 1.088.467.282.296.431.701.41 1.111l-.055 1.058c-.34 6.282-2.218 14.416-5.151 17.811-.099.115-.238.173-.378.173z"/><path d="m13.5 16c-.1 0-.202-.03-.29-.093-.225-.16-.277-.473-.117-.697 1.684-2.364 2.907-7.281 2.907-11.69 0-.276.224-.5.5-.5s.5.224.5.5c0 4.668-1.272 9.714-3.093 12.27-.097.137-.251.21-.407.21z"/><path d="m16.5 24h-9c-.276 0-.5-.224-.5-.5 0-2.481 2.243-4.5 5-4.5s5 2.019 5 4.5c0 .276-.224.5-.5.5zm-8.459-1h7.919c-.278-1.694-1.948-3-3.959-3s-3.682 1.306-3.96 3z"/><path d="m17.491 14.22c-.181 0-.355-.098-.444-.27-.127-.245-.031-.547.214-.674 2.923-1.516 5.002-4.218 5.702-7.413.103-.468-.006-.945-.299-1.31-.284-.351-.707-.553-1.164-.553h-2.12c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2.12c.761 0 1.469.338 1.943.927.483.602.664 1.386.496 2.15-.763 3.486-3.03 6.433-6.218 8.086-.074.039-.153.057-.230.057z"/><path d="m6.509 14.22c-.078 0-.156-.018-.229-.056-3.188-1.653-5.455-4.601-6.218-8.087-.168-.764.012-1.548.496-2.15.473-.589 1.181-.927 1.942-.927h2.12c.276 0 .5.224.5.5s-.224.5-.5.5h-2.12c-.457 0-.88.202-1.163.554-.293.364-.402.841-.299 1.309.7 3.195 2.778 5.897 5.702 7.414.245.127.341.429.214.674-.089.171-.264.269-.445.269z"/></g></svg>`;
      const editIcon = `<svg viewBox="0 0 24 24" width="28" height="28">
                    <!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg id="Line" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="m5 15.08984h37.14093a5.2529 5.2529 0 0 0 10.31482 0h6.54425a1 1 0 0 0 0-2h-6.54364a5.25227 5.25227 0 0 0 -10.316 0h-37.14036a1 1 0 0 0 0 2zm42.29834-4.26171a3.25879 3.25879 0 1 1 -3.25842 3.26232l.00012-.00061-.00037-.00189-.00012-.001a3.26251 3.26251 0 0 1 3.25879-3.25882z"/><path d="m59 31h-22.10107a5.25229 5.25229 0 0 0 -10.31493 0h-21.584a1 1 0 0 0 0 2h21.584a5.25229 5.25229 0 0 0 10.315 0h22.101a1 1 0 0 0 0-2zm-27.25879 4.25879a3.25879 3.25879 0 1 1 3.25879-3.25879 3.26241 3.26241 0 0 1 -3.25879 3.25879z"/><path d="m59 48.91016h-34.80353a5.2526 5.2526 0 0 0 -10.31433 0h-8.88214a1 1 0 0 0 0 2h8.88153a5.252 5.252 0 0 0 10.31555 0h34.80292a1 1 0 0 0 0-2zm-39.96094 4.26172a3.25879 3.25879 0 1 1 3.25879-3.25879 3.26242 3.26242 0 0 1 -3.25879 3.25879z"/></g></svg>
                </svg>`;
      const deleteIcon = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#ff2828">
                    <-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/xlink"><g id="Layer_29" data-name="Layer 29"><path d="m28.7324 5.5186h-7.6015v-1.6846a1.5445 1.5445 0 0 0 -1.5-1.582h-6.0254a1.5445 1.5445 0 0 0 -1.5 1.582v1.6846h-7.6026a.5.5 0 0 0 0 1h1.5125l1.0852 21.2793a1.5154 1.5154 0 0 0 1.498 1.4541h16.09a1.5121 1.5121 0 0 0 1.499-1.4747l.81-21.2587h1.7351a.5.5 0 0 0 0-1zm-15.6269-1.6846a.5463.5463 0 0 1 .5-.582h6.0254a.5463.5463 0 0 1 .5.582v1.6846h-7.0254zm12.082 23.9053a.5151.5151 0 0 1 -.499.5127h-16.0899a.5164.5164 0 0 1 -.5-.5049l-1.082-21.2285h18.9795z"/><path d="m16.6182 8.3535a.5.5 0 0 0 -.5.5v16.93a.5.5 0 0 0 1 0v-16.93a.5.5 0 0 0 -.5-.5z"/><path d="m21.5537 26.2832a.5.5 0 0 0 .5-.5v-16.9297a.5.5 0 0 0 -1 0v16.93a.5.5 0 0 0 .5.4997z"/><path d="m11.541 8.3535a.5.5 0 0 0 -.5.5v16.93a.5.5 0 0 0 1 0v-16.93a.5.5 0 0 0 -.5-.5z"/></g></svg>
                </svg>`;

      return `
        <div class="victory-card" data-idx="${victory.id}" style="--border-color:${clr}">
          <div class="task-meta">
            <div class="victory-icon" style="--border-color:${clr}">${VictoryIcon}</div>
            <div class="task-date">${new Date(victory.start).toLocaleDateString('ru-RU')}</div>
          </div>
          <div class="task-header">
            <div class="task-title">${victory.name}</div>
            <div class="task-actions">
              <button class="edit-task-btn victory-edit" title="Редактировать" data-idx="${victory.id}">${editIcon}</button>
            </div>
          </div>
          <div class="task-desc">${victory.desc ? victory.desc : ''}</div>
          <button class="delete-task-btn victory-delete" title="Удалить" data-idx="${victory.id}">${deleteIcon}</button>
        </div>`;
    }

    bindGlobalEvents() {
      if (this._clickBound) return;
      this._onDocClick = this.handleDocumentClick.bind(this);
      document.addEventListener('click', this._onDocClick);
      this._clickBound = true;
    }

    handleDocumentClick(e) {
      const t = e.target;

      if (t.closest('.victory-sphere-menu')) {
        const sphereEl = t.closest('.victory-sphere');
        const id = parseInt(sphereEl?.dataset.type, 10);
        const victoryCategory = VictoryCategory.getById(id);
        this.openSphereMenu(victoryCategory, t.closest('.victory-sphere-menu'));
        return;
      }

      const sphere = t.closest('.victory-sphere');
      if (sphere) {
        if (t.closest('.victory-sphere-add')) {
          const sphereType = sphere.dataset.type;
          this.openVictoryModal(VictoryCategory.getById(parseInt(sphereType)));
          return;
        }
        VictoryCategory.current = VictoryCategory.getById(parseInt(sphere.dataset.type));
        this.renderSpheres();
        this.renderVictories();
        return;
      }

      if (t.closest('.victory-add-sphere-btn')) {
        this.openAddSphereModal();
        return;
      }

      if (t.closest('.victory-edit')) {
        const id = parseInt(t.closest('[data-idx]')?.dataset.idx, 10);
        const victory = Victory.getById(id);
        this.openVictoryModal(null, victory);
        return;
      }

      if (t.closest('.victory-delete')) {
        const id = parseInt(t.closest('[data-idx]')?.dataset.idx, 10);
        const victory = Victory.getById(id);
        this.removeVictory(victory);
        return;
      }
    }

    openAddSphereModal() {
      const modal = document.createElement('div');
      modal.className = 'victory-modal';
      modal.innerHTML = `
        <div class="victory-modal-box">
          <div class="victory-modal-header">
            <h3>Новая сфера побед</h3>
            <button class="victory-modal-close" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="victory-modal-body">
            <div class="form-group">
              <label class="form-label">Название сферы</label>
              <input type="text" class="form-input victory-input" placeholder="Введите название сферы">
              <div class="form-hint">Обязательное поле</div>
            </div>
            <div class="form-group color-group">
              <label class="form-label">Цвет сферы</label>
              <div class="color-input-wrapper">
                <input type="color" id="sphereColor" value="#1D5060">
                <label for="sphereColor" class="color-preview" style="--selected-color: #1D5060">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="var(--selected-color)"/>
                  </svg>
                  Выбрать цвет
                </label>
              </div>
            </div>
          </div>
          <div class="victory-modal-footer">
            <button class="btn btn-primary">Добавить</button>
            <button class="btn btn-secondary">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-primary').onclick = async () => {
        const name = modal.querySelector('.victory-input').value.trim();
        const color = modal.querySelector('#sphereColor').value;
        if (!name) return;
        await VictoryCategory.add(name, color);
        this.renderSpheres();
        closeModalSmoothly(modal);
      };
      
      modal.querySelector('.btn-secondary').onclick = () => closeModalSmoothly(modal);
      modal.querySelector('.victory-modal-close').onclick = () => closeModalSmoothly(modal);
      modal.onclick = e => { 
        if (e.target === modal) closeModalSmoothly(modal); 
      };
    }

    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    openSphereMenu(victoryCategory, button) {
      const menu = document.createElement('div');
      menu.className = 'victory-context-menu';
      menu.innerHTML = `
        <ul>
          <li class="edit-sphere">Изменить</li>
          <li class="delete-sphere">Удалить</li>
        </ul>
      `;

      document.body.appendChild(menu);

      const rect = button.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.left = `${rect.left}px`;
      menu.style.top = `${rect.bottom + 5}px`;
      menu.style.zIndex = '10001';

      menu.querySelector('.edit-sphere').addEventListener('click', () => {
        this.openEditSphereModal(victoryCategory);
        menu.remove();
      });

      menu.querySelector('.delete-sphere').addEventListener('click', async () => {
        await this.deleteSphere(victoryCategory);
        menu.remove();
      });

      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', closeMenu);
      }, 0);
    }

    openEditSphereModal(victoryCategory) {
      const modal = document.createElement('div');
      modal.className = 'victory-modal';
      modal.innerHTML = `
        <div class="victory-modal-box">
          <div class="victory-modal-header">
            <h3>Изменить сферу</h3>
            <button class="victory-modal-close" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="victory-modal-body">
            <div class="form-group">
              <label class="form-label">Название сферы</label>
              <input type="text" id="sphereName" class="form-input" value="${victoryCategory.name}" placeholder="Название сферы">
              <div class="form-hint">Обязательное поле</div>
            </div>
            <div class="form-group color-group">
              <label class="form-label">Цвет сферы</label>
              <div class="color-input-wrapper">
                <input type="color" id="victoryColor" value="${victoryCategory.color || '#1D5060'}">
                <label for="victoryColor" class="color-preview" style="--selected-color: ${victoryCategory.color || '#1D5060'}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="var(--selected-color)"/>
                  </svg>
                  Выбрать цвет
                </label>
              </div>
            </div>
          </div>
          <div class="victory-modal-footer">
            <button class="btn btn-primary">Сохранить</button>
            <button class="btn btn-secondary">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-primary').addEventListener('click', async () => {
        const name = modal.querySelector('#sphereName').value.trim();
        const color = modal.querySelector('#victoryColor').value;
        if (name) {
          await victoryCategory.update(name, color);

          // Принудительно обновляем отображение
          this.renderSpheres();
          this.renderVictories();

          closeModalSmoothly(modal);
        } else {
          alert('Пожалуйста, введите название сферы');
        }
      });
      
      modal.querySelector('.btn-secondary').addEventListener('click', () => closeModalSmoothly(modal));
      modal.querySelector('.victory-modal-close').addEventListener('click', () => closeModalSmoothly(modal));
      modal.onclick = e => { 
        if (e.target === modal) closeModalSmoothly(modal); 
      };
    }

    async deleteSphere(victoryCategory) {
      this.showDeleteConfirmation(
        `Удалить сферу "${victoryCategory.name}"? Все победы в этой сфере будут удалены.`,
        async () => {
          await victoryCategory.delete();

          if (VictoryCategory.current === victoryCategory) {
            if (VictoryCategory.all.length > 0) {
              VictoryCategory.current = VictoryCategory.all[0];
            } else {
              location.reload();
              return;
            }
          }
          this.renderSpheres();
          this.renderVictories();
        }
      );
    }

    getSphereName(sphereType) {
      if (sphereType === 'all') return 'Все';
      const sphere = this.spheres.find(s => s.type === sphereType);
      return sphere ? sphere.name : 'Неизвестная сфера';
    }

    showDeleteConfirmation(message, onConfirm) {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content confirm-modal">
          <h3>Подтверждение</h3>
          <p>${message}</p>
          <div class="modal-actions1">
            <button class="btn-danger">Удалить</button>
            <button class="btn-secondary">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-secondary').addEventListener('click', () => {
        closeModalSmoothly(modal);
      });

      modal.querySelector('.btn-danger').addEventListener('click', () => {
        closeModalSmoothly(modal);
        onConfirm();
      });

      // Закрытие по клику вне модального окна
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModalSmoothly(modal);
        }
      });
    }

    removeVictory(victory) {
      this.showDeleteConfirmation(
        `Вы уверены, что хотите удалить победу "${victory.name.substring(0, 30)}${victory.name.length > 30 ? '...' : ''}"?`,
        async () => {
          await victory.delete();
          this.renderVictories();
        }
      );
    }

    openVictoryModal(victoryCategory = null, victory = null) {
      const modal = document.createElement('div');
      const name = victoryCategory ? victoryCategory.name : VictoryCategory.getById(victory.categoryId).name;
      // Получаем цвет победы (если редактируем), иначе дефолтный
      const victoryColor = victory ? (victory.color || '#1D5060') : '#1D5060';

      modal.className = 'victory-modal';
      modal.innerHTML = `
        <div class="victory-modal-box">
          <div class="victory-modal-header">
            <h3>${victory === null ? 'Новая победа' : 'Редактирование победы'}</h3>
            <button class="victory-modal-close" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="victory-modal-body">
            <div class="victory-modal-category">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Сфера: ${name}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Название победы</label>
              <textarea class="form-input victory-name-input" placeholder="Краткое и ёмкое название..." rows="1">${victory ? victory.name : ''}</textarea>
              <div class="form-hint">Обязательное поле</div>
            </div>

            <div class="form-group">
              <label class="form-label">Описание победы</label>
              <textarea class="form-input victory-desc-input" placeholder="Опишите детали вашего достижения, что было особенно ценно..." rows="3">${victory ? (victory.desc || '') : ''}</textarea>
            </div>

            <div class="form-group color-group">
              <label class="form-label">Цвет акцента</label>
              <div class="color-input-wrapper">
                <input type="color" id="victoryColor" value="${victoryColor}">
                <label for="victoryColor" class="color-preview" style="--selected-color: ${victoryColor}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1v1.5a2.5 2.5 0 0 0 5 0V18h1c3.87 0 7-3.13 7-7 0-4.97-4.48-9-10-9zm-4.5 9.5A1.5 1.5 0 1 1 9 10a1.5 1.5 0 0 1-1.5 1.5zm3-4A1.5 1.5 0 1 1 12 6a1.5 1.5 0 0 1-1.5 1.5zm6 4A1.5 1.5 0 1 1 18 10a1.5 1.5 0 0 1-1.5 1.5zm-3 4A1.5 1.5 0 1 1 15 14a1.5 1.5 0 0 1-1.5 1.5z" fill="var(--selected-color)"/>
                  </svg>
                  Выбрать цвет
                </label>
              </div>
            </div>
          </div>

          <div class="victory-modal-footer">
            <button class="btn btn-primary" type="submit">${victory ? 'Обновить' : 'Создать победу'}</button>
            <button class="btn btn-secondary" type="button">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-primary').onclick = async () => {
        const nameTxt = modal.querySelector('.victory-name-input').value.trim();
        const descTxt = modal.querySelector('.victory-desc-input').value.trim();
        const colorTxt = modal.querySelector('#victoryColor').value;
        if (!nameTxt) return;
        
        if (victory) {
          victory.name = nameTxt;
          victory.desc = descTxt;
          victory.color = colorTxt;
          await victory.update();
        } else {
          // Форматирование локального времени вместо UTC
          const now = new Date();
          const localDateTime = now.toISOString().split('.')[0]; // Берем ISO формат но с локальным временем
          // Альтернативный способ (если нужна полная локализация):
          // const year = now.getFullYear();
          // const month = String(now.getMonth() + 1).padStart(2, '0');
          // const day = String(now.getDate()).padStart(2, '0');
          // const hours = String(now.getHours()).padStart(2, '0');
          // const minutes = String(now.getMinutes()).padStart(2, '0');
          // const seconds = String(now.getSeconds()).padStart(2, '0');
          // const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
          
          const data = {
            victoryName: nameTxt,
            victoryDesc: descTxt,
            victoryStart: localDateTime,
            victoryColor: colorTxt,
            categoryId: victoryCategory.id
          };
          await Victory.add(data);
          VictoryCategory.current = victoryCategory;
        }
        this.renderSpheres();
        this.renderVictories();
        closeModalSmoothly(modal);
      };

      modal.querySelector('.btn-secondary').onclick = () => closeModalSmoothly(modal);
      modal.querySelector('.victory-modal-close').onclick = () => closeModalSmoothly(modal);
      modal.onclick = e => {
        if (e.target === modal) closeModalSmoothly(modal);
      };
    }
  }
  window.VictoriesManager = VictoriesManager;
})();