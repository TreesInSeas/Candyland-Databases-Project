// ########################################
// ########## SETUP

// env file
require('dotenv').config({path: '../.env'});

// Database
const db = require('./database/db-connector');

// Express
const express = require('express');
const app = express();

// Middleware
const cors = require('cors');
app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json()); // this is needed for post requests


const PORT = process.env.BACKEND_PORT;

// ########################################
// ########## ROUTE HANDLERS

// RESET DATABASE
app.get('/reset', async (req, res) => {
    await db.pool.promise().query('CALL sp_resetDatabase();');
    res.sendStatus(204);
});

// READ ROUTES
app.get('/players', async (req, res) => {
    const [players] = await db.pool.promise().query('SELECT playerID, firstName, lastName, games FROM v_select_players;');
    res.json(players);
});

app.get('/games', async (req, res) => {
    const [games] = await db.pool.promise().query('SELECT gameID, sessionName, active, players FROM v_select_games;');
    res.json(games);  
});

app.get('/prizes', async (req, res) => {
    const [prizes] = await db.pool.promise().query('SELECT prizeID, prizeName, quantity, playerName, playerID FROM v_select_prizes;');
    res.json(prizes);  
});

app.get('/moves', async (req, res) => {
    const [moves] = await db.pool.promise().query('SELECT moveID, sessionName, playerName, startingPosition, endingPosition, stuck, cardColor FROM v_select_moves;');
    res.json(moves);
});

app.get('/playerParticipants', async (req, res) => {
    const [playerParticipants] = await db.pool.promise().query('SELECT playerID, firstName, lastName, sessionName FROM v_select_playerParticipants;');
    const participantsData = {};
    playerParticipants.forEach(participant => {
        const gameName = participant.sessionName;
        if (!participantsData[gameName]) {
            participantsData[gameName] = [];
        }
        participantsData[gameName].push(participant);
    });
    res.json(participantsData);
});

// DELETE ROUTES
app.delete('/players/:id', async (req, res) => {
    const playerID = req.params.id;
    await db.pool.promise().query(`CALL sp_deletePlayer(?);`, [playerID]);
    res.sendStatus(204);
});

app.delete('/games/:id', async (req, res) => {
    const gameID = req.params.id;
    await db.pool.promise().query(`CALL sp_deleteGame(?);`, [gameID]);
    res.sendStatus(204);
});

app.delete('/prizes/:id', async (req, res) => {
    const prizeID = req.params.id;
    await db.pool.promise().query(`CALL sp_deletePrize(?);`, [prizeID]);
    res.sendStatus(204);
});

app.delete('/moves/:id', async (req, res) => {
    const moveID = req.params.id;
    await db.pool.promise().query(`CALL sp_deleteMove(?);`, [moveID]);
    res.sendStatus(204);
});

app.delete('/playerParticipants', async (req, res) => {
    const { playerID, sessionName } = req.body;
    await db.pool.promise().query(`CALL sp_deletePlayerParticipant(?, ?);`, [playerID, sessionName]);
    res.sendStatus(204);
});

app.delete('/gameParticipants', async (req, res) => {
    const { playerFirstName, playerLastName, gameID } = req.body;
    await db.pool.promise().query(`CALL sp_deleteGameParticipant(?, ?, ?);`, [playerFirstName, playerLastName, gameID]);
    res.sendStatus(204);
});

// CREATE ROUTES
app.post('/players', async (req, res) => {
    const { firstName, lastName } = req.body;
    await db.pool.promise().query('CALL sp_insertPlayer(?, ?, @playerID);', [firstName, lastName]);
    const [result] = await db.pool.promise().query('SELECT @playerID as playerID;');
    res.json({ playerID: result[0].playerID });
});

app.post('/playerParticipants', async (req, res) => {
    const { playerID, sessionName } = req.body;
    await db.pool.promise().query('CALL sp_insertPlayerParticipant(?, ?);', [playerID, sessionName]);
    res.sendStatus(201);
});

app.post('/gameParticipants', async (req, res) => {
    const { playerFirstName, playerLastName, gameID } = req.body;
    await db.pool.promise().query('CALL sp_insertGameParticipant(?, ?, ?);', [playerFirstName, playerLastName, gameID]);
    res.sendStatus(201);
});

app.post('/games', async (req, res) => {
    const { sessionName, active } = req.body;
    await db.pool.promise().query('CALL sp_insertGame(?, ?, @gameID);', [sessionName, active]);
    const [result] = await db.pool.promise().query('SELECT @gameID as gameID;');
    res.json({ gameID: result[0].gameID });
});

app.post('/prizes', async (req, res) => {
    const { prizeName, quantity, playerFirstName, playerLastName } = req.body;
    await db.pool.promise().query('CALL sp_insertPrize(?, ?, ?, ?, @prizeID);', [prizeName, quantity, playerFirstName, playerLastName]);
    const [result] = await db.pool.promise().query('SELECT @prizeID as prizeID;');
    res.json({ prizeID: result[0].prizeID });
});

app.post('/moves', async (req, res) => {
    const { sessionName, playerFirstName, playerLastName, startingPosition, endingPosition, stuck, cardColor } = req.body;
    await db.pool.promise().query('CALL sp_insertMove(?, ?, ?, ?, ?, ?, ?);', [playerFirstName, playerLastName, sessionName, startingPosition, endingPosition, stuck, cardColor]);
    res.sendStatus(201);
});

// UPDATE ROUTES
app.put('/players', async (req, res) => {
    const { firstName, lastName, playerID } = req.body;
    await db.pool.promise().query('CALL sp_editPlayer(?, ?, ?);', [playerID, firstName, lastName]);
    res.sendStatus(204);
});

app.put('/games', async (req, res) => {
    const { sessionName, active, gameID } = req.body;
    await db.pool.promise().query('CALL sp_editGame(?, ?, ?);', [gameID, sessionName, active]);
    res.sendStatus(204);
});

app.put('/prizes', async (req, res) => {
    const { prizeName, quantity, playerFirstName, playerLastName, prizeID } = req.body;
    await db.pool.promise().query('CALL sp_editPrize(?, ?, ?, ?, ?);', [prizeID, prizeName, quantity, playerFirstName, playerLastName]);
    res.sendStatus(204);
});

app.put('/moves', async (req, res) => {
    const { sessionName, playerFirstName, playerLastName, startingPosition, endingPosition, stuck, cardColor, moveID } = req.body;
    console.log(req.body);
    await db.pool.promise().query('CALL sp_editMove(?, ?, ?, ?, ?, ?, ?, ?);', [moveID, playerFirstName, playerLastName, sessionName, startingPosition, endingPosition, stuck, cardColor]);
    res.sendStatus(204);
});

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log('Express started on http://classwork.engr.oregonstate.edu:' + PORT + '; press Ctrl-C to terminate.');
});