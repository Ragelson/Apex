
    // Обработчик клика по логотипу
    document.getElementById('home-link').addEventListener('click', function(e) {
        e.preventDefault(); // Отменяем стандартное поведение ссылки
        
        // Создаем или показываем домашний контент
        const contentDiv = document.querySelector('.content');
        contentDiv.innerHTML = `
            <div class="home-content" id="home-content">
                <img class="main-logo main-logo-light" src="assets/planer/Vinc-main-light.png" alt="Vinc Logo">
                <p class="main-slogan">планер твоих побед</p>
            </div>
        `;
        
        // Обновляем заголовок страницы
        document.querySelector('.header-title').textContent = 'Главная';
        document.querySelector('.breadcrumb-item').textContent = '';
        
        // Убираем активный класс со всех иконок тулбара
        document.querySelectorAll('.toolbar-icon').forEach(el => el.classList.remove('active'));
    });
