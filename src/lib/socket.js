export default class Socket {
  constructor() {
    this.PROTOCAL = process.env.POI_APP_SOCKET_PROTOCAL;
    this.HOST = process.env.POI_APP_SOCKET_HOST;
    this.PORT = process.env.POI_APP_SOCKET_PORT;
    this.PATH = process.env.POI_APP_SOCKET_PATH;
    this.URL = `${this.PROTOCAL}://${this.HOST}${this.PORT ? ':' + this.PORT : ''}${this.PATH}`;
  }

  connect() {
    return new WebSocket(this.URL);
    // this.ws.onopen = this.onOpen.bind(this);
    // this.ws.onclose = this.onClose.bind(this);
    // this.ws.onmessage = this.onMessage.bind(this);
    // this.ws.onerror = this.onError.bind(this);
  }
}
