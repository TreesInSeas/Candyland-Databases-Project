/*
===== SELECTs =====
*/

-- Get player info
SELECT playerID, firstName, lastName FROM Players;

-- Get all games
SELECT gameID, sessionName, active FROM Games;

-- Get all prizes
SELECT prizeID, prizeName, quantity, playerID FROM Prizes;

-- Get all participants in a game
SELECT playerID FROM GameParticipants WHERE gameID = (SELECT gameID from Games where sessionName = :sessionName);

-- Get all moves from a player in a game
SELECT moveID, startingPosition, endingPosition, stuck, cardColor FROM Moves WHERE participantID = (SELECT participantID FROM GameParticipants WHERE gameID = (SELECT gameID from Games where sessionName = :sessionName) AND playerID = (SELECT playerID from Players where firstName = :firstName AND lastName = :lastName));

-- Get all moves for a game
SELECT participantID, moveID, startingPosition, endingPosition, stuck, cardColor FROM Moves WHERE participantID = (SELECT participantID FROM GameParticipants WHERE gameID = (SELECT gameID from Games where sessionName = :sessionName));

/*
===== INSERTs =====
*/

-- Insert new player
INSERT INTO Players
(firstName, lastName)
VALUES
(:firstName, :lastName);

-- Insert new game
INSERT INTO Games
(sessionName)
VALUES
(:sessionName);

-- Insert new prize
INSERT INTO Prizes
(prizeName, playerID)
VALUES
(:prizeName, (SELECT playerID from Players WHERE firstName = :firstName AND lastName = :lastName));

-- Add a player to a game
INSERT INTO GameParticipants
(playerID, gameID)
VALUES
((SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName), (SELECT gameID from Games WHERE sessionName = :sessionName));

-- Add a move to a game
INSERT INTO Moves
(participantID, startingPosition, endingPosition, cardColor)
VALUES
((SELECT participantID FROM GameParticipants WHERE playerID = (SELECT playerID from Players WHERE firstName = :firstName AND lastName = :lastName) AND gameID = (SELECT gameID from Games WHERE sessionName = :sessionName)), :startingPosition, :endingPosition, :cardColor);

/*
===== UPDATEs =====
*/

-- Change player name
UPDATE Players
SET firstName = :newFirstName
WHERE firstName = :oldFirstName;

-- Change game session name
UPDATE Games
SET sessionName = :newSessionName
WHERE sessionName = :oldSessionname;

-- Change prize quantity for player
UPDATE Prizes
SET quantity = :quantity
WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName) AND prizeName = :prizeName;

-- Swap out who is playing in a game
UPDATE GameParticipants
SET playerID = (SELECT playerID FROM Players WHERE firstName = :newFirstName AND lastName = :newLastName)
WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :oldFirstName AND lastName = :oldLastName);

-- Change how far a move is
UPDATE Moves
SET endingPosition = :newEndingPosition
WHERE participantID = (SELECT participantID FROM GameParticipants WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName) and gameID = (SELECT gameID from Games WHERE sessionName = :sessionName)) AND endingPosition = :oldEndingPosition;

/*
===== DELETEs =====
*/

-- Delete a player
DELETE FROM Players WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName);

-- Delete a game
DELETE FROM Games WHERE gameID = (SELECT gameID from Games WHERE sessionName = :sessionName);

-- Delete all a players prizes
DELETE FROM Prizes WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName);

-- Delete a player from a game session
DELETE FROM GameParticipants WHERE playerID = (SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName) AND gameID = (SELECT gameID from Games WHERE sessionName = :sessionName);

-- Delete the last move from a player
DELETE FROM Moves WHERE participantID = (SELECT participantID FROM GameParticipants WHERE playerID = ( SELECT playerID FROM Players WHERE firstName = :firstName AND lastName = :lastName)) ORDER BY moveID DESC LIMIT 1;