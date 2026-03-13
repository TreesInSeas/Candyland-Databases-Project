import { useState } from "react"

export default function MovesAddMenu({setIsOpen, pageName, data}){
    const players = data.players || [];
    const sessionName = data.sessionName || "";
    const participants = data.participants || [];
    const [selectedPlayer, setSelectedPlayer] = useState(participants[sessionName]?.[0] || "");
    const [startingPosition, setStartingPosition] = useState(0);
    const [endingPosition, setEndingPosition] = useState(0);
    const [stuck, setStuck] = useState(false);
    const [cardColor, setCardColor] = useState("red");

    return (
        <dialog open>
            <h2>Add new {pageName}</h2>
            <label>Player:</label>
            <select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer}>
                {participants[sessionName]?.map(player => (
                    <option key={player} value={player}>{player}</option>
                )) || []}
            </select>
            <br />
            <label>Starting Position:</label>
            <input type="number" min="0" max="150" defaultValue="0" onChange={(e) => setStartingPosition(parseInt(e.target.value))} value={startingPosition} />
            <br />
            <label>Ending Position:</label>
            <input type="number" min="0" max="150" defaultValue="0" onChange={(e) => setEndingPosition(parseInt(e.target.value))} value={endingPosition} />
            <br />
            <label>Stuck:</label>
            <input type="checkbox" onChange={(e) => setStuck(e.target.checked)} checked={stuck} />
            <br />
            <label>Card Color:</label>
            <select onChange={(e) => setCardColor(e.target.value)} value={cardColor}>
                <option value="red">Red</option>
                <option value="orange">Orange</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
            </select>
            <br />
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(selectedPlayer, startingPosition, endingPosition, stuck, cardColor, sessionName); setIsOpen(false)} }>Submit</button>
        </dialog>
    )
}

async function handleSubmit(selectedPlayer, startingPosition, endingPosition, stuck, cardColor, sessionName) {
    await fetch("http://classwork.engr.oregonstate.edu:7880/moves", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            playerFirstName: selectedPlayer.split(" ")[0],
            playerLastName: selectedPlayer.split(" ")[1],
            startingPosition,
            endingPosition,
            stuck,
            cardColor,
            sessionName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Successfully added player:", data);
        playerID = data.playerID;
    })
    .catch(error => console.error("Error adding player:", error));

    // Reload the page to show the new move in the list
    window.location.reload();
}