import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConnectedApis from "./pages/ConnectedApis";
import LogExplorer from "./pages/LogExplorer";

import ProtectedRoute from "./auth/ProtectedRoute";
import HomeRedirect from "./auth/HomeRedirect";
import { AuthProvider } from "./auth/AuthContext";

function App() {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    {/* Home */}
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

                    {/* Dashboard */}
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

                    {/* Connected APIs */}
                    <Route
                        path="/connected-apis"
                        element={
                            <ProtectedRoute>
                                <ConnectedApis
                                    darkMode={darkMode}
                                    setDarkMode={setDarkMode}
                                />
                            </ProtectedRoute>
                        }
                    />

                    {/* Log Explorer */}
                    <Route
                        path="/logs"
                        element={
                            <ProtectedRoute>
                                <LogExplorer
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