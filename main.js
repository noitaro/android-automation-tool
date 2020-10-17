const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    show: false,
    'icon': __dirname + '/pineapple_emoticon_emoji_icon_152245.ico'
  })

  win.loadFile('./wwwroot/index.html')
  win.setMenu(null);
  // 読込が終わったら画面を表示する
  win.once('ready-to-show', () => {
    win.show()
    // win.webContents.openDevTools();
  });
}

app.whenReady().then(createWindow)
