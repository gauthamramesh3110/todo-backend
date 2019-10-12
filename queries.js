require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//CONNECTING TO THE SERVER
const client = new Client({
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: process.env.DATABASE_PORT,
    ssl: true
});
client.connect();


//SIGN UP FUNCTION
const signUp = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    //QUERY TO INSERT THE USERNAME AND PASSWORD INTO THE USERS TABLE
    const query = 'INSERT INTO users(username, password) VALUES($1, $2) RETURNING *';


    //HASHING THE PASSWORD FOR PROTECTION
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                result: 'Sign Up Failed',
            });
        } else {
            console.log(hash);
            const values = [username, hash];

            client.query(query, values, (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(401).json({
                        success: false,
                        result: 'Sign Up Failed',
                    });
                } else {
                    //A WEB TOKEN IS ATTACHED TO THE RESPONSE TO ALLOW RETREIVING AND ADDING DATA WITHOUT LOGING IN EVERYTIME.
                    //THIS TOKEN IS SAVED IN THE CLIENT DEVICE AND IS ATTACHED TO THE PARAMETERS.
                    //IT WILL BE DECODED BY AUTHCHECK.JS AND THE USER INFO IS USED TO RETRIEVE AND STORE THE DATA.
                    const token = jwt.sign({
                        id: result.rows[0].id,
                        username: result.rows[0].username,
                    }, process.env.JWT_KEY);

                    res.status(200).json({
                        success: true,
                        result: 'Signed Up Successfully',
                        token
                    });
                }
            });
        }
    });
}


//LOGIN FUNCTION
const login = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //QUERY TO SELECT A PARTICULAR USER TO SEE CHECK THE PASSWORD
    const query = 'SELECT * from users WHERE username = $1';
    const values = [username];

    client.query(query, values, (error, result) => {
        if (error) {
            console.log(error);
            res.status(401).json({
                success: false,
                result: 'Failed to Login',
            });
        } else {
            if (result.rows[0] == undefined) {
                res.status(401).json({
                    success: false,
                    result: 'Failed to Login. Username incorrect.'
                });
                return;
            }

            //UNHASHING AND COMPARING THE PASSWORDS. RETURNS TRUE IF PASSWORDS MATCH
            bcrypt.compare(password, result.rows[0].password, (err, success) => {
                if (success) {

                    //A WEB TOKEN IS ATTACHED TO THE RESPONSE TO ALLOW RETREIVING AND ADDING DATA WITHOUT LOGING IN EVERYTIME.
                    //THIS TOKEN IS SAVED IN THE CLIENT DEVICE AND IS ATTACHED TO THE PARAMETERS.
                    //IT WILL BE DECODED BY AUTHCHECK.JS AND THE USER INFO IS USED TO RETRIEVE AND STORE THE DATA.
                    const token = jwt.sign({
                        id: result.rows[0].id,
                        username: result.rows[0].username,
                    }, process.env.JWT_KEY);

                    res.status(200).json({
                        success: true,
                        result: 'Logged in Successfully',
                        token
                    });

                } else {
                    res.status(401).json({
                        success: false,
                        result: 'Failed to Login. Password incorrect.'
                    });
                }
            });
        }
    });
}

const addTodo = (req, res) => {
    const userId = req.userData.id;
    const title = req.body.title;
    const date = req.body.date;

    const query = 'INSERT INTO tasks(title, date, user_id, date) VALUES($1, $2, $3) RETURNING *';
    const values = [title, date, userId];

    client.query(query, values, (error, result) => {
        console.log(error);
        if (error) {
            res.status(401).json({
                success: false,
                result: 'Unable to add the Todo to your list'
            });
        } else {
            console.log(result.rows[0]);
            res.status(200).json({
                success: true,
                result: 'Added Todo to your list Successfully'
            })
        }
    });
}

const getTodos = (req, res) => {
    const userId = req.userData.id;

    const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY completed';
    const values = [userId];

    client.query(query, values, (error, result) => {
        if (error) {
            console.log(error);
            res.status(401).json({
                success: false,
                result: 'Unable to fetch data'
            });
        } else {
            console.log(result);
            res.status(200).json({
                success: true,
                result: result.rows
            });
        }
    });
}

const toggleCompleted = (req, res) => {
    const todoId = req.body.todoId;
    const userId = req.userData.id;

    console.log(`todoId: ${todoId}, userId: ${userId}`);

    const query = 'UPDATE tasks SET completed = NOT completed WHERE id = $1 and user_id = $2';
    const values = [todoId, userId];

    client.query(query, values, (error, result) => {
        console.log(error);
        if(error){
            res.status(401).json({
                success: false,
                result: 'Unable to toggle completed'
            });
        }else{
            res.status(200).json({
                success: true, 
                result: 'Toggled completed successfully'
            });
        }
    });
}

const toggleImportant = (req, res) => {
    const todoId = req.body.todoId;
    const userId = req.userData.id;

    console.log(`todoId: ${todoId}, userId: ${userId}`);

    const query = 'UPDATE tasks SET important = NOT important WHERE id = $1 and user_id = $2';
    const values = [todoId, userId];

    client.query(query, values, (error, result) => {
        console.log(error);
        if(error){
            res.status(401).json({
                success: false,
                result: 'Unable to toggle important'
            });
        }else{
            res.status(200).json({
                success: true, 
                result: 'Toggled important successfully'
            });
        }
    });
}

module.exports = {
    signUp,
    login,
    addTodo,
    getTodos,
    toggleCompleted,
    toggleImportant,
}