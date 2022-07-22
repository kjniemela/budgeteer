import React from 'react';

const Modal = ({ children }) => (
  <div className="modal">
    <div className="modalFrame">
      {children}
    </div>
  </div>
);

export default Modal;