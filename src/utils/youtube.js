
/**
 * 解析 Youtube 網址，並取得 ID。
 * @param {string} url Youtube 網址
 * @returns {string} 回傳代號
 */
function getId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
    ? match[2]
    : null;
}

/**
 * 傳入 Youtube 網址後，解析轉成 iframe 嵌入用網址。
 * @param {string} url Youtube 網址
 * @returns {Array<string>} 回傳網址與代號
 */
export function generateIframeSrc(url) {
  const id = getId(url);
  return [`https://www.youtube-nocookie.com/embed/${id}?controls=0&autoplay=1&fs=0`, id];
}
