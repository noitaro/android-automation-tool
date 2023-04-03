# android-automation-tool
![image](https://user-images.githubusercontent.com/52857466/229396926-2279ab65-34d2-46cd-bd6b-cf107974d09a.png)

## 特徴
Androidの自動化を簡単に行うことができるアプリ
- プログラムを書く必要がなく、ブロックを組み合わせるだけで自動化が可能
- 事前にタップしたい箇所を登録することで、画面内を自動でタップすることができる。
- 実機はもちろんのこと、Androidエミュレーター（[NoxPlayer](https://jp.bignox.com/) 等）に対応
- マウスカーソルやフォーカスを奪われないため、裏で回し続けることができる。

## 準備
+ このツールを使うには adb.exe が必須です。
+ 実機で動かす場合はUSBデバッグも有効にする必要があります。

### SDK Platform-Tools
adb.exe は SDK Platform-Tools に含まれています。
- [SDK Platform-Tools](https://developer.android.com/studio/releases/platform-tools.html)

![image](https://user-images.githubusercontent.com/52857466/229398497-e46b7043-9d1e-4891-b3fd-6b3d0dab507d.png)

## 使い方


## start
```Bash
npm run tauri dev
```

## Debug Build
```Bash
npm run tauri build --debug
```

## App Publishing
```Bash
npm run tauri build
```
