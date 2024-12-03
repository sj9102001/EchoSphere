import React, { useState, ReactNode } from "react";

// Define the interface for the modal state
// interface ModalState {
//     searchUserModalIsOpen: boolean;
//     searchUserModalChange: () => void;
//     createPostModalIsOpen: boolean;
//     createPostModalChange: () => void;
// }

// Create the context with default values
export const ModalContext = React.createContext({
    searchUserModalIsOpen: false,
    searchUserModalChange: (boolean) => {},
    createPostModalIsOpen: false,
    createPostModalChange: (boolean) => {},
});

// Create the ModalProvider component
export const ModalProvider = ({ children }) => {
    const [searchUserModalIsOpen, setSearchUserModalIsOpen] = useState(false);
    const [createPostModalIsOpen, setCreatePostModalIsOpen] = useState(false);

    // Toggle handlers
    const searchUserModalChange = (changeTo) => setSearchUserModalIsOpen(changeTo);
    const createPostModalChange = (changeTo) => setCreatePostModalIsOpen(changeTo);

    return <ModalContext.Provider
            value={{
                searchUserModalIsOpen,
                searchUserModalChange,
                createPostModalIsOpen,
                createPostModalChange,
            }}
        >
            {children}
        </ModalContext.Provider>;
};
