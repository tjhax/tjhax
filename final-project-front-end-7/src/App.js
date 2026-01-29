import './App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router";
import { Conversation } from './Conversation';
import { Conversations } from './Conversations';
import { Login } from './Login';
import Cookies from 'js-cookie'
import React from 'react';
import { useLocation } from 'react-router-dom';


function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const location = useLocation();
    const nav = useNavigate();

    function updateIsLoggedIn() {
        const auth = Cookies.get('auth');
        setIsLoggedIn(!!auth);
    }

    React.useEffect(() => {
        updateIsLoggedIn();
    }, [location.pathname]); // event listener that re-runs any time any of these values change

    return (
        <>
            <div>
                {isLoggedIn && (
                    <>
                        <Link to="/conversations">Conversations</Link>
                        <Link to="/" onClick={(event) => {
                            Cookies.remove('auth');
                        }}>
                            Log out
                        </Link>
                    </>
                )}
                {!isLoggedIn && (<Link to="/login">login</Link>)}
            </div>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login isLoggedIn={isLoggedIn} />} />
                <Route path="/conversations" element={<Conversations isLoggedIn={isLoggedIn} />} />
                <Route path="/conversation/:conversationId" element={<Conversation isLoggedIn={isLoggedIn} />} />
                <Route path="/conversation/" element={<Conversation isLoggedIn={isLoggedIn} />} />
            </Routes>
        </>
    );
}

export default App;
