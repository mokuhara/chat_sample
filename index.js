import firebaseConfig from './config.js'


//------------class
class Chat {
    constructor(name, icon, text, timestamp = this._dateConverter(new Date())) {
        this.name = name
        this.icon = icon
        this.text = text
        this.timestamp = timestamp
    }

    textConverter() {
        //link変換
        //opg変換
    }

    _dateConverter(timestamp) {
        const year = timestamp.getFullYear()
        const month = timestamp.getMonth()
        const day = timestamp.getDate()
        return year + "/" + month + "/" + day
    }

    _TextLinkConverter(text) {
        const regexpUrl = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        const regexpMakeLink = (all, url, h, href) => {
            return '<a href="h' + href + '">' + url + '</a>';
        }
        return text.replace(regexpUrl, regexpMakeLink);
    }

    get() {
        return {
            name: this.name,
            icon: this.icon,
            text: this.text,
            timestamp: this.timestamp,
        }
    }

    render() {
        const chatElement = document.querySelector('#chatTmp').content.cloneNode(true);
        chatElement.querySelector('.icon img').src = this.icon
        chatElement.querySelector('.name p').innerText = this.name
        chatElement.querySelector('.time p').innerText = this.timestamp
        chatElement.querySelector('.text p').innerHTML = this._TextLinkConverter(this.text)
        if (accountIns && accountIns.name && this.name === accountIns.name) {
            chatElement.querySelector('.chatTempContainer').classList.add('myChat')
        }
        return chatElement
    }
}

class FirebaseConnector {
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.provider = new firebase.auth.GoogleAuthProvider();
    }

    store(chat) {
        const {
            name,
            icon,
            text,
            timestamp
        } = chat
        this.database.ref().push({
            name,
            icon,
            text,
            timestamp
        })
    }

    getAll(callback) {
        this.database.ref().on('value', (data) => {
            if (data) {
                const rootList = data.val();
                let list = [];
                if (rootList != null) {
                    Object.keys(rootList).forEach((val) => {
                        rootList[val].id = val;
                        list.push(rootList[val]);
                    })
                }
                callback(list)
            }
        })
    }

    signIn() {
        firebase.auth().signInWithPopup(this.provider).then((result) => {
            const user = result.user;
            // user.email
            // console.log(user.displayName, user.photoURL, user.uid)
            if (!user || !accountIns || !accountIns.setInfo) return
            accountIns.setInfo(user.uid, user.displayName, user.photoURL, true)
            cookieIns.setCookie(accountIns.getInfo())
            document.querySelector('#signIn').classList.add('unactive')
            document.querySelector('#signOut').classList.remove('unactive')
        }).catch(function (error) {
            console.error(`${error.code}: ${error.message}`)
        });

    }

    signout() {
        firebase.auth().signOut().then(() => {
            console.log('Sign-out successful')
            document.querySelector('#signIn').classList.remove('unactive')
            document.querySelector('#signOut').classList.add('unactive')
        }).catch((e) => {
            console.error(e)
        })
    }
}

class Account {
    constructor() {
        this.uid = ''
        this.name = ''
        this.iconUrl = ''
        this.isLogin = false
    }

    setInfo(uid, name, iconUrl, isLogin = false) {
        this.uid = uid
        this.name = name
        this.iconUrl = iconUrl
        this.isLogin = isLogin
    }

    getInfo() {
        if (!this.uid) return
        return {
            uid: this.uid,
            name: this.name,
            iconUrl: this.iconUrl,
            isLogin: this.isLogin
        }
    }

    isLoginA() {
        return this.isLogin ? true : false
    }
}

class CookieHandler {
    constructor() {

    }

    getCookie() {
        const cookiesArr = document.cookie.split(';')
        const cookie = cookiesArr.find(cookie => {
            const decodeCookie = decodeURIComponent(cookie)
            const coookieKey = (decodeCookie.split('='))[0]
            return coookieKey === 'motoTest'
        })
        if (!cookie || !(cookie.split('='))[1]) return ''
        return JSON.parse((decodeURIComponent(cookie).split('='))[1])
    }

    setCookie(account) {
        const key = 'motoTest';
        const jsonVal = {
            uid: account.uid,
            name: account.name,
            iconUrl: account.iconUrl
        };
        document.cookie = key + '=' + encodeURIComponent(JSON.stringify(jsonVal));
    }

    resetCoookie() {
        const key = 'motoTest';
        document.cookie = key + "=; expires=0";
    }

    isLogin() {
        return !!this.getCookie() ? true : false
    }


}

//------------service function
const storeNewItem = () => {
    const chatName = (accountIns.getInfo()).name
    const chatIcon = (accountIns.getInfo()).iconUrl
    const chatText = document.querySelector('#text').value
    const chatIns = new Chat(chatName, chatIcon, chatText)
    firebaseIns.store({
        name: chatName,
        icon: chatIcon,
        text: chatText,
        timestamp: chatIns.timestamp
    })
}

const renderAllItem = () => {
    firebaseIns.getAll((chats => {
        document.querySelector('#channelList ul').innerHTML = ''
        chats.forEach(chat => {
            const chatIns = new Chat(chat.name, chat.icon, chat.text, chat.timestamp)
            const targetElement = document.querySelector('#channelList ul')
            targetElement.appendChild(chatIns.render())
        })
    }))
}

const checkLogin = () => {
    if (cookieIns.isLogin()) {
        const {
            uid,
            name,
            iconUrl
        } = cookieIns.getCookie()
        accountIns.setInfo(uid, name, iconUrl, true)
        document.querySelector('#signIn').classList.add('unactive')
        document.querySelector('#signOut').classList.remove('unactive')
    }
}


//------------実行部分
const firebaseIns = new FirebaseConnector()
const accountIns = new Account()
const cookieIns = new CookieHandler()
renderAllItem()
checkLogin()


//------------eventListener
const chatButton = document.querySelector('#createChat')
chatButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(accountIns.isLoginA())
    if (!accountIns || !accountIns.isLoginA()) return alert('ログインしてください')
    storeNewItem()
    renderAllItem()
    const lastElement = document.querySelector("#channelList ul").lastElementChild
    lastElement.scrollIntoView({
        behavior: "smooth"
    })
})

const signInButton = document.querySelector('#signIn')
signInButton.addEventListener('click', () => {
    firebaseIns.signIn(accountIns)
})

const signOutButton = document.querySelector('#signOut')
signOutButton.addEventListener('click', () => {
    firebaseIns.signout()
    cookieIns.resetCoookie()
})

// cookie.resetCoookie()