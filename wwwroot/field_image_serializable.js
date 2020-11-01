'use strict';

require('google-closure-library');

goog.provide('Blockly.FieldImageSerializable');

goog.require('Blockly.FieldImage');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');

Blockly.FieldImageSerializable = function (opt_value) {
  let image = indexViewModel.getImage(opt_value);
  Blockly.FieldImageSerializable.superClass_.constructor.call(this, opt_value, image.width, image.height);
};
Blockly.utils.object.inherits(Blockly.FieldImageSerializable, Blockly.FieldImage);

Blockly.FieldImageSerializable.fromJson = function (options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldImageSerializable(text, undefined, options);
};

Blockly.FieldImageSerializable.prototype.initView = function () {
  let image = indexViewModel.images().find(x => x.name == this.value_);
  if (image == null) {
    image = {'src': 'data:image/png;base64,'};
  }

  this.imageElement_ = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.IMAGE,
    {
      'height': this.imageHeight_ + 'px',
      'width': this.size_.width + 'px',
      'alt': this.altText_
    },
    this.fieldGroup_);
  this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
    'xlink:href', /** @type {string} */(image.src));

  if (this.clickHandler_) {
    this.imageElement_.style.cursor = 'pointer';
  }  
};

Blockly.FieldImageSerializable.prototype.EDITABLE = false;
Blockly.FieldImageSerializable.prototype.SERIALIZABLE = true;

Blockly.fieldRegistry.register('field_image_serializable', Blockly.FieldImageSerializable);
