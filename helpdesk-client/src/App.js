import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/adminDashboard";
import Tickets from "./pages/Tickets.jsx";
import CreateTicket from "./pages/createTicket.jsx";
import TicketDetails from "./pages/ticketDeatils.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/adminDashboard" element={<AdminDashboard />} />

        <Route path="/tickets" element={<Tickets />} />

        <Route path="/createTicket" element={<CreateTicket />} />

        <Route path="/tickets/:id" element={<TicketDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
