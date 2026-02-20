document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const authDropdown = document.querySelector('.auth-dropdown-content');
    const authBtn = document.querySelector('.auth-btn');
    
    // Кнопки открытия
    const loginBtns = document.querySelectorAll('.login-btn');
    const registerBtns = document.querySelectorAll('.register-btn');
    
    // Кнопки переключения
    const switchToRegister = document.querySelector('.switch-to-register');
    const switchToLogin = document.querySelector('.switch-to-login');
    
    // Кнопки закрытия
    const closeButtons = document.querySelectorAll('.close-modal');
    
    const agreementModals = {
        agreement: document.getElementById('agreement-footer-modal'),
        privacy: document.getElementById('privacy-footer-modal')
    };
    // Открытие dropdown
    authBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        authDropdown.classList.toggle('show');
    });
    
    // Закрытие dropdown при клике вне
    document.addEventListener('click', function() {
        authDropdown.classList.remove('show');
    });

    // Добавляем обработчики для открытия модальных окон с соглашениями
document.querySelectorAll('.open-agreement-modal').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const modalType = this.dataset.modal;
        if (agreementModals[modalType]) {
            agreementModals[modalType].style.display = 'block';
            document.body.classList.add('modal-open');
        }
    });
});
    
    // Обработчики для кнопок входа
    loginBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
            authDropdown.classList.remove('show');
        });
    });
    
    // Обработчики для кнопок регистрации
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
            openModal(registerModal);
            authDropdown.classList.remove('show');
        });
    });
    
    // Переключение между формами
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }
    
    // Закрытие модальных окон
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Функции
    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            closeModal(modal);
        });
    }
    
    // Обработка форм (остается как у вас было)
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Ваша логика входа
            closeModal(loginModal);
        });
    }
    
// Обработка формы регистрации
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Проверяем, что оба чекбокса отмечены
        const agreeLicense = document.getElementById('agreeLicense').checked;
        const agreePrivacy = document.getElementById('agreePrivacy').checked;
        
        if (!agreeLicense || !agreePrivacy) {
            alert('Пожалуйста, подтвердите согласие с Лицензионным соглашением и Политикой конфиденциальности');
            return;
        }
        
        // Остальная логика обработки формы остается без изменений
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const fullName = document.getElementById('registerFullName').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        
        const userData = {
            email,
            password,
            fullName,
            agreeLicense,
            agreePrivacy
        };
        
        console.log('Регистрационные данные:', userData);
        closeModal(registerModal);
        alert('Регистрация прошла успешно!');
    });
}
    
});