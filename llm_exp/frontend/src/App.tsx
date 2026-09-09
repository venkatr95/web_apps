import { useEffect, useState } from "react";
import { fetchFormData, fetchUUIDs } from "./api/formApi";
import "./App.css";
import FormFields from "./components/FormFields";
import StatusPanel from "./components/StatusPanel";
import UUIDComboBox from "./components/UUIDComboBox";
import { FormData } from "./types/FormData";

function App() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [selectedUUID, setSelectedUUID] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    uuid: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    position: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [progress, setProgress] = useState(0);
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // Load available UUIDs on mount
  useEffect(() => {
    loadUUIDs();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const loadUUIDs = async () => {
    try {
      const data = await fetchUUIDs();
      setUuids(data);
    } catch (err) {
      setError("Failed to load UUIDs");
      console.error(err);
    }
  };

  const handleUUIDSelect = async (uuid: string) => {
    setSelectedUUID(uuid);
    setError(null);
    setProgress(0);

    if (!uuid) {
      // Clear form if no UUID selected
      setFormData({
        uuid: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
        position: "",
        notes: "",
      });
      return;
    }

    setLoading(true);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 200);

    try {
      const data = await fetchFormData(uuid);
      setProgress(100);
      setFormData(data);
    } catch (err) {
      setError("Failed to fetch form data. Please check if the UUID exists.");
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <h1>🔐 UUID Form Filler</h1>
        <p className="subtitle">AI-powered form filling using OpenAI</p>
        <button
          className="intelligence-button"
          onClick={() => setShowStatusPanel(true)}
          aria-label="View system intelligence"
          title="View database insights"
        >
          Intelligence
        </button>
      </header>

      <main className="main-content">
        <div className="form-container">
          <UUIDComboBox
            uuids={uuids}
            selectedUUID={selectedUUID}
            onUUIDSelect={handleUUIDSelect}
          />

          {error && <div className="error-message">⚠️ {error}</div>}

          {loading && (
            <div className="loading-container">
              <div className="loading-message">⏳ Processing form data...</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <FormFields formData={formData} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by OpenAI GPT & FastAPI</p>
      </footer>

      <StatusPanel
        isOpen={showStatusPanel}
        onClose={() => setShowStatusPanel(false)}
      />
    </div>
  );
}

export default App;
