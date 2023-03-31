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
 * @fileoverview Define custom blocks.
 * @author samelh@google.com (Sam El-Husseini)
 */

// More on defining blocks:
// https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks


import * as Blockly from 'blockly/core';

// Since we're using json to initialize the field, we'll need to import it.
import '../fields/BlocklyReactField';
import '../fields/DateField';
import '../fields/ImageSerializableField';
import '../fields/NoneDisplayField';

import '@blockly/field-date';

Blockly.Blocks['test_react_field'] = {
  init: function () {
    this.jsonInit({
      "type": "test_react_field",
      "message0": "custom field %1",
      "args0": [
        {
          "type": "field_react_component",
          "name": "FIELD",
          "text": "Click me"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
    });
    this.setStyle('loop_blocks');
  }
};

Blockly.Blocks['test_react_date_field'] = {
  init: function () {
    this.jsonInit({
      "type": "test_react_date_field",
      "message0": "date field: %1",
      "args0": [
        {
          "type": "field_date",
          "name": "DATE",
          "date": "2020-02-20"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
    });
    this.setStyle('loop_blocks');
  }
}

Blockly.Blocks['screencap_field'] = {
  init: function () {
    this.jsonInit({
      "type": "screencap_field",
      "message0": "アンドロイドのスクリーンショットを取得",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['sleep_field'] = {
  init: function () {
    this.jsonInit({
      "type": "sleep_field",
      "message0": "%1 秒間停止",
      "args0": [
        {
          "type": "field_number",
          "name": "NAME",
          "value": 3
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['image_serializable_field'] = {
  init: function () {
    this.jsonInit({
      "type": "image_serializable_field",
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "field_image_serializable",
          "name": "IMG",
          "text": null,
          "width": 21,
          "height": 21,
        },
        {
          "type": "field_label_serializable",
          "name": "NAME",
          "text": "data1"
        },
        {
          "type": "field_none_display",
          "name": "PATH",
          "text": "ccc"
        }
      ],
      "output": "aapoImg",
      "colour": 65,
    });
  }
};

Blockly.Blocks['image_touchscreen_field1'] = {
  init: function () {
    this.jsonInit({
      "type": "image_touchscreen_field1",
      "message0": "%1 この画像が画面にあればタップ",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME",
          "check": "aapoImg"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['image_touchscreen_field2'] = {
  init: function () {
    this.jsonInit({
      "type": "image_touchscreen_field2",
      "message0": "%1 この画像が画面にあるか？",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME",
          "check": "aapoImg"
        }
      ],
      "output": "Boolean",
      "colour": 65,
    });
  }
};

Blockly.Blocks['tap_touchscreen_field'] = {
  init: function () {
    this.jsonInit({
      "type": "tap_touchscreen_field",
      "message0": "X= %1 Y= %2 をタップ",
      "args0": [
        {
          "type": "field_number",
          "name": "X",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "Y",
          "value": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['longtap_touchscreen_field'] = {
  init: function () {
    this.jsonInit({
      "type": "longtap_touchscreen_field",
      "message0": "X= %1 Y= %2 を %3 秒間タップ",
      "args0": [
        {
          "type": "field_number",
          "name": "X",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "Y",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "TIME",
          "value": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['swipe_touchscreen_field'] = {
  init: function () {
    this.jsonInit({
      "type": "swipe_touchscreen_field",
      "message0": "X= %1 Y= %2 から X= %3 Y= %4 までを %5 秒間かけてスワイプ",
      "args0": [
        {
          "type": "field_number",
          "name": "SX",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "SY",
          "value": 0
        },{
          "type": "field_number",
          "name": "EX",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "EY",
          "value": 0
        },
        {
          "type": "field_number",
          "name": "TIME",
          "value": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['input_text_field'] = {
  init: function () {
    this.jsonInit({
      "type": "input_text_field",
      "message0": "%1 この文字をアンドロイドに送る【日本語不可】",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['input_keyevent_field'] = {
  init: function () {
    this.jsonInit({
      "type": "input_keyevent_field",
      "message0": "%1 ボタンを押す",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "NAME",
          "options": [
            ["ホーム", "3"],
            ["戻る", "4"],
            ["電源", "26"],
            ["カメラ", "27"],
            ["メニュー", "82"],
            ["大音量", "24"],
            ["小音量", "25"],
            ["ミュート", "164"],
            ["設定", "176"],
            ["アプリ", "187"],
            ["スクリーンショット", "120"],
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['image_save_field'] = {
  init: function () {
    this.jsonInit({
      "type": "image_save_field",
      "message0": "PCにスクリーンショット画像を保存",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['app_start_field'] = {
  init: function () {
    this.jsonInit({
      "type": "app_start_field",
      "message0": "アプリを起動する %1 ・パッケージ名 %2 ・クラス名 %3",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "PACKAGE_NAME",
          "check": "String"
        },
        {
          "type": "input_value",
          "name": "CLASS_NAME",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};

Blockly.Blocks['app_end_field'] = {
  init: function () {
    this.jsonInit({
      "type": "app_end_field",
      "message0": "アプリを終了する %1 ・パッケージ名 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "PACKAGE_NAME",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 65,
    });
  }
};
