export class CookieHandler {
  constructor() {}

  getCookie() {
    const cookiesArr = document.cookie.split(";");
    const cookie = cookiesArr.find((cookie) => {
      const decodeCookie = decodeURIComponent(cookie);
      const coookieKey = decodeCookie.split("=")[0];
      return coookieKey === "motoTest";
    });
    if (!cookie || !cookie.split("=")[1]) return "";
    return JSON.parse(decodeURIComponent(cookie).split("=")[1]);
  }

  setCookie(account) {
    const key = "motoTest";
    const jsonVal = {
      uid: account.uid,
      name: account.name,
      iconUrl: account.iconUrl,
    };
    document.cookie = key + "=" + encodeURIComponent(JSON.stringify(jsonVal));
  }

  resetCoookie() {
    const key = "motoTest";
    document.cookie = key + "=; expires=0";
  }

  isLogin() {
    return !!this.getCookie() ? true : false;
  }
}
