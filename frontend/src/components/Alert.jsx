import React from 'react';

import Modal from './Modal.jsx';

const Alert = ({ title, callback, children, cancel, cancelCallback }) => (
  <Modal>
    <div className="stack centered">
      <h2>{title || 'OBS!'}</h2>
      {children}
      <div className="horizontalBtnField">
        <button className="solidBtn fullWidth" onClick={callback}>
          Ok
        </button>
        {cancel && (
          <button className="solidBtn errorBtn fullWidth" onClick={cancelCallback}>
            {cancel}
          </button>
        )}
      </div>
    </div>
  </Modal>
);

export default Alert;