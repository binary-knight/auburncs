import React, { useEffect, useState } from 'react';
import { DifficultyChart, QualityChart, HPWChart, GradeChart } from './chart.js';
import './BreakdownModal.css'
import axios from 'axios';

const BreakdownModal = ({ isOpen, onClose, classId, token }) => {
  const [className, setClassName] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setClassName(response.data.name);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [classId, token]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="breakdown-modal" onClick={onClose}>
      <div className="breakdown-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{className} Breakdown</h2>
        <div className="chart-container">
          <h3>Difficulty</h3>
          <DifficultyChart classId={classId} token={token} />
        </div>
        <div className="chart-container">
          <h3>Quality</h3>
          <QualityChart classId={classId} token={token} />
        </div>
        <div className="chart-container">
          <h3>Hours per Week</h3>
          <HPWChart classId={classId} token={token} />
        </div>
        <div className="chart-container">
          <h3>Grade Recieved</h3>
          <GradeChart classId={classId} token={token} />
        </div>
      </div>
    </div>
  );
};

export default BreakdownModal;



