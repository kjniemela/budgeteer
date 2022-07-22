import React from 'react';

import Modal from './Modal.jsx';

const Alert = ({ callback, children }) => (
    <Modal>
        <div className="stack">
            <h2>OBS!</h2>
            {children}
            <button className="solidBtn" onClick={callback}>
                Ok
            </button>
        </div>
    </Modal>
);

export default Alert;