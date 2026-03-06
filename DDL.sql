
-- Disable checks for easy adding
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;


-- Delete tables if they exist
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


-- Add data to
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


-- Reanable checks and commit
SET FOREIGN_KEY_CHECKS=1;
COMMIT;