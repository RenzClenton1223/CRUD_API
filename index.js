const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Use your MySQL username
    password: '', // Use your MySQL password
    database: 'movie_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Get all movies
app.get('/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get a single movie by id
app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM movies WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Movie not found' });
        res.json(results[0]);
    });
});

// Create a new movie
app.post('/movies', (req, res) => {
    const { title, director, year, genre } = req.body;
    if (!title || !director || !year || !genre) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const newMovie = { title, director, year, genre };
    db.query('INSERT INTO movies SET ?', newMovie, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, ...newMovie });
    });
});

// Update an existing movie by id
app.put('/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, director, year, genre } = req.body;
    const updateFields = { title, director, year, genre };
    db.query('UPDATE movies SET ? WHERE id = ?', [updateFields, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Movie not found' });
        res.json({ message: 'Movie updated successfully' });
    });
});

// Delete a movie by id
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM movies WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Movie not found' });
        res.json({ message: 'Movie deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
