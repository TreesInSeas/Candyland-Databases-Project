import AddButton from "../components/AddButton"
import PrizesAddMenu from "../components/add-menus/PrizesAddMenu"
import PrizesEditMenu from "../components/edit-menus/PrizesEditMenu"
import { useState, useEffect } from "react"

// const prizes = [
//     { player: "Hayden Barnes", name: "Gaming PC", quantity: 1 },
//     { player: "Olivia Fidler", name: "Glass egg", quantity: 1 },
//     { player: "Lily Collins", name: "Stuffed Bear", quantity: 1 }
// ];

// const players = [
//     "Hayden Barnes",
//     "Olivia Fidler",
//     "Lily Collins"
// ];

export default function Prizes(){

    const [prizes, setPrizes] = useState([]);
    const [players, setPlayers] = useState([]);

    function getPrizes(){
        fetch("http://classwork.engr.oregonstate.edu:7880/prizes")
        .then(response => response.json())
        .then(data => setPrizes(data))
        .catch(error => console.error("Error fetching prizes:", error));
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
        getPrizes();
        getPlayers();
    }, []);

    return (
        <>
            <h1>Prizes page</h1>
            <p>List of Prizes in the database</p>
            <AddButton pageName="Prize" AddMenu={PrizesAddMenu} data={players} />
            <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Edit/Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {prizes.map((prize, index) => {
                        return <PrizeRow key={index} prize={prize} players={players} />
                    })}
                </tbody>
            </table>
        </>
    )
};

function PrizeRow({prize, players}){
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    return (
        <tr>
            <td>{prize.playerName}</td>
            <td>{prize.prizeName}</td>
            <td>{prize.quantity}</td>
            <td>
                <button onClick={() => setIsEditMenuOpen(true)}>Edit</button>
                <button onClick={() => {
                    if (confirm("Are you sure you wish to delete this?")) {
                        fetch(`http://classwork.engr.oregonstate.edu:7880/prizes/${prize.prizeID}`, {
                            method: "DELETE"
                        })
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                console.error("Failed to delete prize");
                            }
                        })
                        .catch(error => console.error("Error deleting prize:", error));
                    }
                }}>Delete</button>
            </td>
            {isEditMenuOpen && (
                <PrizesEditMenu setIsOpen={setIsEditMenuOpen} pageName="Prize" prizeData={prize} players={players} />
            )}
        </tr>
    )
};