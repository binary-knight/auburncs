import React from 'react';
import { Link } from 'react-router-dom';
import './Grade.css';
import './ClassList';

const Grade = () => {
  return (
    <div className="grade-explanation">
      <h1>Grade Explanation</h1>
      <h2>Difficulty</h2>
      <p>Difficulty is rated from Very Easy to Very Difficult:</p>
      <ul>
        <li><span className="gradeA">Very Easy</span> (1.0 -  2.0)</li>
        <li><span className="gradeB">Easy</span> (2.0 -  3.0)</li>
        <li><span className="gradeC">Moderate</span> (3.0 -  4.0)</li>
        <li><span className="gradeD">Difficult</span> (4.0 -  5.0)</li>
        <li><span className="gradeF">Very Difficult</span> (5.0)</li>
      </ul>
      
      <h2>Quality</h2>
      <p>Quality is rated from Poor to Excellent:</p>
      <ul>
        <li><span className="gradeF">Poor</span> (1.0 - 2.0)</li>
        <li><span className="gradeD">Fair</span> (2.0 - 3.0)</li>
        <li><span className="gradeC">Average</span> (3.0 - 4.0)</li>
        <li><span className="gradeB">Good</span> (4.0 - 5.0)</li>
        <li><span className="gradeA">Excellent</span> (5.0)</li>
      </ul>
      
      <h2>Hours Per Week (HPW)</h2>
      <p>HPW is rated from Low to Extreme:</p>
      <ul>
        <li><span className="gradeA">Low</span> (1-10 hours)</li>
        <li><span className="gradeC">Moderate</span> (10-20 hours)</li>
        <li><span className="gradeD">High</span> (20-30 hours)</li>
        <li><span className="gradeF">Extreme</span> (30+ hours)</li>
      </ul>

      <Link to="/classlist">Back to Class List</Link>
    </div>
  );
};

export default Grade;
