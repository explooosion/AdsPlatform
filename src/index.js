/* eslint-env browser */
import './assets/scss/style.scss';

import YouTubePlayer from 'youtube-player';
import Socket from './lib/socket';
import { generateIframeSrc } from './utils/youtube';

localStorage.debug = 'youtube-player:*';

const ytId = 'youtube';
const ytContainerId = 'youtube-container';
const player = YouTubePlayer(ytId);
const iframe = document.getElementById(ytContainerId);
const amount = document.getElementById('amount');
// const name = document.getElementById('name');
const time = document.getElementById('time');

let isPlayerReady = false;
let isPlaying = false;

let ws;
let timer;

const queue = [];
const socket = new Socket();

player.on('ready', () => {
  isPlayerReady = true;
  console.log('ready', isPlayerReady);
  onConnect();
});

player.on('stateChange', (event) => {
  console.log('stateChange', event);
  switch (event.data) {
    case 1: // 開始播放
      clearInterval(timer);
      timer = setInterval(onPlayerTimer, 900);
      iframe.classList.add('actived');
      isPlaying = true;
      break;
    case 5:
    case 2: // 播放暫停(秒數限制)
    case 0: // 播放結束
      clearInterval(timer);
      iframe.classList.remove('actived');
      isPlaying = false;

      // 連續播放時，間隔五秒。
      if (queue.length > 0) setTimeout(onPlayMusic, 5000);

    // 打入測試 API
    // setTimeout(sendSocketRequest, 2000);
  }
});

async function onPlayerTimer() {
  // const duration = await player.getDuration();
  const current = await player.getCurrentTime();
  // const remain = Math.round(duration - current);
  time.innerText -= 1;
  if (Number(time.innerText) <= 0) {
    player.stopVideo();
  } else if (current >= Number(amount.innerText)) {
    player.stopVideo();
  }
}

/**
 * 播放貯列的下一首音樂
 */
function onPlayMusic() {
  const res = queue[0];
  const [youtubeUrl] = generateIframeSrc(res.msg);
  player.loadVideoByUrl(youtubeUrl);
  player.playVideo();
  queue.shift();

  amount.innerText = res.amount;
  time.innerText = res.amount;
}

function onConnect() {
  ws = socket.connect();
  ws.onopen = onOpen;
  ws.onmessage = onMessage;
}

function onOpen(e) {
  if (isPlayerReady) {
    console.log('onOpen', e);
    const subscribe = JSON.stringify({ id: '24E735ED2BE8A01C6D7DF3002879F719' });
    ws.send(subscribe);
    // setTimeout(sendSocketRequest, 2000);
  }
}

function onMessage(e) {
  try {
    const res = JSON.parse(e.data);
    console.log('onMessage', res);
    if (res.msg) {
      queue.push(res);
      console.log('queue', queue);
      if (queue.length === 1 && isPlaying === false) {
        onPlayMusic();
      }
    }
  } catch (err) {
    console.error('err', err);
    console.error('err-res', e);
  }
}

/**
 * 打入測試的 API
 */
// function sendSocketRequest() {
//   const payload = {
//     amount: 20,
//     donateid: '11455355',
//     msg: 'https://www.youtube.com/watch?v=FR91CB5SBWU',
//     name: 'Robby',
//   };
//   ws.send(JSON.stringify(payload));
// }
