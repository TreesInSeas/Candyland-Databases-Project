import { useState } from "react";

export default function PlayerAddMenu({setIsOpen, pageName, data}){
    const games = data || [];
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedGames, setSelectedGames] = useState([]);

    function toggleGameSelection(game) {
        if (selectedGames.includes(game)) {
            setSelectedGames(selectedGames.filter(g => g !== game));
        } else {
            setSelectedGames([...selectedGames, game]);
        }
    }

    return (
        <dialog open>
            <h2>Add new {pageName}</h2>
            <label>First Name:</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <br />
            <label>Last Name:</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <br />
            <label>In Games:</label>
            <div>
                {games.map(game => (
                    <>
                    <label key={game}>
                        <input type="checkbox" checked={selectedGames.includes(game)} onChange={() => toggleGameSelection(game)} />
                        {game}
                    </label>
                    <br />
                    </>
                ))}
            </div>
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(firstName, lastName, selectedGames); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

async function handleSubmit(firstName, lastName, games) {
    // add player to database
    let playerID;
    await fetch("http://classwork.engr.oregonstate.edu:7880/players", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: firstName.replace(/^\w/, c => c.toUpperCase()).replace(/\s+/g, '-'),
            lastName: lastName.replace(/^\w/, c => c.toUpperCase()).replace(/\s+/g, '-')
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Successfully added player:", data);
        playerID = data.playerID;
    })
    .catch(error => console.error("Error adding player:", error));

    // add player to games via M:M table
    games.forEach(async game => {
        await fetch("http://classwork.engr.oregonstate.edu:7880/playerParticipants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sessionName: game,
                playerID: playerID
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Successfully added player to game:", data);
        })
        .catch(error => console.error("Error adding player to game:", error));
    });

    // Reload page to show new player in list
    window.location.reload();
}