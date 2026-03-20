import { useState, useEffect } from "react";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  personOptions?: string[];
  isSystem?: boolean;
  defaultColorId?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultLocation?: string;
}

export interface EventColor {
  id: string;
  name: string;
  hex: string;
}

export const EVENT_COLORS: EventColor[] = [
  { id: "1", name: "Lavender", hex: "#7986cb" },
  { id: "2", name: "Sage", hex: "#33b679" },
  { id: "3", name: "Grape", hex: "#8e24aa" },
  { id: "4", name: "Flamingo", hex: "#e67c73" },
  { id: "5", name: "Banana", hex: "#f6bf26" },
  { id: "6", name: "Tangerine", hex: "#f4511e" },
  { id: "7", name: "Peacock", hex: "#039be5" },
  { id: "8", name: "Graphite", hex: "#616161" },
  { id: "9", name: "Blueberry", hex: "#3f51b5" },
  { id: "10", name: "Basil", hex: "#0b8043" },
  { id: "11", name: "Tomato", hex: "#d50000" },
];

export const DEFAULT_TEMPLATES: EventTemplate[] = [
  {
    id: "school-dropoff",
    name: "School Drop Off",
    description: "School drop off duty",
    personOptions: ["Brandt", "Hannah"],
    isSystem: true,
    defaultColorId: "9",
    defaultStartTime: "07:50",
    defaultEndTime: "08:00",
    defaultLocation: "1300 N Prospect Rd, Ypsilanti, MI 48198"
  },
  {
    id: "school-pickup",
    name: "School Pick Up",
    description: "School pick up duty",
    personOptions: ["Brandt", "Hannah"],
    isSystem: true,
    defaultColorId: "9",
    // startTime/endTime is dynamic based on day of week for this system template
    defaultLocation: "1300 N Prospect Rd, Ypsilanti, MI 48198"
  },
  {
    id: "office-day",
    name: "Office Day",
    description: "Brandt's office day",
    isSystem: true,
    defaultColorId: "11"
  },
  {
    id: "hannah-work",
    name: "Work",
    description: "Hannah's work shift",
    isSystem: true,
    defaultColorId: "4",
    defaultStartTime: "15:00",
    defaultEndTime: "23:30",
    defaultLocation: "5301 McAuley Dr, Ypsilanti, MI 48197"
  },
];

export function useTemplates() {
  const [templates, setTemplates] = useState<EventTemplate[]>(() => {
    const saved = localStorage.getItem("eventTemplates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure system templates exist, merging custom overrides if any
        return mergeWithSystemTemplates(parsed);
      } catch (e) {
        console.error("Failed to parse templates from localStorage", e);
      }
    }
    return DEFAULT_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem("eventTemplates", JSON.stringify(templates));
  }, [templates]);

  const saveTemplate = (template: EventTemplate) => {
    setTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      } else {
        return [...prev, template];
      }
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id || t.isSystem));
  };

  const resetTemplates = () => {
    setTemplates(DEFAULT_TEMPLATES);
  };

  return { templates, saveTemplate, deleteTemplate, resetTemplates };
}

function mergeWithSystemTemplates(saved: EventTemplate[]): EventTemplate[] {
  const merged = [...saved];
  for (const sysTemplate of DEFAULT_TEMPLATES) {
    const existingIndex = merged.findIndex(t => t.id === sysTemplate.id);
    if (existingIndex === -1) {
      merged.push(sysTemplate);
    } else {
      // Ensure it remains a system template
      merged[existingIndex] = { ...merged[existingIndex], isSystem: true };
    }
  }
  return merged;
}
