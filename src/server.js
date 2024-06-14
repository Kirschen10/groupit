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
    server: 'groupit.database.windows.net',
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

app.post('/users_data', async (req, res) => {
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
