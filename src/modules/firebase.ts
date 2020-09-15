import { firebaseConfig } from "../config/config";
declare var firebase: any;

export class FirebaseConnector {
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

  signIn(accountIns, cookieIns) {
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
