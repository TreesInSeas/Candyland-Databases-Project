import { useState } from "react";

export default function PlayerEditMenu({setIsOpen, pageName, playerData, games}){

    const [firstName, setFirstName] = useState(playerData.firstName || "");
    const [lastName, setLastName] = useState(playerData.lastName || "");
    const [selectedGamesMap, setSelectedGamesMap] = useState(new Map(games.map(game => [game, playerData.games.includes(game)])));

    return (
        <dialog open>
            <h2>Edit {pageName}</h2>
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
                        <input type="checkbox" checked={selectedGamesMap.get(game)} onChange={() => handleGameSelection(game, setSelectedGamesMap)} />
                        {game}
                    </label>
                    <br />
                    </>
                ))}
                <br />
            </div>
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(firstName, lastName, selectedGamesMap, playerData.playerID); setIsOpen(false); }}>Submit</button>
        </dialog>
    )
}

function handleGameSelection(game, setSelectedGamesMapFunction) {
    setSelectedGamesMapFunction(prev => {
        const newMap = new Map(prev);
        newMap.set(game, !newMap.get(game));
        return newMap;
    });
}

async function handleSubmit(firstName, lastName, games, playerID) {
    await fetch(`http://classwork.engr.oregonstate.edu:7880/players`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: firstName.replace(/^\w/, c => c.toUpperCase()).replace(/\s+/g, '-'),
            lastName: lastName.replace(/^\w/, c => c.toUpperCase()).replace(/\s+/g, '-'),
            playerID: playerID
        })
    });

    for (const [game, isSelected] of games.entries()) {
        if (isSelected) {
            await fetch(`http://classwork.engr.oregonstate.edu:7880/playerParticipants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerID: playerID,
                    sessionName: game
                })
            });
        } else {
            await fetch(`http://classwork.engr.oregonstate.edu:7880/playerParticipants`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerID: playerID,
                    sessionName: game
                })
            });
        }
    }

    window.location.reload();
}