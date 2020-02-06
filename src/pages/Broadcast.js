import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import YouTubePlayer from 'youtube-player';
import { useInterval } from 'react-use';
import _ from 'lodash';

import Socket from '../services/socket';

import { generateIframeSrc } from '../utils/youtube';
import './Broadcast.scss';

const cashOfSeconds = 0.6;
const reConnInterval = 2000;

function Broadcast() {
  // 24E735ED2BE8A01C6D7DF3002879F719
  let { id: roomId } = useParams();

  const [ws, setWs] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWSConn, setIsWSConn] = useState(false);
  const [pointer, setPointer] = useState(-1);
  const [songs, setSongs] = useState([]);

  const [amount, setAmount] = useState(null);
  const [time, setTime] = useState(null);

  const youtubeEl = useRef(null);

  // 初始化 WebSocket 事件監聽
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initWebSocket = () => {
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
    ws.onerror = onError;
  }

  /**
   * WS 連線成功
   * @param {object} msg
   */
  const onOpen = msg => {
    console.log('onOpen', msg);
    onJoinRoom(roomId);
    setIsWSConn(true);
  }

  /**
   * WS 連線關閉
   * @param {object} msg
   */
  const onClose = msg => {
    setIsPlaying(false);
    setIsWSConn(false);
    console.log('onClose', msg);
    setTimeout(onReConnect, reConnInterval);
  }

  const onError = msg => {
    ws.close();
    setIsPlaying(false);
    setIsWSConn(false);
    console.log('onError', msg);
    setTimeout(onReConnect, reConnInterval);
  }

  const onReConnect = () => {
    console.log('onReConnect ...');
    setWs(new Socket().connect());
  }

  /**
   * WS 傳送訊息
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
   * WS 訊息接收
   * @param {object} msg
   */
  const onMessage = msg => {
    try {
      const res = JSON.parse(msg.data);
      console.log('onMessage', res);

      if (_.has(res, 'msg')) {
        // 來自斗內贊助
        setSongs([...songs, res]);
      } else if (_.has(res, 'action')) {
        // 接受類型為動作
        onMessageAction(res.action);
      }
    } catch (err) {
      console.log('onMessage JSON 解析失敗', msg);
    }
  }

  /**
   * WS 訊息接收屬於動作時的事件
   * @param {string} msg
   */
  const onMessageAction = msg => {
    switch (msg) {
      case 'previous':
        onPrevious();
        break;
      case 'next':
        onNext();
        break;
      default:
        break;
    }
  }

  /**
   * WS 訊息接收上一首
   */
  const onPrevious = () => {
    console.log('previous');
    if (!isPlaying && pointer + 1 === songs.length) {
      onPlayMusic(pointer);
    } else if (isPlaying && pointer > 0) {
      onPlayMusic(pointer - 1);
    } else {
      onPlayMusic(0);
    }
  }

  /**
   * WS 訊息接收下一首
   */
  const onNext = () => {
    console.log('next');
    if (pointer + 1 < songs.length) {
      onPlayMusic(pointer + 1);
    } else {
      setTime(0);
      player.stopVideo();
    }
  }

  /**
   * WS 發送一次 DONATE 歌曲
   */
  // eslint-disable-next-line no-unused-vars
  const onTestRecive = () => {
    const payload = {
      amount: 30,
      donateid: '11455355',
      msg: 'https://www.youtube.com/watch?v=FR91CB5SBWU',
      name: `播放音樂，指標為`,
    };
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

  /**
   * 初始化播放器事件監聽
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initPlayer = () => {
    player.on('ready', onReady);
    player.on('stateChange', onStateChange);
    player.on('error', () => setTimeout(onNext, 5000));
  }

  /**
   * YT 播放器已準備好
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
        // setIsPlaying(true);
        break;
      case 5: // 被終止(秒數限制)
      case 0: // 播放結束
        setIsPlaying(false);
        break;
      default:
        break;
    }
  }

  /**
   * YT 播放貯列的下一首音樂
   */
  const onPlayMusic = (_pointer = null) => {
    if (_.isNull(player) || _.isNull(_pointer)) return;

    // 取得下一首的指標
    const res = songs[_pointer];
    console.log('onPlayMusic', res);

    setAmount(res.amount);
    setPointer(_pointer);

    const [url, id] = generateIframeSrc(res.msg);

    // 如果抓不到正確網址，就跳下一首
    if (_.isNull(id)) {
      console.log('onPlayMusic 抓不到影片編號');
    } else {
      setIsPlaying(true);
      const _time = Math.floor(Number(res.amount) * cashOfSeconds);
      setTime(_time);
      onSpeak(res.name);
      player.loadVideoByUrl(url);
      player.playVideo();
    }
  }

  const onSpeak = async (name) => {
    // API https://responsivevoice.org/api/
    // Languages https://responsivevoice.org/text-to-speech-languages/
    await window.responsiveVoice.cancel();
    const isSupport = await window.responsiveVoice.voiceSupport();
    if (isSupport) {
      window.responsiveVoice.speak(name, 'Chinese Taiwan Female');
    }
  }

  /**
   * 每 N 秒偵測進度，判斷終止歌曲邏輯
   */
  const onPlayerTimer = async () => {
    const state = await player.getPlayerState();
    if (state !== 1) return;

    const timeNext = time - 1;
    if (timeNext < 1) {
      setTime(0);
      player.stopVideo();
    } else {
      const _time = Math.floor(timeNext);
      setTime(_time);
    }
  }

  /**
   * 每 N 秒偵測佇列，判斷是否進行下一曲播放
   */
  const onQueueTimer = () => {
    console.log('====== onQueueTimer =========');
    console.log('songs', songs);
    console.log('pointer', pointer, '(songs index)');
    // 下一首指標是否還沒超過歌曲總數，並且歌曲存在。
    if (pointer + 1 < songs.length && songs.length > 0) {
      onPlayMusic(pointer + 1);
    };
    console.log('=============================');
    console.log('');
  }

  const renderDebug = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="debug">
          <button onClick={() => onTestRecive()}>Donate</button>
          <button onClick={() => onPrevious()}>Previous</button>
          <button onClick={() => onNext()}>Next</button>
        </div>
      );
    } else {
      return null;
    }
  }

  useInterval(
    () => onPlayerTimer(),
    isPlaying && isWSConn ? 1000 : null
  );

  // 判斷佇列
  useInterval(
    () => onQueueTimer(),
    !isPlaying && isWSConn ? 2000 : null
  );

  useEffect(() => {
    if (_.isNull(ws)) { setWs(new Socket().connect()) } else { initWebSocket() };
    if (_.isNull(player)) { setPlayer(YouTubePlayer('youtube')) } else { initPlayer() };
  }, [initPlayer, initWebSocket, player, isWSConn, ws])

  return (
    <div className="broadcast">
      {renderDebug()}
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

export default Broadcast;
