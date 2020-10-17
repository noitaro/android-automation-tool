Blockly.Blocks['screen_capture'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("アンドロイドのスクリーンショットを撮影");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
  }
};
Blockly.JavaScript['screen_capture'] = function (block) {
  var code = 'AdbScreenCapture();\n';
  return code;
};

Blockly.Blocks['tap'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck(null)
      .appendField("スクリーンショット内をタップ");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
  }
};
Blockly.JavaScript['tap'] = function (block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE);
  var code = 'AdbTap(' + value_name + ');\n';
  return code;
};

Blockly.Blocks['field_image_serializable'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldImageSerializable('data1'), 'FIELDNAME')
      .appendField(new Blockly.FieldTextInput("default"), "NAME");
    this.setOutput(true, null);
    this.setColour(65);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['field_image_serializable'] = function (block) {
  var name = block.getFieldValue('FIELDNAME');
  var code = '"' + name + '"';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['sleep'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(3, 0), "NAME")
        .appendField("秒間停止します");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
Blockly.JavaScript['sleep'] = function(block) {
  var number_name = block.getFieldValue('NAME');
  var code = 'AdbSleep(' + number_name + ');\n';
  return code;
};