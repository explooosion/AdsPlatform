export default class Socket {
  constructor() {
    this.PROTOCAL = process.env.REACT_APP_SOCKET_PROTOCAL;
    this.HOST = process.env.REACT_APP_SOCKET_HOST;
    this.PORT = process.env.REACT_APP_SOCKET_PORT;
    this.PATH = process.env.REACT_APP_SOCKET_PATH;
    this.URL = `${this.PROTOCAL}://${this.HOST}${Number(this.PORT) !== 80 ? ':' + this.PORT : ''}${this.PATH}`;
  }

  connect() {
    this.ws = new WebSocket(this.URL);
    console.log(this.URL);
    return this.ws;
    // this.ws.onopen = this.onOpen.bind(this);
    // this.ws.onclose = this.onClose.bind(this);
    // this.ws.onmessage = this.onMessage.bind(this);
    // this.ws.onerror = this.onError.bind(this);
  }
}
