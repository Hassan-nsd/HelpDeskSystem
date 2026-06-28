import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Tickets from "./pages/Tickets.jsx";
import CreateTicket from "./pages/createTicket.jsx";
import TicketDetails from "./pages/ticketDeatils.jsx";
import Reports from "./pages/Reports.jsx";
import Users from "./pages/users.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/tickets" element={<Tickets />} />

        <Route path="/createTicket" element={<CreateTicket />} />

        <Route path="/tickets/:id" element={<TicketDetails />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/users" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
