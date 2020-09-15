import { aiBotConfig } from "../config/config";

export class AIBot {
  constructor(private text: string) {}

  //APIにメッセージ送信
  async _getMessage() {
    try {
      console.log("fetchStart");
      const endpoint_url =
        aiBotConfig.ENDPOINT_URL +
        "?key=" +
        encodeURIComponent(aiBotConfig.API_KEY) +
        "&message=" +
        encodeURIComponent(this.text);
      const response = await fetch(endpoint_url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
      });
      console.log("fetchFinish");
      const data = await response.json();
      if (!data || data.status != "success" || !data.result) return "";
      return data.result;
    } catch (e) {
      console.error(e);
    }
  }

  //返却されたメッセージの整形
  createAIBotReply() {
    const text = this._getMessage();
    if (!text) return;
    return {
      title: "AIBotからの返信",
      text: text,
    };
  }
}
