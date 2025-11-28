
import React, { useState, useEffect } from 'react';
import { Laptop, AppView } from './types';
import { SAMPLE_CSV_DATA } from './constants';
import { parseCSV } from './utils';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import Chat from './components/Chat';
import { LayoutDashboard, Zap, MessageSquare, Upload, Laptop as LaptopIcon, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // Initialize with sample data immediately to prevent "empty data" crashes in Dashboard
  const [laptops, setLaptops] = useState<Laptop[]>(() => parseCSV(SAMPLE_CSV_DATA));
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Try to fetch the full csv if available in public directory
        const response = await fetch('laptop_data.csv');
        if (response.ok) {
          const text = await response.text();
          const parsed = parseCSV(text);
          if (parsed.length > 0) {
            setLaptops(parsed);
            setIsFileUploaded(true); // Treat auto-load like an upload (full data mode)
            return;
          }
        }
      } catch (e) {
        console.log("Could not auto-load CSV, staying with sample data.");
      }
    };

    loadInitialData();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value so invalid/same file re-upload triggers onChange
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          console.log("Starting CSV parse...");
          const parsedData = parseCSV(text);
          if (parsedData.length > 0) {
            setLaptops(parsedData);
            setIsFileUploaded(true);
            alert(`Successfully loaded ${parsedData.length} laptop records.`);
          } else {
            alert('Error: Could not parse any valid laptop data. Please check that your CSV has headers like "Company", "Price", "Ram", etc.');
          }
        } catch (error) {
          console.error("CSV Parse Error", error);
          alert('Error parsing CSV file. See console for details.');
        }
      }
    };
    reader.readAsText(file);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'bg-gradient-to-r from-indigo-500/20 to-blue-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-20 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full z-30 transition-transform duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800/60 bg-slate-900 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LaptopIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              LapPrice AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">Smart Analytics</p>
          </div>
          <button className="md:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavButton view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavButton view={AppView.PREDICTOR} icon={Zap} label="Price Predictor" />
          <NavButton view={AppView.CHAT} icon={MessageSquare} label="AI Analyst" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div className="flex flex-col items-center justify-center pt-2 pb-3">
              <div className="p-2 bg-slate-800 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
              </div>
              <p className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                {isFileUploaded ? 'Update Dataset' : 'Upload CSV Data'}
              </p>
              <p className="text-[10px] text-slate-600 mt-1">Supports .csv files</p>
            </div>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar Mobile */}
        <header className="md:hidden h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-10 shrink-0">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                <LaptopIcon className="text-white" size={16} />
             </div>
             <span className="font-bold text-white">LapPrice AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {currentView === AppView.DASHBOARD && 'Dashboard Overview'}
                  {currentView === AppView.PREDICTOR && 'Price Prediction'}
                  {currentView === AppView.CHAT && 'Data Analyst'}
                </h2>
                <p className="text-slate-400 text-sm flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${isFileUploaded ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {isFileUploaded 
                    ? `Active Analysis: ${laptops.length} records loaded` 
                    : `Viewing sample data (${laptops.length} records). Upload full CSV for deeper insights.`}
                </p>
              </div>
            </header>

            <div className="relative min-h-[500px]">
              {currentView === AppView.DASHBOARD && <Dashboard data={laptops} />}
              {currentView === AppView.PREDICTOR && <Predictor data={laptops} />}
              {currentView === AppView.CHAT && <Chat data={laptops} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
