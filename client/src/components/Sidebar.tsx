import { Link, useLocation } from "wouter";

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link href={to}>
    <div className={`flex items-center px-6 py-3 ${active ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-700'} transition-colors cursor-pointer`}>
      <span className="material-icons mr-3 text-sm">{icon}</span>
      {label}
    </div>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="sidebar bg-zinc-800 w-64 flex-shrink-0 flex flex-col h-full text-white overflow-y-auto">
      {/* Logo Area */}
      <div className="px-6 py-4 flex items-center border-b border-zinc-700">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center mr-3">
          <span className="material-icons text-white text-sm">lan</span>
        </div>
        <h1 className="text-xl font-semibold">LocalAgentFlow</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        <div className="px-4 py-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          Main
        </div>
        <NavItem to="/" icon="dashboard" label="Dashboard" active={location === '/'} />
        <NavItem to="/workflows" icon="schema" label="Workflow Designer" active={location === '/workflows'} />
        <NavItem to="/agents" icon="smart_toy" label="AI Agents" active={location === '/agents'} />
        <NavItem to="/models" icon="model_training" label="LLM Models" active={location === '/models'} />
        <NavItem to="/connectors" icon="cable" label="Data Connectors" active={location === '/connectors'} />
        
        <div className="px-4 py-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-6">
          System
        </div>
        <NavItem to="/monitoring" icon="insights" label="Performance" active={location === '/monitoring'} />
        <NavItem to="/settings" icon="settings" label="Settings" active={location === '/settings'} />
        <NavItem to="/documentation" icon="menu_book" label="Documentation" active={location === '/documentation'} />
      </nav>
      
      {/* System Status */}
      <div className="p-4 border-t border-zinc-700">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-zinc-300">System Online</span>
        </div>
        <div className="mt-2 text-xs text-zinc-400">
          <span>5 Services Active</span>
        </div>
      </div>
    </div>
  );
}
