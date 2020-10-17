const Store = require('electron-store');
const store = new Store();

const AdbManager = require('./js/AdbManager');

let indexViewModel = require('./js/indexViewModel');
ko.applyBindings(indexViewModel);

const demoWorkspace = Blockly.inject('blocklyDiv', {
  sounds: false,
  toolbox: document.getElementById('toolbox'),
  grid: {
    spacing: 20,
    length: 1,
    colour: '#888',
    snap: false
  },
  zoom: {
    controls: true,
    wheel: false,
    startScale: 1,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2
  }
});

let blocklyArea = document.getElementById('blocklyArea');
let blocklyDiv = document.getElementById('blocklyDiv');

const onresize = function (e) {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  let element = blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(demoWorkspace);
};
window.addEventListener('resize', onresize, false);
onresize();
Blockly.svgResize(demoWorkspace);

/** ワークスペースのブロックを変更したらソースコードを更新します。 */
demoWorkspace.addChangeListener(event => {
  Blockly.JavaScript.STATEMENT_PREFIX = null;
  let code = Blockly.JavaScript.workspaceToCode(demoWorkspace);
  document.getElementById('highlightCode').innerHTML = code;
  hljs.highlightBlock(document.getElementById('highlightCode'));
});

function initApi(interpreter, globalObject) {
  interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction((text) => alert(arguments.length ? text : '')));
  interpreter.setProperty(globalObject, 'prompt', interpreter.createNativeFunction((text) => prompt(text)));
  interpreter.setProperty(globalObject, 'highlightBlock', interpreter.createNativeFunction((id) => demoWorkspace.highlightBlock(id)));
  interpreter.setProperty(globalObject, 'AdbScreenCapture', interpreter.createNativeFunction(AdbManager.adbScreenCapture));
  interpreter.setProperty(globalObject, 'AdbTap', interpreter.createNativeFunction(AdbManager.adbTap));
  interpreter.setProperty(globalObject, 'AdbSleep', interpreter.createAsyncFunction(AdbManager.adbSleep));
}

// Knockout から呼ばれる↓
// 実行ボタン
function runCodeButtonClicked() {
  indexViewModel.hasRunCodeButtonClicked(false);
  indexViewModel.running(true);

  // ストア保存
  let xmlDom = Blockly.Xml.workspaceToDom(demoWorkspace);
  let xmlText = Blockly.Xml.domToPrettyText(xmlDom);
  store.set('workspace', xmlText);

  Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  let code = Blockly.JavaScript.workspaceToCode(demoWorkspace);
  let myInterpreter = new Interpreter(code, initApi);

  indexViewModel.logClear();
  (async () => {
    try {
      indexViewModel.ligWriteLine('自動操作開始');
      while (indexViewModel.running() && myInterpreter.step()) {
        // sleep
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      indexViewModel.ligWriteLine('error: ' + error);
    }
    finally {
      demoWorkspace.highlightBlock(null);
      indexViewModel.running(false);
      indexViewModel.ligWriteLine('自動操作終了');
    }
  })();

  // 連打対策
  setTimeout(() => indexViewModel.hasRunCodeButtonClicked(true), 100);
}
// 停止ボタン
function stopCodeButtonClicked() {
  indexViewModel.hasStopCodeButtonClicked(false);

  indexViewModel.ligWriteLine('停止！！！');
  indexViewModel.running(false);

  // 連打対策
  setTimeout(() => indexViewModel.hasStopCodeButtonClicked(true), 100);
}
// 読込ボタン
function importCodeButtonClicked() {
  indexViewModel.hasImportCodeButtonClicked(false);


  // 連打対策
  setTimeout(() => indexViewModel.hasImportCodeButtonClicked(true), 100);
}
// 保存ボタン
function exportCodeButtonClicked() {
  indexViewModel.hasExportCodeButtonClicked(false);

  let xmlDom = Blockly.Xml.workspaceToDom(demoWorkspace);
  let xmlText = Blockly.Xml.domToPrettyText(xmlDom);
  indexViewModel.ligWriteLine(xmlText);

  const { dialog } = require('electron').remote;
  let filePath = dialog.showSaveDialogSync({
    title: '名前を付けて保存',
    defaultPath: '自動操作ファイル.dat',
    filters: [
      {
        name: '自動操作ファイル',
        extensions: ['dat']
      }],
    properties: []
  })

  let canvas = document.getElementById('canvasOutput');
  let base64 = canvas.toDataURL();
  console.log(base64);

  let fs = require('fs');
  fs.writeFile(filePath, base64, err => console.log(err));

  // 連打対策
  setTimeout(() => indexViewModel.hasExportCodeButtonClicked(true), 100);
}
// 自動操作設定ボタン
function autoSettingButtonClicked() {
  indexViewModel.hasAutoSettingButtonClicked(false);

  indexViewModel.autoSettingModal(true);

  // 連打対策
  setTimeout(() => indexViewModel.hasAutoSettingButtonClicked(true), 100);
}
// ヘルプボタン
function otherButtonClicked() {
  indexViewModel.hasOtherButtonClicked(false);

  indexViewModel.otherModal(true);

  // 連打対策
  setTimeout(() => indexViewModel.hasOtherButtonClicked(true), 100);
}
// adbパス設定ボタン
function adbPathButtonClicked() {
  indexViewModel.hasAdbPathButtonClicked(false);

  const { dialog } = require('electron').remote;
  let filePath = dialog.showOpenDialogSync(
    {
      title: 'adb.exe があるフォルダを指定して下さい。',
      filters: [],
      properties: ['openDirectory']
    })

  if (filePath?.length > 0) {
    // 存在確認
    const fs = require('fs');
    if (fs.existsSync(filePath[0] + '\\adb.exe')) {
      indexViewModel.adbPath(filePath[0]);
    }
  }

  // 連打対策
  setTimeout(() => indexViewModel.hasAdbPathButtonClicked(true), 100);
}
// スクショ取得ボタン
function execScreencapClicked() {
  indexViewModel.hasExecScreencapClicked(false);

  const binaryData = AdbManager.adbExecScreencap();
  if (binaryData.length == 0) {
    alert('スクリーンショットの取得に失敗しました。アンドロイドの接続を確認して下さい。');
  }

  let base64String = binaryData.toString('base64');
  base64String = 'data:image/png;base64,' + base64String;
  $('#canvasOutput').attr('src', base64String);

  // 連打対策
  setTimeout(() => indexViewModel.hasExecScreencapClicked(true), 100);
}
// トリミング開始ボタン
function trimmingClicked() {
  indexViewModel.hasTrimmingClicked(false);

  if (document.getElementById('canvasOutput').src != '' && document.getElementById('canvasOutput').src != 'data:image/png;base64,') {
    indexViewModel.trimmingMode(true);

    indexViewModel.cropper = new Cropper(document.getElementById('canvasOutput'), {
      zoomable: false,
      zoomOnTouch: false,
      zoomOnWheel: false
    });
  }

  // 連打対策
  setTimeout(() => indexViewModel.hasTrimmingClicked(true), 100);
}
// トリミングキャンセルボタン
function trimmingCancelClicked() {
  indexViewModel.hasTrimmingCancelClicked(false);

  indexViewModel.cropper?.destroy();
  indexViewModel.cropper = null;
  indexViewModel.trimmingMode(false);

  // 連打対策
  setTimeout(() => indexViewModel.hasTrimmingCancelClicked(true), 100);
}
// トリミング確定ボタン
function trimmingFixedClicked() {
  indexViewModel.hasTrimmingFixedClicked(false);

  const dataURL = indexViewModel.cropper.getCroppedCanvas().toDataURL();

  indexViewModel.cropper?.destroy();
  indexViewModel.cropper = null;
  indexViewModel.trimmingMode(false);

  document.getElementById('canvasOutput').src = dataURL;

  // 連打対策
  setTimeout(() => indexViewModel.hasTrimmingFixedClicked(true), 100);
}
// リストに追加ボタン
function addListClicked() {
  indexViewModel.hasAddListClicked(false);

  if (document.getElementById('canvasOutput').src != '' && document.getElementById('canvasOutput').src != 'data:image/png;base64,') {

    let nameNum = 0;
    if (1 <= indexViewModel.images().length) {
      let lastData = indexViewModel.images()[indexViewModel.images().length - 1];
      nameNum = Number(lastData.name.replace('data', ''));
    }
    indexViewModel.images.push({
      name: 'data' + (nameNum + 1),
      src: document.getElementById('canvasOutput').src,
      width: 50,
      height: 30
    });

  }

  // 連打対策
  setTimeout(() => indexViewModel.hasAddListClicked(true), 100);
}
// リストから削除ボタン
function removeListClicked(data) {
  indexViewModel.images.remove(data);
}
// Knockout から呼ばれる↑

let canvas = document.getElementById('canvasOutput');

canvas.onload = function () {
  indexViewModel.screencapImageWidth(canvas.naturalWidth);
  indexViewModel.screencapImageHeight(canvas.naturalHeight);
};

canvas.addEventListener("mousedown", e => {
  // drawing = true;
  // lastPos = getMousePos(canvas, e);
}, false);
canvas.addEventListener("mouseup", e => {
  // drawing = false;
}, false);
canvas.addEventListener("mousemove", e => {
  let x = e.clientX - canvas.getBoundingClientRect().left;
  let y = e.clientY - canvas.getBoundingClientRect().top;
  indexViewModel.canvasXPos(Math.floor(x * (indexViewModel.screencapImageWidth() / canvas.getBoundingClientRect().width)));
  indexViewModel.canvasYPos(Math.floor(y * (indexViewModel.screencapImageHeight() / canvas.getBoundingClientRect().height)));
}, false);

// 自動操作設定モーダルを閉じた後のイベント
$('#autoSettingModal').on('hidden.bs.modal', e => {
  indexViewModel.autoSettingModal(false);
})

// ヘルプモーダルを閉じた後のイベント
$('#otherModal').on('hidden.bs.modal', e => {
  indexViewModel.otherModal(false);
})

// カテゴリ更新
categoryUpdate = () => {
  let imageBlockCategory = demoWorkspace.getToolbox().getToolboxItemById('imageBlock');
  let contents = [];

  indexViewModel.images().forEach(function (element, index, array) {
    let block = {
      "kind": "block",
      "blockxml": '<block type="field_image_serializable"><field name="NAME">' + element.name + '</field><field name="FIELDNAME">' + element.name + '</field></block>'
    };
    contents.push(block);
  });

  imageBlockCategory.updateFlyoutContents(contents);
};

// Javascript 初期化
$(() => {

  // 初期化
  indexViewModel.adbPath(store.get('adbPath'));
  indexViewModel.images(JSON.parse(store.get('imagesJsonData')));

  // カテゴリ更新
  categoryUpdate();

  // ワークスペース設定
  if (store.get('workspace') != null && store.get('workspace') != '') {
    let xml = Blockly.Xml.textToDom(store.get('workspace'));
    Blockly.Xml.domToWorkspace(xml, demoWorkspace);
  }

});

// URLを開く
function urlopen(url) {
  const { shell } = require('electron');
  shell.openExternal(url);
}