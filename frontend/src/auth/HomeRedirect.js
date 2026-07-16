import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function HomeRedirect() {

    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
}

export default HomeRedirect;