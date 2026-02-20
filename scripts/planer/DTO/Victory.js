class Victory {
  constructor({ id, victoryName, victoryDesc, victoryStart, victoryColor, category, owner }) {
    this.id = id;
    this.name = victoryName;
    this.desc = victoryDesc;
    this.start = victoryStart;
    this.color = victoryColor;
    this.categoryId = category.id;
  }

  static all = [];

  static _time(v) {
    const d = v?.start instanceof Date ? v.start : new Date(v?.start);
    const t = d?.getTime();
    return Number.isFinite(t) ? t : -Infinity; // невалидные даты — в самый низ
  }

  static _sortAll() {
    Victory.all.sort((a, b) => Victory._time(b) - Victory._time(a));
  }

  static getById(id) {
    return Victory.all.find(v => v.id === id);
  }

  static getByCategoryId(categoryId) {
    return Victory.all.filter(v => v.categoryId === categoryId);
  }

  static async fetchAll() {
    try {
      const victories = await apiGet(`/v1/victory`);
      Victory.all = victories.map(victory => new Victory(victory));
      Victory._sortAll();
    } catch (e) {
      console.error('Ошибка при загрузке побед:', e);
    }
  }

  static async fetchAllByCategoryId(categoryId) {
    try {
      const victories = await apiGet(`/v1/victory/by-category/${categoryId}`);
      const newVictories = victories.map(victory => new Victory(victory));
      Victory.all = Victory.all.filter(v => v.categoryId !== categoryId);
      Victory.all.push(...newVictories);
      Victory._sortAll();
    } catch (e) {
      console.error(`Ошибка при загрузке побед по categoryId=${categoryId}:`, e);
    }
  }

  static async add(data) {
    const result = await apiPost('/v1/victory', data);
    const victory = new Victory(result);
    Victory.all.push(victory);
    Victory._sortAll();
    return victory;
  }

  async delete() {
    await apiDelete(`/v1/victory/${this.id}`);
    Victory.all = Victory.all.filter(v => v.id !== this.id);
    Victory._sortAll();
  }

  async update() {
    const data = {
      victoryName: this.name,
      victoryDesc: this.desc,
      victoryStart: this.start,
      victoryColor: this.color,
      categoryId: this.categoryId
    };
    await apiPut(`/v1/victory/${this.id}`, data);
    Victory._sortAll();
    return this;
  }
}
