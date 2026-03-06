function Home() {
    return (
        <>
            <h1>Home page</h1>
            <p>Welcome to the candyland database!</p>
            <button onClick={() => {
                fetch("http://classwork.engr.oregonstate.edu:7880/reset")
                .then(() => alert("Database reset successfully!"))
                .catch(error => console.error("Error resetting database:", error));
            }}>Reset Database</button>
        </>
    )
} export default Home;