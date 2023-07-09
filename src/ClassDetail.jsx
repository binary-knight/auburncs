import React from 'react';
import { useParams } from 'react-router-dom';

const ClassDetail = () => {
  const { id } = useParams();

  // Sample class data
  const classDetails = [
    { id: 1, title: 'Class 1', description: 'This is Class 1.' },
    { id: 2, title: 'Class 2', description: 'This is Class 2.' },
    { id: 3, title: 'Class 3', description: 'This is Class 3.' },
  ];

  const classItem = classDetails.find((classItem) => classItem.id === parseInt(id));

  if (!classItem) {
    return <div>Class not found</div>;
  }

  const { title, description } = classItem;

  return (
    <div className="class-detail">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default ClassDetail;
