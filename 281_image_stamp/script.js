// 変数定義
let canvas, context, stampCanvas, stampContext; // キャンバス（画像用、スタンプ用）
const image = new Image();                      // 画像
let sx, sy, sw, sh, cx, cy, cr;                 // 描画位置、サイズ、クリップの中心、半径
let x1, y1, mouseDown = false;                  // 始点、マウスボタンが押されたか
const [width, height] = [400, 400];             // キャンバスサイズ

// ページ読み込み時
const init = () => {
  // キャンバスの取得
  canvas = document.getElementById("image");
  context = canvas.getContext("2d");
  stampCanvas = document.getElementById("stamp");
  stampContext = stampCanvas.getContext("2d");
  [canvas.width, canvas.height] = [width, height];
  [stampCanvas.width, stampCanvas.height] = [width, height];
  [context.fillStyle, stampContext.fillStyle] = ["#FFFFFF", "#FFFFFF"];
  [context.strokeStyle, stampContext.strokeStyle] = ["#000000", "#111111"];
  [context.lineWidth, stampContext.lineWidth] = [2, 10];

  // マウスイベントの登録
  // クリック中
  canvas.addEventListener("mousedown", event => {
      // 始点を取得
      [x1, y1] = getPosition(event);
      mouseDown = true;
  });
  canvas.addEventListener("mousemove", drawClip); // 動かしてる時
  canvas.addEventListener("mouseup", () => mouseDown = false);    // 離したら終了
  canvas.addEventListener("mouseleave", () => mouseDown = false); // 場外終了
}

// ファイル選択ボタンから画像の読み込み、描画
const loadImage = files => {
  if (files.length > 0) image.src = URL.createObjectURL(files[0]);
  // 画像が読み込まれたらスタート
  image.onload = () => {
    // 縦横大きい方に合わせて白埋めで正方形を作る
    if (image.width > image.height) {
      [sw, sh] = [image.width, image.width*height/width];
      [sx, sy] = [0, image.height/2 - sh/2];
    } else {
      [sw, sh] = [image.height*width/height, image.height];
      [sx, sy] = [image.width/2 - sw/2, 0];
    }
    context.fillRect(0, 0, width, height);
    context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    [cx, cy, cr] = [200, 200, 200];
  }
}

// マウスカーソルの位置を取得
const getPosition = event => {
  const canvasRect = canvas.getBoundingClientRect();
  return [event.clientX-canvasRect.left, event.clientY-canvasRect.top];
}

// クリップの中心、半径の取得、円の描画
const drawClip = event => {
  if (mouseDown) {
    const [x2, y2] = getPosition(event);
    [cx, cy] = [(x1 + x2)/2, (y1 + y2)/2];
    cr = Math.abs(cx - x1);
    if (Math.abs(x2-x1) > Math.abs(y2-y1)) cr = Math.abs(cy - y1);
    context.fillRect(0, 0, width, height);
    context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    context.beginPath();
    context.arc(cx, cy, cr, 0, Math.PI*2);
    context.stroke();
  }
}

// ノイズの作成
const getNoise = () => {
  let noise = 0;
  for (let i=0; i<16; i++) {
    noise += Math.random();
  }
  return (noise - 8)*16;
}

// スタンプ作成
const filter = () => {
  // 画像の切り抜き
  const r = width/2;
  const [sx1, sy1] = [sx + (cx-cr)*sw/width, sy + (cy-cr)*sh/height];
  stampContext.save();
  stampContext.fillRect(0, 0, width, height);
  stampContext.beginPath();
  stampContext.arc(width/2, height/2, r, 0, Math.PI*2);
  stampContext.clip();
  stampContext.drawImage(image, sx1, sy1, sw*cr/r, sh*cr/r, 0, 0, width, height);
  stampContext.restore();
  // エッジ検出
  const imageData = stampContext.getImageData(0, 0, width, height);
  const edgeData = stampContext.getImageData(0, 0, width, height);
  const check = document.getElementById("edge").checked;
  const weight = [[1, 1, 1], [1, -8, 1], [1, 1, 1]];
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      let [r, g, b] = [0, 0, 0];
      for (let i=-1; i<=1; i++) {
        for (let j=-1; j<=1; j++) {
          const target = ((y+1)*width + (x+j))*4;
          const w = weight[i+1][j+1];
          r += imageData.data[target] * w;
          g += imageData.data[target+1] * w;
          b += imageData.data[target+2] * w;
        }
      }
      const index = (y*width + x)*4;
      if (check&&((r > 100) || (g > 100) || (b > 100))) {
        edgeData.data[index] = 0;
        edgeData.data[index+1] = 0;
        edgeData.data[index+2] = 0;
      }
    }
  }
  stampContext.putImageData(edgeData, 0, 0);
  // 枠の描画
  stampContext.beginPath();
  stampContext.arc(width/2, height/2, r-5, 0, Math.PI*2);
  stampContext.stroke();
  // ノイズ
  const noiseData = stampContext.getImageData(0, 0, width, height);
  for (let i=0; i<width*height*4; i+=4) {
    const noise = getNoise();
    for (let j=0; j<4; j++) {
      noiseData.data[i+j] += noise;
      if (noiseData.data[i+j] < 0) noiseData.data[i+j] = 0;
      if (noiseData.data[i+j] > 255) noiseData.data[i+j] = 255;
    }
  }
  // 二重化
  const stampData = stampContext.createImageData(width, height);
  const t = document.getElementById("t").value * 16;
  const color = document.getElementById("color").value;
  for (let i=0; i<width*height*4; i+=4) {
    const r = noiseData.data[i];
    const g = noiseData.data[i+1];
    const b = noiseData.data[i+2];
    if (0.299*r + 0.587*g + 0.114*b < t) {
      stampData.data[i] = parseInt(color.substr(1, 2), 16);
      stampData.data[i+1] = parseInt(color.substr(3, 2), 16);
      stampData.data[i+2] = parseInt(color.substr(5, 2), 16);
      stampData.data[i+3] = noiseData.data[i+3];
    }
  }
  stampContext.putImageData(stampData, 0, 0);
}

// 画像を名前をつけて保存（ダウンロード）
const saveImage = () => {
  const filename = window.prompt("ファイル名を入力してください", "stamp.png");
  if (filename != null) {
    const a = document.createElement("a");
    a.href = stampCanvas.toDataURL("image/png");
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}