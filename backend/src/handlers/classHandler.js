/**
 * This is the handler for all of the routes involving classes
 * All internal logic should be contained here
 */

// Logic for getting all classes
const handleGetAllClasses = async (req, res) => {
  console.log('Attempting to retrieve classes...');

  try {
    // Execute the MySQL query to retrieve all classes
    const [rows, fields] = await req.dbConn.query('SELECT * FROM classes ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving classes:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// export all of the defined handler functions
module.exports = {
  handleGetAllClasses,
}