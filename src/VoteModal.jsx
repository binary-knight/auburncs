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
                <h2>Review {votingClass.name}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="number" name="difficulty" placeholder="Difficulty" value={vote.difficulty} onChange={handleChange} />
                    <input type="number" name="quality" placeholder="Quality" value={vote.quality} onChange={handleChange} />
                    <input type="number" name="hpw" placeholder="Hours Per Week" value={vote.hpw} onChange={handleChange} />
                    <button type="submit">Submit Review</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
}
  
  export default VoteModal;
  