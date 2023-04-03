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
 * @fileoverview Blockly React Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import React from 'react';
import './BlocklyComponent.css';

import Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import locale from 'blockly/msg/ja';
import 'blockly/blocks';

Blockly.setLocale(locale);

export interface BlocklyComponentHandles {
  getWorkspace(): any;
}

export const BlocklyComponent = React.forwardRef((props: any, ref) => {
  const { initialXml, children, setCode, ...rest } = props;

  const blocklyDiv = React.useRef<any>();
  const toolbox = React.useRef<any>();
  const primaryWorkspace = React.useRef<any>();

  const didLogRef = React.useRef(false);
  React.useEffect(() => {
    // In this case, whether we are mounting or remounting,
    // we use a ref so that we only log an impression once.
    if (didLogRef.current == false) {
      didLogRef.current = true;

      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, { toolbox: toolbox.current, ...rest },);
      primaryWorkspace.current.addChangeListener(() => {
        javascriptGenerator.STATEMENT_PREFIX = null;
        const code: string = javascriptGenerator.workspaceToCode(primaryWorkspace.current);
        setCode(code);
      });
    }
  });

  React.useEffect(() => {
    if (initialXml != null && initialXml != '') {
      const dom = Blockly.Xml.textToDom(initialXml);
      Blockly.Xml.domToWorkspace(dom, primaryWorkspace.current);
    }
  }, [initialXml]);

  React.useImperativeHandle(ref, () => ({
    getWorkspace() {
      return primaryWorkspace.current;
    },
  }));

  return (
    <React.Fragment>
      <div ref={blocklyDiv} id="blocklyDiv" />
      <div style={{ display: 'none' }} ref={toolbox}>
        {props.children}
      </div>
    </React.Fragment>);
});
