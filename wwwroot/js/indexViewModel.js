let indexViewModel = {
  images: ko.observableArray([]),

  running: ko.observable(false),
  adbPath: ko.observable('adb.exe'),
  execLog: ko.observableArray([]),

  // 類似度の設定(0~1)
  threshold: ko.observable(0.8),

  // 実行ボタン
  executionClick: runCodeButtonClicked,
  hasRunCodeButtonClicked: ko.observable(true),
  // 停止ボタン
  stopClick: stopCodeButtonClicked,
  hasStopCodeButtonClicked: ko.observable(true),
  // 読込ボタン
  loadClick: importCodeButtonClicked,
  hasImportCodeButtonClicked: ko.observable(true),
  // 保存ボタン
  saveClick: exportCodeButtonClicked,
  hasExportCodeButtonClicked: ko.observable(true),
  // 自動操作設定ボタン
  autoSettingClick: autoSettingButtonClicked,
  hasAutoSettingButtonClicked: ko.observable(true),
  // ヘルプボタン
  otherClick: otherButtonClicked,
  hasOtherButtonClicked: ko.observable(true),
  // スクリーンショットのソースパス
  captureSrc: ko.observable(''),
  // adbパス設定ボタン
  adbPathSettingClick: adbPathButtonClicked,
  hasAdbPathButtonClicked: ko.observable(true),
  // スクショ取得ボタン
  execScreencapClick: execScreencapClicked,
  hasExecScreencapClicked: ko.observable(true),
  // スクショの画像サイズ
  screencapImageWidth: ko.observable(''),
  screencapImageHeight: ko.observable(''),
  // キャンバス内のマウスカーソル位置
  canvasXPos: ko.observable(0),
  canvasYPos: ko.observable(0),
  // トリミング開始ボタン
  trimmingClick: trimmingClicked,
  hasTrimmingClicked: ko.observable(true),
  // トリミングモード
  trimmingMode: ko.observable(false),
  // トリミングインスタンス
  cropper: null,
  // トリミングキャンセルボタン
  trimmingCancelClick: trimmingCancelClicked,
  hasTrimmingCancelClicked: ko.observable(true),
  // トリミング確定ボタン
  trimmingFixedClick: trimmingFixedClicked,
  hasTrimmingFixedClicked: ko.observable(true),
  // 自動操作設定モーダル開閉状態
  autoSettingModal: ko.observable(false),
  // ヘルプモーダル開閉状態
  otherModal: ko.observable(false),
  // リストに追加ボタン
  addListClick: addListClicked,
  hasAddListClicked: ko.observable(true),
  // リストから削除ボタン
  removeListClick: removeListClicked,

  logClear: () => indexViewModel.execLog([]),
  ligWriteLine: text => indexViewModel.execLog.push(text),
  getImage: name => indexViewModel.images().find(x => x.name == name)
};

const Store = require('electron-store');
const store = new Store();

// adbパスが変わった時のイベント
indexViewModel.adbPath.subscribe(newValue => {
  // ストア保存
  store.set('adbPath', newValue);
});

// ログリストが変わった時のイベント
indexViewModel.execLog.subscribe(newValue => {
  let logArea = $('#logArea');
  // 一番下までスクロール
  logArea.animate({ scrollTop: logArea[0].scrollHeight }, 100);
});

// 自動操作設定モーダル開閉状態が変わった時のイベント
indexViewModel.autoSettingModal.subscribe(newValue => {

  if (newValue) {
    // モーダル表示
    $('#autoSettingModal').modal({});
    let canvas = document.getElementById('canvasOutput');
    indexViewModel.screencapImageWidth(canvas.naturalWidth);
    indexViewModel.screencapImageHeight(canvas.naturalHeight);

  } else {
    // トリミングキャンセルボタン
    trimmingCancelClicked();
  }
});

// ヘルプモーダル開閉状態が変わった時のイベント
indexViewModel.otherModal.subscribe(newValue => {

  if (newValue) {
    // モーダル表示
    $('#otherModal').modal({});

  } else {

  }
});

// 画像リストが変わった時のイベント
indexViewModel.images.subscribe(newValue => {

  // 画像リストをストア保存する
  var imagesJsonData = ko.toJSON(indexViewModel.images);
  store.set('imagesJsonData', imagesJsonData);

  // カテゴリ更新
  categoryUpdate();
});

module.exports = indexViewModel;