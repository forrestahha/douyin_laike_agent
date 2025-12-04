import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ChatInterface } from './components/ChatInterface';
import { NavItem } from './types';

const App: React.FC = () => {
  const [activeItem, setActiveItem] = useState<NavItem>(NavItem.ASSETS); // Default to Assets to show the demo immediately per prompt context, or change back to Agent

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar activeItem={activeItem} onSelect={setActiveItem} />
      
      <div className="ml-64 pt-16">
        <TopHeader />
        <main>
          {/* 
            The prompt requests "Page center becomes: Settings and LaiKe Agent dialogue".
            We reuse ChatInterface for different contexts (Agent vs Assets Demo).
            For other tabs, we could show different tools, but for this reconstruction,
            we focus on the ChatInterface being the core.
          */}
          <ChatInterface key={activeItem} activeContext={activeItem} />
        </main>
      </div>
    </div>
  );
};

export default App;