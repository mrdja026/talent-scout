import { useWorkflow } from "@/contexts/WorkflowContext";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { saveWorkflow } = useWorkflow();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveWorkflow();
      toast({
        title: "Success",
        description: "Workflow saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workflow.",
        variant: "destructive",
      });
    }
  };

  const handleRunWorkflow = () => {
    toast({
      title: "Running Workflow",
      description: "Workflow execution started.",
    });
    // In a real implementation, we would call the API to run the workflow
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-xl font-medium">Workflow Designer</h2>
        <div className="ml-6 flex space-x-1">
          <button
            onClick={handleSave}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label="Save"
          >
            <span className="material-icons text-sm">save</span>
          </button>
          <button
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label="Undo"
          >
            <span className="material-icons text-sm">undo</span>
          </button>
          <button
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label="Redo"
          >
            <span className="material-icons text-sm">redo</span>
          </button>
          <button
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label="Zoom In"
          >
            <span className="material-icons text-sm">zoom_in</span>
          </button>
          <button
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label="Zoom Out"
          >
            <span className="material-icons text-sm">zoom_out</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-sm">search</span>
        </div>
        
        <button
          onClick={handleRunWorkflow}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md text-sm flex items-center"
        >
          <span className="material-icons mr-1 text-sm">play_arrow</span>
          Run Workflow
        </button>
        
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="material-icons text-gray-500 text-sm">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
