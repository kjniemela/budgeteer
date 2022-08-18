import React from 'react';

const TextBtn = (props) => (
  <button {...{...props}} className={'btn textBtn ' + (props.className ?? '')}>{props.children}</button>
);

export default TextBtn;