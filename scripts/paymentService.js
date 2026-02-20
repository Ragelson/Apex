class PaymentService {
    static subscriptionStatus = null;
    static plans = {};
    static status = null;

    // создать платёж и вернуть ссылку (string)
    static async createPayment(planId) {
        const res = await apiPost('/v1/payment/create', { planId });
        return res.paymentUrl; // просто строка
    }

    // активировать пробный период
    static async activateTrial() {
        return apiPost('/v1/subscription/activate-trial', {});
    }

    // получить и сохранить статус подписки
    static async getSubscriptionStatus() {
        const newStatus = await apiGet('/v1/subscription/status');
        this.subscriptionStatus = newStatus;
        const active = PaymentService.subscriptionStatus.active;
        const endsAt = PaymentService.subscriptionStatus.endsAt;
        const trial = PaymentService.subscriptionStatus.trial;

        if (active && trial) {
            // Активная пробная
            this.status = 'activeTrial';
        } else if (active && !trial) {
            // Активная платная
            this.status = 'active';
        } else if (!trial && !endsAt) {
            // Никогда не пробовал
            this.status = 'none';
        } else if (trial && !endsAt) {
            // Пробная была, платной не было
            this.status = 'trialOnly';
        } else if (trial && endsAt) {
            // Пробная и платная были, всё закончилось
            this.status = 'expired';
        } else {
            this.status = 'none';
        }
        return newStatus;
    }

    // получить и сохранить список планов как словарь { id: план }
    static async getPlans() {
        const plansArray = await apiGet('/v1/subscription/plans');
        plansArray.sort((a, b) => a.price - b.price);
        this.plans = plansArray;
        try {
            if (['active', 'activeTrial', 'trialOnly', 'expired'].includes(PaymentService.status)) {
                this.plans = this.plans.slice(1);
            }
        }
        catch { }
        return plansArray;
    }
}
