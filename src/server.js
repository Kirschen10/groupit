const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // Allow credentials (cookies, headers, etc.)
};

app.use(cors(corsOptions));

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

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'groupittechnion@gmail.com',  // Replace with your email
        pass: 'ohrr sorx crdj clul'    // Replace with your email password
    }
});

app.use(session({
    secret: 'Group123it', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // Set to true if using HTTPS
}));

sql.connect(connectionString, err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to Azure SQL Database');
    }
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const result = await sql.query`SELECT *
                                       FROM users_data
                                       WHERE userName = ${username}
                                         AND password = ${password}`;

        if (result.recordset.length > 0) {
            res.status(200).send({message: 'Login successful'});
        } else {
            res.status(401).send({message: 'Invalid username or password'});
        }
    } catch (err) {
        console.error('Error occurred during login:', err);
        res.status(500).send({message: 'An error occurred', error: err.message});
    }
});

// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send({message: 'Unauthorized'});
    }
};

app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});

// Example protected route
app.get('/HomePage', checkAuth, (req, res) => {
    res.send(`Hello, ${req.session.user.username}`);
});

app.get('/SelectArtists', checkAuth, (req, res) => {
    res.send(`Hello, ${req.session.user.username}`);
});

app.get('/SelectSongs', checkAuth, (req, res) => {
    res.send(`Hello, ${req.session.user.username}`);
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const {firstName, lastName, birthday, email, username, password} = req.body;
    const createdAt = new Date().toISOString(); // Get the current date and time in ISO format

    try {
        const userIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.UserIDSequence AS userID`;
        const userID = userIDResult.recordset[0].userID;

        await sql.query`INSERT INTO users_data (userID, userFirstName, userLastName, userName, birthday, email,
                                                password, createdAt)
                        VALUES (${userID}, ${firstName}, ${lastName}, ${username}, ${birthday}, ${email}, ${password},
                                ${createdAt})`;

        // Set the session after successful registration
        req.session.user = { username };
        res.status(201).send({message: 'Registration successful'});
    } catch (err) {
        console.error('Error occurred during registration:', err);
        res.status(500).send({message: 'An error occurred', error: err.message});
    }
});

// Password reset endpoint
app.post('/resetPassword', async (req, res) => {
    const {username, password} = req.body;

    try {
        // Ensure required fields are present
        if (!username || !password) {
            return res.status(400).send({message: 'Username and password are required'});
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        const result = await sql.query`UPDATE users_data
                                       SET password = ${hashedPassword}
                                       WHERE userName = ${username}`;

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({message: 'Password reset successful'});
        } else {
            res.status(404).send({message: 'User not found'});
        }
    } catch (err) {
        console.error('Error occurred during password reset:', err);
        res.status(500).send({message: 'An error occurred', error: err.message});
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
        res.status(500).send({message: 'An error occurred', error: err.message});
    }
});

app.post('/password', async (req, res) => {
    const {username, email} = req.body;

    try {
        const result = await sql.query`SELECT *
                                       FROM users_data
                                       WHERE userName = ${username}
                                         AND email = ${email}`;

        if (result.recordset.length > 0) {
            // Send email after successful verification
            const resetPasswordUrl = `http://localhost:3000/resetPassword/${username}`;

            const mailOptions = {
                from: 'groupittechnion@gmail.com',
                to: email,
                subject: 'Password Reset Verification',
                text: 'You have requested a password reset. Please click the link below to reset your password.',
                html: `<p>You have requested a password reset. Please click the link below to reset your password:</p><a href="${resetPasswordUrl}">Reset Password</a>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).send({message: 'Error sending email', error: error.message});
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(200).send({message: 'Verification successful. Email sent.'});
                }
            });
        } else {
            res.status(401).send({message: 'Invalid username or email'});
        }
    } catch (err) {
        console.error('Error occurred during login:', err);
        res.status(500).send({message: 'An error occurred', error: err.message});
    }
});


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
