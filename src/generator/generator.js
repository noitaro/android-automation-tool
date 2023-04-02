/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Define generation methods for custom blocks.
 * @author samelh@google.com (Sam El-Husseini)
 */

// More on generating code:
// https://developers.google.com/blockly/guides/create-custom-blocks/generating-code

import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

javascriptGenerator['test_react_field'] = function (block) {
  return 'console.log(\'custom block\');\n';
};

javascriptGenerator['test_react_date_field'] = function (block) {
  return 'console.log(' + block.getField('DATE').getText() + ');\n';
};

javascriptGenerator['screencap_field'] = function (block) {
  return 'aapo.screencap();\n';
};
pythonGenerator['screencap_field'] = function (block) {
  return 'aapo.screencap() # アンドロイドのスクリーンショットを取得\n';
};

javascriptGenerator['sleep_field'] = function (block) {
  return 'aapo.sleep(' + block.getField('NAME').getText() + ');\n';
};
pythonGenerator['sleep_field'] = function (block) {
  const ms = block.getField('NAME').getText();
  return `aapo.sleep(${ms}) # ${ms} 秒間停止\n`;
};

javascriptGenerator['image_touchscreen_field1'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.touchImg(\'' + name + '\');\n';
};
pythonGenerator['image_touchscreen_field1'] = function (block) {
  const name = pythonGenerator.valueToCode(block, 'NAME', pythonGenerator.ORDER_ATOMIC);
  return 'aapo.touchImg(\'' + name + '\') # この画像が画面にあればタップ\n';
};

javascriptGenerator['image_touchscreen_field2'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  const code = 'aapo.chkImg(\'' + name + '\')';
  return [code, javascriptGenerator.ORDER_ATOMIC];
};
pythonGenerator['image_touchscreen_field2'] = function (block) {
  const name = pythonGenerator.valueToCode(block, 'NAME', pythonGenerator.ORDER_ATOMIC);
  const code = 'aapo.chkImg(\'' + name + '\')';
  return [code, pythonGenerator.ORDER_ATOMIC];
};

javascriptGenerator['image_serializable_field'] = function (block) {
  const name = block.getField('PATH').getText();
  return [name, javascriptGenerator.ORDER_ATOMIC];
};
pythonGenerator['image_serializable_field'] = function (block) {
  const name = block.getField('PATH').getText();
  return [name, pythonGenerator.ORDER_ATOMIC];
};

javascriptGenerator['tap_touchscreen_field'] = function (block) {
  return 'aapo.touchPos(' + block.getField('X').getText() + ', ' + block.getField('Y').getText() + ');\n';
};
pythonGenerator['tap_touchscreen_field'] = function (block) {
  const x = block.getField('X').getText();
  const y = block.getField('Y').getText();
  return `aapo.touchPos(${x}, ${y}) # X=${x},Y=${y} をタップ\n`;
};

javascriptGenerator['longtap_touchscreen_field'] = function (block) {
  return 'aapo.longTouchPos(' + block.getField('X').getText() + ', ' + block.getField('Y').getText() + ', ' + block.getField('TIME').getText() * 1000 + ');\n';
};
pythonGenerator['longtap_touchscreen_field'] = function (block) {
  const x = block.getField('X').getText();
  const y = block.getField('Y').getText();
  const time = block.getField('TIME').getText();
  return `aapo.longTouchPos(${x}, ${y}, ${(time * 1000)}) # X=${x},Y=${y} を ${time} 秒間タップ\n`;
};

javascriptGenerator['swipe_touchscreen_field'] = function (block) {
  return 'aapo.swipeTouchPos(' + block.getField('SX').getText() + ', ' + block.getField('SY').getText() + ', ' + block.getField('EX').getText() + ', ' + block.getField('EY').getText() + ', ' + block.getField('TIME').getText() * 1000 + ');\n';
};
pythonGenerator['swipe_touchscreen_field'] = function (block) {
  const sx = block.getField('SX').getText();
  const sy = block.getField('SY').getText();
  const ex = block.getField('EX').getText();
  const ey = block.getField('EY').getText();
  const time = block.getField('TIME').getText();
  return `aapo.swipeTouchPos(${sx}, ${sy}, ${ex}, ${ey}, ${(time * 1000)}) # X=${sx},Y=${sy} から X=${ex},Y=${ey} までを ${time} 秒間かけてスワイプ\n`;
};

javascriptGenerator['input_text_field'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.inputtext(' + name + ');\n';
};
pythonGenerator['input_text_field'] = function (block) {
  const name = pythonGenerator.valueToCode(block, 'NAME', pythonGenerator.ORDER_ATOMIC);
  return 'aapo.inputtext(' + name + ') # この文字をアンドロイドに送る【日本語不可】\n';
};

javascriptGenerator['input_keyevent_field'] = function (block) {
  return 'aapo.inputkeyevent(' + block.getField('NAME').getValue() + ');\n';
};
pythonGenerator['input_keyevent_field'] = function (block) {
  return 'aapo.inputkeyevent(' + block.getField('NAME').getValue() + ') # ボタンを押す\n';
};

javascriptGenerator['image_save_field'] = function (block) {
  return 'aapo.imgSave(\'./img_save/screenshot_\' + new Date().getTime() + \'.png\');\n';
};
pythonGenerator['image_save_field'] = function (block) {
  return 'aapo.imgSave(\'./img_save/screenshot_\' + datetime.datetime.now().strftime(\'%Y%m%d%H%M%S\') + \'.png\') # PCにスクリーンショット画像を保存\n';
};

javascriptGenerator['app_start_field'] = function (block) {
  let packageName = javascriptGenerator.valueToCode(block, 'PACKAGE_NAME', javascriptGenerator.ORDER_ATOMIC);
  if (packageName.endsWith("\'")) packageName = packageName.slice(0, -1);

  let className = javascriptGenerator.valueToCode(block, 'CLASS_NAME', javascriptGenerator.ORDER_ATOMIC);
  if (className.startsWith("\'")) className = className.slice(1);

  return 'aapo.start(' + packageName + '/' + className + ');\n';
};
pythonGenerator['app_start_field'] = function (block) {
  let packageName = pythonGenerator.valueToCode(block, 'PACKAGE_NAME', pythonGenerator.ORDER_ATOMIC);
  if (packageName.endsWith("\'")) packageName = packageName.slice(0, -1);

  let className = pythonGenerator.valueToCode(block, 'CLASS_NAME', pythonGenerator.ORDER_ATOMIC);
  if (className.startsWith("\'")) className = className.slice(1);

  return 'aapo.start(' + packageName + '/' + className + ') # アプリを起動する\n';
};

javascriptGenerator['app_end_field'] = function (block) {
  const packageName = javascriptGenerator.valueToCode(block, 'PACKAGE_NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.end(' + packageName + ');\n';
};
pythonGenerator['app_end_field'] = function (block) {
  const packageName = pythonGenerator.valueToCode(block, 'PACKAGE_NAME', pythonGenerator.ORDER_ATOMIC);
  return 'aapo.end(' + packageName + ') # アプリを終了する\n';
};
