import React from 'react';

const Modal = ({ isOpen, onClose, classDetails }) => {
    if (!isOpen) {
      return null;
    }
  
    return (
      <div className="modal">
        <div className="modal-content">
          {/* Display the class details */}
          <h3>{classDetails.name}</h3>
          <p>{classDetails.description}</p>
          <p>{classDetails.syllabus}</p>
          {/* Other class details */}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };

export default Modal;
