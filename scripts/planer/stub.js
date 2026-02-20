// Обратный отсчет до 25 мая 2025 года
function updateCountdown() {
  const targetDate = new Date('May 25, 2025 00:00:00').getTime();
  const now = new Date().getTime();
  const distance = targetDate - now;
  
  if (distance < 0) {
    document.getElementById('days').innerText = '00';
    document.getElementById('hours').innerText = '00';
    document.getElementById('minutes').innerText = '00';
    document.getElementById('seconds').innerText = '00';
    return;
  }
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  document.getElementById('days').innerText = days.toString().padStart(2, '0');
  document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
  document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Обновляем счетчик каждую секунду
updateCountdown();
setInterval(updateCountdown, 1000);

// Обработка формы подписки
document.querySelector('.submit-btn').addEventListener('click', function() {
  const email = document.querySelector('.email-input').value;
  if (email && email.includes('@')) {
      alert('Спасибо! Мы уведомим вас о запуске раздела.');
      document.querySelector('.email-input').value = '';
  } else {
      alert('Пожалуйста, введите корректный email адрес.');
  }
});