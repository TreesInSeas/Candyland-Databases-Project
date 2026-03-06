import { useState } from "react";

export default function MovesEditMenu({setIsOpen, pageName, moveData, players, sessionName}){

    const [currentPlayer, setPlayer] = useState(moveData.playerName || "");
    const [startingPosition, setStartingPosition] = useState(moveData.startingPosition || 0);
    const [endingPosition, setEndingPosition] = useState(moveData.endingPosition || 0);
    const [stuck, setStuck] = useState(moveData.stuck || false);
    const [cardColor, setCardColor] = useState(moveData.cardColor || "Red");

    return (
        <dialog open>
            <h2>Edit {pageName}</h2>
            <label>Player:</label>
            <select defaultValue={moveData.playerName} onChange={(e) => setPlayer(e.target.value)} value={currentPlayer}>
                {players.map(player => (
                    <option key={player} value={player}>{player}</option>
                ))}
            </select>
            <br />
            <label>Starting Position:</label>
            <input type="number" defaultValue={moveData.startingPosition || 0} onChange={(e) => setStartingPosition(parseInt(e.target.value))} />
            <br />
            <label>Ending Position:</label>
            <input type="number" defaultValue={moveData.endingPosition || 0} onChange={(e) => setEndingPosition(parseInt(e.target.value))} />
            <br />
            <label>Stuck:</label>
            <input type="checkbox" defaultChecked={moveData.stuck || false} onChange={(e) => setStuck(e.target.checked)} />
            <br />
            <label>Card Color:</label>
            <select defaultValue={moveData.cardColor || "Red"} onChange={(e) => setCardColor(e.target.value)}>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Purple">Purple</option>
            </select>
            <br />
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(currentPlayer, startingPosition, endingPosition, stuck, cardColor, moveData.moveID, sessionName); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

function handleSubmit(player, startingPosition, endingPosition, stuck, cardColor, moveID, sessionName) {
    fetch(`http://classwork.engr.oregonstate.edu:7880/moves`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playerFirstName: player.split(" ")[0],
            playerLastName: player.split(" ")[1],
            startingPosition: startingPosition,
            endingPosition: endingPosition,
            stuck: stuck,
            cardColor: cardColor,
            moveID: moveID,
            sessionName: sessionName
        })
    }).catch(err => alert("Error editing move (is the player part of the current game?)"));

    window.location.reload();
}