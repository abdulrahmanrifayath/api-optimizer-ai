import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./auth/ProtectedRoute";
import HomeRedirect from "./auth/HomeRedirect";
import { AuthProvider } from "./auth/AuthContext";

function App() {

    const [darkMode, setDarkMode] = useState(false);

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* Home Route */}

                    <Route
                        path="/"
                        element={<HomeRedirect />}
                    />

                    {/* Login */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* Register */}

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* Protected Dashboard */}

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>

                                <Dashboard
                                    darkMode={darkMode}
                                    setDarkMode={setDarkMode}
                                />

                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );

}

export default App;