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
    server: 'groupit.database.windows.net',
    database: 'groupit_new',
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

        await sql.query`INSERT INTO users_data (userID, firstName, lastName, userName, birthday, email, password, createdAt) 
            VALUES (${userID}, ${firstName}, ${lastName}, ${username}, ${birthday}, ${email}, ${password}, ${createdAt})`;
        res.status(201).send({ message: 'Registration successful' });
    } catch (err) {
        console.error('Error occurred during registration:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Password reset endpoint
app.post('/resetPassword', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Ensure required fields are present
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required' });
        }

        console.log('Received username:', username);

        // Update the user's password in the database
        const result = await sql.query`UPDATE users_data SET password = ${password} WHERE userName = ${username}`;
        
        console.log('SQL query result:', result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Password reset successful' });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error occurred during password reset:', err);
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

app.get('/api/user-data/:userID', async (req, res) => {
    const {user.username} = req.params;

    try {
        const result = await sql.query`SELECT firstName, lastName, userName, email, birthday, password FROM users_data WHERE WHERE userName = ${user.username}`;

        if (result.recordset.length > 0) {
            res.status(200).send(result.recordset[0]);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});


// Fetch all users endpoint
app.get('/usersList', async (req, res) => {
    try {
        const result = await sql.query`SELECT userName FROM users_data`;
        const users = result.recordset.map(user => user.userName);
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Add user to group endpoint
app.post('/addUserByUserName', async (req, res) => {
    const { userName, groupId } = req.body;
    try {
        const groupResult = await sql.query`SELECT groupID FROM groups_data WHERE groupID = ${groupId}`;
        if (groupResult.recordset.length === 0) {
            return res.status(404).send({ message: 'Group not found' });
        }

        const userResult = await sql.query`SELECT userID FROM users_data WHERE userName = ${userName}`;
        if (userResult.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userID = userResult.recordset[0].userID;
        await sql.query`INSERT INTO group_user (groupID, userID) VALUES (${groupId}, ${userID})`;

        res.status(200).send({ message: 'User added to group successfully' });
    } catch (err) {
        console.error('Error adding user to group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/groupMembers', async (req, res) => {
    const { groupId } = req.body;

    try {
        const client = await pool.connect();

        // Get user IDs for the group
        const groupUsersResult = await client.query('SELECT userID FROM group_user WHERE groupID = $1', [groupId]);
        const userIds = groupUsersResult.rows.map(row => row.user_id);

        if (userIds.length === 0) {
            res.json([]);
            client.release();
            return;
        }

        // Get user names from user IDs
        const usersResult = await client.query('SELECT userName FROM users_data WHERE userID = ANY($1)', [userIds]);
        const userNames = usersResult.rows.map(row => row.user_name);

        client.release();
        res.json(userNames);
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/api/search-users', async (req, res) => {
    const { username } = req.query;

    try {
        const result = await sql.query`SELECT userName FROM users_data WHERE userName LIKE ${username + '%'}`;
        res.status(200).send({ users: result.recordset });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/api/verify-user', async (req, res) => {
    const { username } = req.body;

    try {
        const result = await sql.query`SELECT userID FROM users_data WHERE userName = ${username}`;
        if (result.recordset.length > 0) {
            res.status(200).send({ exists: true, userID: result.recordset[0].userID });
        } else {
            res.status(200).send({ exists: false });
        }
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});


app.post('/api/create-group', async (req, res) => {
    const { groupName, groupDescription, users } = req.body;
    const groupID = sql.UniqueIdentifier();

    try {
        // Save the group to the groups_data table
        const groupIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.GroupIDSequence AS groupID`;
        const groupID = groupIDResult.recordset[0].groupID;
        await sql.query`INSERT INTO groups_data (groupID, groupName, groupDescription, createdAt) VALUES (${groupID}, ${groupName}, ${groupDescription}, GETDATE())`;

        // Save the users to the group_user table
        for (const user of users) {
            await sql.query`INSERT INTO group_user (userID, groupID) VALUES (${user.userID}, ${groupID})`;
        }

         res.status(201).send({ message: 'Group created successfully', groupID: groupID });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});


app.post('/api/join-group', async (req, res) => {
    const { groupID, userID } = req.body; // You need to pass userID as well

    try {
        const groupResult = await sql.query`SELECT * FROM groups_data WHERE groupID = ${groupID}`;
        if (groupResult.recordset.length === 0) {
            return res.status(200).send({ exists: false });
        }

        // Add the user to the group_user table
        await sql.query`INSERT INTO group_user (userID, groupID) VALUES (${userID}, ${groupID})`;
        res.status(200).send({ exists: true });
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/api/leave-group', async (req, res) => {
    const { groupID, userID } = req.body;

    try {
        await sql.query`DELETE FROM group_user WHERE userID = ${userID} AND groupID = ${groupID}`;
        res.status(200).send({ message: 'Successfully left the group' });
    } catch (err) {
        console.error('Error leaving group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.get('/api/find-groups', async (req, res) => {
    try {
        const result = await sql.query`SELECT TOP 10 groupID, groupName FROM groups_data`;
        res.status(200).send({ groups: result.recordset });
    } catch (err) {
        console.error('Error finding groups:', err);
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
