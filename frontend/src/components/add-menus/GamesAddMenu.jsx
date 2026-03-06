import { useState } from "react";

export default function GamesAddMenu({setIsOpen, pageName, data}){
    const players = data || [];
    const [sessionName, setSelectedSessionName] = useState("");
    const [active, setActive] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    function togglePlayerSelection(player) {
        if (selectedPlayers.includes(player)) {
            setSelectedPlayers(selectedPlayers.filter(p => p !== player));
        } else {
            setSelectedPlayers([...selectedPlayers, player]);
        }
    }

    return (
        <dialog open>
            <h2>Add new {pageName}</h2>
            <label>Session Name:</label>
            <input type="text" value={sessionName} onChange={(e) => setSelectedSessionName(e.target.value)} />
            <br />
            <label>Active:</label>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <br />
            <label>Has players:</label>
            <div>
                {players.map(player => (
                    <>
                    <label key={player}>
                        <input type="checkbox" name="players" value={player} checked={selectedPlayers.includes(player)} onChange={() => togglePlayerSelection(player)} />
                        {player}
                    </label>
                    <br />
                    </>
                ))}
                <br />
            </div>
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(sessionName, active, selectedPlayers); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

async function handleSubmit(sessionName, active, players) {

    // add game to database
    let gameID;
    await fetch("http://classwork.engr.oregonstate.edu:7880/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sessionName: sessionName,
            active: active
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Successfully added game:", data);
        gameID = data.gameID;
    })
    .catch(error => console.error("Error adding game:", error));

    // add player to games via M:M table
    players.forEach(async player => {
        await fetch("http://classwork.engr.oregonstate.edu:7880/gameParticipants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerFirstName: player.split(" ")[0],
                playerLastName: player.split(" ")[1],
                gameID: gameID
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Successfully added player to game:", data);
        })
        .catch(error => console.error("Error adding player to game:", error));
    });

    // Reload page to show new game in list
    window.location.reload();
}