const BreakdownModal = ({ isOpen, onClose, classId, token }) => {
    if (!isOpen) {
      return null;
    }
  
    return (
      <div className="breakdown-modal" onClick={onClose}>
        <div className="breakdown-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>X</button>
          <h2>Class {classId} Breakdown</h2>
          <div>
            <h3>Difficulty</h3>
            <DifficultyChart classId={classId} token={token} />
          </div>
          <div>
            <h3>Quality</h3>
            <QualityChart classId={classId} token={token} />
          </div>
          <div>
            <h3>Hours per Week</h3>
            <HPWChart classId={classId} token={token} />
          </div>
        </div>
      </div>
    );
  };

