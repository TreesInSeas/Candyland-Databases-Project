import { useState } from "react";

export default function PrizesEditMenu({setIsOpen, pageName, prizeData, players}){
    const [player, setPlayer] = useState(prizeData.playerName || "");
    const [prizeName, setPrizeName] = useState(prizeData.prizeName || "");
    const [quantity, setQuantity] = useState(prizeData.quantity || 1);

    return (
        <dialog open>
            <h2>Edit {pageName}</h2>
            <label>Player</label>
            <select defaultValue={prizeData.playerName || ""} onChange={(e) => setPlayer(e.target.value)}>
                {players.map(player => (
                    <option key={player} value={player}>{player}</option>
                ))}
            </select>
            <br />
            <label>Prize Name:</label>
            <input type="text" defaultValue={prizeData.prizeName || ""} onChange={(e) => setPrizeName(e.target.value)} />
            <br />
            <label>Quantity:</label>
            <input type="number" defaultValue={prizeData.quantity || 1} min="1" onChange={(e) => setQuantity(parseInt(e.target.value))} />
            <br />
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(prizeName, quantity, player, prizeData.prizeID); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

function handleSubmit(prizeName, quantity, player, prizeID) {
    fetch(`http://classwork.engr.oregonstate.edu:7880/prizes`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prizeName: prizeName,
            quantity: quantity,
            playerFirstName: player.split(" ")[0],
            playerLastName: player.split(" ")[1],
            prizeID: prizeID
        })
    });

    window.location.reload();
}