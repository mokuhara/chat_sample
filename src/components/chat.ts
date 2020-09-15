export class Chat {
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

  render(accountInstance: any) {
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
