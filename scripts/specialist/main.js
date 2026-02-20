document.addEventListener('DOMContentLoaded', () => {
  // Burger menu toggle
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav__links');

  burger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
  });

  // Прокрутка к футеру при клике на кнопку "Скачать мобильную версию"
const downloadBtn = document.querySelector('.hero__cta a');
if (downloadBtn) {
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

  // Simple auto-scroll for testimonials
  const slider = document.querySelector('.testimonials__slider');
  if (slider) {
    let scrollAmount = 0;
    const slideWidth = 320; // width including gap
    setInterval(() => {
      scrollAmount += slideWidth;
      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }
      slider.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }, 5000);
  }
});

// Модальные окна для footer
const modalLinks = document.querySelectorAll('.modal-link');
const footerModals = {};

modalLinks.forEach(link => {
  const modalId = link.dataset.modal;
  
  // Создаем модальное окно для каждой ссылки
  if (!footerModals[modalId]) {
    const modal = document.createElement('div');
    modal.className = 'footer-modal';
    modal.id = `${modalId}-footer-modal`;
    modal.innerHTML = `
      <div class="footer-modal-content">
        <span class="close-footer-modal">&times;</span>
        <h2>${link.textContent}</h2>
        <p>Содержимое модального окна для ${link.textContent}</p>
      </div>
    `;
    document.body.appendChild(modal);
    footerModals[modalId] = modal;
    
    // Закрытие модального окна
    const closeBtn = modal.querySelector('.close-footer-modal');
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Закрытие при клике вне окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Открытие модального окна
  link.addEventListener('click', (e) => {
    e.preventDefault();
    footerModals[modalId].style.display = 'block';
  });
});

// Переход по ссылке реестра
document.querySelector('.registry-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'https://reestr.digital.gov.ru/';
});

// Help Carousel
const helpCarousel = () => {
  const carousel = document.querySelector('.help__grid');
  if (!carousel) return;
  
  const cards = document.querySelectorAll('.help__grid .card');
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-nav';
  
  // Create dots
  const dotCount = Math.ceil(cards.length / 2);
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  }
  
  carousel.parentNode.insertBefore(dotsContainer, carousel.nextSibling);
  
  // Create arrows
  const prevArrow = document.createElement('button');
  prevArrow.className = 'carousel-arrow prev';
  prevArrow.innerHTML = '&lt;';
  carousel.parentNode.appendChild(prevArrow);
  
  const nextArrow = document.createElement('button');
  nextArrow.className = 'carousel-arrow next';
  nextArrow.innerHTML = '&gt;';
  carousel.parentNode.appendChild(nextArrow);
  
  // Navigation
  let currentIndex = 0;
  const dots = document.querySelectorAll('.carousel-dot');
  const cardWidth = cards[0].offsetWidth + 24; // width + gap
  
  const goToSlide = (index) => {
    currentIndex = index;
    carousel.scrollTo({
      left: index * cardWidth * 2,
      behavior: 'smooth'
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };
  
  // Dot click
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
    });
  });
  
  // Arrow click
  prevArrow.addEventListener('click', () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : dotCount - 1;
    goToSlide(newIndex);
  });
  
  nextArrow.addEventListener('click', () => {
    const newIndex = currentIndex < dotCount - 1 ? currentIndex + 1 : 0;
    goToSlide(newIndex);
  });
  
  // Auto scroll
  let autoScroll = setInterval(() => {
    const newIndex = currentIndex < dotCount - 1 ? currentIndex + 1 : 0;
    goToSlide(newIndex);
  }, 5000);
  
  // Pause on hover
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoScroll);
  });
  
  carousel.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => {
      const newIndex = currentIndex < dotCount - 1 ? currentIndex + 1 : 0;
      goToSlide(newIndex);
    }, 5000);
  });
};

document.addEventListener('DOMContentLoaded', helpCarousel);

const plannerCards = () => {
  const plannerContainer = document.querySelector('.planner__cards');
  if (!plannerContainer) return;
  
  const cards = Array.from(plannerContainer.querySelectorAll('.planner-card'));
  if (cards.length < 3) return;
  
  // Инициализация позиций
  const initCards = () => {
    cards.forEach((card, index) => {
      card.classList.remove('center', 'left', 'right', 'next-left', 'next-right', 'hidden');
      
      if (index === 0) {
        card.classList.add('left');
      } else if (index === 1) {
        card.classList.add('center');
      } else if (index === 2) {
        card.classList.add('right');
      } else if (index === cards.length - 1) {
        card.classList.add('next-left');
      } else if (index === 3) {
        card.classList.add('next-right');
      } else {
        card.classList.add('hidden');
      }
    });
  };
  
  initCards();
  
  // Функция для получения индексов соседних карточек
  const getAdjacentIndices = (centerIndex, direction) => {
    const total = cards.length;
    let leftIndex, rightIndex, nextLeftIndex, nextRightIndex;
    
    if (direction === 'left') {
      leftIndex = centerIndex;
      centerIndex = (centerIndex + 1) % total;
      rightIndex = (centerIndex + 1) % total;
      nextLeftIndex = (leftIndex - 1 + total) % total;
      nextRightIndex = (rightIndex + 1) % total;
    } else {
      rightIndex = centerIndex;
      centerIndex = (centerIndex - 1 + total) % total;
      leftIndex = (centerIndex - 1 + total) % total;
      nextRightIndex = (rightIndex + 1) % total;
      nextLeftIndex = (leftIndex - 1 + total) % total;
    }
    
    return {
      leftIndex,
      centerIndex,
      rightIndex,
      nextLeftIndex,
      nextRightIndex
    };
  };
  
  // Вращение карточек
  const rotateCards = (direction) => {
    const currentCenter = plannerContainer.querySelector('.center');
    if (!currentCenter) return;
    
    const centerIndex = cards.indexOf(currentCenter);
    const {
      leftIndex,
      centerIndex: newCenterIndex,
      rightIndex,
      nextLeftIndex,
      nextRightIndex
    } = getAdjacentIndices(centerIndex, direction);
    
    // Сначала скрываем все карточки
    cards.forEach(card => {
      card.classList.remove('left', 'center', 'right', 'next-left', 'next-right');
      card.classList.add('hidden');
    });
    
    // Устанавливаем новые классы
    cards[leftIndex].classList.remove('hidden');
    cards[leftIndex].classList.add('left');
    
    cards[newCenterIndex].classList.remove('hidden');
    cards[newCenterIndex].classList.add('center');
    
    cards[rightIndex].classList.remove('hidden');
    cards[rightIndex].classList.add('right');
    
    if (cards.length > 3) {
      cards[nextLeftIndex].classList.remove('hidden');
      cards[nextLeftIndex].classList.add('next-left');
      
      cards[nextRightIndex].classList.remove('hidden');
      cards[nextRightIndex].classList.add('next-right');
    }
  };
  
  // Обработчики кликов
  plannerContainer.addEventListener('click', (e) => {
    const clickedCard = e.target.closest('.planner-card');
    if (!clickedCard) return;
    
    if (clickedCard.classList.contains('left') || clickedCard.classList.contains('next-left')) {
      rotateCards('right');
    } else if (clickedCard.classList.contains('right') || clickedCard.classList.contains('next-right')) {
      rotateCards('left');
    }
  });
  
  // Автоматическое вращение (опционально)
  let autoRotate = setInterval(() => rotateCards('left'), 5000);
  
  plannerContainer.addEventListener('mouseenter', () => {
    clearInterval(autoRotate);
  });
  
  plannerContainer.addEventListener('mouseleave', () => {
    autoRotate = setInterval(() => rotateCards('left'), 5000);
  });
};

document.addEventListener('DOMContentLoaded', plannerCards);