import React from 'react';
import * as Blockly from 'blockly/core';

import BlocklyReactField from './BlocklyReactField';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


class ImageSerializableField extends Blockly.FieldImage {

  SERIALIZABLE = true

  constructor(text, width, height) {
    super(text, width, height);
  }

  static fromJson(options) {
    return new this(options['text'], options['width'], options['height']);
  }
}

Blockly.fieldRegistry.register('field_image_serializable', ImageSerializableField);

export default ImageSerializableField;
