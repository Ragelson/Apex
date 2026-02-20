document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        document.getElementById(targetPage).classList.add('active');
    });
});

