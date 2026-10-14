
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="/admin"
          element={<h2>Admin Dashboard - Coming Soon</h2>}
        />

        <Route
          path="/user"
          element={<h2>User Dashboard - Coming Soon</h2>}
        />

        <Route
          path="/owner"
          element={<h2>Store Owner Dashboard - Coming Soon</h2>}
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
