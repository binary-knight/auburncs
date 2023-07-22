import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import './ClassList.css';
import VoteModal from './VoteModal';
import BreakdownModal from './BreakdownModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

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
  const [breakdownClass, setBreakdownClass] = useState(null);

  useEffect(() => {
    console.log('voteModalIsOpen changed:', voteModalIsOpen);
  }, [voteModalIsOpen]);
  

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_ROUTE}/classes`)
      .then(response => response.json())
      .then(data => setClasses(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const mapDifficultyToRating = (difficulty) => {
    if (difficulty === 0) return { grade: 'No Data', class: 'no-data' };
    if (difficulty <= 1.5) return { grade: 'Very Easy', class: 'gradeA' };
    if (difficulty <= 2.5) return { grade: 'Easy', class: 'gradeB' };
    if (difficulty <= 3.5) return { grade: 'Moderate', class: 'gradeC' };
    if (difficulty <= 4.5) return { grade: 'Difficult', class: 'gradeD' };
    return { grade: 'Very Difficult', class: 'gradeF' };
  }
  
  const mapQualityToRating = (quality) => {
    if (quality === 0) return { grade: 'No Data', class: 'no-data' };
    if (quality <= 1.5) return { grade: 'Poor', class: 'gradeF' };
    if (quality <= 2.5) return { grade: 'Fair', class: 'gradeD' };
    if (quality <= 3.5) return { grade: 'Average', class: 'gradeC' };
    if (quality <= 4.5) return { grade: 'Good', class: 'gradeB' };
    return { grade: 'Excellent', class: 'gradeA' };
  }
  
  const mapHPWToRating = (hpw) => {
    if (hpw === 0) return { grade: 'No Data', class: 'no-data' };
    if (hpw <= 1) return { grade: 'Low', class: 'gradeA' };
    if (hpw <= 2) return { grade: 'Moderate', class: 'gradeC' };
    if (hpw <= 3) return { grade: 'High', class: 'gradeD' };
    return { grade: 'Extreme', class: 'gradeF' };
  }
  
  const renderClassStats = (cls) => {
    const roundedDifficulty = roundToNearestTenth(cls.difficulty);
    const roundedQuality = roundToNearestTenth(cls.quality);
    const roundedHPW = roundToNearestTenth(cls.hpw);
  
    const difficultyRating = mapDifficultyToRating(roundedDifficulty);
    const qualityRating = mapQualityToRating(roundedQuality);
    const hpwRating = mapHPWToRating(roundedHPW);
  
    return (
      <div className="class-stats">
        <span className="stats">
          {cls.name} - 
          Difficulty: <span className={difficultyRating.class}>{difficultyRating.grade}</span>, 
          Quality: <span className={qualityRating.class}>{qualityRating.grade}</span>, 
          HPW: <span className={hpwRating.class}>{hpwRating.grade}</span>, Reviews: {cls.votes}
        </span>
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

  // Map HPW to correct range
  let hpw;
  switch(vote.hpw) {
    case "1-10":
      hpw = 1;
      break;
    case "10-20":
      hpw = 2;
      break;
    case "20-30":
      hpw = 3;
      break;
    default:
      hpw = 4;
  }

  // Create the data object to send in the request
  const data = {
    difficulty: parseInt(vote.difficulty),
    quality: parseInt(vote.quality),
    hpw: hpw,
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
        toast.error('Invalid review parameters. Quality and Difficulty must be between 1-5, and HPW must be a string representation of a range.');
      } else {
        console.error('Error:', error);
      }
    });
};



const handleReviewBreakdown = async (classId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const cls = response.data;
    if (cls.votes > 0) {
      setBreakdownClass(cls);
    } else {
      toast.error('No data available for this class.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
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

  const coreClasses = classes.filter(cls => cls.elective === 0);
  const electiveClasses = classes.filter(cls => cls.elective === 1);

  return (
    <div className="class-list-container">
      <div className="class-reviews">
        <div className="review-container">
          <div className="review-header">
            <h2>Class Reviews</h2>
            <input
              type="text"
              placeholder="Search classes"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <Link to="/grade" className="review-note">
              Click for Grading Explanation
          </Link>
        </div>
      </div>
  
      <h3 className="core-classes-title">Core Class Averages</h3>
      <div className="class-items-container">
        {coreClasses.filter(cls => cls.name.toLowerCase().startsWith(searchInput.toLowerCase())).map(cls => (
          editingClassId === cls.id ? (
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
                <button onClick={() => handleReviewBreakdown(cls.id)}>Review Breakdown</button>
              </div>
            </div>
          )
        ))}
      </div>

        <h3><center>Elective Class Average</center></h3>
        <div className="class-items-container">
          {electiveClasses.filter(cls => cls.name.toLowerCase().startsWith(searchInput.toLowerCase())).map(cls => (
            editingClassId === cls.id ? (
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
                  <button onClick={() => handleReviewBreakdown(cls.id)}>Review Breakdown</button>
                </div>
              </div>
            )
          ))}
        </div>

        {breakdownClass && (
          <BreakdownModal 
            isOpen={!!breakdownClass} 
            onClose={() => setBreakdownClass(null)} 
            classId={breakdownClass.id} 
            token={token} 
          />
        )}
  
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
  const [updatedClass, setUpdatedClass] = useState({ ...cls, syllabus: cls.syllabus, description: cls.description, elective: cls.elective });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClass(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setUpdatedClass(prevState => ({
      ...prevState,
      [name]: checked ? 1 : 0
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
      <label>
        Elective:
        <input type="checkbox" name="elective" checked={updatedClass.elective === 1} onChange={handleCheckboxChange} />
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};;


export default ClassList;

