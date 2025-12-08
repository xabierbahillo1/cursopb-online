import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, message, type = "info", onConfirm, confirmText = "Aceptar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className={`modal-content modal-${type}`}>
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                    <X size={20} />
                </button>
                
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                
                <div className="modal-footer">
                    {onConfirm ? (
                        <>
                            <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                                {cancelText}
                            </button>
                            <button className="modal-btn modal-btn-primary" onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button className="modal-btn modal-btn-primary" onClick={onClose}>
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};