import React, { useState, useEffect, useRef } from 'react';
import YouTubePlayer from 'youtube-player';
import { useInterval } from 'react-use';
import _ from 'lodash';

import Socket from './services/socket';
import { generateIframeSrc } from './utils/youtube';
import './App.scss';

// localStorage.debug = 'youtube-player:*';

function App() {
  const [ws, setWs] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [roomId] = useState('24E735ED2BE8A01C6D7DF3002879F719');

  const [amount, setAmount] = useState(null);
  const [time, setTime] = useState(null);

  const youtubeEl = useRef(null);

  // 初始化 WebSocket 事件監聽
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initWebSocket = () => {
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
  }

  /**
   * 連線成功
   * @param {object} msg
   */
  const onOpen = msg => {
    console.log('onOpen', msg);
    onJoinRoom(roomId);
    // setTimeout(onTestRecive, 2000);
  }

  /**
   * 連線關閉
   * @param {object} msg
   */
  const onClose = msg => {
    console.log('onClose', msg);
  }

  /**
   * 訊息接收
   * @param {object} msg
   */
  const onMessage = msg => {
    try {
      const res = JSON.parse(msg.data);
      console.log('onMessage', res);

      // 來自斗內贊助
      if (_.has(res, 'msg')) {
        const _queue = [...queue, res];
        console.log('queue', _queue);
        setQueue(_queue);
        // async setState, so queue.length will be 1
        if (queue.length === 0 && isPlaying === false) {
          onPlayMusic(res);
        }

        // 接受類型為動作
      } else if (_.has(res, 'action')) {
        onMessageAction(res.action);
      }
    } catch (err) {
      console.error(msg, err);
    }
  }

  /**
   * 訊息接收屬於動作時的事件
   * @param {string} msg
   */
  const onMessageAction = msg => {
    switch (msg) {
      case 'previous':
        console.log('previous');
        break;
      case 'next':
        console.log('next');
        player.stopVideo();
        setTime(0);
        break;
      default:
        break;
    }
  }

  /**
   * 傳送訊息
   * @param {object} msg
   */
  const onSend = (msg = {}) => {
    try {
      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.error(msg, err);
    }
  }

  /**
   * 加入房間
   * @param {string} id 房間代號
   */
  const onJoinRoom = (id = '') => {
    const joinRoom = { action: 'join', room: id };
    console.log('onJoinRoom', joinRoom);
    onSend(joinRoom);
  }

  // const onTestRecive = () => {
  //   const payload = {
  //     amount: 10,
  //     donateid: '11455355',
  //     msg: 'https://www.youtube.com/watch?v=FR91CB5SBWU',
  //     name: 'Robby',
  //   };
  //   onSend(payload);
  // }

  /**
   * 初始化播放器事件監聽
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initPlayer = () => {
    player.on('ready', onReady);
    player.on('stateChange', onStateChange);
  }

  /**
   * 播放器已準備好
   */
  const onReady = () => {
    // console.log('ready', true);
  }

  // YT 播放器狀態改變
  const onStateChange = event => {
    // https://developers.google.com/youtube/iframe_api_reference
    // -1 – unstarted
    // 0 – ended
    // 1 – playing
    // 2 – paused
    // 3 – buffering
    // 5 – video cued

    switch (event.data) {
      case 1: // 開始播放
        setIsPlaying(true);
        break;
      case 5: // 被終止(秒數限制)
      case 0: // 播放結束
        setIsPlaying(false);
        // TEST 連續播放時，間隔五秒。
        if (queue.length > 0) setTimeout(onPlayMusic, 5000);
        break;
      default:
        break;
    }
  }

  /**
   * 播放貯列的下一首音樂
   */
  const onPlayMusic = (args = null) => {
    if (_.isNull(player)) return;

    const { msg, amount } = _.isNull(args) ? queue[0] : args;
    const [url] = generateIframeSrc(msg);

    player.loadVideoByUrl(url);
    player.playVideo();

    setQueue(_.drop(queue));
    setAmount(amount);
    setTime(amount);
  }

  /**
   * 每秒偵測進度，判斷終止歌曲邏輯
   */
  const onPlayerTimer = async () => {

    const state = await player.getPlayerState();
    if (state !== 1) return;

    // const current = await player.getCurrentTime();
    const timeNext = time - 1;

    // 播放完畢 or 超額時間(如果手動跳時間會失效，因此需要&&)
    if (_.toNumber(timeNext) < 1) {
      player.stopVideo();
      setTime(0);
      console.log('onPlayerTimer', 'stopVideo()');
    } else {
      setTime(timeNext);
    }
  }

  useInterval(
    () => onPlayerTimer(),
    isPlaying ? 900 : null
  );

  useEffect(() => {
    if (_.isNull(ws)) { setWs(new Socket().connect()) } else { initWebSocket() };
    if (_.isNull(player)) { setPlayer(YouTubePlayer('youtube')) } else { initPlayer() };

  }, [initWebSocket, initPlayer, player, ws])

  return (
    <div className="App">
      <div className={`youtube-container ${isPlaying ? 'actived' : ''}`}>
        <div className="info">
          <div className="col">
            <label>Donate</label>
            <div id="amount">{amount}</div>
          </div>
          <div className="col">
            <label>Time</label>
            <div id="time">{time}</div>
          </div>
        </div>
        <div ref={youtubeEl} id="youtube"></div>
      </div>
    </div>
  );
}

export default App;
