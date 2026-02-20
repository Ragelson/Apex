class User {
  static instance;

  constructor({id, email, phoneNumber, fullName, birthDate, status, timeZone, location, avatarUrl}) {
    if (User.instance) {
      return User.instance;
    }
    User.instance = this;
    this.id = id;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.fullName = fullName;
    this.birthDate = birthDate;
    this.status = status;
    this.timeZone = timeZone;
    this.location = location;
    this.avatarUrl = avatarUrl;
  }

  static async fetchUserData(){
    const userData = await apiGet('/v1/user/me');
    new User(userData);
    return User.instance;
  }

  static async update(){
    const data = {
        fullName: User.instance.fullName,
        phoneNumber: User.instance.phoneNumber,
        birthDate: User.instance.birthDate,
        status: User.instance.status,
        timeZone: User.instance.timeZone,
        location: User.instance.location
    }
    await apiPut('/v1/user/me', data);
    return User.instance;
  }

  //TODO
  static async updateAvatar(file){
    const data = {
        file: file
    }
    await apiPost('/v1/user/avatar', data)
  }
}