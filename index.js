const express = require('express');
const app = express();
const { Pool, Client } = require('pg');

const connectionString = 'postgres://pkvvfgdfjewhdb:4b07f3c69e329d0f87366a77819e47d348090c2f244c18d3d1ad3d37d9b7a3e6@ec2-54-243-253-181.compute-1.amazonaws.com:5432/d6vop91dc21fmv';
const client = new Client({
    user: 'pkvvfgdfjewhdb',
    password: '4b07f3c69e329d0f87366a77819e47d348090c2f244c18d3d1ad3d37d9b7a3e6',
    database: 'd6vop91dc21fmv',
    host: 'ec2-54-243-253-181.compute-1.amazonaws.com',
    port: '5432',
    ssl: true
})
client.connect();

app.get('/', (req, res) => {
    res.json({
        message: "Hello, Welcome to the To-Do App.",
    });
});

app.listen(5000, () => console.log('Server started on port 5000'));