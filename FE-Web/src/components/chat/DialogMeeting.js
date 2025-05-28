import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';


// Component dialog cuộc gọi đến với chuông và hiển thị tên caller
const ConfirmDialog = ({ show, handleClose, handleConfirm, callerName }) => {
  // Lấy tên hiển thị: ưu tiên prop callerName, sau đó localStorage, rồi fallback
  const nameToShow =
    callerName || localStorage.getItem('userName') || 'Người dùng';

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center">
        {/* Chuông đổ khi có cuộc gọi */}
        <audio src="/ring.mp3" autoPlay loop />

        {/* Tiêu đề và thông báo
        <h5 className="mb-3">
          <i className="bi bi-bell-fill me-2"></i>
          {nameToShow} đang gọi cho bạn
        </h5> */}
        <p className="text-muted">Bạn có muốn tham gia cuộc gọi không?</p>

        {/* Nút chấp nhận / Từ chối */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="success" onClick={handleConfirm}>
            <i className="bi bi-telephone-fill me-1"></i>
            Chấp nhận
          </Button>
          <Button variant="danger" onClick={handleClose}>
            <i className="bi bi-telephone-x-fill me-1"></i>
            Từ chối
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDialog;
