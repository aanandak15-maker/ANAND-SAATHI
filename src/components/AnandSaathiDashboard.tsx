/**
 * Anand Saathi - Simple Farmer Dashboard
 * A focused agricultural app for daily farming activities
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import AnandSaathiEnhancedFieldMapper from './AnandSaathiEnhancedFieldMapper';
import RealTimeDashboard from './RealTimeDashboard';

interface DashboardStats {
  totalFields: number;
  totalArea: number;
  activeAlerts: number;
  todayTasks: number;
}

export const AnandSaathiDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, language, changeLanguage, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalFields: 0,
    totalArea: 0,
    activeAlerts: 2, // Default alerts shown
    todayTasks: 3 // Default tasks shown
  });
  const [fields, setFields] = useState<FieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFieldMapper, setShowFieldMapper] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Only fetch fields if user is authenticated
      if (user) {
        const fieldsResult = await anandSaathiBackend.getFields();

        if (fieldsResult.success && Array.isArray(fieldsResult.data)) {
          setFields(fieldsResult.data);
          setDashboardStats({
            totalFields: fieldsResult.data.length,
            totalArea: fieldsResult.data.reduce((sum, field) => sum + (field.area_acres || 0), 0),
            activeAlerts: 2,
            todayTasks: 3
          });
        } else {
          setFields([]);
        }
      } else {
        // Guest user - show empty state
        setFields([]);
        setDashboardStats({
          totalFields: 0,
          totalArea: 0,
          activeAlerts: 2,
          todayTasks: 3
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t('common.loadingError'));
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldCreated = (newField: FieldData) => {
    setFields(prev => [...prev, newField]);
    setShowFieldMapper(false);
    toast.success('Field added successfully!');
    loadDashboardData();
  };

  if (showFieldMapper) {
    return (
      <AnandSaathiEnhancedFieldMapper
        farmId="demo-farm"
        onFieldCreated={handleFieldCreated}
        onCancel={() => setShowFieldMapper(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ਸ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Anand Saathi</h1>
                <p className="text-sm text-gray-600">Your Farming Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="english">English</option>
                <option value="punjabi">ਪੰਜਾਬੀ</option>
                <option value="hindi">हिन्दी</option>
              </select>

              <Badge variant="outline" className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPunjabi ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ' : isHindi ? 'नमस्ते' : 'Good Morning'}, Farmer!
          </h2>
          <p className="text-gray-600">
            {isPunjabi ? 'ਆਪਣੇ ਖੇਤਾਂ ਦੀ ਦੇਖਭਾਲ ਕਰੋ ਅਤੇ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ' :
             isHindi ? 'अपने खेतों की देखभाल करें और मौसम की जानकारी प्राप्त करें' :
             'Manage your fields and get weather updates'}
          </p>
        </div>

        {/* Quick Stats - Simple & Focused */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 font-bold">📍</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fields</p>
                <p className="text-xl font-bold">{dashboardStats.totalFields}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 font-bold">🌾</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="text-xl font-bold">{dashboardStats.totalArea.toFixed(1)} acres</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 font-bold">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-xl font-bold">{dashboardStats.activeAlerts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 font-bold">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-xl font-bold">{dashboardStats.todayTasks}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Actions - Simple & Clear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* My Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📍</span>
                My Fields
              </CardTitle>
              <CardDescription>
                Manage your agricultural fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">No fields added yet</p>
                  <Button onClick={() => setShowFieldMapper(true)}>
                    Add Your First Field
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.slice(0, 3).map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-600">{field.crop_type} • {field.area_acres} acres</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                  {fields.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All Fields ({fields.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span>
                Today's Activities
              </CardTitle>
              <CardDescription>
                Important tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">💧</span>
                  <div>
                    <p className="text-sm font-medium">Check irrigation system</p>
                    <p className="text-xs text-gray-600">Rice Field 1</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600">🌤️</span>
                  <div>
                    <p className="text-sm font-medium">Review weather forecast</p>
                    <p className="text-xs text-gray-600">Rain expected tomorrow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">🌱</span>
                  <div>
                    <p className="text-sm font-medium">Apply fertilizer</p>
                    <p className="text-xs text-gray-600">Wheat Field 2</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time AI Predictions */}
        {fields.length > 0 && (
          <div className="mb-6">
            <RealTimeDashboard fieldId={fields[0].id.toString()} />
          </div>
        )}

        {/* Market Prices - Simple & Useful */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📈</span>
              Market Prices
            </CardTitle>
            <CardDescription>
              Current agricultural commodity prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Rice</p>
                <p className="text-2xl font-bold text-green-600">₹2,200</p>
                <p className="text-xs text-gray-500">per quintal</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Wheat</p>
                <p className="text-2xl font-bold text-green-600">₹2,100</p>
                <p className="text-xs text-gray-500">per quintal</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Sugarcane</p>
                <p className="text-2xl font-bold text-green-600">₹350</p>
                <p className="text-xs text-gray-500">per quintal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Bottom Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common farming activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => setShowFieldMapper(true)}
              >
                <span className="text-2xl">📍</span>
                <span className="text-sm">Add Field</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
              >
                <span className="text-2xl">🌤️</span>
                <span className="text-sm">Weather</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
              >
                <span className="text-2xl">💰</span>
                <span className="text-sm">Market</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
              >
                <span className="text-2xl">🛠️</span>
                <span className="text-sm">Tools</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnandSaathiDashboard;




