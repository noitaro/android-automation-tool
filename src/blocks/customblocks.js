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
          "type": "input_value",
          "name": "NAME",
          "check": "Number"
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
      "tooltip": "",
      "helpUrl": ""
    });
  }
};
