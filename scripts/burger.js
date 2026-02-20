// Бургер-меню
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileAuthBtn = document.querySelector('.mobile-auth-btn');
    const mobileAuthDropdown = document.querySelector('.mobile-auth-dropdown');
    
    // Открытие/закрытие бургер-меню
    burger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      mobileMenuOverlay.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    
    // Закрытие меню по клику на оверлей
    mobileMenuOverlay.addEventListener('click', function() {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      this.classList.remove('open');
      document.body.classList.remove('menu-open');
      mobileAuthDropdown.classList.remove('open');
    });
    
    
    // Открытие выпадающего меню авторизации в мобильном меню
    mobileAuthBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      mobileAuthDropdown.classList.toggle('open');
    });
    
  
    
    // Обработчики для кнопок входа/регистрации
    const loginButtons = document.querySelectorAll('.login-btn');
    const registerButtons = document.querySelectorAll('.register-btn');
    
    loginButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal('loginModal');
        mobileAuthDropdown.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.remove('open');
        burger.classList.remove('active');
      });
    });
    
    registerButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal('registerModal');
        mobileAuthDropdown.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.remove('open');
        burger.classList.remove('active');
      });
    });
    
    // Закрытие меню при клике на ссылку
    const menuLinks = document.querySelectorAll('.mobile-menu a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileAuthDropdown.classList.remove('open');
      });
    });
  });
  
  // Функция для открытия модальных окон
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
    }
  }
  // Проверяем параметры URL при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const formSubmitted = urlParams.get('formSubmitted');
    const name = urlParams.get('name');
    
    if (formSubmitted === 'true') {
      showSuccessModal(name);
    }
  });

  // Показать модальное окно успешной отправки
  function showSuccessModal(name) {
    const modal = document.getElementById('successModal');
    const message = document.getElementById('successMessage');
    
    message.innerHTML = `
      <p>🔹 Уважаемый(ая) ${name || 'Пользователь'},</p>
      <p>Ваша анкета успешно принята на рассмотрение. <br> Обычно проверка занимает до 3 дней. <br> Мы уведомим вас о результате по e-mail.</p>
      <p>Спасибо, что выбрали наш сервис!</p>
      <p>С уважением,<br>Команда Vincere Psychology.</p>
    `;
    
    modal.style.display = 'flex';
  }

  // Закрыть модальное окно
  function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    // Удаляем параметры из URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }