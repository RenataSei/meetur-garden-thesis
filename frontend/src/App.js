// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";
import AppLayout from "./components/AppLayout";

// Auth
import { useAuthContext } from "./hooks/useAuthContext";

// Pages
import Home from "./pages/Home";
import Plants from "./pages/PlantsList";
import NewPlant from "./pages/NewPlant";
import EditPlant from "./pages/EditPlant";
import PlantDetail from "./pages/PlantDetail";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";

function RequireAuth({ children }) {
  const { user } = useAuthContext();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <SidebarProvider>
      <AppLayout>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/plants"
            element={
              <RequireAuth>
                <Plants />
              </RequireAuth>
            }
          />
          <Route
            path="/plants/new"
            element={
              <RequireAuth>
                <NewPlant />
              </RequireAuth>
            }
          />
          <Route
            path="/plants/:id"
            element={
              <RequireAuth>
                <PlantDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/plants/:id/edit"
            element={
              <RequireAuth>
                <EditPlant />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </SidebarProvider>
  );
}
