import { useState, useEffect } from "react";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { workflowTemplateService, WorkflowTemplate } from "@/services/workflowTemplateService";

interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function TemplateManager() {
  const { nodes, connections, loadWorkflow } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const [saveMode, setSaveMode] = useState(false);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Load templates when component mounts or when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadedTemplates = workflowTemplateService.getTemplatesList();
      setTemplates(loadedTemplates);
    }
  }, [isOpen]);
  
  // Open dialog in save mode
  const openSaveDialog = () => {
    setSaveMode(true);
    setIsOpen(true);
    setTemplateName("");
    setTemplateDescription("");
  };
  
  // Open dialog in load mode
  const openLoadDialog = () => {
    setSaveMode(false);
    setIsOpen(true);
    setSelectedTemplateId(null);
  };
  
  // Close dialog
  const closeDialog = () => {
    setIsOpen(false);
  };
  
  // Save current workflow as a template
  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }
    
    workflowTemplateService.saveTemplate(
      templateName,
      templateDescription,
      nodes,
      connections
    );
    
    // Auto-save to session storage as well
    workflowTemplateService.saveCurrentWorkflow(nodes, connections);
    
    closeDialog();
  };
  
  // Load selected template
  const loadTemplate = () => {
    if (!selectedTemplateId) {
      alert("Please select a template to load");
      return;
    }
    
    const template = workflowTemplateService.getTemplate(selectedTemplateId);
    if (template) {
      loadWorkflow(template.nodes, template.connections);
      closeDialog();
    }
  };
  
  // Delete selected template
  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this template?")) {
      workflowTemplateService.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
      if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  if (!isOpen) {
    return (
      <div className="flex space-x-2">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
          onClick={openSaveDialog}
        >
          Save Template
        </button>
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
          onClick={openLoadDialog}
        >
          Load Template
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {saveMode ? "Save Workflow Template" : "Load Workflow Template"}
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={closeDialog}
          >
            &times;
          </button>
        </div>
        
        {saveMode ? (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Template Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Enter template description"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={saveTemplate}
              >
                Save Template
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {templates.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No saved templates found
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border-b cursor-pointer ${
                      selectedTemplateId === template.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <button
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={(e) => deleteTemplate(template.id, e)}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {formatDate(template.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${
                  !selectedTemplateId ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={loadTemplate}
                disabled={!selectedTemplateId}
              >
                Load Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}