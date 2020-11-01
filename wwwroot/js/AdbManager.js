'use strict';
const childProcess = require('child_process');
const cv = require('./opencv.js');
const Jimp = require('jimp');

let indexViewModel = require('./indexViewModel');

class AdbManager {
  adbScreenCapture = () => {

    const binaryData = this.adbExecScreencap();
    let base64String = binaryData.toString('base64');
    base64String = 'data:image/png;base64,' + base64String;
    indexViewModel.captureSrc(base64String);
  };

  adbTap = async imgName => {

    if (indexViewModel.captureSrc() == 'data:image/png;base64,') {
      return;
    }
    if (indexViewModel.getImage(imgName) == null) {
      return;
    }

    let screenshotMat = await this.matFromBase64String(indexViewModel.captureSrc());
    let templateMat = await this.matFromBase64String(indexViewModel.getImage(imgName).src);

    let rect = this.getRectangleFromMatchTemplate(screenshotMat, templateMat);
    if (rect == null) {
      indexViewModel.ligWriteLine(imgName + ' 画像は見つからなかった。');
      return;
    }

    indexViewModel.ligWriteLine(imgName + ' 画像を発見。');

    cv.rectangle(screenshotMat,
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      new cv.Scalar(255, 0, 0, 255), 2, cv.LINE_8, 0);

    cv.imshow('hidden-canvas', screenshotMat);
    indexViewModel.captureSrc(document.getElementById('hidden-canvas').toDataURL());

    templateMat.delete();
    screenshotMat.delete();

    // スクリーンショット内をタップ
    this.adbExecTouchscreen(rect.x + (rect.width * 0.5), rect.y + (rect.height * 0.5));
  };

  adbSleep = async (sec, callback) => {
    indexViewModel.ligWriteLine(sec + ' 秒間停止します');
    const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
    await sleep(sec * 1000);
    callback();
  };

  adbExecScreencap = () => {
    indexViewModel.ligWriteLine('アンドロイドのスクリーンショットを撮影');

    let buffer = null;
    try {
      buffer = childProcess.execSync(
        '"' + indexViewModel.adbPath() + '\\adb.exe" exec-out screencap -p',
        {
          maxBuffer: 1024 * 1024 * 1024 // 1GB
        });

    } catch (error) {
      buffer = Buffer.from('', 'base64');
      indexViewModel.ligWriteLine('失敗');
    }

    return buffer;
  };

  adbExecTouchscreen = (x, y) => {
    indexViewModel.ligWriteLine('タップ: X=' + x + ', Y=' + y);
    return childProcess.exec('"' + indexViewModel.adbPath() + '\\adb.exe" shell input touchscreen tap ' + x + ' ' + y);
  };

  matFromBase64String = async base64String => {
    let str = base64String.replace('data:image/png;base64,', '');
    let buffer = Buffer.from(str, 'base64');
    let jimp = await Jimp.read(buffer).then(result => result);
    return cv.matFromImageData(jimp.bitmap);
  };

  getRectangleFromMatchTemplate = (image, templ) => {
    let dst = new cv.Mat();
    let mask = new cv.Mat();

    // Template Match
    cv.matchTemplate(image, templ, dst, cv.TM_CCOEFF_NORMED, mask);
    let result = cv.minMaxLoc(dst, mask);

    dst.delete();
    mask.delete();
    dst = null;
    mask = null;

    // 類似度確認
    if (indexViewModel.threshold() > result.maxVal) {
      // タップ箇所無し
      return null;
    }

    let maxPoint = result.maxLoc;
    let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);

    // let maxPoint = {x: 118, y: 132};
    // let point = {x: 177, y: 187};

    return {
      x: maxPoint.x,
      y: maxPoint.y,
      width: point.x - maxPoint.x,
      height: point.y - maxPoint.y
    };
  };

}

module.exports = new AdbManager();