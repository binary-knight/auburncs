import React from 'react';
import { Link } from 'react-router-dom';

const ClassList = () => {
  // Sample class data
  const classListings = [
    { id: 1, title: 'Class 1', description: 'This is Class 1.' },
    { id: 2, title: 'Class 2', description: 'This is Class 2.' },
    { id: 3, title: 'Class 3', description: 'This is Class 3.' },
  ];

  return (
    <div className="class-list">
      <h2>Class Listings</h2>
      <ul>
        {classListings.map((classItem) => (
          <li key={classItem.id}>
            <h3>{classItem.title}</h3>
            <p>{classItem.description}</p>
            <Link to={`/classes/${classItem.id}`}>View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassList;
