import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import API from "../services/api";
import { useAuth } from "../auth/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            formData.append("email", email);
            formData.append("password", password);

            const response = await API.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            // Save user and JWT using AuthContext
            login(
                response.data.user,
                response.data.access_token
            );

            alert("Login Successful!");

            // Redirect to Dashboard
            navigate("/");

        } catch (error) {
            console.error("Login Error:", error);

            if (error.response) {
                alert(error.response.data.detail || "Invalid email or password");
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
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
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
                    Login
                </button>
            </form>

<p
    style={{
        marginTop: "20px",
        textAlign: "center",
    }}
>
    Don't have an account?{" "}
    <Link to="/register">
        Register
    </Link>
</p>

        </div>
    );
}

export default Login;