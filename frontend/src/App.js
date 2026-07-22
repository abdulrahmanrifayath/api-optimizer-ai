import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConnectedApis from "./pages/ConnectedApis";
import LogExplorer from "./pages/LogExplorer";
import ExecutiveDashboardPage from "./pages/ExecutiveDashboardPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";

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
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Main Pages */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/executive-dashboard"
                        element={
                            <ProtectedRoute>
                                <ExecutiveDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/connected-apis"
                        element={
                            <ProtectedRoute>
                                <ConnectedApis darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/logs"
                        element={
                            <ProtectedRoute>
                                <LogExplorer darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ai-insights"
                        element={
                            <ProtectedRoute>
                                <AIInsightsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <AlertsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;