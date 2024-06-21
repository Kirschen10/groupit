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

app.get('/api/user-data/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const result = await sql.query`SELECT firstName, lastName, userName, email, birthday, password, userID FROM users_data WHERE userName = ${username}`;

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

// Add endpoint to fetch all songs
app.get('/api/songs', async (req, res) => {
    try {
        const result = await sql.query`SELECT trackId, trackName, artistName FROM songs_data`;
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Add endpoint to add a song to the user's favorite list
app.post('/api/add-user-song', async (req, res) => {
    const { userID, trackID } = req.body;

    try {
        await sql.query`INSERT INTO user_song (userID, trackId) VALUES (${userID}, ${trackID})`;
        res.status(200).send({ message: 'Song added to user\'s favorite list' });
    } catch (err) {
        console.error('Error adding song to user\'s favorite list:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});



// Fetch all users endpoint
app.get('/usersList', async (req, res) => {
    try {
        const result = await sql.query`SELECT userID, userName FROM users_data`;
        const users = result.recordset.map(user => ({ userID: user.userID, userName: user.userName }));
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

// Fetch group members endpoint
app.post('/groupMembers', async (req, res) => {
    const { groupId } = req.body;

    try {
        // Ensure the pool is connected
        await sql.connect(connectionString);

        // Get user IDs for the group
        const groupUsersResult = await sql.query`
            SELECT userID 
            FROM group_user 
            WHERE groupID = ${groupId}
        `;

        const userIds = groupUsersResult.recordset.map(row => row.userID);

        if (userIds.length === 0) {
            return res.json([]); // Return an empty array if no users found
        }

        // Get user names from user IDs
        const usersResult = await sql.query`
            SELECT userName 
            FROM users_data 
            WHERE userID IN (${userIds})
        `;
        
        const userNames = usersResult.recordset.map(row => row.userName);

        res.json(userNames);
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
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


app.post('/create-group', async (req, res) => {
    const { groupName, groupDescription, users } = req.body;
    const groupID = sql.UniqueIdentifier();

    try {
        // Save the group to the groups_data table
        const groupIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.GroupIDSequence AS groupID`;
        const groupID = groupIDResult.recordset[0].groupID;
        await sql.query`INSERT INTO groups_data (groupID, groupName, groupDescription, createdAt) VALUES (${groupID}, ${groupName}, ${groupDescription}, GETDATE())`;
        console.log(users);
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

// Fetch the groups a user belongs to along with user counts
app.get('/user-groups/:userID', async (req, res) => {
    const { userID } = req.params;
    
    try {
        // Log the incoming userID
        console.log('Received userID:', userID);

        // Ensure the pool is connected
        await sql.connect(connectionString);

        // Fetch the group IDs the user belongs to
        const userGroupsResult = await sql.query`
            SELECT groupID
            FROM group_user
            WHERE userID = ${userID}
        `;

        // Log the result of the user groups query
        console.log('User groups result:', userGroupsResult.recordset);

        const groupIDs = userGroupsResult.recordset.map(record => record.groupID);

        // Log the extracted groupIDs
        console.log('User groupIDs:', groupIDs);

        if (groupIDs.length === 0) {
            return res.status(200).json([]); // User belongs to no groups
        }

        // Dynamically construct the SQL query for group details using parameterized queries
        let groupIDPlaceholders = groupIDs.map((id, index) => `@groupID${index}`).join(',');
        let request = new sql.Request();
        groupIDs.forEach((id, index) => {
            request.input(`groupID${index}`, sql.Int, id); // Treat groupID as integer
        });

        const groupsDataQuery = `
            SELECT groupID, groupName, groupDescription, createdAt
            FROM groups_data
            WHERE groupID IN (${groupIDPlaceholders})
        `;
        const groupsDataResult = await request.query(groupsDataQuery);

        // Log the result of the groups data query
        console.log('Groups data result:', groupsDataResult.recordset);

        const groupsData = groupsDataResult.recordset;

        // Fetch the number of users in each group
        const groupsWithUserCounts = await Promise.all(groupsData.map(async group => {
            try {
                const userCountResult = await sql.query`
                    SELECT COUNT(*) as userCount
                    FROM group_user
                    WHERE groupID = ${group.groupID}
                `;

                // Log the user count for each group
                console.log(`User count for group ${group.groupID}:`, userCountResult.recordset[0].userCount);

                const userCount = userCountResult.recordset[0].userCount;
                return {
                    ...group,
                    userCount
                };
            } catch (err) {
                console.error(`Error fetching user count for group ${group.groupID}:`, err);
                throw err;
            }
        }));

        console.log('Final groups data with user counts:', groupsWithUserCounts);
        res.status(200).json(groupsWithUserCounts);
    } catch (err) {
        console.error('Error fetching user groups:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Endpoint to remove a user from a group
app.post('/leave-group', async (req, res) => {
    const { userID, groupID } = req.body;

    try {
        // Ensure the pool is connected
        await sql.connect(connectionString);

        // Delete the user from the group
        const result = await sql.query`
            DELETE FROM group_user 
            WHERE userID = ${userID} AND groupID = ${groupID}
        `;

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Successfully left the group' });
        } else {
            res.status(404).send({ message: 'User or group not found' });
        }
    } catch (err) {
        console.error('Error leaving group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/all-songs-by-artists', async (req, res) => {
    const { selectedArtists } = req.body;
    const artistNames = selectedArtists.map(artist => artist.name);

    try {
        const request = new sql.Request();
        const artistPlaceholders = artistNames.map((_, index) => `@artist${index}`).join(',');
        artistNames.forEach((artist, index) => {
            request.input(`artist${index}`, sql.VarChar, artist);
        });

        const query = `
            SELECT trackId AS id, trackName AS name, artistName
            FROM songs_data
            WHERE artistName IN (${artistPlaceholders})
        `;

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching songs by artists:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/top-songs-by-artists', async (req, res) => {
    const { selectedArtists } = req.body;
    const artistNames = selectedArtists.map(artist => artist.name);

    try {
        const request = new sql.Request();
        const artistPlaceholders = artistNames.map((_, index) => `@artist${index}`).join(',');
        artistNames.forEach((artist, index) => {
            request.input(`artist${index}`, sql.VarChar, artist);
        });

        const query = `
            SELECT s.trackId AS id, s.trackName AS name, s.artistName, COUNT(us.userId) AS playCount
            FROM songs_data s
            JOIN user_song us ON s.trackId = us.trackId
            WHERE s.artistName IN (${artistPlaceholders})
            GROUP BY s.trackId, s.trackName, s.artistName
            ORDER BY playCount DESC
        `;

        const result = await request.query(query);

        const topSongs = [];
        const artistSongCount = {};

        result.recordset.forEach(song => {
            if (!artistSongCount[song.artistName]) {
                artistSongCount[song.artistName] = 0;
            }
            if (artistSongCount[song.artistName] < 5) {
                topSongs.push(song);
                artistSongCount[song.artistName] += 1;
            }
        });

        res.status(200).json(topSongs);
    } catch (err) {
        console.error('Error fetching top songs by artists:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Endpoint to add user songs
app.post('/add-user-songs', async (req, res) => {
    const { username, songIDs } = req.body;

    try {
        // Fetch user ID based on username
        const userResult = await sql.query`
            SELECT userID FROM users_data WHERE userName = ${username}
        `;
        
        if (userResult.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userID = userResult.recordset[0].userID;

        for (const songID of songIDs) {
            await sql.query`
                INSERT INTO user_song (userID, trackId)
                VALUES (${userID}, ${songID})
            `;
        }

        res.status(200).send({ message: 'Songs added to user successfully' });
    } catch (err) {
        console.error('Error adding user songs:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Endpoint to get playlist for a user
app.get('/userPlaylist/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        // Fetch trackIds based on userID from user_song table
        const userSongsResult = await sql.query`
            SELECT trackId 
            FROM user_song 
            WHERE userId = ${userID}
        `;

        if (userSongsResult.recordset.length === 0) {
            return res.status(404).send({ message: 'No songs found for this user' });
        }

        const trackIds = userSongsResult.recordset.map(row => row.trackId);

        // Fetch trackName and artistName based on trackIds from songs_data table
        const songsResult = await sql.query`
            SELECT trackName, artistName 
            FROM songs_data 
            WHERE trackId IN (${trackIds})
        `;

        const songs = songsResult.recordset.map(song => ({
            name: song.trackName,
            artist: song.artistName,
        }));

        res.status(200).send({ songs });
    } catch (err) {
        console.error('Error fetching user playlist:', err);
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
