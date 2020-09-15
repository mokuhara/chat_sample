import { firebaseConfig } from "./config";
import { AIBot } from "./aiBot";

declare var firebase: any;

//------------class
class Chat {
  constructor(
    private name: string,
    private icon: string,
    private text: string,
    private timestamp: Date = new Date()
  ) {}

  textConverter() {
    //link変換
    //opg変換
  }

  _dateConverter(timestamp: Date) {
    const year = timestamp.getFullYear();
    const month = timestamp.getMonth();
    const day = timestamp.getDate();
    return year + "/" + month + "/" + day;
  }

  _TextLinkConverter(text: string) {
    const regexpUrl = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
    const regexpMakeLink = (
      all: string,
      url: string,
      h: string,
      href: string
    ) => {
      return '<a href="h' + href + '">' + url + "</a>";
    };
    return text.replace(regexpUrl, regexpMakeLink);
  }

  get() {
    return {
      name: this.name,
      icon: this.icon,
      text: this.text,
      timestamp: this._dateConverter(new Date(this.timestamp)),
    };
  }

  render(accountInstance: Account) {
    const chatElement = document
      .querySelector<any>("#chatTmp")
      .content.cloneNode(true);
    const chatNameElement = chatElement.querySelector(
      ".name p"
    ) as HTMLParagraphElement;
    const chatIconElement = chatElement.querySelector(
      ".icon img"
    )! as HTMLImageElement;
    const chatTimeElement = chatElement.querySelector(
      ".time p"
    ) as HTMLParagraphElement;
    const chatTextElement = chatElement.querySelector(
      ".text p"
    ) as HTMLParagraphElement;

    chatNameElement.innerText = this.name;
    chatIconElement.src = this.icon;
    chatTimeElement.innerText = String(this.timestamp);
    chatTextElement.innerHTML = this._TextLinkConverter(this.text);
    if (
      accountInstance &&
      accountInstance.getInfo().name &&
      this.name === accountInstance.getInfo().name
    ) {
      chatElement.querySelector(".chatTempContainer").classList.add("myChat");
    }
    return chatElement;
  }
}

class FirebaseConnector {
  database: any;
  provider: any;
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.database = firebase.database();
    this.provider = new firebase.auth.GoogleAuthProvider();
  }

  store(chat) {
    const { name, icon, text, timestamp } = chat;
    this.database.ref().push({
      name,
      icon,
      text,
      timestamp,
    });
  }

  getAll(callback) {
    this.database.ref().on("value", (data) => {
      if (data) {
        const rootList = data.val();
        let list = [];
        if (rootList != null) {
          Object.keys(rootList).forEach((val) => {
            rootList[val].id = val;
            list.push(rootList[val]);
          });
        }
        callback(list);
      }
    });
  }

  signIn(accountIns) {
    firebase
      .auth()
      .signInWithPopup(this.provider)
      .then((result) => {
        const user = result.user;
        // user.email
        // console.log(user.displayName, user.photoURL, user.uid)
        if (!user || !accountIns || !accountIns.setInfo) return;
        accountIns.setInfo(user.uid, user.displayName, user.photoURL, true);
        cookieIns.setCookie(accountIns.getInfo());
        document.querySelector("#signIn").classList.add("unactive");
        document.querySelector("#signOut").classList.remove("unactive");
      })
      .catch(function (error) {
        console.error(`${error.code}: ${error.message}`);
      });
  }

  signout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("Sign-out successful");
        document.querySelector("#signIn").classList.remove("unactive");
        document.querySelector("#signOut").classList.add("unactive");
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

class Account {
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

class CookieHandler {
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

//------------service function
const storeNewItem = () => {
  const chatName = accountIns.getInfo().name;
  const chatIcon = accountIns.getInfo().iconUrl;
  const chatText = document.querySelector<HTMLInputElement>("#text").value;
  const chatIns = new Chat(chatName, chatIcon, chatText);
  firebaseIns.store({
    name: chatName,
    icon: chatIcon,
    text: chatText,
    timestamp: chatIns.get().timestamp,
  });
};

const storeChatReplay = () => {
  const aibot = new AIBot(
    document.querySelector<HTMLInputElement>("#text").value
  );
  const message = aibot.createAIBotReply()!;
  const chatName = "aibot";
  const chatIcon =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSpTMMnbfGdDFSGv8Q1eT7wmHeFBIyUitJ7eA&usqp=CAU";
  message.text.then((text: string) => {
    if (!text) return;
    const chatText = text.replace('"', "");
    const chatIns = new Chat(chatName, chatIcon, chatText);
    firebaseIns.store({
      name: chatName,
      icon: chatIcon,
      text: chatText,
      timestamp: chatIns.get().timestamp,
    });
  });
};

const renderAllItem = () => {
  firebaseIns.getAll((chats) => {
    document.querySelector("#channelList ul").innerHTML = "";
    chats.forEach((chat) => {
      const chatIns = new Chat(chat.name, chat.icon, chat.text, chat.timestamp);
      const targetElement = document.querySelector("#channelList ul");
      targetElement.appendChild(chatIns.render(accountIns));
    });
    const lastElement = document.querySelector("#channelList ul");
    lastElement.lastElementChild.scrollIntoView({
      behavior: "smooth",
    });
  });
};

const checkLogin = () => {
  if (cookieIns.isLogin()) {
    const { uid, name, iconUrl } = cookieIns.getCookie();
    accountIns.setInfo(uid, name, iconUrl, true);
    document.querySelector("#signIn").classList.add("unactive");
    document.querySelector("#signOut").classList.remove("unactive");
  }
};

//------------実行部分
const firebaseIns = new FirebaseConnector();
const accountIns = new Account();
const cookieIns = new CookieHandler();
renderAllItem();
checkLogin();

//------------eventListener
const chatButton = document.querySelector("#createChat");
chatButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (!accountIns || !accountIns.isLoginA())
    return alert("ログインしてください");
  storeNewItem();
  storeChatReplay();
  renderAllItem();
});

const signInButton = document.querySelector("#signIn");
signInButton.addEventListener("click", () => {
  firebaseIns.signIn(accountIns);
});

const signOutButton = document.querySelector("#signOut");
signOutButton.addEventListener("click", () => {
  firebaseIns.signout();
  cookieIns.resetCoookie();
});

// cookie.resetCoookie()
