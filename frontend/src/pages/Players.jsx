import AddButton from "../components/AddButton"
import PlayerAddMenu from "../components/add-menus/PlayerAddMenu"
import PlayerEditMenu from "../components/edit-menus/PlayerEditMenu"
import { useState, useEffect } from "react"


export default function Players(){

    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);

    function getPlayers(){
        fetch("http://classwork.engr.oregonstate.edu:7880/players")
        .then(response => response.json())
        .then(data => {
            data.forEach(player => {
                player.games = player.games ? player.games.split(",") : [];
            });
            setPlayers(data);
        })
        .catch(error => console.error("Error fetching players:", error));
    }

    function getGames(){
        fetch("http://classwork.engr.oregonstate.edu:7880/games")
        .then(response => response.json())
        .then(data => {
            setGames(data.map(game => game.sessionName));
        })
        .catch(error => console.error("Error fetching games:", error));
    }


    useEffect(() => {
        getGames();
        getPlayers();
    }, []);
    

    return (
        <>
            <h1>Players page</h1>
            <p>List of Players in the database</p>
            <AddButton pageName="Player" AddMenu={PlayerAddMenu} data={games} />
            <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>In Games</th>
                        <th>Edit/Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) => {
                        return <PlayerRow key={index} player={player} games={games} />
                    })}
                </tbody>
            </table>
        </>
    )
};

function PlayerRow({player, games}){
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    return (
        <tr>
            <td>{player.firstName}</td>
            <td>{player.lastName}</td>
            <td><ul>{player.games.map(game => <li key={game}>{game}</li>)}</ul></td>
            <td>
                <button onClick={() => setIsEditMenuOpen(true)}>Edit</button>
                <button onClick={() => {
                    if (confirm("Are you sure you wish to delete this?")) {
                        fetch(`http://classwork.engr.oregonstate.edu:7880/players/${player.playerID}`, {
                            method: "DELETE"
                        })
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                console.error("Failed to delete player");
                            }
                        })
                        .catch(error => console.error("Error deleting player:", error));
                    }
                }}>Delete</button>
            </td>
            {isEditMenuOpen && (
                <PlayerEditMenu setIsOpen={setIsEditMenuOpen} pageName="Player" playerData={player} games={games} />
            )}
        </tr>
    )
}