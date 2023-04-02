
# This Python file uses the following encoding: utf-8

# pip install android-auto-play-opencv
import android_auto_play_opencv as am
import datetime # 日時を取得するために必要

aapo = am.AapoManager('D:\Program Files\Nox\bin\adb.exe')

aapo.screencap() # アンドロイドのスクリーンショットを取得
aapo.sleep(3) # 3 秒間停止
aapo.touchImg('./img/data1.png') # この画像が画面にあればタップ
if aapo.chkImg('./img/data1.png'):
  aapo.touchPos(100, 150) # X=100,Y=150 をタップ

    