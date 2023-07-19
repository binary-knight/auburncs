import React, { useState } from 'react';
import './VoteModal.css';

const VoteModal = ({ isOpen, votingClass, onSubmit, onClose }) => {
    const [vote, setVote] = useState({
      difficulty: '',
      quality: '',
      hpw: ''
    });
  
    if (!isOpen) {
      return null;
    }
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Changing ${name} to ${value}`);
        setVote(prevVote => ({
          ...prevVote,
          [name]: value
        }));
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
                            <input type="radio" value="1" name="difficulty" onChange={handleChange} /> Very Easy
                        </label>
                        <label>
                            <input type="radio" value="2" name="difficulty" onChange={handleChange} /> Easy
                        </label>
                        <label>
                            <input type="radio" value="3" name="difficulty" onChange={handleChange} /> Moderate
                        </label>
                        <label>
                            <input type="radio" value="4" name="difficulty" onChange={handleChange} /> Difficult
                        </label>
                        <label>
                            <input type="radio" value="5" name="difficulty" onChange={handleChange} /> Very Difficult
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend>Quality</legend>
                        <label>
                            <input type="radio" value="1" name="quality" onChange={handleChange} /> Poor
                        </label>
                        <label>
                            <input type="radio" value="2" name="quality" onChange={handleChange} /> Fair
                        </label>
                        <label>
                            <input type="radio" value="3" name="quality" onChange={handleChange} /> Average
                        </label>
                        <label>
                            <input type="radio" value="4" name="quality" onChange={handleChange} /> Good
                        </label>
                        <label>
                            <input type="radio" value="5" name="quality" onChange={handleChange} /> Excellent
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend>Hours Per Week</legend>
                        <label>
                            <input type="radio" value="1" name="hpw" onChange={handleChange} /> 1-10
                        </label>
                        <label>
                            <input type="radio" value="2" name="hpw" onChange={handleChange} /> 10-20
                        </label>
                        <label>
                            <input type="radio" value="3" name="hpw" onChange={handleChange} /> 20-30
                        </label>
                        <label>
                            <input type="radio" value="4" name="hpw" onChange={handleChange} /> 30+
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

  