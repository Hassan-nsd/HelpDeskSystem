const API_URL = "http://localhost:5213/api";

export const getDashboard = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to load dashboard");

  return response.json();
};

export const getTickets = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to load tickets");

  return response.json();
};

export const getTicketById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5213/api/tickets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

export const getAssignableUsers = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5213/api/tickets/assignable-users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return await response.json();
};

export const assignTicket = async (ticketId, userId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:5213/api/tickets/${ticketId}/assign`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        userId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to assign ticket");
  }
};
