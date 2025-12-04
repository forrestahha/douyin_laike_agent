import React from 'react';
import { Bell, MessageSquare, Monitor, HelpCircle } from 'lucide-react';

export const TopHeader: React.FC = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 fixed top-0 left-64 right-0 z-40">
      <div className="flex items-center gap-4">
         <h1 className="text-lg font-semibold text-gray-800">智能经营助手</h1>
         <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100 font-medium">
           BETA
         </span>
      </div>

      <div className="flex items-center gap-6">
        <button className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
          体验新版
        </button>
        
        <div className="h-4 w-px bg-gray-300"></div>

        <div className="flex items-center gap-5 text-gray-500">
           <button className="flex items-center gap-1 hover:text-gray-800 transition-colors">
             <MessageSquare size={18} />
             <span className="text-xs">在线咨询</span>
           </button>
           <button className="relative hover:text-gray-800 transition-colors">
             <Bell size={18} />
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span>
           </button>
           <button className="hover:text-gray-800 transition-colors flex items-center gap-1">
             <Monitor size={18} />
             <span className="text-xs">下载客户端</span>
           </button>
        </div>
      </div>
    </div>
  );
};