import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import './ClassList.css';
import VoteModal from './VoteModal';
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
  const [voteModalIsOpen, setVoteModalIsOpen] = useState(false);
  const [votingClass, setVotingClass] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    console.log('voteModalIsOpen changed:', voteModalIsOpen);
  }, [voteModalIsOpen]);
  

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_ROUTE}/classes`)
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
          {cls.name} - Difficulty: {roundedDifficulty.toFixed(1)}, Quality: {roundedQuality.toFixed(1)}, HPW: {roundedHPW.toFixed(1)}, Reviews: {cls.votes}
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
      const response = await fetch(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/details`);
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
    console.log('handleVote called');  // Log statement for debugging
    // Find the class that is being voted on
    const cls = classes.find(cls => cls.id === classId);
  
    // Save the class to state
    setVotingClass(cls);
  
    // Open the voting modal
    setVoteModalIsOpen(true);
};

const handleVoteSubmit = (vote) => {

  // Create the Axios configuration for the request
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Create the data object to send in the request
  const data = {
    difficulty: parseInt(vote.difficulty),
    quality: parseInt(vote.quality),
    hpw: parseInt(vote.hpw),
  };
  
    // Make an API call to update the class with the user's vote
    axios
      .post(`${process.env.REACT_APP_API_ROUTE}/classes/${votingClass.id}/vote`, data, config)
      .then((response) => {
        // Vote added successfully
        toast.success('Review added successfully');
        fetchClassList(); // Fetch the updated class list
        setVoteModalIsOpen(false); // Close the vote modal
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
      axios.put(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/clear-stats`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.status === 200) {
            // Stats cleared successfully
            toast.success('Class stats reset successfully.');
            // Fetch the updated class list
            fetchClassList();
          } else {
            toast.error('Error:', response.status);
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
      return { score: 'No data yet', class: 'no-data', color: 'gray' };
    }
  
    // Assign scores to different difficulty and hpw ranges
    const difficultyScore = difficulty < 2 ? 1 : difficulty < 3 ? 2 : difficulty < 4 ? 3 : 4;
    const hpwScore = hpw < 5 ? 1 : hpw < 10 ? 2 : hpw < 15 ? 3 : 4;
  
    // Determine the class based on the scores
    let scoreClasses = {};

    const difficultyDescriptors = ['Very easy', 'Easy', 'Moderate', 'Difficult', 'Very difficult'];
    const timeDescriptors = ['minimal', 'low', 'moderate', 'high', 'very high'];
    const colors = ['green', 'lightgreen', 'yellow', 'orange', 'red'];

    for(let i=1; i<=5; i++) {
        for(let j=1; j<=5; j++) {
            let score = `${difficultyDescriptors[i-1]} difficulty with a ${timeDescriptors[j-1]} time commitment`;
            let classLabel = `class-${i}-${j}`;
            let color = colors[Math.max(i, j) - 1];

            scoreClasses[`${i}-${j}`] = { score: score, class: classLabel, color: color };
        }
    }

    const key = `${difficultyScore}-${hpwScore}`;

    return scoreClasses[key];
}
    
  const handleDeleteClass = (id, token) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this class ${id}?`);
    if (confirmDelete) {
      axios.delete(`${process.env.REACT_APP_API_ROUTE}/classes/${id}`, {
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
        const response = await axios.put(`${process.env.REACT_APP_API_ROUTE}/classes/${updatedClass.id}`, 
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
      const response = await axios.post(`${process.env.REACT_APP_API_ROUTE}/classes`, newClass, {
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
      const response = await axios.get(`${process.env.REACT_APP_API_ROUTE}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  return (
    <div className="class-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>Classes &nbsp;&nbsp;&nbsp;</h2>
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            * Reviews are from 1 (Lowest) to 5 (Highest). HPW is estimated Hours Per Week a student spent on the class.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search classes"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
      </div>
      <ul>
        {classes.filter(cls => cls.name.toLowerCase().startsWith(searchInput.toLowerCase())).map(cls => (
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
      {/* Modal component for voting */}
      {votingClass && (
        <VoteModal 
          isOpen={voteModalIsOpen} 
          votingClass={votingClass} 
          onSubmit={handleVoteSubmit} 
          onClose={() => setVoteModalIsOpen(false)} 
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

