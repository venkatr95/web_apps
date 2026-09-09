import React from 'react';
import './ModalDialog.css';

interface ModalDialogProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isSuccess?: boolean;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  show,
  onClose,
  title,
  message,
  isSuccess = true,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className={`modal-title ${isSuccess ? 'success' : 'error'}`}>{title}</h2>
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="modal-close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalDialog;
