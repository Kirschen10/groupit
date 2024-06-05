const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connectionString = {
    user: 'groupit_admin',
    password: 'Group123it',
    server: 'groupitserver.database.windows.net',
    database: 'groupit_db',
    options: {
        encrypt: true,
        enableArithAbort: true,
    }
};

sql.connect(connectionString, err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to Azure SQL Database');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await sql.query`SELECT * FROM users_data WHERE userName = ${username} AND password = ${password}`;

        if (result.recordset.length > 0) {
            res.status(200).send({ message: 'Login successful' });
        } else {
            res.status(401).send({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error occurred during login:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { firstName, lastName, birthday, email, username, password } = req.body;
    const createdAt = new Date().toISOString(); // Get the current date and time in ISO format

    try {
        const userIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.UserIDSequence AS userID`;
        const userID = userIDResult.recordset[0].userID;

        await sql.query`INSERT INTO users_data (userID, userFirstName, userLastName, userName, birthday, email, password, createdAt) 
            VALUES (${userID}, ${firstName}, ${lastName}, ${username}, ${birthday}, ${email}, ${password}, ${createdAt})`;
        res.status(201).send({ message: 'Registration successful' });
    } catch (err) {
        console.error('Error occurred during registration:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Endpoint to get top 100 artists with most songs
app.get('/top-artists', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT TOP 100 artistName, COUNT(*) AS song_count
            FROM songs_data
            GROUP BY artistName
            ORDER BY COUNT(*) DESC
        `;
        res.status(200).send(result.recordset);
    } catch (err) {
        console.error('Error fetching top artists:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.get('/test', async (req, res) => {
    return res.json("test")
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
