import React from 'react';
import { NavItem, NavConfig } from '../types';
import { 
  Bot, 
  ShoppingBag, 
  Clapperboard, 
  Megaphone, 
  Activity, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeItem: NavItem;
  onSelect: (item: NavItem) => void;
}

const NAV_ITEMS: NavConfig[] = [
  { id: NavItem.AGENT, label: '来客 Agent', icon: Bot },
  { id: NavItem.PRODUCTS, label: '管理店品', icon: ShoppingBag },
  { id: NavItem.ASSETS, label: '素材生成', icon: Clapperboard },
  { id: NavItem.MARKETING, label: '营销推广', icon: Megaphone },
  { id: NavItem.DIAGNOSIS, label: '经营诊断', icon: Activity },
  // Keeping Settings as the 6th visual item though it's often at bottom
  { id: NavItem.SETTINGS, label: '账号设置', icon: Settings }, 
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onSelect }) => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.19 28.16C36.19 33.68 31.71 38.16 26.19 38.16C20.67 38.16 16.19 33.68 16.19 28.16C16.19 22.64 20.67 18.16 26.19 18.16V28.16H36.19Z" fill="#24AEF3"/>
            <path d="M11.81 19.84C11.81 14.32 16.29 9.84 21.81 9.84C27.33 9.84 31.81 14.32 31.81 19.84C31.81 25.36 27.33 29.84 21.81 29.84V19.84H11.81Z" fill="#2BDE73"/>
          </svg>
          <span className="text-xl font-bold text-gray-800 tracking-tight">抖音来客</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom User Profile Snippet */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <img 
            src="https://picsum.photos/40/40" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">甜心烘焙坊</p>
            <p className="text-xs text-gray-500 truncate">企业认证：餐饮/烘焙</p>
          </div>
        </div>
      </div>
    </div>
  );
};