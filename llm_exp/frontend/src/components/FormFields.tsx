import { useEffect, useRef, useState } from "react";
import { FormData } from "../types/FormData";

interface FormFieldsProps {
  formData: FormData;
  onUpdate?: (updatedData: FormData) => void;
}

function FormFields({ formData, onUpdate }: FormFieldsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<FormData>(formData);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditedData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);

    // Clear existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer for 30 seconds
    if (isEditMode) {
      setSaveStatus("idle");
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(newData);
      }, 30000);
    }
  };

  const handleSave = async (dataToSave = editedData) => {
    setSaving(true);
    setSaveStatus("saving");

    try {
      const response = await fetch(
        `http://localhost:8000/api/update-form-data/${dataToSave.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSave),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setSaveStatus("saved");
      setIsEditMode(false);

      if (onUpdate) {
        onUpdate(dataToSave);
      }

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    }
  };

  const handleCancel = () => {
    setEditedData(formData);
    setIsEditMode(false);
    setSaveStatus("idle");
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="form-fields">
      {formData.uuid && (
        <div className="form-actions">
          {!isEditMode ? (
            <button className="edit-button" onClick={() => setIsEditMode(true)}>
              ✏️ Edit
            </button>
          ) : (
            <div className="edit-controls">
              <button
                className="save-button"
                onClick={() => handleSave()}
                disabled={saving}
              >
                {saving ? "💾 Saving..." : "💾 Save"}
              </button>
              <button
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                ✕ Cancel
              </button>
              {saveStatus === "saved" && (
                <span className="save-status saved">✓ Saved</span>
              )}
              {saveStatus === "saving" && (
                <span className="save-status">Saving...</span>
              )}
              {saveStatus === "error" && (
                <span className="save-status error">Error saving</span>
              )}
              <span className="autosave-hint">Auto-saves after 30s</span>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={editedData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Name will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={editedData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Email will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={editedData.phone}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Phone will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          type="text"
          value={editedData.address}
          onChange={(e) => handleFieldChange("address", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Address will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          value={editedData.company}
          onChange={(e) => handleFieldChange("company", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Company will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">Position</label>
        <input
          id="position"
          type="text"
          value={editedData.position}
          onChange={(e) => handleFieldChange("position", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Position will appear here..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={editedData.notes}
          onChange={(e) => handleFieldChange("notes", e.target.value)}
          readOnly={!isEditMode}
          placeholder="Notes will appear here..."
        />
      </div>
    </div>
  );
}

export default FormFields;
