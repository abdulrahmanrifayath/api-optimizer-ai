import { useEffect, useState } from "react";
import {
    FaBell,
    FaMoon,
    FaSearch,
    FaUserCircle
} from "react-icons/fa";

import "../styles/navbar.css";

function Navbar({

    darkMode,

    setDarkMode

}) {
    const [time, setTime] = useState("");

    useEffect(() => {

        const updateClock = () => {

            setTime(
                new Date().toLocaleTimeString()
            );

        };

        updateClock();

        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);

    }, []);

    return (

        <header className="navbar">

            <div className="logo">

                🚀 API Optimizer AI

            </div>

            <div className="navbar-search">

                <FaSearch />

                <input
                    type="text"
                    placeholder="Search..."
                />

            </div>

            <div className="navbar-right">

                <span className="clock">

                    🕒 {time}

                </span>

                <button className="icon-btn">

                    <FaBell />

                    <span className="badge">

                        3

                    </span>

                </button>

                <button

                className="icon-btn"

                onClick={() =>

                setDarkMode(!darkMode)

                }

                >
               <FaMoon />

                </button>

                <div className="profile">

                    <FaUserCircle size={28} />

                    <span>

                        Abdul

                    </span>

                </div>

            </div>

        </header>

    );

}

export default Navbar;