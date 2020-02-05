import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';

import AppContext from '../appContext';

function Manage() {
  // 24E735ED2BE8A01C6D7DF3002879F719
  let { id: roomId } = useParams();

  // const [ws, setWs] = useState(null);
  const { ws } = useContext(AppContext);
  const [isWSConn, setIsWSConn] = useState(false);

  // 初始化 WebSocket 事件監聽
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initWebSocket = () => {
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
  }

  /**
   * WS 連線成功
   * @param {object} msg
   */
  const onOpen = msg => {
    console.log('onOpen', msg);
    setIsWSConn(true);
    onJoinRoom(roomId);
  }

  /**
   * WS 連線關閉
   * @param {object} msg
   */
  const onClose = msg => {
    console.log('onClose', msg);
  }

  /**
   * WS 傳送訊息
   * @param {object} msg
   */
  const onSend = (msg = {}) => {
    try {
      console.log('onSend', JSON.stringify(msg));
      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.error(msg, err);
    }
  }

  /**
   * WS 訊息接收
   * @param {object} msg
   */
  const onMessage = msg => {
    try {
      const res = JSON.parse(msg.data);
      console.log('onMessage', res);
    } catch (err) {
      console.error(msg, err);
    }
  }

  /**
   * WS 發送 DONATE 歌曲
   */
  const onSendOpay = () => {
    const payload = {
      amount: 10,
      donateid: '11455355',
      msg: 'https://www.youtube.com/watch?v=FR91CB5SBWU',
      name: 'Robby',
    };
    onSend(payload);
  }

  /**
   * WS 發送上一首
   */
  const onSendPrevious = () => {
    if (!isWSConn) return;
    const payload = { action: 'msg', msg: JSON.stringify({ action: 'previous' }) };
    onSend(payload);
  }

  /**
   * WS 發送下一首
   */
  const onSendNext = () => {
    if (!isWSConn) return;
    const payload = { action: 'msg', msg: JSON.stringify({ action: 'next' }) };
    onSend(payload);
  }

  /**
   * WS 加入房間
   * @param {string} id 房間代號
   */
  const onJoinRoom = (id = '') => {
    if (_.isEmpty(id)) return;
    const joinRoom = { action: 'join', room: id };
    console.log('onJoinRoom', joinRoom);
    onSend(joinRoom);
  }

  useEffect(() => {
    if (!_.isNull(ws)) initWebSocket();
  }, [initWebSocket, ws])

  return (
    <div className="broadcast">
      <div className="debug">
        <h4>發送 WebSocket</h4>
        {/** <button onClick={() => onSendOpay()}>Donate</button> */}
        <button onClick={() => onSendPrevious()} >Previous</button>
        <button onClick={() => onSendNext()} >Next</button>
      </div>
    </div>
  );
}

export default Manage;
