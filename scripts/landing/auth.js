document.addEventListener('DOMContentLoaded', async function () {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const authDropdown = document.querySelector('.auth-dropdown-content');
    const authBtn = document.querySelector('.auth-btn');

    const loginBtns = document.querySelectorAll('.login-btn');
    const registerBtns = document.querySelectorAll('.register-btn');
    const goToPlannerBtns = document.querySelectorAll('.go-to-planer-btn');
    const switchToRegister = document.querySelector('.switch-to-register');
    const switchToLogin = document.querySelector('.switch-to-login');
    const closeButtons = document.querySelectorAll('.close-modal');

    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const switchToForgotLinks = document.querySelectorAll('.switch-to-forgot');
    const switchToLoginFromForgot = document.querySelector('.switch-to-login');

    window.redirectTo = null;

    const agreementModals = {
        agreement: document.getElementById('agreement-footer-modal'),
        privacy: document.getElementById('privacy-footer-modal')
    };


    authBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        authDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function () {
        authDropdown.classList.remove('show');
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    document.querySelectorAll('.open-agreement-modal').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const modalType = this.dataset.modal;
            if (agreementModals[modalType]) {
                agreementModals[modalType].style.display = 'block';
                document.body.classList.add('modal-open');
            }
        });
    });

    loginBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
            authDropdown.classList.remove('show');
            redirectTo = "/index.html"
        });
    });

    switchToForgotLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            forgotPasswordModal.style.display = 'flex';
        });
    });

    // Обработчик для возврата ко входу из восстановления пароля
    switchToLoginFromForgot.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    // Обработчик отправки формы восстановления пароля
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value;
        
        try {
            // Вызов API для восстановления пароля
            const response = await apiService.forgotPassword(email);
            
            if (response.success) {
                showSuccessModal('Инструкции по восстановлению пароля отправлены на вашу почту');
                forgotPasswordModal.style.display = 'none';
            } else {
                alert('Ошибка: ' + response.message);
            }
        } catch (error) {
            console.error('Ошибка восстановления пароля:', error);
            alert('Произошла ошибка при восстановлении пароля. Попробуйте позже.');
        }
    });

    registerBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            closeAllModals();
            openModal(registerModal);
            authDropdown.classList.remove('show');
            redirectTo = "/index.html"
        });
    });

    goToPlannerBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            if(User.instance){
                window.location.href = "/index.html";
            }
            else{
                openModal(registerModal);
                redirectTo = "/index.html"
            }
        });
    });

    switchToRegister?.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
    });

    switchToLogin?.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal);
            redirectTo = null;
        });
    });

    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
            redirectTo = null;
        }
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            handleLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userData = {
                fullName: document.getElementById('registerName').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                password: document.getElementById('registerPassword').value.trim(),
                confirmPassword: document.getElementById('registerConfirmPassword').value.trim(),
                agreedToTerms: document.getElementById('agreeLicense').checked,
                agreedToPolicy: document.getElementById('agreePrivacy').checked
            };

            handleRegister(userData);
        });
    }

    function openModal(modal) {
        modal.style.display = 'flex'; // Явно устанавливаем display
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    function closeModal(modal) {
        modal.style.display = 'none'; // Явно скрываем
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    function showSuccessModal(message = 'Операция выполнена успешно') {
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        successModal.style.display = 'flex';
}

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            closeModal(modal);
        });
    }
});
