/**
 * Anand Saathi Pest & Disease Management
 * Comprehensive pest and disease monitoring, identification, and treatment system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bug,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Microscope,
  Droplets,
  Sun,
  Wind,
  Activity,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Camera,
  BookOpen,
  Zap,
  Leaf,
  Pill
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface PestDiseaseIncident {
  id: string;
  field_id: string;
  field_name: string;
  crop_type: string;
  pest_disease_type: 'pest' | 'disease' | 'weed' | 'nutrient_deficiency';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'treated' | 'monitoring' | 'resolved';
  first_observed: string;
  affected_area_acres: number;
  treatment_plan?: string;
  treatment_applied?: string;
  treatment_date?: string;
  estimated_cost?: number;
  effectiveness?: number;
  notes?: string;
  images?: string[];
}

interface TreatmentRecommendation {
  id: string;
  pest_disease_type: string;
  severity: string;
  recommended_treatments: string[];
  preventive_measures: string[];
  expected_effectiveness: number;
  cost_range: { min: number; max: number };
  application_method: string;
}

interface MonitoringSchedule {
  id: string;
  field_id: string;
  type: 'scouting' | 'trapping' | 'sampling' | 'sensor_check';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  next_due: string;
  status: 'active' | 'completed' | 'overdue';
}

const AnandSaathiPestDiseaseManagement: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<PestDiseaseIncident[]>([
    {
      id: '1',
      field_id: '1',
      field_name: 'North Rice Field',
      crop_type: 'Rice',
      pest_disease_type: 'pest',
      name: 'Brown Plant Hopper',
      severity: 'high',
      status: 'identified',
      first_observed: '2024-09-20',
      affected_area_acres: 2.1,
      treatment_plan: 'Neem oil spray and chemical treatment',
      estimated_cost: 2500,
      notes: 'High infestation observed in northern section'
    },
    {
      id: '2',
      field_id: '2',
      field_name: 'Wheat Field A',
      crop_type: 'Wheat',
      pest_disease_type: 'disease',
      name: 'Leaf Rust',
      severity: 'medium',
      status: 'treated',
      first_observed: '2024-09-15',
      affected_area_acres: 1.5,
      treatment_applied: 'Fungicide application',
      treatment_date: '2024-09-18',
      effectiveness: 85,
      notes: 'Responding well to treatment'
    }
  ]);

  const [monitoringSchedules, setMonitoringSchedules] = useState<MonitoringSchedule[]>([
    {
      id: '1',
      field_id: '1',
      type: 'scouting',
      frequency: 'weekly',
      next_due: '2024-09-25T09:00:00',
      status: 'active'
    },
    {
      id: '2',
      field_id: '2',
      type: 'trapping',
      frequency: 'biweekly',
      next_due: '2024-09-28T08:00:00',
      status: 'active'
    }
  ]);

  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([
    {
      id: '1',
      pest_disease_type: 'Brown Plant Hopper',
      severity: 'high',
      recommended_treatments: ['Neem oil spray', 'Chemical insecticide', 'Biological control'],
      preventive_measures: ['Early planting', 'Resistant varieties', 'Field sanitation'],
      expected_effectiveness: 85,
      cost_range: { min: 2000, max: 5000 },
      application_method: 'Foliar spray'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'treated': return 'bg-blue-500';
      case 'monitoring': return 'bg-yellow-500';
      case 'identified': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return <Bug className="h-4 w-4" />;
      case 'disease': return <Microscope className="h-4 w-4" />;
      case 'weed': return <Leaf className="h-4 w-4" />;
      case 'nutrient_deficiency': return <Pill className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getMonitoringIcon = (type: string) => {
    switch (type) {
      case 'scouting': return <Activity className="h-4 w-4" />;
      case 'trapping': return <Target className="h-4 w-4" />;
      case 'sampling': return <BookOpen className="h-4 w-4" />;
      case 'sensor_check': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleAddIncident = () => {
    toast.success(isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਘਟਨਾ ਜੋੜਨ ਲਈ ਅੱਗੇ ਵਧ ਰਹੇ ਹਾਂ' : isHindi ? 'कीट-रोग घटना जोड़ने के लिए आगे बढ़ रहे हैं' : 'Adding pest/disease incident functionality coming soon');
  };

  const handleMarkResolved = (incidentId: string) => {
    setIncidents(prev => prev.map(incident =>
      incident.id === incidentId
        ? { ...incident, status: 'resolved' }
        : incident
    ));
    toast.success(isPunjabi ? 'ਘਟਨਾ ਹੱਲ ਹੋ ਗਈ' : isHindi ? 'घटना हल हो गई' : 'Incident resolved');
  };

  const handleCompleteMonitoring = (scheduleId: string) => {
    setMonitoringSchedules(prev => prev.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, status: 'completed' }
        : schedule
    ));
    toast.success(isPunjabi ? 'ਨਿਗਰਾਨੀ ਪੂਰੀ ਹੋ ਗਈ' : isHindi ? 'निगरानी पूरी हो गई' : 'Monitoring completed');
  };

  const activeIncidents = incidents.filter(incident => incident.status !== 'resolved').length;
  const criticalIncidents = incidents.filter(incident => incident.severity === 'critical').length;
  const resolvedIncidents = incidents.filter(incident => incident.status === 'resolved').length;
  const averageEffectiveness = incidents
    .filter(incident => incident.effectiveness)
    .reduce((sum, incident) => sum + (incident.effectiveness || 0), 0) /
    incidents.filter(incident => incident.effectiveness).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਕੀੜੇ-ਮਕੌੜੇ ਅਤੇ ਬਿਮਾਰੀ ਪ੍ਰਬੰਧਨ' : isHindi ? 'अनंद साथी कीट-रोग और बीमारी प्रबंधन' : 'Anand Saathi Pest & Disease Management'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਅਤੇ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ, ਨਿਗਰਾਨੀ ਅਤੇ ਇਲਾਜ ਦੀ ਵਿਆਪਕ ਪ੍ਰਣਾਲੀ' : isHindi ? 'कीट-रोग और बीमारियों की पहचान, निगरानी और इलाज की व्यापक प्रणाली' : 'Comprehensive pest and disease identification, monitoring, and treatment system'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{activeIncidents}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਸਰਗਰਮ ਘਟਨਾਵਾਂ' : isHindi ? 'सक्रिय घटनाएं' : 'Active Incidents'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{criticalIncidents}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਗੰਭੀਰ ਮਾਮਲੇ' : isHindi ? 'गंभीर मामले' : 'Critical Cases'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{resolvedIncidents}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਹੱਲ ਕੀਤੀਆਂ ਘਟਨਾਵਾਂ' : isHindi ? 'हल की गईं घटनाएं' : 'Resolved Incidents'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isNaN(averageEffectiveness) ? 'N/A' : `${Math.round(averageEffectiveness)}%`}
            </div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਔਸਤ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ' : isHindi ? 'औसत प्रभावशीलता' : 'Avg. Effectiveness'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਘਟਨਾਵਾਂ' : isHindi ? 'घटनाएं' : 'Incidents'}
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਨਿਗਰਾਨੀ' : isHindi ? 'निगरानी' : 'Monitoring'}
          </TabsTrigger>
          <TabsTrigger value="treatments">
            <Pill className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਇਲਾਜ' : isHindi ? 'इलाज' : 'Treatments'}
          </TabsTrigger>
          <TabsTrigger value="prevention">
            <Shield className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਰੋਕਥਾਮ' : isHindi ? 'रोकथाम' : 'Prevention'}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਰਿਪੋਰਟਸ' : isHindi ? 'रिपोर्ट्स' : 'Reports'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(incident.status)}`}></div>
                      <CardTitle className="text-lg">{incident.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <CardDescription>{incident.field_name} • {incident.crop_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ' : isHindi ? 'प्रभावित क्षेत्र' : 'Affected Area'}
                      </span>
                      <span className="font-medium">{incident.affected_area_acres} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}
                      </span>
                      <span className="font-medium">{incident.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪਹਿਲੀ ਵਾਰ ਦੇਖਿਆ ਗਿਆ' : isHindi ? 'पहली बार देखा गया' : 'First Observed'}
                      </span>
                      <span className="font-medium">{new Date(incident.first_observed).toLocaleDateString()}</span>
                    </div>
                    {incident.effectiveness && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਇਲਾਜ ਦੀ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ' : isHindi ? 'इलाज की प्रभावशीलता' : 'Treatment Effectiveness'}
                        </span>
                        <span className="font-medium">{incident.effectiveness}%</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkResolved(incident.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isPunjabi ? 'ਹੱਲ ਕਰੋ' : isHindi ? 'हल करें' : 'Resolve'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਅਤੇ ਬਿਮਾਰੀਆਂ ਦੀਆਂ ਘਟਨਾਵਾਂ' : isHindi ? 'कीट-रोग और बीमारियों की घटनाएं' : 'Pest & Disease Incidents'}
            </h3>
            <Button onClick={handleAddIncident}>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਘਟਨਾ ਜੋੜੋ' : isHindi ? 'घटना जोड़ें' : 'Add Incident'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.pest_disease_type)}
                      <CardTitle className="text-lg">{incident.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <CardDescription>{incident.field_name} • {incident.crop_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ' : isHindi ? 'प्रभावित क्षेत्र' : 'Affected Area'}
                      </span>
                      <span className="font-medium">{incident.affected_area_acres} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}
                      </span>
                      <span className="font-medium">{incident.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪਹਿਲੀ ਵਾਰ ਦੇਖਿਆ ਗਿਆ' : isHindi ? 'पहली बार देखा गया' : 'First Observed'}
                      </span>
                      <span className="font-medium">{new Date(incident.first_observed).toLocaleDateString()}</span>
                    </div>
                    {incident.estimated_cost && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਲਾਗਤ' : isHindi ? 'अनुमानित लागत' : 'Est. Cost'}
                        </span>
                        <span className="font-medium">₹{incident.estimated_cost}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਨਿਗਰਾਨੀ ਸ਼ਡਿਊਲਸ' : isHindi ? 'निगरानी शेड्यूल्स' : 'Monitoring Schedules'}
            </h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਸ਼ਡਿਊਲ ਜੋੜੋ' : isHindi ? 'शेड्यूल जोड़ें' : 'Add Schedule'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoringSchedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMonitoringIcon(schedule.type)}
                      <CardTitle className="text-lg">{schedule.type}</CardTitle>
                    </div>
                    <Badge variant="outline">{schedule.frequency}</Badge>
                  </div>
                  <CardDescription>Field {schedule.field_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਗਲੀ ਨਿਗਰਾਨੀ' : isHindi ? 'अगली निगरानी' : 'Next Due'}
                      </span>
                      <span className="font-medium">{new Date(schedule.next_due).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}
                      </span>
                      <span className="font-medium">{schedule.status}</span>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleCompleteMonitoring(schedule.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isPunjabi ? 'ਨਿਗਰਾਨੀ ਪੂਰੀ ਕਰੋ' : isHindi ? 'निगरानी पूरी करें' : 'Complete Monitoring'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਇਲਾਜ ਦੀਆਂ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'इलाज की सिफारिशें' : 'Treatment Recommendations'}
            </h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਤਾਜ਼ਾ ਕਰੋ' : isHindi ? 'ताजा करें' : 'Refresh'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatmentRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{recommendation.pest_disease_type}</CardTitle>
                  <CardDescription>{recommendation.severity} severity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">
                        {isPunjabi ? 'ਸਿਫਾਰਸ਼ ਕੀਤੇ ਇਲਾਜ' : isHindi ? 'सिफारिश किए गए इलाज' : 'Recommended Treatments'}
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {recommendation.recommended_treatments.map((treatment, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Pill className="h-3 w-3" />
                            {treatment}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        {isPunjabi ? 'ਲਾਗੂ ਕਰਨ ਦੀ ਵਿਧੀ' : isHindi ? 'लागू करने की विधि' : 'Application Method'}
                      </h4>
                      <p className="text-sm">{recommendation.application_method}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਪੇਖਿਤ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ' : isHindi ? 'अपेक्षित प्रभावशीलता' : 'Expected Effectiveness'}
                      </span>
                      <span className="font-medium">{recommendation.expected_effectiveness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਲਾਗਤ ਰੇਂਜ' : isHindi ? 'लागत रेंज' : 'Cost Range'}
                      </span>
                      <span className="font-medium">
                        ₹{recommendation.cost_range.min} - ₹{recommendation.cost_range.max}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prevention Tab */}
        <TabsContent value="prevention" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਰੋਕਥਾਮ ਉਪਾਅ' : isHindi ? 'रोकथाम उपाय' : 'Prevention Measures'}
            </h3>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਗਾਈਡ ਵੇਖੋ' : isHindi ? 'गाइड देखें' : 'View Guide'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਸਭ ਤੋਂ ਵਧੀਆ ਅਭਿਆਸ' : isHindi ? 'सर्वोत्तम अभ्यास' : 'Best Practices'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਫਸਲ ਚਕਰਣ' : isHindi ? 'फसल चक्रण' : 'Crop Rotation'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਵੱਖ-ਵੱਖ ਫਸਲਾਂ ਬੀਜਣ ਨਾਲ ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਆਬਾਦੀ ਘਟਾਓ' : isHindi ? 'विभिन्न फसलें बोने से कीट-रोग की आबादी घटाएं' : 'Reduce pest populations by planting different crops'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਜੈਵਿਕ ਨਿਯੰਤਰਣ' : isHindi ? 'जैविक नियंत्रण' : 'Biological Control'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਫਾਇਦੇਮੰਦ ਕੀੜੇ ਅਤੇ ਜੈਵਿਕ ਏਜੰਟ ਵਰਤੋ' : isHindi ? 'फायदेमंद कीड़े और जैविक एजेंट का उपयोग करें' : 'Use beneficial insects and biological agents'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਸਮਾਂ ਸਿਰ ਬੀਜਣ' : isHindi ? 'समय पर बुआई' : 'Timely Planting'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਿਫਾਰਸ਼ ਕੀਤੇ ਸਮੇਂ \'ਤੇ ਫਸਲਾਂ ਬੀਜੋ' : isHindi ? 'सिफारिश किए समय पर फसलें बोएं' : 'Plant crops at recommended times'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਨਿਗਰਾਨੀ ਯੋਜਨਾ' : isHindi ? 'निगरानी योजना' : 'Monitoring Plan'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਹਫਤਾਵਾਰ ਨਿਰੀਖਣ' : isHindi ? 'साप्ताहिक निरीक्षण' : 'Weekly Scouting'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਹਰ ਹਫਤੇ ਖੇਤ ਦੀ ਨਿਰੀਖਣ ਕਰੋ' : isHindi ? 'हर सप्ताह खेत की निगरानी करें' : 'Scout fields weekly for early detection'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਜਾਲ ਲਗਾਓ' : isHindi ? 'जाल लगाएं' : 'Install Traps'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਫੜਨ ਲਈ ਜਾਲ ਲਗਾਓ' : isHindi ? 'कीट-रोग पकड़ने के लिए जाल लगाएं' : 'Install traps to catch pests early'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        {isPunjabi ? 'ਸਿਹਤਮੰਦ ਪੌਧੇ' : isHindi ? 'स्वस्थ पौधे' : 'Healthy Plants'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਿਹਤਮੰਦ ਪੌਧੇ ਕੀੜੇ-ਮਕੌੜੇ ਦੇ ਵਿਰੁੱਧ ਵਧੇਰੇ ਪ੍ਰਤੀਰੋਧੀ ਹਨ' : isHindi ? 'स्वस्थ पौधे कीट-रोग के खिलाफ अधिक प्रतिरोधी हैं' : 'Healthy plants are more resistant to pests and diseases'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col">
              <Download className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਘਟਨਾ ਰਿਪੋਰਟ' : isHindi ? 'घटना रिपोर्ट' : 'Incident Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਇਲਾਜ ਰਿਪੋਰਟ' : isHindi ? 'इलाज रिपोर्ट' : 'Treatment Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਰੋਕਥਾਮ ਰਿਪੋਰਟ' : isHindi ? 'रोकथाम रिपोर्ट' : 'Prevention Report'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiPestDiseaseManagement;
