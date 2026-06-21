// payment.js

// Открытие модального окна оплаты
async function openPaymentModal(preselectPlanId = null) {
    try {
        // Загружаем данные перед открытием модалки + предвыбор плана (если передан)
        await PaymentModal.init(preselectPlanId);

        const modal = document.getElementById('paymentModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
    } catch (error) {
        console.error('Ошибка при открытии модального окна:', error);
        alert('Не удалось загрузить данные о подписках');
    }
}

// Закрытие модального окна оплаты
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
}

// Модальные окна оплаты
class PaymentModal {
    static currentPlan = null;
    static hasUsedTrial = false;
    static selectedPlanId = null;

    // Инициализация модальных окон
    static async init(preselectPlanId = null) {
        try {
            this.hasUsedTrial = PaymentService.subscriptionStatus?.hasUsedTrial || false;
            this.currentPlan = PaymentService.subscriptionStatus?.currentPlan || null;

            // если пришёл id от кнопки "Выбрать" — используем его
            if (preselectPlanId != null) {
                this.selectedPlanId = Number(preselectPlanId);
            } else {
                // иначе, если ничего не выбрано — первый план
                this.selectedPlanId = Number(PaymentService.plans[0].id);
            }

            this.updatePaymentUI();
        } catch (error) {
            console.error('Ошибка при инициализации платежной системы:', error);
            throw error;
        }
    }

    // Обновление UI модального окна
    static updatePaymentUI() {
        const modalContent = document.querySelector('.payment-modal-content');
        if (!modalContent) return;

        // Сохраняем элементы-рамки
        const header = modalContent.querySelector('h2');
        const closeBtn = modalContent.querySelector('.close-payment-modal');
        const footer = modalContent.querySelector('.payment-footer');

        const plansHTML = this.generatePlansContent();

        modalContent.innerHTML = `
            ${closeBtn?.outerHTML || ''}
            ${header?.outerHTML || '<h2>Выбор подписки</h2>'}
            <div class="payment-plans">
                ${plansHTML}
            </div>
            ${footer?.outerHTML || ''}
        `;

        this.addEventListeners();
        this.updatePayButtonLabel();
        this.updateTotalAmount();
    }

    // Генерация контента планов
    static generatePlansContent() {
        let html = '';

        PaymentService.plans.forEach(plan => {
            const isCurrentPlan = this.currentPlan === plan.id;
            const isSelected = this.selectedPlanId === plan.id;

            const classes = ['payment-plan'];
            if (isSelected) classes.push('active');
            if (isCurrentPlan) classes.push('current-plan');

            const priceFormatted = new Intl.NumberFormat('ru-RU').format(plan.price);
            const description = this.getPlanDescription(plan);

            html += `
                <div class="${classes.join(' ')}" data-plan="${plan.id}">
                    <h3>${plan.name}</h3>
                    <p class="price">${priceFormatted}</p>
                    <p>${description}</p>
                    ${isCurrentPlan ? '<span class="badge">Ваш план</span>' : ''}
                </div>
            `;
        });
        return html;
    }

    // Получение длительности плана
    static getPlanDuration(plan) {
        if (plan.name.toLowerCase().includes('месяц') || plan.name.toLowerCase().includes('month')) {
            return '1 месяц';
        } else if (plan.name.toLowerCase().includes('квартал') || plan.name.toLowerCase().includes('quarter')) {
            return '3 месяца';
        } else if (plan.name.toLowerCase().includes('год') || plan.name.toLowerCase().includes('year')) {
            return '1 год';
        }
        return plan.name;
    }

    // Получение описания плана
    static getPlanDescription(plan) {
        if (plan.name.toLowerCase().includes('месяц') || plan.name.toLowerCase().includes('month')) {
            return 'Ежемесячная оплата';
        } else if (plan.name.toLowerCase().includes('квартал') || plan.name.toLowerCase().includes('quarter')) {
            const monthlyPrice = Math.round(plan.price / 3);
            const economy = 225 * 3 - plan.price;
            return `${monthlyPrice} ₽/мес (экономия ${economy} ₽)`;
        } else if (plan.name.toLowerCase().includes('год') || plan.name.toLowerCase().includes('year')) {
            const monthlyPrice = Math.round(plan.price / 12);
            const economy = 225 * 12 - plan.price;
            return `${monthlyPrice} ₽/мес (экономия ${economy} ₽)`;
        }
        return plan.description || '';
    }

    // Добавление обработчиков событий
    static addEventListeners() {
        // Выбор плана
        const plans = document.querySelectorAll('.payment-plan:not(.current-plan)');
        plans.forEach(el => {
            el.addEventListener('click', () => {
                plans.forEach(p => p.classList.remove('active'));
                el.classList.add('active');
                PaymentModal.selectedPlanId = Number(el.dataset.plan);
                PaymentModal.updatePayButtonLabel();
                PaymentModal.updateTotalAmount();
            });
        });

        // Обработка оплаты
        const confirmBtn = document.getElementById('confirmPayment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.processPayment());
        }

        const closeBtn = document.getElementById('close-payment-modal-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closePaymentModal());
        }
    }

    // Обновление общей суммы
    static updateTotalAmount() {
        const selectedPlan = PaymentService.plans.find(p => p.id === this.selectedPlanId);
        const totalElement = document.querySelector('.total-amount');
        
        if (totalElement && selectedPlan) {
            const priceFormatted = new Intl.NumberFormat('ru-RU').format(selectedPlan.price);
            totalElement.textContent = `${priceFormatted} ₽`;
        }
    }

    // Обработка платежа
    static async processPayment() {
        if (!this.selectedPlanId) {
            alert('Пожалуйста, выберите план подписки');
            return;
        }

        if (!User.instance) {
            alert('Пожалуйста, войдите в аккаунт');
            closePaymentModal();
            return;
        }

        try {
            const selectedPlan = PaymentService.plans.find(p => p.id === this.selectedPlanId);
            if (selectedPlan.price === 0) {
                // Активация пробного периода
                await PaymentService.activateTrial();
                window.location.href = "/trial_success.html";
                this.hasUsedTrial = true;
                this.currentPlan = 'trial';
                this.updatePaymentUI();
            } else {
                // Создание платежа для выбранного плана
                const paymentUrl = await PaymentService.createPayment(this.selectedPlanId);

                // Перенаправляем на страницу оплаты
                window.location.href = paymentUrl;
            }
        } catch (error) {
            console.error('Ошибка при обработке платежа:', error);
            alert('Не удалось обработать платеж: ' + error.message);
        }
    }

    static updatePayButtonLabel() {
        const btn = document.getElementById('confirmPayment');
        if (!btn) return;

        const selectedId = this.selectedPlanId;
        const plan = PaymentService.plans.find(p => p.id === selectedId);

        if (plan && Number(plan.price) === 0) {
            btn.textContent = 'Активировать пробный период';
            btn.classList.add('trial-action');
        } else {
            btn.textContent = 'Оплатить';
            btn.classList.remove('trial-action');
        }
    }
}

// Функция рендера карточек подписки
async function renderPricingCards() {
    try {
        const container = document.getElementById('pricingCards');
        if (!container) return;
        
        container.innerHTML = '';

        PaymentService.plans.forEach(plan => {
            const card = document.createElement('div');
            card.classList.add('pricing-card');
            card.dataset.plan = plan.id;
            if (plan.isPopular) card.classList.add('featured');

            const priceFormatted = new Intl.NumberFormat('ru-RU').format(plan.price);

            card.innerHTML = `
                ${plan.isPopular ? '<div class="popular-badge">Популярный</div>' : ''}
                <h3>${plan.name}</h3>
                <div class="price">${priceFormatted} ₽</div>
                <p>${plan.description || ''}</p>
                <ul class="features">
                    ${(plan.features || []).map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="btn btn--primary open-payment-modal" data-plan="${plan.id}">Выбрать</button>
            `;

            container.appendChild(card);
        });

        // Открытие модалки с предвыбором из data-plan
        const buttons = container.querySelectorAll('.open-payment-modal');
        buttons.forEach(btn => btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.plan || e.currentTarget.closest('[data-plan]')?.dataset.plan;
            openPaymentModal(id);
        }));

    } catch (error) {
        console.error('Не удалось загрузить тарифы:', error);
    }
}

// Добавляем CSS стили динамически
function injectPaymentModalStyles() {
    const styleId = 'payment-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #paymentModal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            overflow-y: auto;
            padding: 1rem;
            box-sizing: border-box;
        }

        #paymentModal.show {
            display: flex;
            align-items: flex-start;
            justify-content: center;
        }

        .payment-modal-content {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)), #121826;
            margin: 2% auto;
            padding: 2.5rem;
            border-radius: 16px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.08);
            animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .payment-modal-content h2 {
            text-align: center;
            font-size: 1.8rem;
            font-weight: 700;
            color: #EAF1FB;
            margin: 0 0 2rem 0;
            position: relative;
            padding-bottom: 1rem;
        }

        .payment-modal-content h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, #003577 0%, #006BBD 100%);
            border-radius: 2px;
        }

        .close-payment-modal {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 36px;
            height: 36px;
            background: #1A2236;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.5rem;
            color: #EAF1FB;
            border: 1px solid rgba(255, 255, 255, 0.16);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            z-index: 10;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .close-payment-modal:hover {
            background: #006BBD;
            color: #fff;
            transform: rotate(90deg);
        }

        .payment-plans {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .payment-plan {
            background: #1A2236;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }

        .payment-plan:hover {
            border-color: #2E8FE0;
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }

        .payment-plan.active {
            border-color: #2E8FE0;
            background: linear-gradient(135deg, rgba(0, 107, 189, 0.12) 0%, rgba(0, 53, 119, 0.18) 100%);
            box-shadow: 0 0 0 1px rgba(46, 143, 224, 0.18), 0 8px 24px rgba(0, 67, 140, 0.25);
        }

        .payment-plan.current-plan {
            border-color: #2E8FE0;
            background: linear-gradient(135deg, rgba(0, 107, 189, 0.10) 0%, rgba(46, 143, 224, 0.12) 100%);
            cursor: default;
        }

        .payment-plan h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #EAF1FB;
            margin: 0 0 0.5rem 0;
        }

        .payment-plan .price {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2E8FE0;
            margin: 0 0 0.5rem 0;
            display: inline;
            align-items: baseline;
        }

        .payment-plan .price::before {
            content: '₽';
            font-size: 1rem;
            margin-right: 2px;
            color: #8A99B5;
        }

        .payment-plan p {
            font-size: 0.9rem;
            color: #8A99B5;
            margin: 0;
            line-height: 1.4;
        }

        .payment-plan .badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #003577 0%, #006BBD 100%);
            color: #fff;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .payment-footer {
            background: linear-gradient(135deg, rgba(0, 107, 189, 0.08) 0%, rgba(0, 53, 119, 0.04) 100%);
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            margin-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .payment-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.16);
        }

        .payment-total span {
            font-size: 0.9rem;
            color: #8A99B5;
        }

        .payment-total .total-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2E8FE0;
        }

        #confirmPayment {
            width: 100%;
            padding: 1rem;
            font-size: 1.1rem;
            font-weight: 600;
            background: linear-gradient(135deg, #003577 0%, #006BBD 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(46, 143, 224, 0.18), 0 8px 24px rgba(0, 67, 140, 0.25);
        }

        #confirmPayment:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 0 1px rgba(46, 143, 224, 0.3), 0 12px 32px rgba(0, 67, 140, 0.35);
        }

        #confirmPayment:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        #confirmPayment.trial-action {
            background: linear-gradient(135deg, #006BBD 0%, #2E8FE0 100%);
        }

        #confirmPayment::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.7s ease;
        }

        #confirmPayment:hover::after {
            left: 100%;
        }

        .payment-info {
            font-size: 0.8rem;
            color: #8A99B5;
            margin-top: 1rem;
            line-height: 1.4;
        }

        @media (max-width: 768px) {
            #paymentModal.show {
                align-items: flex-start;
                padding-top: 2rem;
            }
            
            .payment-modal-content {
                margin: 0;
                padding: 1.5rem;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .payment-modal-content h2 {
                font-size: 1.5rem;
            }
            
            .close-payment-modal {
                top: 0.5rem;
                right: 0.5rem;
                width: 32px;
                height: 32px;
                font-size: 1.2rem;
            }
            
            .payment-plan {
                padding: 1.25rem;
            }
        }

        .subscription-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        }

        .subscription-modal {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)), #121826;
            padding: 2rem;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            text-align: center;
            position: relative;
            animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .subscription-modal p {
            font-size: 1rem;
            color: #B5C2D8;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }

        .subscription-modal-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1.5rem;
        }

        .subscription-modal-buttons button {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            border: 2px solid transparent;
            min-width: 120px;
        }

        .subscription-modal-buttons button:first-child {
            background: #1A2236;
            color: #EAF1FB;
            border-color: rgba(255, 255, 255, 0.16);
        }

        .subscription-modal-buttons button:first-child:hover {
            background: #232C42;
            color: #fff;
        }

        .subscription-modal-buttons button:last-child {
            background: linear-gradient(135deg, #003577 0%, #006BBD 100%);
            color: #fff;
            box-shadow: 0 0 0 1px rgba(46, 143, 224, 0.18), 0 8px 24px rgba(0, 67, 140, 0.25);
        }

        .subscription-modal-buttons button:last-child:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 0 1px rgba(46, 143, 224, 0.3), 0 12px 32px rgba(0, 67, 140, 0.35);
        }

        body.modal-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
        }
    `;

    document.head.appendChild(style);
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    injectPaymentModalStyles();
    
    // Добавляем HTML для модального окна, если его нет
    if (!document.getElementById('paymentModal')) {
        const modalHTML = `
            <div id="paymentModal">
                <div class="payment-modal-content">
                    <div id="close-payment-modal-button" class="close-payment-modal">×</div>
                    <h2>Выбор подписки</h2>
                    <div class="payment-plans"></div>
                    <div class="payment-footer">
                        <div class="payment-total">
                            <span>Итого к оплате:</span>
                            <span class="total-amount">0 ₽</span>
                        </div>
                        <button id="confirmPayment" class="btn btn--primary">Оплатить</button>
                        <p class="payment-info">
                            <i class="fas fa-lock"></i> Безопасная оплата • Подписка продлевается автоматически
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
});

// Обработчики событий
document.addEventListener("authChecked", async (e) => {
    // Если на странице есть заранее размеченные кнопки .open-payment-modal — тоже читаем data-plan
    document.querySelectorAll('.open-payment-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.plan || e.currentTarget.closest('[data-plan]')?.dataset.plan;
            openPaymentModal(id);
        });
    });

    const closeIcon = document.querySelector('.close-payment-modal');
    if (closeIcon) closeIcon.addEventListener('click', closePaymentModal);

    const modalEl = document.getElementById('paymentModal');
    if (modalEl) {
        modalEl.addEventListener('click', function(e) {
            if (e.target === this) closePaymentModal();
        });
    }

    if (e.detail.userData) {
        await PaymentService.getSubscriptionStatus();
    }
    
    await PaymentService.getPlans();

    // Прединициализация — сначала грузим данные...
    PaymentModal.init()
        .then(() => {
            renderPricingCards();
            // ...а потом, если URL содержит #pricingCards — открываем модалку
            if (window.location.hash === '#pricingCards' && !['active', 'activeTrial'].includes(PaymentService.status)) {
                const modal = new SubscriptionModal({ status: PaymentService.status });
                modal.setActionCallback((status) => {
                    modal.close();
                    openPaymentModal();
                });
                modal.open();
            }
        })
        .catch(console.error);
});

// subscriptionModal.js
class SubscriptionModal {
    constructor(options = {}) {
        this.status = options.status || 'none';
        this.texts = options.texts || {
            none: 'У вас ещё нет подписки. Попробуйте бесплатный пробный период или оформите подписку, чтобы получить доступ к планеру.',
            trialOnly: 'Ваш пробный период закончился. Чтобы продолжить пользоваться планером, оформите подписку.',
            expired: 'Срок действия вашей подписки истёк. Продлите её, чтобы снова получить доступ к планеру.'
        };
        this.initModal();
    }

    initModal() {
        // Создаём обёртку модалки
        this.overlay = document.createElement('div');
        this.overlay.className = 'subscription-modal-overlay';
        this.overlay.style.cssText = 'display: none;';

        // Создаём саму модалку
        this.modal = document.createElement('div');
        this.modal.className = 'subscription-modal';

        // Текст
        const message = document.createElement('p');
        message.textContent = this.getTextForStatus(this.status);
        message.style.cssText = 'font-size: 16px; color: #B5C2D8; margin-bottom: 25px;';

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.className = 'btn btn--secondary';

        // Кнопка действия (подписка)
        const actionBtn = document.createElement('button');
        actionBtn.textContent = this.getActionText(this.status);
        actionBtn.className = 'btn btn--primary';

        // Контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'subscription-modal-buttons';
        buttonsContainer.appendChild(closeBtn);
        buttonsContainer.appendChild(actionBtn);

        // Вставляем элементы
        this.modal.appendChild(message);
        this.modal.appendChild(buttonsContainer);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Обработчики событий
        closeBtn.onclick = () => this.close();
        actionBtn.onclick = () => {
            this.onAction && this.onAction(this.status);
        };
    }

    getTextForStatus(status) {
        return this.texts[status] || this.texts.none;
    }

    getActionText(status) {
        if (status === 'none') return 'Попробовать бесплатно';
        return 'Оформить подписку';
    }

    setStatus(status) {
        this.status = status;
        this.modal.querySelector('p').textContent = this.getTextForStatus(status);
        this.modal.querySelectorAll('button')[1].textContent = this.getActionText(status);
    }

    setActionCallback(callback) {
        this.onAction = callback;
    }

    open() {
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
    }

    close() {
        this.overlay.style.display = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
}

// Пример использования (оставлено для обратной совместимости)
// const modal = new SubscriptionModal({ status: 'none' });
// modal.setActionCallback((status) => {
//   console.log('Нажата кнопка подписки, статус:', status);
// });
// modal.open();