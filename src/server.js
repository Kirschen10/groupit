const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

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

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'groupittechnion@gmail.com',  // Replace with your email
        pass: 'ohrr sorx crdj clul'    // Replace with your email password
    }
});

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
                    return res.status(500).send({ message: 'Error sending email', error: error.message });
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(200).send({ message: 'Verification successful. Email sent.' });
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


app.get('/test', async (req, res) => {
    return res.json("test")
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
