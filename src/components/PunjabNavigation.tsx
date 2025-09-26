/**
 * Punjab Navigation Component
 * Provides consistent navigation across Punjab Rice Phenology System
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wheat, 
  Bell, 
  Award, 
  Home, 
  ArrowLeft,
  Settings,
  HelpCircle,
  Phone,
  MessageSquare
} from 'lucide-react';

interface PunjabNavigationProps {
  showBackButton?: boolean;
  showSupportButtons?: boolean;
  currentPage?: string;
}

export default function PunjabNavigation({ 
  showBackButton = true, 
  showSupportButtons = true,
  currentPage 
}: PunjabNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/punjab',
      label: 'Dashboard',
      icon: Wheat,
      description: 'Field monitoring & analysis'
    },
    {
      path: '/punjab/alerts',
      label: 'Alerts',
      icon: Bell,
      description: 'Notification management'
    },
    {
      path: '/punjab/government',
      label: 'Government',
      icon: Award,
      description: 'Schemes & services'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <Wheat className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-green-800">
                  ਪੰਜਾਬ ਰਾਈਸ ਸਿਸਟਮ (Punjab Rice System)
                </h1>
                {currentPage && (
                  <p className="text-sm text-gray-600">{currentPage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center - Navigation items */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 ${
                    active 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'border-green-200 hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Right side - Support buttons */}
          {showSupportButtons && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Support</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden mt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    active 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'border-green-200 hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              PR-126 & HKR-47
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Multi-language
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
