import AddButton from "../components/AddButton"
import MovesAddMenu from "../components/add-menus/MovesAddMenu"
import MovesEditMenu from "../components/edit-menus/MovesEditMenu"
import { useState, useEffect } from "react"

export default function Moves(){
    const [selectedGame, setSelectedGame] = useState("");
    const [games, setGames] = useState({});
    const [moves, setMoves] = useState([]);
    const [players, setPlayers] = useState([]);
    const [participants, setParticipants] = useState([]);

    function getMoves(){
        fetch("http://classwork.engr.oregonstate.edu:7880/moves")
        .then(response => response.json())
        .then(data => {
            const gamesData = {};
            data.forEach(move => {
                const gameName = move.sessionName;
                if (!Object.keys(gamesData).includes(gameName)) {
                    gamesData[gameName] = [];
                }
                gamesData[gameName].push(move);
            });
            setMoves(gamesData);
        })
        .catch(error => console.error("Error fetching moves:", error));
    }

    function getGames(){
        fetch("http://classwork.engr.oregonstate.edu:7880/games")
        .then(response => response.json())
        .then(data => {
            const gamesData = {};
            data.forEach(game => {
                gamesData[game.sessionName] = [];
            });
            setGames(gamesData);
            getMoves();
        })
        .catch(error => console.error("Error fetching games:", error));
    }

    function getPlayers(){
        fetch("http://classwork.engr.oregonstate.edu:7880/players")
        .then(response => response.json())
        .then(data => {
            const playerNames = data.map(player => player.firstName + " " + player.lastName);
            setPlayers(playerNames);
        })
        .catch(error => console.error("Error fetching players:", error));
    }

    function getParticipants(){
        fetch("http://classwork.engr.oregonstate.edu:7880/playerParticipants")
        .then(response => response.json())
        .then(data => {
            let participantsData = {};
            Object.keys(data).forEach(game => {
                participantsData[game] = data[game].map(participant => participant.firstName + " " + participant.lastName);
            });
            setParticipants(participantsData);
            console.log(participantsData);
        })
        .catch(error => console.error("Error fetching participants:", error));
    }

    useEffect(() => {
        getGames();
        getPlayers();
        getParticipants();
    }, []);

    useEffect(() => {
        if (Object.keys(games).length > 0) {
            setSelectedGame(Object.keys(games)[0]);
        }
    }, [games]);

    return (
        <>
            <h1>Move page</h1>
            <p>List of Moves in the database</p>
            <label>Game:</label>
            <select onChange={(e) => setSelectedGame(e.target.value)}>
                {Object.keys(games).map(game => (
                    <option key={game} value={game}>{game}</option>
                ))}
            </select>
            <br /><br />
            <AddButton pageName="Move" AddMenu={MovesAddMenu} data={{players, sessionName: selectedGame, participants}} />
            <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Starting Position</th>
                        <th>Ending Position</th>
                        <th>Stuck</th>
                        <th>Card Color</th>
                        <th>Edit/Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {moves[selectedGame] && moves[selectedGame].map((move, index) => (
                        <MoveRow key={index} move={move} index={index} players={players} selectedGame={selectedGame} participants={participants} />
                    ))}
                </tbody>
            </table>
        </>
    )
};

function MoveRow({ move, index, players, selectedGame, participants, currentSessionName }) {
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    return (
        <>
            <tr>
                <td>{move.playerName}</td>
                <td>{move.startingPosition}</td>
                <td>{move.endingPosition}</td>
                <td>{move.stuck ? "Yes" : "No"}</td>
                <td>{move.cardColor}</td>
                <td>
                    <button onClick={() => setIsEditMenuOpen(true)}>Edit</button>
                    <button onClick={() => {
                        if (confirm("Are you sure you wish to delete this?")) {
                            fetch(`http://classwork.engr.oregonstate.edu:7880/moves/${move.moveID}`, {
                                method: "DELETE"
                            })
                            .then(response => {
                                if (response.ok) {
                                    window.location.reload();
                                } else {
                                    console.error("Failed to delete move");
                                }
                            })
                            .catch(error => console.error("Error deleting move:", error));
                        }
                    }}>Delete</button>
                </td>
            </tr>
            {isEditMenuOpen && (
                <tr>
                    <td colSpan={6}>
                        <MovesEditMenu setIsOpen={setIsEditMenuOpen} pageName="Move" moveData={move} players={players} sessionName={selectedGame} participants={participants} />
                    </td>
                </tr>
            )}
        </>
    )
}