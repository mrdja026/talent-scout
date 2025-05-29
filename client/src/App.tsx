import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import WorkflowDesigner from "@/pages/WorkflowDesigner";
import Agents from "@/pages/Agents";
import Models from "@/pages/Models";
import Connectors from "@/pages/Connectors";
import Monitoring from "@/pages/Monitoring";
import Settings from "@/pages/Settings";
import Documentation from "@/pages/Documentation";
import ApiTest from "@/pages/ApiTest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflows" component={WorkflowDesigner} />
      <Route path="/agents" component={Agents} />
      <Route path="/models" component={Models} />
      <Route path="/connectors" component={Connectors} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/settings" component={Settings} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/api-test" component={ApiTest} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
