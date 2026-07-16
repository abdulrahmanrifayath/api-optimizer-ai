import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import API from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await API.post("/users/", {
                name,
                email,
                password,
            });

            alert("Registration Successful!");

            navigate("/login");

        } catch (error) {

            console.error(error);

            if (error.response) {
                alert(error.response.data.detail || "Registration failed");
            } else {
                alert("Unable to connect to the server.");
            }

        }

    };

    return (

        <div
            style={{
                width: "350px",
                margin: "100px auto",
                padding: "25px",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >

            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "15px" }}>
                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                        }}
                        required
                    />

                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                        }}
                        required
                    />

                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                        }}
                        required
                    />

                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                    }}
                >
                    Register
                </button>

            </form>

            <p
    style={{
        marginTop: "20px",
        textAlign: "center",
    }}
>
    Already have an account?{" "}
    <Link to="/login">
        Login
    </Link>
</p>


        </div>

    );

}

export default Register;