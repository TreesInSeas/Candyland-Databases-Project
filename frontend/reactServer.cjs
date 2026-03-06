// ########################################
// ########## SETUP

const express = require('express');
const path = require('path');
require('dotenv').config({path: '../.env'});
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.FRONTEND_PORT;

// ########################################
// ########## ROUTE HANDLERS

// Handles any requests that don't match the ones above to return the React app
// A request to '/nonExist' will redirect to the index.html where react router takes over at '/'
app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ########################################
// ########## LISTENER

app.listen(PORT, () => {
    console.log(`Server running: http://classwork.engr.oregonstate.edu:${PORT}...`);
});