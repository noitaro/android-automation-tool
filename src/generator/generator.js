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

javascriptGenerator['test_react_field'] = function (block) {
  return 'console.log(\'custom block\');\n';
};

javascriptGenerator['test_react_date_field'] = function (block) {
  return 'console.log(' + block.getField('DATE').getText() + ');\n';
};

javascriptGenerator['screencap_field'] = function (block) {
  return 'aapo.screencap();\n';
};

javascriptGenerator['sleep_field'] = function (block) {
  return 'aapo.sleep(' + block.getField('NAME').getText() + ');\n';
};

javascriptGenerator['image_touchscreen_field1'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.touchImg(\'' + name + '\');\n';
};

javascriptGenerator['image_touchscreen_field2'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  const code = 'aapo.chkImg(\'' + name + '\')';
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator['image_serializable_field'] = function (block) {
  const name = block.getField('PATH').getText();
  return [name, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator['tap_touchscreen_field'] = function (block) {
  return 'aapo.touchPos(' + block.getField('X').getText() + ', ' + block.getField('Y').getText() + ');\n';
};

javascriptGenerator['longtap_touchscreen_field'] = function (block) {
  return 'aapo.longTouchPos(' + block.getField('X').getText() + ', ' + block.getField('Y').getText() + ', ' + block.getField('TIME').getText() * 1000 + ');\n';
};

javascriptGenerator['swipe_touchscreen_field'] = function (block) {
  return 'aapo.swipeTouchPos(' + block.getField('SX').getText() + ', ' + block.getField('SY').getText() + ', ' + block.getField('EX').getText() + ', ' + block.getField('EY').getText() + ', ' + block.getField('TIME').getText() * 1000 + ');\n';
};

javascriptGenerator['input_text_field'] = function (block) {
  const name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.inputtext(' + name + ');\n';
};

javascriptGenerator['input_keyevent_field'] = function (block) {
  return 'aapo.inputkeyevent(' + block.getField('NAME').getValue() + ');\n';
};

javascriptGenerator['image_save_field'] = function (block) {
  return 'aapo.imgSave(\'./img_save/screenshot_\' + new Date().getTime() + \'.png\');\n';
};

javascriptGenerator['app_start_field'] = function (block) {
  let packageName = javascriptGenerator.valueToCode(block, 'PACKAGE_NAME', javascriptGenerator.ORDER_ATOMIC);
  if (packageName.endsWith("\'")) packageName = packageName.slice(0, -1);

  let className = javascriptGenerator.valueToCode(block, 'CLASS_NAME', javascriptGenerator.ORDER_ATOMIC);
  if (className.startsWith("\'")) className = className.slice(1);

  return 'aapo.start(' + packageName + '/' + className + ');\n';
};

javascriptGenerator['app_end_field'] = function (block) {
  const packageName = javascriptGenerator.valueToCode(block, 'PACKAGE_NAME', javascriptGenerator.ORDER_ATOMIC);
  return 'aapo.end(' + packageName + ');\n';
};
