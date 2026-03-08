import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import EventConfig from "./pages/EventConfig";
import PeopleAndGroups from "./pages/PeopleAndGroups";
import GroupsPage from "./pages/GroupsPage";
import UsersAndPermissions from "./pages/UsersAndPermissions";
import Analytics from "./pages/Analytics";
import Attendance from "./pages/Attendance";
import AttendanceHome from "./pages/AttendanceHome";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ErrorModal from "./components/ui/ErrorModal";

export default function App() {
  const [error, setError] = useState(null);
  const location = useLocation();
  const isAuthenticated = typeof window !== "undefined" && Boolean(window.localStorage.getItem("auth_token"));
  const publicPaths = ["/login", "/register"];
  const isPublic = publicPaths.includes(location.pathname);

  useEffect(() => {
    function handleError(event) {
      const message = event?.detail?.message || "Error inesperado";
      setError(message);
    }

    window.addEventListener("app:error", handleError);
    return () => window.removeEventListener("app:error", handleError);
  }, []);

  return (
    <>
      {!isAuthenticated && !isPublic ? <Navigate to="/login" replace /> : null}
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/events/:id/config" element={<EventConfig />} />
      <Route path="/admin/people-and-groups" element={<PeopleAndGroups />} />
        <Route path="/admin/groups" element={<GroupsPage />} />
        <Route path="/admin/security" element={<UsersAndPermissions />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/staff/attendance" element={<AttendanceHome />} />
        <Route path="/staff/attendance/event/:eventId" element={<Attendance />} />
        <Route path="/staff/attendance/desktop" element={<Navigate to="/staff/attendance" replace />} />
        <Route path="/staff/attendance/tablet" element={<Navigate to="/staff/attendance" replace />} />
        <Route path="/staff/attendance/variant-3" element={<Navigate to="/staff/attendance" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      <ErrorModal
        open={Boolean(error)}
        title="Solicitud rechazada"
        message={error || ""}
        onClose={() => setError(null)}
      />
    </>
  );
}
