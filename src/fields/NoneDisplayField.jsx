import React from 'react';
import * as Blockly from 'blockly/core';

import BlocklyReactField from './BlocklyReactField';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


class NoneDisplayField extends Blockly.FieldLabel {

  SERIALIZABLE = true

  constructor(text) {
    super(text);
  }

  static fromJson(options) {
    return new this(options['text']);
  }

  render_() {
    return null;
  }
}

Blockly.fieldRegistry.register('field_none_display', NoneDisplayField);

export default NoneDisplayField;
