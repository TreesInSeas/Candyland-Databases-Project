import AddButton from "../components/AddButton"
import GamesAddMenu from "../components/add-menus/GamesAddMenu"
import GamesEditMenu from "../components/edit-menus/GamesEditMenu"
import { useState, useEffect } from "react"

// const games = [
//     { sessionName: "Dev playthrough", active: true, players: ["Hayden Barnes", "Olivia Fidler"] },
//     { sessionName: "Girlypop power", active: true, players: ["Hayden Barnes", "Olivia Fidler", "Lily Collins"] },
//     { sessionName: "Lonely Lobby", active: true, players: ["Lily Collins"] }
// ];

// const players = [
//     "Hayden Barnes",
//     "Olivia Fidler",
//     "Lily Collins"
// ];

export default function Games(){

    const [games, setGames] = useState([]);
    const [players, setPlayers] = useState([]);

    function getGames(){
        fetch("http://classwork.engr.oregonstate.edu:7880/games")
        .then(response => response.json())
        .then(data => {
            data.forEach(game => {
                game.players = game.players ? game.players.split(",") : [];
            });
            setGames(data);
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

    useEffect(() => {
        getGames();
        getPlayers();
    }, []);

    return (
        <>
            <h1>Games page</h1>
            <p>List of Games in the database</p>
            <AddButton pageName="Game" AddMenu={GamesAddMenu} data={players} />
            <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>Session Name</th>
                        <th>Active</th>
                        <th>Players</th>
                        <th>Edit/Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game, index) => {
                        return <GameRow key={index} game={game} players={players} />
                    })}
                </tbody>
            </table>
        </>
    )
};

function GameRow({game, players}){
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    return (
        <tr>
            <td>{game.sessionName}</td>
            <td>{game.active ? "Yes" : "No"}</td>
            <td><ul>{game.players.map(player => <li key={player}>{player}</li>)}</ul></td>
            <td>
                <button onClick={() => setIsEditMenuOpen(true)}>Edit</button>
                <button onClick={() => {
                    if (confirm("Are you sure you wish to delete this?")) {
                        fetch(`http://classwork.engr.oregonstate.edu:7880/games/${game.gameID}`, {
                            method: "DELETE"
                        })
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                console.error("Failed to delete game");
                            }
                        })
                        .catch(error => console.error("Error deleting game:", error));
                    }
                }}>Delete</button>
            </td>
            {isEditMenuOpen && (
                <GamesEditMenu setIsOpen={setIsEditMenuOpen} pageName="Game" gameData={game} players={players} />
            )}
        </tr>
    )
};