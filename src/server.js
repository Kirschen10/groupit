const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
app.use(bodyParser.json());

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
    if (err) console.log(err);
    else console.log('Connected to Azure SQL Database');
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
