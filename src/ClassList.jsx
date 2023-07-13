import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import './ClassList.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const roundToNearestTenth = (value) => {
  return Math.round(value * 10) / 10;
};


const ClassList = ({ isAdmin, token }) => {
  const [classes, setClasses] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    difficulty: '',
    quality: '',
    hpw: '',
    syllabus: "",
    description: ""
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
  
    const qualityGradeObject = getQualityGrade(cls.quality);
    const difficultyScoreObject = getDifficultyScore(cls.difficulty, cls.hpw);

    return (
      <div className="class-stats">
        <span className="stats">
          {cls.name} - Difficulty: {roundedDifficulty.toFixed(1)}, Quality: {roundedQuality.toFixed(1)}, HPW: {roundedHPW.toFixed(1)}
        </span>
        <div>
          <span className="quality-label">Quality Grade: </span>
          <span className={qualityGradeObject.class}>{qualityGradeObject.grade}</span>
        </div>
        <div>
          <span className="difficulty-label">Difficulty Score: </span>
          <span className={difficultyScoreObject.class}>{difficultyScoreObject.score}</span>
        </div>
      </div>
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

  const handleVote = (classId, difficulty, quality, hpw) => {
    let userDifficulty = parseInt(prompt('Enter Difficulty:'), 10);
    while (userDifficulty !== '' && (isNaN(userDifficulty) || userDifficulty < 1 || userDifficulty > 5)) {
      if (userDifficulty === null) {
        return; // Exit the function if the user clicks "Cancel"
      }
      alert('Invalid input. Difficulty must be between 1-5.');
      userDifficulty = parseInt(prompt('Enter Difficulty:'), 10);
    }
  
    let userQuality = parseInt(prompt('Enter Quality:'), 10);
    while (userQuality !== '' && (isNaN(userQuality) || userQuality < 1 || userQuality > 5)) {
      if (userQuality === null) {
        return; // Exit the function if the user clicks "Cancel"
      }
      alert('Invalid input. Quality must be between 1-5.');
      userQuality = parseInt(prompt('Enter Quality:'), 10);
    }
  
    let userHPW = parseInt(prompt('Enter HPW:'), 10);
    while (userHPW !== '' && (isNaN(userHPW) || userHPW < 1 || userHPW >= 40)) {
      if (userHPW === null) {
        return; // Exit the function if the user clicks "Cancel"
      }
      alert('Invalid input. HPW must be less than 40.');
      userHPW = parseInt(prompt('Enter HPW:'), 10);
    }
  
    // Create the Axios configuration for the request
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    // Create the data object to send in the request
    const data = {
      difficulty: userDifficulty,
      quality: userQuality,
      hpw: userHPW,
    };
  
    // Make an API call to update the class with the user's vote
    axios
      .post(`https://dev.auburnonlinecs.com:3000/classes/${classId}/vote`, data, config)
      .then((response) => {
        // Vote added successfully
        toast.success('Review added successfully');
        fetchClassList(); // Fetch the updated class list
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          // User has already voted for this class
          toast.error('You have already reviewed this class.');
        } else if (error.response && error.response.status === 405) {
          // Invalid review parameters
          toast.error('Invalid review parameters. Quality must be between 1-5, Difficulty must be between 1-5, and HPW must be less than 40.');
        } else {
          console.error('Error:', error);
        }
      });
  };
  

  const handleClearStats = (classId) => {
    const confirmClearStats = window.confirm('Are you sure you want to clear the stats of this class?');
    if (confirmClearStats) {
      axios.put(`https://dev.auburnonlinecs.com:3000/classes/${classId}/clear-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  function getQualityGrade(quality) {
    switch (Math.round(quality)) {
      case 5: return { grade: 'A', class: 'gradeA' };
      case 4: return { grade: 'B', class: 'gradeB' };
      case 3: return { grade: 'C', class: 'gradeC' };
      case 2: return { grade: 'D', class: 'gradeD' };
      case 1: return { grade: 'F', class: 'gradeF' };
      default: return { grade: 'No data', class: 'no-data' };
    }
  }
  

  function getDifficultyScore(difficulty, hpw) {
    // Check if the difficulty or hpw is null, undefined, or 0
    if (difficulty == null || difficulty === 0 || hpw == null || hpw === 0) {
      return { score: 'No data yet', class: 'no-data' };
    }
  
    const difficultyTier = difficulty < 2 ? 'low' : difficulty < 4 ? 'medium' : 'high';
    const hpwTier = hpw < 10 ? 'low' : hpw < 20 ? 'medium' : 'high';
  
    if (difficultyTier === 'high' && hpwTier === 'high') {
      return { score: 'Hard, extremely time consuming', class: 'hard' };
    } else if (difficultyTier === 'low' && hpwTier === 'low') {
      return { score: 'Easy, not time consuming', class: 'easy' };
    } else if (difficultyTier === 'high' && hpwTier === 'low') {
      return { score: 'Difficult, not time consuming', class: 'manageable' };
    } else if (difficultyTier === 'low' && hpwTier === 'high') {
      return { score: 'Easy, but time consuming', class: 'challenging' };
    } else if (difficultyTier === 'medium' && hpwTier === 'medium') {
      return { score: 'Moderate difficulty, moderate time commitment', class: 'moderate' };
    } else {
      return { score: 'Varied difficulty and time commitment', class: 'challenging' };
    }
  }

  const handleDeleteClass = (id, token) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this class ${id}?`);
    if (confirmDelete) {
      axios.delete(`https://dev.auburnonlinecs.com:3000/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        // Class deleted successfully
        setClasses(prevClasses => prevClasses.filter(cls => cls.id !== id));
        toast.success('Class deleted successfully', response.data);
      })
      .catch(error => {
        toast.error('Class Delete Error:', error);
      });
    }
  };
   
  const handleEdit = (classId) => {
    setEditingClassId(classId);
  };

  const handleUpdate = async (updatedClass) => {
    try {
        const response = await axios.put(`https://dev.auburnonlinecs.com:3000/classes/${updatedClass.id}`, 
            updatedClass, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        toast.success('Class updated successfully:', response.data);

        // Clear the editing state
        setEditingClassId(null);
  
        // Fetch the updated class list
        await fetchClassList();
    } catch (error) {
        // Handle the error (e.g., display an error message)
        toast.error('Error updating class:', error);
    }
};

  const handleAddClass = async (event) => {
    event.preventDefault();
    
    try {
      // Make an API call to add the new class to the database
      const response = await axios.post('https://dev.auburnonlinecs.com:3000/classes', newClass, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    
      toast.success('Class added successfully:', response.data);
    
      // Clear the new class form
      setNewClass({
        name: '',
        difficulty: '',
        quality: '',
        hpw: '',
        syllabus: '',
        description: ''
      });
    
      // Fetch the updated class list
      await fetchClassList();
    } catch (error) {
      toast.error('Error adding class:', error);
    }
  }
  

  const fetchClassList = async () => {
    try {
      const response = await axios.get('https://dev.auburnonlinecs.com:3000/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
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
                  {isAdmin && (
                    <>
                      <button onClick={() => handleDeleteClass(cls.id)}>Delete Class</button>
                      <button onClick={() => handleEdit(cls.id)}>Edit Class</button>
                      <button onClick={() => handleClearStats(cls.id)}>Clear Stats</button>
                    </>
                  )}
                  <button onClick={() => handleViewDetails(cls.id)}>View Details</button>
                  {token && <button onClick={() => handleVote(cls.id)}>Review</button>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
  
      {/* Modal component */}
      {selectedClass && (
        <Modal 
          isOpen={!!selectedClass} 
          onClose={() => setSelectedClass(null)} 
          classDetails={selectedClass}
        />
      )}
  
      {isAdmin && (
        <>
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
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newClass.description}
              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            />
            <input
              type="text"
              name="syllabus"
              placeholder="Syllabus"
              value={newClass.syllabus}
              onChange={(e) => setNewClass({ ...newClass, syllabus: e.target.value })}
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}
    </div>
  );
};

const ClassEditForm = ({ cls, handleUpdate, onCancel }) => {
  const [updatedClass, setUpdatedClass] = useState({ ...cls, syllabus: cls.syllabus, description: cls.description });

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
      <input type="text" name="description" value={updatedClass.description} onChange={handleChange} />
      <input type="text" name="syllabus" value={updatedClass.syllabus} onChange={handleChange} />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};


export default ClassList;

