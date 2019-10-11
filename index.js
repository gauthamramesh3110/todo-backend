const express = require('express');
const app = express();
const db = require('./queries');
const authCheck = require('./authCheck');

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "Hello, Welcome to the To-Do App.",
    });
});

app.post('/signup', db.signUp);
app.post('/login', db.login);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server started on port ${port}`));