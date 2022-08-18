import React from 'react';

const SolidBtn = (props) => (
  <button {...{...props}} className={'btn solidBtn ' + (props.className ?? '')}>{props.children}</button>
);

export default SolidBtn;