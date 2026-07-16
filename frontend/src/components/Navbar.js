import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaMoon,
    FaSearch,
    FaUserCircle,
    FaSignOutAlt
} from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";

import "../styles/navbar.css";

function Navbar({
    darkMode,
    setDarkMode
}) {

    const [time, setTime] = useState("");

    const navigate = useNavigate();

    const { logout, user } = useAuth();

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

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

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
                    onClick={() => setDarkMode(!darkMode)}
                >

                    <FaMoon />

                </button>

                <div className="profile">

                    <FaUserCircle size={28} />

                    <span>

                        {user?.name || "User"}

                    </span>

                </div>

                <button
                    className="icon-btn"
                    onClick={handleLogout}
                    title="Logout"
                >

                    <FaSignOutAlt />

                </button>

            </div>

        </header>

    );

}

export default Navbar;