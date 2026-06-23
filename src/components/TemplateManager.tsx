import React, { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { EventTemplate, EVENT_COLORS, EVENT_COLORS_MAP } from "../utils/templates";

interface TemplateManagerProps {
  templates: EventTemplate[];
  onSave: (template: EventTemplate) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onSave,
  onDelete,
  onReset,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const [personOptionsInput, setPersonOptionsInput] = useState("");

  const handleEdit = (template: EventTemplate) => {
    // Make a copy so we don't modify the active array until save
    setEditingTemplate({ ...template, personOptions: template.personOptions ? [...template.personOptions] : [] });
    setPersonOptionsInput(template.personOptions ? template.personOptions.join(", ") : "");
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: "custom-" + Temporal.Now.instant().epochMilliseconds,
      name: "New Template",
      description: "",
      personOptions: [],
      isSystem: false,
    });
    setPersonOptionsInput("");
  };

  const handleSave = () => {
    if (editingTemplate) {
      const arr = personOptionsInput.split(",").map(s => s.trim()).filter(Boolean);
      onSave({ ...editingTemplate, personOptions: arr });
      setEditingTemplate(null);
      setPersonOptionsInput("");
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setPersonOptionsInput("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      onDelete(id);
    }
  };

  const handleConfirmReset = () => {
    if (window.confirm("Are you sure you want to reset all templates back to the system defaults? All custom templates will be lost.")) {
      onReset();
    }
  };

  if (editingTemplate) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-slate-100">
            {editingTemplate.id.startsWith("custom-") ? "New Template" : "Edit Template"}
          </h2>
          {editingTemplate.isSystem && (
            <span className="bg-primary-900/50 text-primary-400 text-xs px-2 py-1 rounded border border-primary-800">System Template</span>
          )}
        </div>

        <div>
          <label htmlFor="templateName" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
          <input id="templateName"
            type="text"
            value={editingTemplate.name}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Gym Session"
          />
        </div>

        <div>
          <label htmlFor="templateDesc" className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
          <input id="templateDesc"
            type="text"
            value={editingTemplate.description}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Workout at local gym"
          />
        </div>

        <div>
          <label htmlFor="templatePeople" className="block text-sm font-medium text-slate-300 mb-1">People Options (comma separated)</label>
          <input id="templatePeople"
            type="text"
            value={personOptionsInput}
            onChange={(e) => setPersonOptionsInput(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Brandt, Hannah"
          />
          <p className="text-xs text-slate-500 mt-1">Leave empty if not applicable.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="templateStartTime" className="block text-sm font-medium text-slate-300 mb-1">Default Start Time</label>
              <input id="templateStartTime"
                type="time"
                value={editingTemplate.defaultStartTime || ""}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultStartTime: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="templateEndTime" className="block text-sm font-medium text-slate-300 mb-1">Default End Time</label>
              <input id="templateEndTime"
                type="time"
                value={editingTemplate.defaultEndTime || ""}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultEndTime: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
        </div>

        <div>
          <label htmlFor="templateLocation" className="block text-sm font-medium text-slate-300 mb-1">Default Location</label>
          <input id="templateLocation"
            type="text"
            value={editingTemplate.defaultLocation || ""}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultLocation: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 123 Main St, Anytown"
          />
        </div>

        <div>
          <label htmlFor="templateColor" className="block text-sm font-medium text-slate-300 mb-1">Default Color</label>
          <select id="templateColor"
            value={editingTemplate.defaultColorId || ""}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultColorId: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Default (Calendar Default)</option>
            {EVENT_COLORS.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editingTemplate.name.trim()}
            title={!editingTemplate.name.trim() ? "Template name is required" : undefined}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Save Template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Available Templates
        </h2>
        <button
          onClick={handleCreateNew}
          className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded px-1"
        >
          <span className="material-symbols-outlined text-sm">add</span> Add New
        </button>
      </div>

      <div className="space-y-3">
        {templates.map((template) => {
          const colorObj = template.defaultColorId ? EVENT_COLORS_MAP[template.defaultColorId] : undefined;
          return (
            <div key={template.id} className="bg-slate-700/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center group overflow-hidden relative">
              {colorObj && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: colorObj.hex }}
                ></div>
              )}
              <div className="flex-1 pr-4 pl-2">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-200">{template.name}</h3>
                    {template.isSystem && (
                        <span className="bg-slate-800 text-slate-400 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-600">System</span>
                    )}
                </div>
                {template.description && (
                  <p className="text-xs text-slate-400">{template.description}</p>
                )}
                <div className="text-[10px] text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {template.defaultStartTime && template.defaultEndTime && (
                        <span>🕒 {template.defaultStartTime} - {template.defaultEndTime}</span>
                    )}
                    {template.defaultLocation && (
                        <span className="truncate max-w-[150px]" title={template.defaultLocation}>📍 {template.defaultLocation}</span>
                    )}
                    {template.personOptions && template.personOptions.length > 0 && (
                        <span>👥 {template.personOptions.join(", ")}</span>
                    )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  aria-label="Edit template"
                  title="Edit template"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                {!template.isSystem && (
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    aria-label="Delete template"
                    title="Delete template"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700 text-center">
         <button
            onClick={handleConfirmReset}
            className="text-red-400 hover:text-red-300 text-xs font-medium rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
         >
            Reset All to Default
         </button>
         <p className="text-slate-500 text-[10px] mt-1">This will remove any custom templates and restore system templates.</p>
      </div>
    </div>
  );
};

export default TemplateManager;
