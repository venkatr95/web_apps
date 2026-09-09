import { useEffect, useState } from "react";
import "./StatusPanel.css";

interface DuplicateInfo {
  uuid1: string;
  uuid2: string;
  confidence: number;
  reason: string;
  type: string;
}

interface StaleAnalysis {
  stale_records: Array<{ uuid: string; reason: string; name?: string }>;
  important_but_inactive: Array<{
    uuid: string;
    reason: string;
    name?: string;
  }>;
  recommendations: string[];
  summary: string;
}

interface UserStats {
  total_interactions: number;
  total_corrections: number;
  total_views: number;
  intelligent_analysis: {
    preferred_fields: string[];
    correction_patterns: Array<{ pattern: string; insight: string }>;
    time_saving_tips: string[];
    predicted_defaults: Record<string, string>;
    summary: string;
  };
}

interface DatabaseStats {
  total_records: number;
  duplicate_count: number;
  stale_count: number;
  active_records: number;
}

interface StatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusPanel({ isOpen, onClose }: StatusPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "duplicates" | "stale" | "stats"
  >("overview");
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [staleAnalysis, setStaleAnalysis] = useState<StaleAnalysis | null>(
    null,
  );
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "overview") {
        const statsResponse = await fetch(
          "http://localhost:8000/api/database-stats",
        );
        if (!statsResponse.ok) throw new Error("Failed to load database stats");
        const statsData = await statsResponse.json();
        setDbStats(statsData);
      } else if (activeTab === "duplicates") {
        const response = await fetch("http://localhost:8000/api/duplicates");
        if (!response.ok) throw new Error("Failed to load duplicates");
        const data = await response.json();
        setDuplicates(data.duplicates || []);
      } else if (activeTab === "stale") {
        const response = await fetch(
          "http://localhost:8000/api/stale-records?days=365",
        );
        if (!response.ok) throw new Error("Failed to load stale records");
        const data = await response.json();
        setStaleAnalysis(data.analysis || null);
      } else if (activeTab === "stats") {
        const response = await fetch("http://localhost:8000/api/user-stats");
        if (!response.ok) throw new Error("Failed to load user stats");
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="status-panel-overlay" onClick={onClose}>
      <div className="status-panel" onClick={(e) => e.stopPropagation()}>
        <div className="status-panel-header">
          <h2>🔍 System Intelligence</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="status-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === "duplicates" ? "active" : ""}`}
            onClick={() => setActiveTab("duplicates")}
          >
            👥 Duplicates
          </button>
          <button
            className={`tab-button ${activeTab === "stale" ? "active" : ""}`}
            onClick={() => setActiveTab("stale")}
          >
            🗑️ Stale Data
          </button>
          <button
            className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            🎯 Usage
          </button>
        </div>

        <div className="status-content">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-icon">⚙️</div>
              <p>Analyzing data with AI...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && dbStats && (
                <div className="overview-view">
                  <div className="ai-badge">
                    🤖 Real-time Database Intelligence
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card-large">
                      <div className="stat-icon">📁</div>
                      <div className="stat-info">
                        <div className="stat-value-large">
                          {dbStats.total_records}
                        </div>
                        <div className="stat-label">Total Records</div>
                      </div>
                    </div>

                    <div className="stat-card-large">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <div className="stat-value-large">
                          {dbStats.active_records}
                        </div>
                        <div className="stat-label">Active Records</div>
                      </div>
                    </div>

                    <div
                      className={`stat-card-large ${dbStats.duplicate_count > 0 ? "warning" : ""}`}
                    >
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <div className="stat-value-large">
                          {dbStats.duplicate_count}
                        </div>
                        <div className="stat-label">Duplicates</div>
                      </div>
                    </div>

                    <div
                      className={`stat-card-large ${dbStats.stale_count > 0 ? "danger" : ""}`}
                    >
                      <div className="stat-icon">🗑️</div>
                      <div className="stat-info">
                        <div className="stat-value-large">
                          {dbStats.stale_count}
                        </div>
                        <div className="stat-label">Stale Records</div>
                      </div>
                    </div>
                  </div>

                  <div className="insights-section">
                    <h3>💡 AI Insights</h3>
                    <div className="insight-cards">
                      {dbStats.duplicate_count > 0 && (
                        <div className="insight-card">
                          <div className="insight-title">
                            ⚠️ Data Quality Issue
                          </div>
                          <p>
                            Found <strong>{dbStats.duplicate_count}</strong>{" "}
                            potential duplicate records. These should be
                            reviewed and merged to maintain data integrity.
                          </p>
                          <button
                            className="insight-action"
                            onClick={() => setActiveTab("duplicates")}
                          >
                            View Duplicates →
                          </button>
                        </div>
                      )}

                      {dbStats.stale_count > 0 && (
                        <div className="insight-card">
                          <div className="insight-title">
                            📅 Outdated Records
                          </div>
                          <p>
                            <strong>{dbStats.stale_count}</strong> records
                            haven't been updated in over a year. Consider
                            archiving or removing outdated information.
                          </p>
                          <button
                            className="insight-action"
                            onClick={() => setActiveTab("stale")}
                          >
                            Review Stale Data →
                          </button>
                        </div>
                      )}

                      {dbStats.duplicate_count === 0 &&
                        dbStats.stale_count === 0 && (
                          <div className="insight-card success">
                            <div className="insight-title">
                              ✨ Excellent Data Quality
                            </div>
                            <p>
                              Your database is clean with no duplicates or stale
                              records detected. Keep up the good work!
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="quick-actions">
                    <h3>⚡ Quick Actions</h3>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => setActiveTab("duplicates")}
                      >
                        <span>🔍</span>
                        Scan for Duplicates
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => setActiveTab("stale")}
                      >
                        <span>🧹</span>
                        Clean Stale Data
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => setActiveTab("stats")}
                      >
                        <span>📈</span>
                        View Usage Patterns
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "stats" && userStats && (
                <div className="stats-view">
                  <div className="ai-badge">
                    🤖 AI-Powered Behavior Analysis
                  </div>

                  <div className="stats-summary">
                    <div className="stat-card">
                      <div className="stat-value">
                        {userStats.total_interactions}
                      </div>
                      <div className="stat-label">Total Interactions</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{userStats.total_views}</div>
                      <div className="stat-label">Views</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {userStats.total_corrections}
                      </div>
                      <div className="stat-label">Corrections</div>
                    </div>
                  </div>

                  {userStats.intelligent_analysis && (
                    <>
                      <div className="ai-summary">
                        <h3>📝 AI Summary</h3>
                        <p>{userStats.intelligent_analysis.summary}</p>
                      </div>

                      {userStats.intelligent_analysis.preferred_fields &&
                        userStats.intelligent_analysis.preferred_fields.length >
                          0 && (
                          <div className="stats-section">
                            <h3>🎯 Your Preferred Fields</h3>
                            <div className="field-list">
                              {userStats.intelligent_analysis.preferred_fields.map(
                                (field, idx) => (
                                  <div key={idx} className="field-item">
                                    <span className="field-name">{field}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {userStats.intelligent_analysis.time_saving_tips &&
                        userStats.intelligent_analysis.time_saving_tips.length >
                          0 && (
                          <div className="stats-section">
                            <h3>💡 Time-Saving Tips</h3>
                            <div className="tips-list">
                              {userStats.intelligent_analysis.time_saving_tips.map(
                                (tip, idx) => (
                                  <div key={idx} className="tip-item">
                                    {tip}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {userStats.intelligent_analysis.correction_patterns &&
                        userStats.intelligent_analysis.correction_patterns
                          .length > 0 && (
                          <div className="stats-section">
                            <h3>🔄 Your Correction Patterns</h3>
                            <div className="patterns-list">
                              {userStats.intelligent_analysis.correction_patterns.map(
                                (pattern, idx) => (
                                  <div key={idx} className="pattern-item">
                                    <div className="pattern-name">
                                      {pattern.pattern}
                                    </div>
                                    <div className="pattern-insight">
                                      {pattern.insight}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "duplicates" && (
                <div className="duplicates-view">
                  <div className="ai-badge">
                    🤖 AI-Powered Semantic Analysis
                  </div>
                  <p className="info-text">
                    Found {duplicates.length} potential duplicate
                    {duplicates.length !== 1 ? "s" : ""}
                  </p>
                  {duplicates.length > 0 ? (
                    <div className="duplicates-list">
                      {duplicates.map((dup, idx) => (
                        <div key={idx} className="duplicate-item">
                          <div className="duplicate-header">
                            <span className={`similarity-badge ${dup.type}`}>
                              {(dup.confidence * 100).toFixed(0)}% confidence -{" "}
                              {dup.type.replace("_", " ")}
                            </span>
                          </div>
                          <div className="duplicate-reason">
                            <strong>AI Reasoning:</strong> {dup.reason}
                          </div>
                          <div className="duplicate-uuids">
                            <code>{dup.uuid1}</code>
                            <span className="duplicate-arrow">≈</span>
                            <code>{dup.uuid2}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">
                      <div className="no-data-icon">✓</div>
                      <p>No duplicates detected by AI</p>
                      <p className="no-data-sub">Your database is clean!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "stale" && staleAnalysis && (
                <div className="stale-view">
                  <div className="ai-badge">🤖 AI-Powered Context Analysis</div>

                  <div className="ai-summary">
                    <h3>📊 Analysis Summary</h3>
                    <p>{staleAnalysis.summary}</p>
                  </div>

                  {staleAnalysis.stale_records &&
                    staleAnalysis.stale_records.length > 0 && (
                      <div className="stats-section">
                        <h3>
                          🗑️ Truly Stale Records (
                          {staleAnalysis.stale_records.length})
                        </h3>
                        <p className="section-desc">
                          These records are likely obsolete and can be archived
                        </p>
                        <div className="stale-list">
                          {staleAnalysis.stale_records.map((record, idx) => (
                            <div key={idx} className="stale-item">
                              <div className="stale-header">
                                <code className="uuid-code">{record.uuid}</code>
                                {record.name && (
                                  <span className="record-name">
                                    {record.name}
                                  </span>
                                )}
                              </div>
                              <div className="stale-reason">
                                {record.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {staleAnalysis.important_but_inactive &&
                    staleAnalysis.important_but_inactive.length > 0 && (
                      <div className="stats-section">
                        <h3>
                          ⚠️ Important But Inactive (
                          {staleAnalysis.important_but_inactive.length})
                        </h3>
                        <p className="section-desc">
                          These should be kept despite low activity
                        </p>
                        <div className="important-list">
                          {staleAnalysis.important_but_inactive.map(
                            (record, idx) => (
                              <div key={idx} className="important-item">
                                <div className="important-header">
                                  <code className="uuid-code">
                                    {record.uuid}
                                  </code>
                                  {record.name && (
                                    <span className="record-name">
                                      {record.name}
                                    </span>
                                  )}
                                </div>
                                <div className="important-reason">
                                  {record.reason}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {staleAnalysis.recommendations &&
                    staleAnalysis.recommendations.length > 0 && (
                      <div className="stats-section">
                        <h3>💡 AI Recommendations</h3>
                        <div className="recommendations-list">
                          {staleAnalysis.recommendations.map((rec, idx) => (
                            <div key={idx} className="recommendation-item">
                              <span className="rec-icon">→</span>
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
