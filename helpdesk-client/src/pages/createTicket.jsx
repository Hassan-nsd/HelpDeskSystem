import { useEffect, useState } from "react";
import "../styles/createTicket.css";
import "../styles/Dashboard.css";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import createTicket from "../images/create_ticket.png";

function CreateTicket() {
  const [ticket, setTicket] = useState({
    title: "",
    description: "",
    categoryId: "",
    priorityId: "",
  });

  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");

      const categoryResponse = await fetch(
        "http://localhost:5213/api/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const priorityResponse = await fetch(
        "http://localhost:5213/api/priorities",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategories(await categoryResponse.json());
      setPriorities(await priorityResponse.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setTicket({
      ...ticket,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5213/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticket),
      });

      if (response.ok) {
        alert("Ticket created successfully");

        setTicket({
          title: "",
          description: "",
          categoryId: "",
          priorityId: "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <NavBar isOpen={sidebarOpen} />
        <main className="main-content">
          <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="create-ticket-page">
            <div className="page-header">
              <h2>Create Ticket</h2>
            </div>
            <div className="create-ticket-content">
              <div className="form-card">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Title</label>

                    <input
                      type="text"
                      name="title"
                      value={ticket.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>

                    <select
                      name="categoryId"
                      value={ticket.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>

                    <select
                      name="priorityId"
                      value={ticket.priorityId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Priority</option>

                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <textarea
                      rows="5"
                      name="description"
                      value={ticket.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Create Ticket
                  </button>
                </form>
              </div>
              <div className="image">
                <img src={createTicket} alt="Create Ticket Illustration" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default CreateTicket;
