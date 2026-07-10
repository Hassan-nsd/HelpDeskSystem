const API_URL =
  "https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api";

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

  const response = await fetch(`${API_URL}/tickets/${id}`, {
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

  const response = await fetch(`${API_URL}/tickets/assignable-users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const assignTicket = async (ticketId, userId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to assign ticket");
  }
};

export const getComments = async (ticketId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/comments/${ticketId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load comments");
  }

  return await response.json();
};

export const addComment = async (ticketId, comment) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ticketId,
      comment,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add comment");
  }

  return true;
};

export const deleteComment = async (commentId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
};

export const updateComment = async (commentId, comment) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      comment,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update comment");
  }

  return await response.json();
};

export const updateTicketStatus = async (ticketId, status) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket status");
  }

  return await response.json();
};

export const getAttachments = async (ticketId) => {
  const response = await fetch(`${API_URL}/attachments/ticket/${ticketId}`);

  if (!response.ok) {
    throw new Error("Failed to load attachments");
  }

  return await response.json();
};

export const uploadAttachment = async (ticketId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/attachments/${ticketId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload attachment");
  }

  return await response.json();
};

export const getReports = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load reports");
  }

  return await response.json();
};

export const getNotifications = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const markNotificationAsRead = async (id) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTicket = async (ticketId, ticket) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ticket),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket");
  }

  return await response.json();
};

export const deleteTicket = async (ticketId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return await response.json();
};

export const getCategories = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  return await response.json();
};

export const getPriorities = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/priorities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load priorities");
  }

  return await response.json();
};

export const getUsers = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return await response.json();
};

export const getUser = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return await response.json();
};

export const createUser = async (user) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return await response.json();
};

export const updateUser = async (id, user) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }
};

export const deactivateUser = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate user");
  }
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete user");
  }
};

export const analyzeTicket = async (title, description) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/analyze-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze ticket");
  }

  return await response.json();
};
