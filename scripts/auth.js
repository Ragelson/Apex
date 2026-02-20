// Добавил смену кнопки на иконку профиля
async function updateAuthUI() {
    const authContainer = document.querySelector('.header-actions .auth-dropdown');
    if (!authContainer) return;

    let userData = null;
    try {
        userData = await User.fetchUserData();
    }
    catch (error) { }
    document.dispatchEvent(new CustomEvent("authChecked", {
        detail: {userData}
    }));
    if (!userData) { return }
    const firstLetter = userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'П';

    authContainer.innerHTML = `
            <button class="auth-btn" type="button" aria-haspopup="true" aria-expanded="false">
                <div class="profile-avatar">${firstLetter}</div>
            </button>
            <div class="auth-dropdown-content">
                <div class="auth-dropdown-header">
                    <div class="dropdown-avatar">${firstLetter}</div>
                    <div class="dropdown-user-info">
                        <div class="dropdown-username">${userData.fullName || 'Пользователь'}</div>
                        <div class="dropdown-email">${userData.email}</div>
                    </div>
                </div>
                <a href="#" class="auth-dropdown-item profile-settings-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Настройки профиля</span>
                </a>
                <a href="#" class="auth-dropdown-item logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Выйти</span>
                </a>
            </div>
        `;

    document.querySelector('.logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await apiPost('/v1/auth/logout', {});
            User.instance = null;
            location.replace(location.origin + location.pathname + location.search);
        } catch (error) {
            alert('Ошибка при выходе: ' + error.message);
        }
    });

    document.querySelector('.profile-settings-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/#profile';
    });

    initAuthDropdown();
}

function initAuthDropdown() {
    const dropdown = document.querySelector('.auth-dropdown');
    const btn = dropdown?.querySelector('.auth-btn');
    const content = dropdown?.querySelector('.auth-dropdown-content');

    if (!btn || !content) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        content.classList.toggle('show');
        const expanded = content.classList.contains('show');
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            content.classList.remove('show');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            content.classList.remove('show');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Модифицируем функции handleLogin и handleRegister для обновления UI после успешной авторизации
async function handleLogin(email, password) {
    if (!email || !password) {
        alert('Введите email и пароль');
        return;
    }

    try {
        await apiPost('/v1/auth/login', { email, password }, false);
        await updateAuthUI();
        alert('Вход выполнен успешно!');
        closeModalById('loginModal');
        if (window.redirectTo) {
            window.location.href = window.redirectTo;
            window.redirectTo = null;
        }
    } catch (error) {
        alert('Ошибка при входе: ' + error.message);
    }
}

async function handleRegister(userData) {
    const { email, password, confirmPassword, fullName, agreedToTerms, agreedToPolicy } = userData;

    if (!agreedToTerms || !agreedToPolicy) {
        alert('Подтвердите согласие с документами');
        return;
    }

    if (!email || !password || !confirmPassword || !fullName) {
        alert('Заполните все поля');
        return;
    }

    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    if (password.length < 6) {
        alert("Пароль должен быть не менее 6 символов");
        return;
    }

    try {
        await apiPost('/v1/auth/register', { fullName, email, password, agreedToTerms, agreedToPolicy }, false);
        await apiPost('/v1/auth/login', { email, password }, false);
        await updateAuthUI();
        alert('Регистрация прошла успешно!');
        closeModalById('registerModal');
        if (window.redirectTo) {
            window.location.href = window.redirectTo;
            window.redirectTo = null;
        }
    } catch (error) {
        alert('Ошибка при регистрации: ' + error.message);
    }
}

// Для работы с модальными окнами
function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

async function checkAuth() {
    try {
        const result = await apiGet('/v1/user/check-auth');
        return result;
    } catch (error) {
        return null; // В случае ошибки возвращаем null
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    await updateAuthUI();
})