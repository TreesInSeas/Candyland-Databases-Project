-- #############################
-- RESET DATABASE
-- #############################
DROP PROCEDURE IF EXISTS sp_resetDatabase;

DELIMITER //
CREATE PROCEDURE sp_resetDatabase()
BEGIN
    -- Delete tables if they exist (in reverse dependency order)
    DROP TABLE IF EXISTS Moves;
    DROP TABLE IF EXISTS Prizes;
    DROP TABLE IF EXISTS GameParticipants;
    DROP TABLE IF EXISTS Games;
    DROP TABLE IF EXISTS Players;

    -- Create tables for 4 entities and one MtM table
    CREATE TABLE Players(
        playerID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL
    );
    CREATE TABLE Games(
        gameID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        active boolean NOT NULL DEFAULT TRUE,
        sessionName VARCHAR(255) NOT NULL
    );
    CREATE TABLE Prizes(
        prizeID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        prizeName VARCHAR(255) NOT NULL,
        quantity int NOT NULL DEFAULT 1,
        playerID int NOT NULL,
        FOREIGN KEY (playerID) REFERENCES Players(playerID) ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE TABLE GameParticipants(
        participantID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        playerID int NOT NULL,
        gameID int NOT NULL,
        FOREIGN KEY (playerID) REFERENCES Players(playerID) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (gameID) REFERENCES Games(gameID) ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE TABLE Moves(
        moveID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        participantID int NOT NULL,
        startingPosition int NOT NULL,
        endingPosition int NOT NULL,
        stuck boolean NOT NULL DEFAULT FALSE,
        cardColor ENUM('Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink') NOT NULL,
        FOREIGN KEY (participantID) REFERENCES GameParticipants(participantID) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Add dummy data to tables
    INSERT INTO Players(
        firstName,
        lastName
    )
    VALUES(
        "Hayden",
        "Barnes"
    ),
    (
        "Olivia",
        "Fidler"
    ),
    (
        "Lily",
        "Collins"
    );

    INSERT INTO Games(
        sessionName
    )
    VALUES(
        "Dev playthrough"
    ),
    (
        "Girlypop power"
    ),
    (
        "Lonely Lobby"
    );

    INSERT INTO Prizes(
        prizeName,
        playerID
    )
    VALUES(
        "Gaming PC",
        (SELECT playerID FROM Players WHERE firstName = "Hayden")
    ),
    (
        "Glass egg",
        (SELECT playerID FROM Players WHERE firstName = "Olivia")
    ),
    (
        "Stuffed Bear",
        (SELECT playerID FROM Players WHERE firstName = "Lily")
    );

    INSERT INTO GameParticipants(
        playerID,
        gameID
    )
    VALUES(
        (SELECT playerID FROM Players WHERE firstName = "Hayden"),
        (SELECT gameID FROM Games WHERE sessionName = "Dev playthrough")
    ),
    (
        (SELECT playerID FROM Players WHERE firstName = "Olivia"),
        (SELECT gameID FROM Games WHERE sessionName = "Dev playthrough")
    ),
    (
        (SELECT playerID FROM Players WHERE firstName = "Hayden"),
        (SELECT gameID FROM Games WHERE sessionName = "Girlypop power")
    ),
    (
        (SELECT playerID FROM Players WHERE firstName = "Olivia"),
        (SELECT gameID FROM Games WHERE sessionName = "Girlypop power")
    ),
    (
        (SELECT playerID FROM Players WHERE firstName = "Lily"),
        (SELECT gameID FROM Games WHERE sessionName = "Girlypop power")
    ),
    (
        (SELECT playerID FROM Players WHERE firstName = "Lily"),
        (SELECT gameID FROM Games WHERE sessionName = "Lonely Lobby")
    );

    INSERT INTO Moves(
        participantID,
        startingPosition,
        endingPosition,
        cardColor
    )
    VALUES (
        (SELECT participantID FROM GameParticipants WHERE playerID = (SELECT playerID FROM Players WHERE firstName = "Hayden") AND gameID = (SELECT gameID FROM Games WHERE sessionName = "Dev playthrough")),
        0,
        1,
        'Blue'
    ),
    (
        (SELECT participantID FROM GameParticipants WHERE playerID = (SELECT playerID FROM Players WHERE firstName = "Olivia") AND gameID = (SELECT gameID FROM Games WHERE sessionName = "Dev playthrough")),
        0,
        2,
        'Red'
    ),
    (
        (SELECT participantID FROM GameParticipants WHERE playerID = (SELECT playerID FROM Players WHERE firstName = "Hayden") AND gameID = (SELECT gameID FROM Games WHERE sessionName = "Dev playthrough")),
        1,
        5,
        'Purple'
    );

END //
DELIMITER ;

-- #############################
-- SELECT players with games
-- #############################
DROP VIEW  IF EXISTS v_select_players;

CREATE VIEW v_select_players AS
SELECT 
    p.playerID,
    p.firstName,
    p.lastName,
    GROUP_CONCAT(g.sessionName SEPARATOR ',') AS games
FROM Players p
LEFT JOIN GameParticipants gp ON p.playerID = gp.playerID
LEFT JOIN Games g ON gp.gameID = g.gameID
GROUP BY p.playerID, p.firstName, p.lastName;


-- #############################
-- SELECT games with players
-- #############################
DROP VIEW  IF EXISTS v_select_games;

CREATE VIEW v_select_games AS
SELECT 
    g.gameID,
    g.sessionName,
    g.active,
    GROUP_CONCAT(CONCAT(p.firstName, ' ', p.lastName) SEPARATOR ',') AS players
FROM Games g
LEFT JOIN GameParticipants gp ON g.gameID = gp.gameID
LEFT JOIN Players p ON gp.playerID = p.playerID
GROUP BY g.gameID, g.sessionName;

-- #############################
-- SELECT prizes with players
-- #############################
DROP VIEW IF EXISTS v_select_prizes;

CREATE VIEW v_select_prizes AS
SELECT 
    pr.prizeID,
    pr.prizeName,
    pr.quantity,
    CONCAT(p.firstName, ' ', p.lastName) AS playerName,
    p.playerID
FROM Prizes pr
JOIN Players p ON pr.playerID = p.playerID;

-- #############################
-- SELECT moves with participants
-- #############################
DROP VIEW  IF EXISTS v_select_moves;

CREATE VIEW v_select_moves AS
SELECT 
    m.moveID,
    g.sessionName,
    CONCAT(p.firstName, ' ', p.lastName) AS playerName,
    m.startingPosition,
    m.endingPosition,
    m.stuck,
    m.cardColor
FROM Moves m
JOIN GameParticipants gp ON m.participantID = gp.participantID
JOIN Players p ON gp.playerID = p.playerID
JOIN Games g ON gp.gameID = g.gameID
ORDER BY m.moveID;

-- #############################
-- DELETE player by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_deletePlayer;

DELIMITER //
CREATE PROCEDURE sp_deletePlayer(IN p_playerID INT)
BEGIN
    DELETE FROM Players WHERE playerID = p_playerID;
END //
DELIMITER ;

-- #############################
-- DELETE game by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_deleteGame;

DELIMITER //
CREATE PROCEDURE sp_deleteGame(IN p_gameID INT)
BEGIN
    DELETE FROM Games WHERE gameID = p_gameID;
END //
DELIMITER ;

-- #############################
-- DELETE prize by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_deletePrize;

DELIMITER //
CREATE PROCEDURE sp_deletePrize(IN p_prizeID INT)
BEGIN
    DELETE FROM Prizes WHERE prizeID = p_prizeID;
END //
DELIMITER ;

-- #############################
-- DELETE move by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_deleteMove;

DELIMITER //
CREATE PROCEDURE sp_deleteMove(IN p_moveID INT)
BEGIN
    DELETE FROM Moves WHERE moveID = p_moveID;
END //
DELIMITER ;

-- #############################
-- DELETE PlayerParticipant by playerID and game sessionName if exits
-- #############################
DROP PROCEDURE IF EXISTS sp_deletePlayerParticipant;

DELIMITER //
CREATE PROCEDURE sp_deletePlayerParticipant(
    IN p_playerID INT,
    IN g_sessionName VARCHAR(255)
)
BEGIN
    DECLARE sessionGameID INT;
    SELECT gameID INTO sessionGameID FROM Games WHERE sessionName = g_sessionName;
    IF EXISTS (SELECT * FROM GameParticipants WHERE playerID = p_playerID AND gameID = sessionGameID) THEN
        DELETE FROM GameParticipants WHERE playerID = p_playerID AND gameID = sessionGameID;
    END IF;
END //
DELIMITER ;

-- #############################
-- DELETE PlayerParticipant by gameID and first and last name
-- #############################
DROP PROCEDURE IF EXISTS sp_deleteGameParticipant;

DELIMITER //
CREATE PROCEDURE sp_deleteGameParticipant(
    IN p_playerFirstName VARCHAR(255),
    IN p_playerLastName VARCHAR(255),
    IN g_gameID INT
)
BEGIN
    DECLARE playerNameID INT;
    SELECT playerID INTO playerNameID FROM Players WHERE firstName = p_playerFirstName AND lastName = p_playerLastName;
    IF EXISTS (SELECT * FROM GameParticipants WHERE playerID = playerNameID AND gameID = g_gameID) THEN
        DELETE FROM GameParticipants WHERE playerID = playerNameID AND gameID = g_gameID;
    END IF;
END //
DELIMITER ;

-- #############################
-- INSERT player
-- #############################
DROP PROCEDURE IF EXISTS sp_insertPlayer;

DELIMITER //
CREATE PROCEDURE sp_insertPlayer(
    IN p_firstName VARCHAR(255),
    IN p_lastName VARCHAR(255),
    OUT p_playerID INT
)
BEGIN
    INSERT INTO Players(firstName, lastName) VALUES(p_firstName, p_lastName);
    SET p_playerID = LAST_INSERT_ID();
END //
DELIMITER ;

-- #############################
-- INSERT playerParticipant (from sessionName and playerID) if not already exists
-- #############################
DROP PROCEDURE IF EXISTS sp_insertPlayerParticipant;

DELIMITER //
CREATE PROCEDURE sp_insertPlayerParticipant(
    IN p_playerID INT,
    IN g_sessionName VARCHAR(255)
)
BEGIN
    DECLARE sessionGameID INT;
    SELECT gameID INTO sessionGameID FROM Games WHERE sessionName = g_sessionName;
    IF NOT EXISTS (SELECT * FROM GameParticipants WHERE playerID = p_playerID AND gameID = sessionGameID) THEN
        INSERT INTO GameParticipants(playerID, gameID) VALUES(p_playerID, sessionGameID);
    END IF;
END //
DELIMITER ;

-- #############################
-- INSERT gameParticipant (from full player name and gameID) if not already exists
-- #############################
DROP PROCEDURE IF EXISTS sp_insertGameParticipant;

DELIMITER //
CREATE PROCEDURE sp_insertGameParticipant(
    IN p_playerFirstName VARCHAR(255),
    IN p_playerLastName VARCHAR(255),
    IN g_gameID INT
)
BEGIN
    DECLARE playerNameID INT;
    SELECT playerID INTO playerNameID FROM Players WHERE firstName = p_playerFirstName AND lastName = p_playerLastName;
    IF NOT EXISTS (SELECT * FROM GameParticipants WHERE playerID = playerNameID AND gameID = g_gameID) THEN
        INSERT INTO GameParticipants(playerID, gameID) VALUES(playerNameID, g_gameID);
    END IF;
END //
DELIMITER ;

-- #############################
-- INSERT game
-- #############################
DROP PROCEDURE IF EXISTS sp_insertGame;

DELIMITER //
CREATE PROCEDURE sp_insertGame(
    IN g_sessionName VARCHAR(255),
    IN g_active BOOLEAN,
    OUT g_gameID INT
)
BEGIN
    INSERT INTO Games(sessionName, active) VALUES(g_sessionName, g_active);
    SET g_gameID = LAST_INSERT_ID();
END //
DELIMITER ;

-- #############################
-- INSERT prize
-- #############################
DROP PROCEDURE IF EXISTS sp_insertPrize;

DELIMITER //
CREATE PROCEDURE sp_insertPrize(
    IN pr_prizeName VARCHAR(255),
    IN pr_quantity INT,
    IN pl_firstName VARCHAR(255),
    IN pl_lastName VARCHAR(255)
)
BEGIN
    DECLARE playerNameID INT;
    SELECT playerID INTO playerNameID FROM Players WHERE firstName = pl_firstName AND lastName = pl_lastName;
    INSERT INTO Prizes(prizeName, quantity, playerID) VALUES(pr_prizeName, pr_quantity, playerNameID);
END //
DELIMITER ;

-- #############################
-- INSERT move
-- #############################
DROP PROCEDURE IF EXISTS sp_insertMove;

DELIMITER //
CREATE PROCEDURE sp_insertMove(
    IN pl_firstName VARCHAR(255),
    IN pl_lastName VARCHAR(255),
    IN g_sessionName VARCHAR(255),
    IN m_startingPosition INT,
    IN m_endingPosition INT,
    IN m_stuck BOOLEAN,
    IN m_cardColor ENUM('Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink')
)
BEGIN
    DECLARE currentParticipantID INT;

    SELECT gp.participantID INTO currentParticipantID
    FROM GameParticipants gp
    JOIN Players p ON gp.playerID = p.playerID
    JOIN Games g ON gp.gameID = g.gameID
    WHERE p.firstName = pl_firstName AND p.lastName = pl_lastName AND g.sessionName = g_sessionName;

    INSERT INTO Moves(participantID, startingPosition, endingPosition, stuck, cardColor)
    VALUES(currentParticipantID, m_startingPosition, m_endingPosition, m_stuck, m_cardColor);
END //
DELIMITER ;

-- #############################
-- Edit player by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_editPlayer;

DELIMITER //
CREATE PROCEDURE sp_editPlayer(
    IN p_playerID INT,
    IN p_firstName VARCHAR(255),
    IN p_lastName VARCHAR(255)
)
BEGIN
    UPDATE Players
    SET firstName = p_firstName, lastName = p_lastName
    WHERE playerID = p_playerID;
END //
DELIMITER ;

-- #############################
-- Edit game by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_editGame;

DELIMITER //
CREATE PROCEDURE sp_editGame(
    IN g_gameID INT,
    IN g_sessionName VARCHAR(255),
    IN g_active BOOLEAN
)
BEGIN
    UPDATE Games
    SET sessionName = g_sessionName, active = g_active
    WHERE gameID = g_gameID;
END //
DELIMITER ;

-- #############################
-- Edit prize by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_editPrize;

DELIMITER //
CREATE PROCEDURE sp_editPrize(
    IN p_prizeID INT,
    IN pr_prizeName VARCHAR(255),
    IN pr_quantity INT,
    IN pl_firstName VARCHAR(255),
    IN pl_lastName VARCHAR(255)
)
BEGIN
    DECLARE playerNameID INT;
    SELECT playerID INTO playerNameID FROM Players WHERE firstName = pl_firstName AND lastName = pl_lastName;
    UPDATE Prizes
    SET prizeName = pr_prizeName, quantity = pr_quantity, playerID = playerNameID
    WHERE prizeID = p_prizeID;
END //
DELIMITER ;

-- #############################
-- Edit move by ID
-- #############################
DROP PROCEDURE IF EXISTS sp_editMove;

DELIMITER //
CREATE PROCEDURE sp_editMove(
    IN m_moveID INT,
    IN pl_firstName VARCHAR(255),
    IN pl_lastName VARCHAR(255),
    IN g_sessionName VARCHAR(255),
    IN m_startingPosition INT,
    IN m_endingPosition INT,
    IN m_stuck BOOLEAN,
    IN m_cardColor ENUM('Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink')
)
BEGIN
    DECLARE currentParticipantID INT;

    SELECT gp.participantID INTO currentParticipantID
    FROM GameParticipants gp
    JOIN Players p ON gp.playerID = p.playerID
    JOIN Games g ON gp.gameID = g.gameID
    WHERE p.firstName = pl_firstName AND p.lastName = pl_lastName AND g.sessionName = g_sessionName;

    UPDATE Moves
    SET participantID = currentParticipantID, startingPosition = m_startingPosition, endingPosition = m_endingPosition, stuck = m_stuck, cardColor = m_cardColor
    WHERE moveID = m_moveID;
END //
DELIMITER ;