import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { BsPencil, BsX } from 'react-icons/bs';
import './ClassList.css';

const roundToNearestTenth = (value) => {
  return Math.round(value * 10) / 10;
};


const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    difficulty: '',
    quality: '',
    hpw: ''
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetch('https://dev.auburnonlinecs.com:3000/classes')
      .then(response => response.json())
      .then(data => setClasses(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const renderClassStats = (cls) => {
    const roundedDifficulty = roundToNearestTenth(cls.difficulty);
    const roundedQuality = roundToNearestTenth(cls.quality);
    const roundedHPW = roundToNearestTenth(cls.hpw);

    return (
      <>
        {cls.name} - Difficulty: {roundedDifficulty.toFixed(1)}, Quality: {roundedQuality.toFixed(1)}, HPW: {roundedHPW.toFixed(1)}
      </>
    );
  };

  const handleViewDetails = async (classId) => {
    try {
      const response = await fetch(`https://dev.auburnonlinecs.com:3000/classes/${classId}/details`);
      if (response.ok) {
        const classDetails = await response.json();
        setSelectedClass(classDetails);
        setModalIsOpen(true);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleVote = (classId) => {
    const userDifficulty = prompt('Enter Difficulty:');
    const userQuality = prompt('Enter Quality:');
    const userHPW = prompt('Enter HPW:');

    // Make an API call to update the class with the user's vote
    fetch(`https://dev.auburnonlinecs.com:3000/classes/${classId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        difficulty: parseInt(userDifficulty),
        quality: parseInt(userQuality),
        hpw: parseInt(userHPW)
      })
    })
      .then(response => {
        if (response.ok) {
          // Vote added successfully
          console.log('Vote added successfully');
          fetchClassList(); // Fetch the updated class list
        } else {
          console.error('Error:', response.status);
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleClearStats = (classId) => {
    const confirmClearStats = window.confirm('Are you sure you want to clear the stats of this class?');
    if (confirmClearStats) {
      fetch(`https://dev.auburnonlinecs.com:3000/classes/${classId}/clear-stats`, {
        method: 'PUT',
      })
        .then(response => {
          if (response.ok) {
            // Stats cleared successfully
            // Fetch the updated class list
            fetchClassList();
          } else {
            console.error('Error:', response.status);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const handleDeleteClass = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this class?');
    if (confirmDelete) {
      fetch(`https://dev.auburnonlinecs.com:3000/classes/${id}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (response.ok) {
            // Class deleted successfully
            setClasses(prevClasses => prevClasses.filter(cls => cls.id !== id));
          } else {
            console.error('Error:', response.status);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const handleEdit = (classId) => {
    setEditingClassId(classId);
  };

  const handleUpdate = (updatedClass) => {
    // Make an API call to update the class with the updated data
    fetch(`https://dev.auburnonlinecs.com:3000/classes/${updatedClass.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedClass)
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response as needed (e.g., show a success message)
        console.log('Class updated successfully:', data);

        // Clear the editing state
        setEditingClassId(null);

        // Fetch the updated class list
        fetchClassList();
      })
      .catch(error => {
        // Handle the error (e.g., display an error message)
        console.error('Error updating class:', error);
      });
  };

  const handleAddClass = () => {
    // Make an API call to add the new class to the database
    fetch('https://dev.auburnonlinecs.com:3000/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClass)
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response as needed (e.g., show a success message)
        console.log('Class added successfully:', data);

        // Clear the new class form
        setNewClass({
          name: '',
          difficulty: '',
          quality: '',
          hpw: ''
        });

        // Fetch the updated class list
        fetchClassList();
      })
      .catch(error => {
        // Handle the error (e.g., display an error message)
        console.error('Error adding class:', error);
      });
  };

  const fetchClassList = () => {
    fetch('https://dev.auburnonlinecs.com:3000/classes')
      .then(response => response.json())
      .then(data => setClasses(data))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="class-list-container">
      <h2>Class List</h2>
      <ul>
        {classes.map(cls => (
          <li key={cls.id}>
            {editingClassId === cls.id ? (
              <ClassEditForm
                cls={cls}
                handleUpdate={handleUpdate}
                onCancel={() => setEditingClassId(null)}
              />
            ) : (
              <div className="class-item">
                {renderClassStats(cls)}
                <div className="button-container">
                  <BsPencil onClick={() => handleEdit(cls.id)} />
                  <button onClick={() => handleDeleteClass(cls.id)}>
                    <BsX className="delete-icon" />
                  </button>
                  <button onClick={() => handleVote(cls.id)}>Vote</button>
                  <button onClick={() => handleClearStats(cls.id)}>Clear Stats</button>
                  <button onClick={() => handleViewDetails(cls.id)}>View Details</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

          {/* Modal component */}
    {selectedClass && (
      <div className="modal">
        <div className="modal-content">
          <h3>{selectedClass.name}</h3>
          <p>Quality: {selectedClass.quality}</p>
          <p>HPW: {selectedClass.hpw}</p>
          <p>Difficulty: {selectedClass.difficulty}</p>
          {/* Other class details */}
          <button onClick={() => setSelectedClass(null)}>Close</button>
        </div>
      </div>
    )}
    
      <h2>Add Class</h2>
      <form onSubmit={handleAddClass}>
        <input
          type="text"
          name="name"
          placeholder="Class Name"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
        />
        <input
          type="number"
          name="difficulty"
          placeholder="Difficulty"
          value={newClass.difficulty}
          onChange={(e) => setNewClass({ ...newClass, difficulty: e.target.value })}
        />
        <input
          type="number"
          name="quality"
          placeholder="Quality"
          value={newClass.quality}
          onChange={(e) => setNewClass({ ...newClass, quality: e.target.value })}
        />
        <input
          type="number"
          name="hpw"
          placeholder="HPW"
          value={newClass.hpw}
          onChange={(e) => setNewClass({ ...newClass, hpw: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

const ClassEditForm = ({ cls, handleUpdate, onCancel }) => {
  const [updatedClass, setUpdatedClass] = useState({ ...cls });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClass(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate(updatedClass);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={updatedClass.name} onChange={handleChange} />
      <input type="number" name="difficulty" value={updatedClass.difficulty} onChange={handleChange} />
      <input type="number" name="quality" value={updatedClass.quality} onChange={handleChange} />
      <input type="number" name="hpw" value={updatedClass.hpw} onChange={handleChange} />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};


export default ClassList;

