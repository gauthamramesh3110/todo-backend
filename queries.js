require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//CONNECTING TO THE SERVER
const client = new Client({
    user: 'pkvvfgdfjewhdb',
    password: '4b07f3c69e329d0f87366a77819e47d348090c2f244c18d3d1ad3d37d9b7a3e6',
    database: 'd6vop91dc21fmv',
    host: 'ec2-54-243-253-181.compute-1.amazonaws.com',
    port: '5432',
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

module.exports = {
    signUp,
    login,
}