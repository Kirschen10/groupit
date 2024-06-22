const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const EmailVerifier = require('email-verifier');


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

app.post('/register', async (req, res) => {
    const { firstName, lastName, birthday, email, username, password } = req.body;
    const createdAt = new Date().toISOString(); // Get the current date and time in ISO format

    try {

        // Check if the username already exists

        const usernameResult = await sql.query`SELECT userName FROM users_data WHERE userName = ${username}`;
        if (usernameResult.recordset.length > 0) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const emailResult = await sql.query`SELECT email FROM users_data WHERE email = ${email}`;
        if (emailResult.recordset.length > 0) {
            return res.status(400).send({ message: 'Email already registered' });
        }

        // Get a new userID
        const userIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.UserIDSequence AS userID`;
        const userID = userIDResult.recordset[0].userID;
        const userResult = await sql.query`SELECT userID FROM users_data WHERE userName = ${username}`;
        if (userResult.recordset.length > 0) {
            return res.status(400).send({ message: 'Username already exists' });
        }
        // Get the next userID
        const userIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.UserIDSequence AS userID`;
        const userID = userIDResult.recordset[0].userID;

        // Insert the new user
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
app.post('/usersList', async (req, res) => {
    const { groupID } = req.body;
    console.log('Group ID:', groupID); // Log groupID for debugging
    try {
        const result = await sql.query`
            SELECT u.userID, u.userName
            FROM users_data u
            LEFT JOIN (
                SELECT userID, groupID
                FROM group_user
                WHERE groupID = ${groupID}
            ) AS gu ON u.userID = gu.userID
            WHERE gu.userID IS NULL
        `;
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
        const createdAt = new Date().toISOString();
        await sql.query`INSERT INTO groups_data (groupID, groupName, groupDescription, createdAt) VALUES (${groupID}, ${groupName}, ${groupDescription}, ${createdAt})`;
        console.log(users);
        // Save the users to the group_user table
        for (const user of users) {
            await sql.query`INSERT INTO group_user (userID, groupID) VALUES (${user.userID}, ${groupID})`;
        }

         res.status(201).send({ message: 'Group created successfully', groupID, createdAt});
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});


app.post('/join-group', async (req, res) => {
    const { groupID, userName } = req.body; 
    console.log(userName);
    try {
        const userResult = await sql.query`SELECT userID FROM users_data WHERE userName = ${userName}`;
        if (userResult.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        const userID = userResult.recordset[0].userID;

        const groupResult = await sql.query`SELECT * FROM groups_data WHERE groupID = ${groupID}`;
        if (groupResult.recordset.length === 0) {
            return res.status(404).send({ message: 'Group not found' });
        }

        const membershipResult = await sql.query`
            SELECT * FROM group_user WHERE userID = ${userID} AND groupID = ${groupID}
        `;
        if (membershipResult.recordset.length > 0) {
            return res.status(400).send({ message: 'User already belongs to this group' });
        }

        await sql.query`INSERT INTO group_user (userID, groupID) VALUES (${userID}, ${groupID})`;
        res.status(200).send({ message: 'Successfully joined the group' });
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

app.get('/find-groups', async (req, res) => {
    const { username } = req.query; // Get the username from the query parameters

    try {
        // Find the user ID based on the provided username
        const userResult = await sql.query`SELECT userID FROM users_data WHERE userName = ${username}`;

        if (userResult.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userID = userResult.recordset[0].userID;

        // Fetch groups where the user is not already a member
        const result = await sql.query`
            SELECT g.*, COUNT(gu.userID) AS userCount
            FROM groups_data g
            JOIN group_user gu ON g.groupID = gu.groupID
            LEFT JOIN group_user ug ON g.groupID = ug.groupID AND ug.userID = ${userID}
            WHERE ug.userID IS NULL
            GROUP BY g.groupID, g.groupName, g.groupDescription, g.createdAt
            HAVING COUNT(gu.userID) > 0
        `;

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
            SELECT trackName, artistName, trackId
            FROM songs_data 
            WHERE trackId IN (${trackIds})
        `;

        const songs = songsResult.recordset.map(song => ({
            name: song.trackName,
            artist: song.artistName,
            trackId : song.trackId,
        }));

        res.status(200).send({ songs });
    } catch (err) {
        console.error('Error fetching user playlist:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.get('/checkUserSongs', async (req, res) => {
    const { username } = req.query;

    try {
        // Find the user ID based on the username
        const userResult = await sql.query`SELECT userID FROM users_data WHERE userName = ${username}`;
        
        if (userResult.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userID = userResult.recordset[0].userID;

        // Check if the user has songs
        const songResult = await sql.query`SELECT COUNT(*) AS songCount FROM user_song WHERE userID = ${userID}`;

        if (songResult.recordset[0].songCount > 0) {
            res.json({ hasSongs: true });
        } else {
            res.json({ hasSongs: false });
        }
    } catch (err) {
        console.error('Error checking user songs:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

// Delete a song from playlist
app.delete('/deleteSong/:userID/:trackId', async (req, res) => {
    const { userID, trackId } = req.params;

    try {
        const result = await sql.query`DELETE FROM user_song WHERE userId = ${userID} AND trackId = ${trackId}`;
        res.status(200).send({ message: 'Song deleted successfully' });
    } catch (error) {
        console.error('Error deleting song:', error);
        res.status(500).send({ message: 'Error deleting song' });
    }
});

// Fetch songs by a specific artist
app.get('/songsBySinger/:artistName', async (req, res) => {
    const { artistName } = req.params;

    try {
        const result = await sql.query`SELECT * FROM songs_data WHERE artistName = ${artistName}`;
        res.status(200).json({ songs: result.recordset });
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).send({ message: 'Error fetching songs' });
    }
});

// Function to escape special characters for SQL LIKE queries
const escapeStringForSQLLike = (str) => {
    return str.replace(/[%_]/g, '\\$&'); // Escape % and _ characters
  };

// Endpoint to search for an artist by name
app.get('/searchArtist/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    const escapedSearchTerm = escapeStringForSQLLike(searchTerm);

    try {
      const result = await sql.query`
        SELECT DISTINCT artistName
        FROM songs_data
        WHERE artistName LIKE ${'%' + escapedSearchTerm + '%'}
        ORDER BY artistName
      `;
      res.status(200).json({ artists: result.recordset });
    } catch (err) {
      console.error('Error searching for artist:', err);
      res.status(500).send({ message: 'An error occurred', error: err.message });
    }
  });

 // Add a song to playlist
app.post('/addSong/:userID/:trackId', async (req, res) => {
    const { userID, trackId } = req.params;

    try {
        const result = await sql.query`INSERT INTO user_song (userId, trackId) VALUES (${userID}, ${trackId})`;
        res.status(200).send({ message: 'Song added successfully' });
    } catch (error) {
        console.error('Error adding song:', error);
        res.status(500).send({ message: 'Error adding song' });
    }
});

app.post('/getPlaylist', async (req, res) => {
    const { groupID } = req.body;
    try {
        const result = await sql.query`
        SELECT TOP 10 sd.trackID, sd.trackName, sd.artistName
        FROM (
            SELECT us.trackID, COUNT(*) AS count
            FROM group_user gu
            JOIN user_song us ON gu.userID = us.userID
            WHERE gu.groupID = ${groupID}
            GROUP BY us.trackID
        ) AS SongCounts
        JOIN songs_data sd ON SongCounts.trackID = sd.trackID
        ORDER BY SongCounts.count DESC;`

        const songs = result.recordset;
        const playlistIDResult = await sql.query`SELECT NEXT VALUE FOR dbo.PlaylistIDSequence AS playlistID`;
        const playlistID = playlistIDResult.recordset[0].playlistID;

        // Insert into group_song if not exists
        for (const song of songs) {
            const { trackID } = song;

            // Insert new record
            await sql.query`
                INSERT INTO group_song (groupID, trackId, playlistID)
                VALUES (${groupID}, ${trackID}, ${playlistID})
                `;
            }
        res.status(200).send({ songs });

    } catch (err) {
        console.error('Error fetching playlist:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/giveFeedback', async (req, res) => {
    const { userID, trackID, groupID } = req.body;
    try {
        await sql.query`INSERT INTO feedback_data (userID, groupID, trackID, isLiked) VALUES (${userID}, ${groupID} ,${trackID} ,'1' )`;
        res.status(200).send({ message: 'Feedback recorded' });
    } catch (err) {
        console.error('Error recording feedback:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/removeFeedback', async (req, res) => {
    const { userID, trackID, groupID } = req.body;
    try {
        await sql.query`DELETE FROM feedback_data WHERE userID = ${userID} AND trackID = ${trackID} AND groupID = ${groupID}`;
        res.status(200).send({ message: 'Feedback removed' });
    } catch (err) {
        console.error('Error removing feedback:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/getFeedbackForTracks', async (req, res) => {
    const { userID, groupID, trackIDs } = req.body;
    try {
        const result = await sql.query`
            SELECT trackID
            FROM feedback_data
            WHERE userID = ${userID}
            AND groupID = ${groupID}
            AND trackID IN (${trackIDs})
        `;

        const feedbackTrackIDs = result.recordset.map(row => row.trackID);
        res.status(200).send({ feedbackTrackIDs });
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

app.post('/getGroupSongs', async (req, res) => {
    const { groupID, userID } = req.body; // Include userID in the request
    try {
        const result = await sql.query`
            SELECT gs.trackID, sd.trackName, sd.artistName,
                   ISNULL(fd.isLiked, 0) AS isLiked
            FROM group_song gs
            JOIN songs_data sd ON gs.trackID = sd.trackID
            LEFT JOIN feedback_data fd ON gs.trackID = fd.trackID AND fd.userID = ${userID}
            WHERE gs.groupID = ${groupID}
            AND gs.playlistID = (
                SELECT MAX(playlistID)
                FROM group_song
                WHERE groupID = ${groupID}
            )
        `;
        const groupSongs = result.recordset;
        res.status(200).send({ groupSongs });
    } catch (err) {
        console.error('Error fetching group songs:', err);
        res.status(500).send({ message: 'An error occurred', error: err.message });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
