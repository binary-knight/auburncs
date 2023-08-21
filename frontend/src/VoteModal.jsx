import React, { useState } from 'react';
import './VoteModal.css';

const VoteModal = ({ isOpen, votingClass, onSubmit, onClose }) => {
  const [vote, setVote] = useState({
    difficulty: '',
    quality: '',
    hpw: '',
    grade: ''
  });

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);

    if (name === 'grade') {
      const gradeMapping = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1, 'DNF': 7 };
      setVote(prevVote => ({
        ...prevVote,
        [name]: gradeMapping[value]
      }));
    } else {
      setVote(prevVote => ({
        ...prevVote,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(vote);  // pass the vote state
  };

  return (
    <div className="vote-modal">
      <div className="vote-modal-content">
        <span className="vote-modal-close" onClick={onClose}>&times;</span>
        <h2>Review: {votingClass.name}</h2>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Difficulty</legend>
            <label>
              <input type="radio" value="1" name="difficulty" onChange={handleChange} required /> Very Easy
            </label>
            <label>
              <input type="radio" value="2" name="difficulty" onChange={handleChange} required /> Easy
            </label>
            <label>
              <input type="radio" value="3" name="difficulty" onChange={handleChange} required /> Moderate
            </label>
            <label>
              <input type="radio" value="4" name="difficulty" onChange={handleChange} required /> Difficult
            </label>
            <label>
              <input type="radio" value="5" name="difficulty" onChange={handleChange} required /> Very Difficult
            </label>
          </fieldset>

          <fieldset>
            <legend>Quality</legend>
            <label>
              <input type="radio" value="1" name="quality" onChange={handleChange} required /> Poor
            </label>
            <label>
              <input type="radio" value="2" name="quality" onChange={handleChange} required /> Fair
            </label>
            <label>
              <input type="radio" value="3" name="quality" onChange={handleChange} required /> Average
            </label>
            <label>
              <input type="radio" value="4" name="quality" onChange={handleChange} required /> Good
            </label>
            <label>
              <input type="radio" value="5" name="quality" onChange={handleChange} required /> Excellent
            </label>
          </fieldset>

          <fieldset>
            <legend>Hours Per Week</legend>
            <label>
              <input type="radio" value="1" name="hpw" onChange={handleChange} required /> 1-10
            </label>
            <label>
              <input type="radio" value="2" name="hpw" onChange={handleChange} required /> 10-20
            </label>
            <label>
              <input type="radio" value="3" name="hpw" onChange={handleChange} required /> 20-30
            </label>
            <label>
              <input type="radio" value="4" name="hpw" onChange={handleChange} required /> 30+
            </label>
          </fieldset>

          <fieldset>
            <legend>Grade Recieved</legend>
            <label>
              <input type="radio" value="A" name="grade" onChange={handleChange} required /> A
            </label>
            <label>
              <input type="radio" value="B" name="grade" onChange={handleChange} required /> B
            </label>
            <label>
              <input type="radio" value="C" name="grade" onChange={handleChange} required /> C
            </label>
            <label>
              <input type="radio" value="D" name="grade" onChange={handleChange} required /> D
            </label>
            <label>
              <input type="radio" value="F" name="grade" onChange={handleChange} required /> F
            </label>
            <label>
              <input type="radio" value="DNF" name="grade" onChange={handleChange} required /> Did Not Finish/Do Not Record
            </label>
          </fieldset>

          <button type="submit">Submit Review</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default VoteModal;


  