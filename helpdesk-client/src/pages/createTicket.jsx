import { useEffect, useState } from "react";
import "../styles/createTicket.css";
import "../styles/Dashboard.css";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import createTicket from "../images/create_ticket.png";
import Select from "react-select/base";
import { analyzeTicket } from "../services/api";

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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");

      const categoryResponse = await fetch(
        "https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const priorityResponse = await fetch(
        "https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/priorities",
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

  const handleAnalyzeTicket = async () => {
    if (!ticket.title.trim() || !ticket.description.trim()) {
      alert("Please enter a title and description first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAiAnalysis(null);

      const result = await analyzeTicket(ticket.title, ticket.description);

      setAiAnalysis(result);

      const matchingCategory = categories.find(
        (category) =>
          category.name?.trim().toLowerCase() ===
          result.category?.trim().toLowerCase(),
      );

      const matchingPriority = priorities.find(
        (priority) =>
          priority.name?.trim().toLowerCase() ===
          result.priority?.trim().toLowerCase(),
      );

      setTicket((currentTicket) => ({
        ...currentTicket,
        categoryId: matchingCategory
          ? String(matchingCategory.id)
          : currentTicket.categoryId,
        priorityId: matchingPriority
          ? String(matchingPriority.id)
          : currentTicket.priorityId,
      }));
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert(error.message || "AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ticket),
        },
      );

      if (response.ok) {
        setTicket({
          title: "",
          description: "",
          categoryId: "",
          priorityId: "",
        });
        setAiAnalysis(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <NavBar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
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

                  {aiAnalysis && (
                    <div className="ai-analysis">
                      <h3>AI Ticket Analysis</h3>

                      <div className="ai-analysis-row">
                        <strong>Suggested Category:</strong>
                        <span>{aiAnalysis.category}</span>
                      </div>

                      <div className="ai-analysis-row">
                        <strong>Suggested Priority:</strong>
                        <span>{aiAnalysis.priority}</span>
                      </div>

                      <div className="ai-analysis-row">
                        <strong>Summary:</strong>
                        <span>{aiAnalysis.summary}</span>
                      </div>

                      <div className="ai-analysis-row">
                        <strong>Suggested Reply:</strong>
                        <span>{aiAnalysis.suggestedReply}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="submit-btn">
                    Create Ticket
                  </button>

                  <button
                    type="button"
                    className="ai-analyze-btn"
                    onClick={handleAnalyzeTicket}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "✨ Analyze with AI"}
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
