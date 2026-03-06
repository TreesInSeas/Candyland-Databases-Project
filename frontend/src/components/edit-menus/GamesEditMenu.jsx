import { useState } from "react";

export default function GamesEditMenu({setIsOpen, pageName, gameData, players}){

    const [sessionName, setSessionName] = useState(gameData.sessionName || "");
    const [active, setActive] = useState(gameData.active || false);
    const [selectedPlayers, setSelectedPlayers] = useState(new Map(players.map(player => [player, gameData.players.includes(player)])));

    return (
        <dialog open>
            <h2>Edit {pageName}</h2>
            <label>Session Name:</label>
            <input type="text" defaultValue={gameData.sessionName || ""} value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
            <br />
            <label>Active:</label>
            <input type="checkbox" defaultChecked={gameData.active || false} checked={active} onChange={(e) => setActive(e.target.checked)} />
            <br />
            <label>In Games:</label>
            <div>
                {players.map(player => (
                    <>
                    <label key={player}>
                        <input type="checkbox" defaultChecked={gameData.players.includes(player)} checked={selectedPlayers.get(player)} onChange={() => handlePlayerSelection(player, setSelectedPlayers)} />
                        {player}
                    </label>
                    <br />
                    </>
                ))}
                <br />
            </div>
            <button onClick={() => setIsOpen(false)}>Close</button>
            <button onClick={() => { handleSubmit(sessionName, active, selectedPlayers, gameData.gameID); setIsOpen(false) }}>Submit</button>
        </dialog>
    )
}

function handlePlayerSelection(player, setSelectedPlayersFunction) {
    setSelectedPlayersFunction(prev => {
        const newMap = new Map(prev);
        newMap.set(player, !newMap.get(player));
        return newMap;
    });
}

async function handleSubmit(sessionName, active, players, gameID) {
    await fetch(`http://classwork.engr.oregonstate.edu:7880/games`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionName: sessionName,
            active: active,
            gameID: gameID
        })
    });
    
    for (const [player, isSelected] of players.entries()) {
        if (isSelected) {
            await fetch(`http://classwork.engr.oregonstate.edu:7880/gameParticipants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerFirstName: player.split(' ')[0],
                    playerLastName: player.split(' ')[1],
                    gameID: gameID
                })
            });
        } else {
            await fetch(`http://classwork.engr.oregonstate.edu:7880/gameParticipants`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerFirstName: player.split(' ')[0],
                    playerLastName: player.split(' ')[1],
                    gameID: gameID
                })
            });
        }
    }

    window.location.reload();
}