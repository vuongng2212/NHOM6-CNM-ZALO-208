import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDialog = ({ show, handleClose, handleConfirm }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Join Meeting</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to join this meeting?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Join
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;