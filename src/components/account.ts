export class Account {
  constructor(
    private uid: string = "",
    private name: string = "",
    private iconUrl: string = "",
    private isLogin: boolean = false
  ) {}

  setInfo(uid, name, iconUrl, isLogin = false) {
    this.uid = uid;
    this.name = name;
    this.iconUrl = iconUrl;
    this.isLogin = isLogin;
  }

  getInfo() {
    if (!this.uid) return;
    return {
      uid: this.uid,
      name: this.name,
      iconUrl: this.iconUrl,
      isLogin: this.isLogin,
    };
  }

  isLoginA() {
    return this.isLogin ? true : false;
  }
}
