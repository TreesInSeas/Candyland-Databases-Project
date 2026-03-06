import { useState } from "react";


export default function AddButton({pageName, AddMenu, data}){
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                Add new {pageName}
            </button>

            {isOpen && (
                <AddMenu setIsOpen={setIsOpen} pageName={pageName} data={data} />
            )}
        </>
    )
};