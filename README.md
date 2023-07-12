# アンドロイド自動操作ツール (android-automation-tool)
![image](https://user-images.githubusercontent.com/52857466/229396926-2279ab65-34d2-46cd-bd6b-cf107974d09a.png)

## 特徴
Androidの自動化を簡単に行うことができるアプリ
- プログラムを書く必要がなく、ブロックを組み合わせるだけで自動化が可能
- 事前にタップしたい箇所を登録することで、画面内を自動でタップすることができる。
- 実機はもちろんのこと、Androidエミュレーター（[NoxPlayer](https://jp.bignox.com/) 等）に対応
- マウスカーソルやフォーカスを奪わないため、裏で回し続けることができる。
- 作った自動操作ロジックは Python のみでも実行することができる。

## 準備
+ このツールを使うには adb.exe が必須です。
+ 実機で動かす場合はUSBデバッグも有効にする必要があります。

### SDK Platform-Tools
adb.exe は SDK Platform-Tools に含まれています。
- [SDK Platform-Tools](https://developer.android.com/studio/releases/platform-tools.html)

![image](https://user-images.githubusercontent.com/52857466/229398497-e46b7043-9d1e-4891-b3fd-6b3d0dab507d.png)

## 使い方

### 1.プロジェクト作成
左メニューから新規プロジェクトを作成する。

![image](https://user-images.githubusercontent.com/52857466/229405446-9b4c7d31-490c-4903-a470-b50bf5debc0d.png)

### 2.自動操作設定

#### adb.exe の設定
PC内の adb.exe を指定する。

![image](https://user-images.githubusercontent.com/52857466/229405895-33b02f35-a5f8-44ae-a5b1-435a4141fdd1.png)

### タッチ画像の作成
スクリーンショットを取得して、トリミング範囲を選択し保存する。

![image](https://user-images.githubusercontent.com/52857466/229406255-c068fc23-b2a5-40b4-954c-91cc43bd0d6d.png)

## 3.自動操作ロジック作成
ブロックを使って、自動操作の流れを作る。

![image](https://user-images.githubusercontent.com/52857466/229396926-2279ab65-34d2-46cd-bd6b-cf107974d09a.png)

## その他機能

### プロジェクトについて
プロジェクトはマイドキュメント内に保存されます。
- C:\Users\{ユーザー名}\Documents\android-automation-tool\

![image](https://user-images.githubusercontent.com/52857466/229407193-6fa7da63-03d3-4e18-8d34-4a4aa0ebabd4.png)

- 作った自動操作ロジックやトリミングした画像等が保存してあります。

### Python 出力について
右上ボタンから Python 出力することができます。

![image](https://user-images.githubusercontent.com/52857466/229407488-16d58d58-411c-4988-8e87-45789ef75a0a.png)

- 保存先はプロジェクトフォルダー内に「main.py」で保存されます。
- 保存した Pythonスクリプトを使うことで、Python のみで実行することができます。
- 実行方法については「[https://noitaro.github.io/android-auto-play-opencv/](https://noitaro.github.io/android-auto-play-opencv/)」の記事をご覧ください。

## Webサイト
[https://noitaro.github.io/android-automation-tool/](https://noitaro.github.io/android-automation-tool/)

## 開発
### start
```Bash
npm run tauri dev
```

### Debug Build
```Bash
npm run tauri build --debug
```

### App Publishing
```Bash
npm run tauri build
```
