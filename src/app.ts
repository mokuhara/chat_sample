import { AIBot } from "./modules/aiBot";
import { Chat } from "./components/chat";
import { FirebaseConnector } from "./modules/firebase";
import { Account } from "./components/account";
import { CookieHandler } from "./modules/cookieHandler";

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
  document.querySelector<HTMLInputElement>("#text").value = "";
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
  firebaseIns.signIn(accountIns, cookieIns);
});

const signOutButton = document.querySelector("#signOut");
signOutButton.addEventListener("click", () => {
  firebaseIns.signout();
  cookieIns.resetCoookie();
});

// cookie.resetCoookie()
