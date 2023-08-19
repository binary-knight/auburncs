/**
 * This is the handler for all of the routes involving classes
 * All internal logic should be contained here
 */

// Logic for getting all classes
const handleGetAllClasses = async (req, res) => {
  console.log('Attempting to retrieve classes...');

  try {
    // Execute the MySQL query to retrieve all classes
    const [rows, fields] = await req.dbConnection.query('SELECT * FROM classes ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving classes:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Logic for getting a single class
const handleGetClassByID = async (req, res) => {
  console.log(`Received GET request for class ID ${req.params.id}`);

  const classId = req.params.id;

  try {
    // Perform the necessary logic to get the class from the database
    const [results] = await pool.query('SELECT * FROM classes WHERE id = ?', [classId]);

    if (results.length > 0) {
      // Class found, return it
      console.log(`Class ID ${classId} found successfully`);
      res.status(200).json(results[0]);
    } else {
      // Class not found
      console.log(`No class found with ID ${classId}`);
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Logic for deleting a class
const handleDeleteClass = async (req, res) => {
  console.log(`Received DELETE request for class ID ${req.params.id}`);

  const classId = req.params.id;

  try {
    // Perform the necessary logic to delete the class from the database
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [classId]);

    if (result.affectedRows > 0) {
      // Class deleted successfully
      console.log(`Class ID ${classId} deleted successfully`);
      res.sendStatus(204); // Send a 204 No Content response
    } else {
      // Class not found or no rows affected
      console.log(`No class found with ID ${classId}`);
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Logic for updating a class
const handleUpdateClass = async (req, res) => {
  const classId = req.params.id;
  const updatedClassData = req.body;

  try {
    // Perform the necessary logic to update the class in the database
    const [result] = await pool.query(
      'UPDATE classes SET name = ?, difficulty = ?, quality = ?, hpw = ?, description = ?, syllabus = ?, elective = ? WHERE id = ?',
      [
        updatedClassData.name,
        updatedClassData.difficulty,
        updatedClassData.quality,
        updatedClassData.hpw,
        updatedClassData.description,
        updatedClassData.syllabus,
        updatedClassData.elective,
        classId
      ]
    );

    if (result.affectedRows > 0) {
      // Class updated successfully
      res.json(updatedClassData);
    } else {
      // Class not found or no rows affected
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Logic for adding a new class
const handleCreateClass = async (req, res) => {
  const { name, difficulty, quality, hpw, description, syllabus } = req.body;

  try {    
    // Perform the necessary logic to add the class to the database
    const [result] = await pool.query(
      'INSERT INTO classes (name, difficulty, quality, hpw, description, syllabus) VALUES (?, ?, ?, ?, ?, ?)',
      [name, difficulty, quality, hpw, description, syllabus]
    );

    if (result.affectedRows > 0) {
      // Class added successfully
      res.sendStatus(201); // Send a 201 Created response
    } else {
      // No rows affected
      console.error('Failed to add class:', result);
      res.status(500).json({ error: 'Failed to add class' });
    }
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// export all of the defined handler functions
module.exports = {
  handleGetAllClasses,
  handleGetClassByID,
  handleCreateClass,
  handleDeleteClass,
  handleUpdateClass,
}