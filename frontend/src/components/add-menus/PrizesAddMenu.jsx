import { useState } from "react";

export default function PrizesAddMenu({setIsOpen, pageName, data}){
    const players = data || [];
    const [selectedPlayer, setSelectedPlayer] = useState(players.length > 0 ? players[0] : null);
    const [prizeName, setPrizeName] = useState("");
    const [quantity, setQuantity] = useState(1);

    return (
        <dialog open>
            <h2>Add new {pageName}</h2>
            <label>Player:</label>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
                {players.map(player => (
                    <option key={player} value={player}>{player}</option>
                ))}
            </select>
            <br />
            <label>Prize name:</label>
            <input type="text" value={prizeName} onChange={(e) => setPrizeName(e.target.value)} />
            <br />
            <label>Quantity:</label>
            <input type="number" min="1" defaultValue="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <br />
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(selectedPlayer, prizeName, quantity); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

async function handleSubmit(playerName, prizeName, quantity) {
    // add prize to database
    await fetch("http://classwork.engr.oregonstate.edu:7880/prizes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            playerFirstName: playerName.split(' ')[0],
            playerLastName: playerName.split(' ')[1],
            prizeName,
            quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Successfully added prize:", data);
    });

    // Reload page to show new prize in list
    window.location.reload();
}