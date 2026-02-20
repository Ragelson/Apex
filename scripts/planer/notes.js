(() => {
  
  if (typeof TaskModalManager === 'undefined') {
    console.error('TaskModalManager is not defined. Make sure taskModal.js is loaded before notes.js');
    return;
  }

  const noteSVG = `
      <svg class="note-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
        <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z"/>
      </svg>`;

  // Функция для плавного закрытия модальных окон
  function closeModalSmoothly(modal) {
    if (!modal) return;
    
    modal.classList.add('closing');
    const modalBox = modal.querySelector('.note-modal-box, .modal-content');
    if (modalBox) modalBox.classList.add('closing');
    
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.remove();
      }
    }, 200);
  }

  class NotesManager {
    constructor() {
      this._ready = false;       
      this._unbindView = null;   
      this.root = null;          
    }

    
    async init() {
      if (this._ready) return;
      try {
        if (typeof Note !== 'undefined' && Array.isArray(Note.all) && Note.all.length === 0) {
          await Note.fetchAll();
        }
      } catch (e) {
        console.warn('Notes preload failed:', e);
      }
      this._ready = true;
    }

    
    async show() {
      const spheresIcon = document.querySelector('.toolbar-icon[title="Заметки"]');
        if (spheresIcon && !spheresIcon.classList.contains('active')) {
            document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
            spheresIcon.classList.add('active');
        }
      sphereManager.updateHeaderTitle("Заметки");
      setHash("notes");
      if (!this._ready) await this.init();
      this.renderPage();
      this.bindViewEvents();
    }

    
    destroy() {
      if (this._unbindView) this._unbindView(), (this._unbindView = null);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      this.root = null;
    }

    renderPage() {
      const content = document.querySelector('.content');
      if (!content) return;

      content.innerHTML = `
        <div class="note-page">
          <div class="note-header"></div>
          <div class="note-list"></div>
        </div>`;
      this.root = content.querySelector('.note-page');

      this.renderNotes();
    }

    renderNotes() {
      if (!this.root) return;
      const list   = this.root.querySelector('.note-list');
      const header = this.root.querySelector('.note-header');
      if (!list || !header) return;

      if (!Array.isArray(Note.all) || Note.all.length === 0) {
        list.innerHTML = `
          <div class="note-empty">
            <p>Нет заметок в этом разделе</p>
            <button class="note-add-btn">Добавить заметку</button>
          </div>`;
        header.innerHTML = ''; 
        return;
      }

      list.innerHTML = `<div class="note-grid">
        ${Note.all.map((n) => this.renderCard(n)).join('')}
      </div>`;
      header.innerHTML = `<button class="note-add-btn">Добавить заметку</button>`; 
    }

    renderCard(note) {
      const color = note.color;
      const editIcon = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>`;
      const deleteIcon = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>`;
      const convertIcon = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>`;

      return `
        <div class="note-card" data-idx="${note.id}">
          <div class="note-card-header" style="--sphere-color:${color}">
            <div class="note-icon">${noteSVG}</div>
            <div class="note-date">${new Date(note.createdAt).toLocaleDateString('ru-RU')}</div>
          </div>
          <div class="note-content">${note.text}</div>
          <div class="note-actions">
            <button class="note-convert" title="Преобразовать в задачу" data-idx="${note.id}">${convertIcon}</button>
            <button class="note-edit" title="Редактировать" data-idx="${note.id}">${editIcon}</button>
            <button class="note-delete" title="Удалить" data-idx="${note.id}">${deleteIcon}</button>
          </div>
        </div>`;
    }

    
    bindViewEvents() {
      if (this._unbindView) this._unbindView(); 
      const root = this.root;
      if (!root) return;

      const onClick = (e) => {
        const t = e.target;
        const noteEdit    = t.closest('.note-edit');
        const noteDelete  = t.closest('.note-delete');
        const noteConvert = t.closest('.note-convert');
        const noteAddBtn  = t.closest('.note-add-btn');

        if (noteEdit) {
          e.stopPropagation();
          const noteId = Number(noteEdit.dataset.idx);
          this.openNoteModal(noteId);
          return;
        }
        if (noteDelete) {
          e.stopPropagation();
          const noteId = Number(noteDelete.dataset.idx);
          this.showDeleteConfirmation(noteId);
          return;
        }
        if (noteConvert) {
          e.stopPropagation();
          const noteId = Number(noteConvert.dataset.idx);
          new ConvertMenu(noteConvert, noteId, async (sphereId) => {
            await this.convertToTask(noteId, sphereId);
          });
          return;
        }
        if (noteAddBtn) {
          e.stopPropagation();
          this.openNoteModal();
          return;
        }
      };

      root.addEventListener('click', onClick);
      this._unbindView = () => root.removeEventListener('click', onClick);
    }

    showDeleteConfirmation(noteId) {
      
      document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content confirm-modal">
          <div class="modal-header">
            <h3>Подтверждение удаления</h3>
            <button class="modal-close" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить эту заметку? <br>Это действие нельзя отменить.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger">Удалить</button>
            <button class="btn btn-secondary">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-secondary').onclick = () => closeModalSmoothly(modal);
      modal.querySelector('.btn-danger').onclick = async () => {
        await this.removeNote(noteId);
        closeModalSmoothly(modal);
      };
      
      modal.querySelector('.modal-close').onclick = () => closeModalSmoothly(modal);
      modal.onclick = (e) => { 
        if (e.target === modal) closeModalSmoothly(modal); 
      };
    }

    async convertToTask(noteId, sphereId) {
      const note = Note.getById(noteId);
      if (!note) return;

      const statuses = Status.getBySphereId(sphereId) || [];
      const firstStatus = statuses[0] || {};
      
      const now = new Date();
      const localDateTime = formatLocalDateTimeForInput(now);
      
      const data = {
        taskName: note.text,
        taskStart: localDateTime,
        taskEnd: localDateTime,
        taskDesc: "",
        taskColor: firstStatus.color || "#4CAF50",
        statusId: firstStatus.id,
        goal_id: sphereId
      };

      const newTask = await Task.add(data);
      TaskModalManager.openModal(newTask);

      await this.removeNote(noteId);
    }

    async removeNote(id) {
      const note = Note.getById(id);
      if (note && typeof note.delete === 'function') {
        await note.delete();
      }
      this.renderNotes();
    }

    openNoteModal(noteId = null) {
      
      document.querySelectorAll('.note-modal').forEach(el => el.remove());

      const note = (noteId != null) ? Note.getById(noteId) : null;
      const modal = document.createElement('div');
      modal.className = 'note-modal';
      modal.innerHTML = `
        <div class="note-modal-box">
          <div class="note-modal-header">
            <h3>${noteId === null ? 'Новая заметка' : 'Редактирование заметки'}</h3>
            <button class="note-modal-close" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="note-modal-body">
            <div class="form-group">
              <label class="form-label">Текст заметки</label>
              <textarea class="form-input note-input" placeholder="Введите текст заметки..." rows="4">${noteId === null || !note ? '' : note.text}</textarea>
              <div class="form-hint">Обязательное поле</div>
            </div>
          </div>
          <div class="note-modal-footer">
            <button class="btn btn-primary">Сохранить</button>
            <button class="btn btn-secondary">Отмена</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.btn-primary').onclick = async () => {
        const txt = modal.querySelector('.note-input').value.trim();
        if (!txt) return;

        if (noteId === null) {
          await Note.add({
            text: txt,
            color: "#000000",
            createdAt: new Date().toISOString().slice(0, 16)
          });
        } else if (note && txt !== note.text) {
          note.text = txt;
          await note.update();
        }
        this.renderNotes();
        closeModalSmoothly(modal);
      };

      modal.querySelector('.btn-secondary').onclick = () => closeModalSmoothly(modal);
      modal.querySelector('.note-modal-close').onclick = () => closeModalSmoothly(modal);
      modal.onclick = (e) => { 
        if (e.target === modal) closeModalSmoothly(modal); 
      };
    }
  }
  
  class ConvertMenu {
    constructor(triggerBtn, noteId, onSelect) {
      this.triggerBtn = triggerBtn;
      this.noteId = noteId;
      this.onSelect = onSelect;
      this.menu = null;
      this.spheres = [];
      this.cacheTimeout = null;
      this.cache = null;
      this.init();
    }

    async init() {
      try {
        await this.loadSpheres();
        this.renderMenu();
        this.addListeners();
        setTimeout(() => this.menu.classList.add('show'), 10);
      } catch (e) {
        this.renderError(e);
      }
    }

    async loadSpheres() {
      if (this.cache && Date.now() - this.cache.ts < 30000) {
        this.spheres = this.cache.data;
        return;
      }
      if (this.cacheTimeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.loadSpheres();
      }
      this.cacheTimeout = true;
      try {
        this.spheres = Sphere.all;
        this.cache = { data: this.spheres, ts: Date.now() };
      } catch (e) {
        throw new Error('Ошибка загрузки списка сфер');
      } finally {
        this.cacheTimeout = null;
      }
    }

    renderMenu() {
      this.menu = document.createElement('div');
      this.menu.className = 'note-context-menu convert-menu';
      this.menu.setAttribute('role', 'menu');
      this.menu.setAttribute('aria-label', 'Выберите сферу для задачи');
      this.menu.style.position = 'absolute';
      this.menu.style.zIndex = '2000';
      this.menu.style.minWidth = '260px';
      this.menu.style.opacity = '0';
      this.menu.style.transform = 'translateY(-10px)';
      this.menu.style.transition = 'opacity 250ms, transform 250ms';

      const rect = this.triggerBtn.getBoundingClientRect();
      this.menu.style.top  = `${rect.bottom + window.scrollY + 4}px`;
      this.menu.style.left = `${rect.left + window.scrollX}px`;

      let html = `<div class="convert-menu-header">
        <h4>Преобразовать в задачу</h4>
      </div>
      <div class="convert-menu-body">
        <div class="convert-menu-title">Выберите сферу:</div>
        <ul>`;
      
      this.spheres.forEach(sphere => {
        html += `<li class="convert-menu-item" role="menuitem" tabindex="0" data-id="${sphere.id}">
          <span class="sphere-color-indicator" style="background:${sphere.color}"></span>
          <span class="sphere-name">${sphere.name}</span>
        </li>`;
      });
      
      html += `</ul></div>`;
      this.menu.innerHTML = html;
      document.body.appendChild(this.menu);

      requestAnimationFrame(() => {
        this.menu.style.opacity = '1';
        this.menu.style.transform = 'translateY(0)';
      });
    }

    renderError(e) {
      this.menu = document.createElement('div');
      this.menu.className = 'note-context-menu convert-menu';
      this.menu.style.position = 'absolute';
      this.menu.style.zIndex = '2000';
      this.menu.innerHTML = `<div class="convert-menu-error">${e.message}</div>`;
      document.body.appendChild(this.menu);
    }

    addListeners() {
      this.menu.addEventListener('click', async e => {
        const item = e.target.closest('.convert-menu-item');
        if (item) {
          const sphereId = parseInt(item.dataset.id);
          this.close();
          await this.onSelect(sphereId);
        }
      });
      
      this.menu.addEventListener('keydown', async e => {
        if (e.key === 'Escape') this.close();
        if (e.key === 'Enter') {
          const item = document.activeElement;
          if (item.classList.contains('convert-menu-item')) {
            const sphereId = parseInt(item.dataset.id);
            this.close();
            await this.onSelect(sphereId);
          }
        }
      });
      
      setTimeout(() => {
        document.addEventListener('mousedown', this.handleOutsideClick, true);
      }, 0);
    }

    handleOutsideClick = (e) => {
      if (this.menu && !this.menu.contains(e.target) && e.target !== this.triggerBtn) {
        this.close();
      }
    };

    close() {
      if (this.menu) {
        this.menu.style.opacity = '0';
        this.menu.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (this.menu && this.menu.parentNode) this.menu.parentNode.removeChild(this.menu);
          document.removeEventListener('mousedown', this.handleOutsideClick, true);
        }, 250);
      }
    }
  }
  window.NotesManager = NotesManager;
})();