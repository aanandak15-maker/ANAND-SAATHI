/**
 * Anand Saathi Pest Control Component
 * Integrated pest management system with monitoring and treatment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calendar,
  MapPin,
  BarChart3,
  Target,
  Zap,
  Eye,
  Activity,
  Clock,
  TrendingUp,
  Camera,
  FileText
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface PestIncident {
  id: string;
  fieldId: string;
  pestName: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number; // percentage
  firstDetected: string;
  lastUpdated: string;
  status: 'active' | 'monitoring' | 'treated' | 'resolved';
  symptoms: string[];
  treatment: {
    method: string;
    product: string;
    dosage: string;
    applicationDate: string;
    effectiveness: number;
  }[];
  images: string[];
  economicLoss: number;
}

interface PestControlPlan {
  id: string;
  fieldId: string;
  cropType: string;
  season: string;
  preventiveMeasures: {
    measure: string;
    frequency: string;
    cost: number;
    effectiveness: number;
  }[];
  monitoringSchedule: {
    activity: string;
    frequency: string;
    responsible: string;
    cost: number;
  }[];
  treatmentProtocols: {
    pest: string;
    threshold: string;
    treatment: string;
    cost: number;
  }[];
  totalCost: number;
  expectedSavings: number;
  createdAt: string;
}

interface PestControlProps {
  fieldData?: FieldData;
  onIncidentReported?: (incident: PestIncident) => void;
}

export const AnandSaathiPestControl: React.FC<PestControlProps> = ({
  fieldData,
  onIncidentReported
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [isLoading, setIsLoading] = useState(false);
  const [pestIncidents, setPestIncidents] = useState<PestIncident[]>([]);
  const [controlPlans, setControlPlans] = useState<PestControlPlan[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<PestIncident | null>(null);

  // Form state for new incident
  const [incidentForm, setIncidentForm] = useState({
    pestName: '',
    cropAffected: '',
    severity: '',
    affectedArea: '',
    symptoms: '',
    images: [] as string[]
  });

  // Pest database
  const pestDatabase = {
    'Aphids': {
      crops: ['Rice', 'Wheat', 'Maize', 'Cotton'],
      symptoms: ['Yellowing leaves', 'Stunted growth', 'Honeydew secretion'],
      treatment: ['Neem oil', 'Insecticidal soap', 'Beneficial insects'],
      threshold: '10-15 per plant'
    },
    'Whitefly': {
      crops: ['Cotton', 'Tomato', 'Chili'],
      symptoms: ['Yellow spots', 'Leaf curling', 'Sooty mold'],
      treatment: ['Yellow sticky traps', 'Neem oil', 'Pyrethrin'],
      threshold: '5-10 per leaf'
    },
    'Bollworm': {
      crops: ['Cotton', 'Maize'],
      symptoms: ['Holes in bolls', 'Frass on plants', 'Reduced yield'],
      treatment: ['Bt cotton', 'Pheromone traps', 'Biological control'],
      threshold: '2-3 per plant'
    },
    'Stem Borer': {
      crops: ['Rice', 'Maize', 'Sugarcane'],
      symptoms: ['Dead hearts', 'White heads', 'Tunneling'],
      treatment: ['Resistant varieties', 'Biological control', 'Chemical treatment'],
      threshold: '5% dead hearts'
    },
    'Leaf Miner': {
      crops: ['Tomato', 'Chili', 'Potato'],
      symptoms: ['Mining patterns', 'Leaf damage', 'Reduced photosynthesis'],
      treatment: ['Parasitic wasps', 'Neem oil', 'Systemic insecticides'],
      threshold: '10% leaf damage'
    },
    'Thrips': {
      crops: ['Onion', 'Garlic', 'Chili'],
      symptoms: ['Silver streaks', 'Distorted growth', 'Flower damage'],
      treatment: ['Blue sticky traps', 'Neem oil', 'Spinosad'],
      threshold: '5-10 per flower'
    }
  };

  useEffect(() => {
    loadPestData();
  }, []);

  const loadPestData = async () => {
    setIsLoading(true);
    try {
      // Mock pest incidents
      const mockIncidents: PestIncident[] = [
        {
          id: '1',
          fieldId: '1',
          pestName: 'Aphids',
          cropAffected: 'Rice',
          severity: 'medium',
          affectedArea: 25,
          firstDetected: '2024-09-20',
          lastUpdated: '2024-09-24',
          status: 'active',
          symptoms: ['Yellowing leaves', 'Stunted growth', 'Honeydew secretion'],
          treatment: [
            {
              method: 'Spray',
              product: 'Neem Oil',
              dosage: '2ml per liter',
              applicationDate: '2024-09-22',
              effectiveness: 75
            }
          ],
          images: ['pest1.jpg', 'pest2.jpg'],
          economicLoss: 5000
        }
      ];

      // Mock control plans
      const mockPlans: PestControlPlan[] = [
        {
          id: '1',
          fieldId: '1',
          cropType: 'Rice',
          season: 'Kharif',
          preventiveMeasures: [
            {
              measure: 'Field sanitation',
              frequency: 'Weekly',
              cost: 500,
              effectiveness: 80
            },
            {
              measure: 'Beneficial insect release',
              frequency: 'Monthly',
              cost: 1000,
              effectiveness: 70
            }
          ],
          monitoringSchedule: [
            {
              activity: 'Visual inspection',
              frequency: 'Daily',
              responsible: 'Field worker',
              cost: 200
            },
            {
              activity: 'Pheromone trap monitoring',
              frequency: 'Weekly',
              responsible: 'Technician',
              cost: 300
            }
          ],
          treatmentProtocols: [
            {
              pest: 'Aphids',
              threshold: '10-15 per plant',
              treatment: 'Neem oil spray',
              cost: 800
            }
          ],
          totalCost: 2800,
          expectedSavings: 15000,
          createdAt: '2024-09-24'
        }
      ];

      setPestIncidents(mockIncidents);
      setControlPlans(mockPlans);
      if (mockIncidents.length > 0) {
        setSelectedIncident(mockIncidents[0]);
      }
    } catch (error) {
      console.error('Error loading pest data:', error);
      toast.error(isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'कीट-रोग डेटा लोड करने में त्रुटि' : 'Error loading pest data');
    } finally {
      setIsLoading(false);
    }
  };

  const reportPestIncident = async () => {
    if (!incidentForm.pestName || !incidentForm.cropAffected) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਖੇਤ ਭਰੋ' : isHindi ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const newIncident: PestIncident = {
        id: Date.now().toString(),
        fieldId: fieldData?.id.toString() || '1',
        pestName: incidentForm.pestName,
        cropAffected: incidentForm.cropAffected,
        severity: incidentForm.severity as any,
        affectedArea: parseFloat(incidentForm.affectedArea),
        firstDetected: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        status: 'active',
        symptoms: incidentForm.symptoms.split(',').map(s => s.trim()),
        treatment: [],
        images: incidentForm.images,
        economicLoss: 0
      };

      setPestIncidents(prev => [newIncident, ...prev]);
      setSelectedIncident(newIncident);
      
      if (onIncidentReported) {
        onIncidentReported(newIncident);
      }

      // Reset form
      setIncidentForm({
        pestName: '',
        cropAffected: '',
        severity: '',
        affectedArea: '',
        symptoms: '',
        images: []
      });

      toast.success(isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਰਿਪੋਰਟ ਦਰਜ ਹੋਈ' : isHindi ? 'कीट-रोग की रिपोर्ट दर्ज हुई' : 'Pest incident reported');
    } catch (error) {
      console.error('Error reporting pest incident:', error);
      toast.error(isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਰਿਪੋਰਟ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'कीट-रोग की रिपोर्ट में त्रुटि' : 'Error reporting pest incident');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'treated': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setIncidentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਪ੍ਰਬੰਧਨ' : isHindi ? 'कीट-रोग प्रबंधन' : 'Pest Control Management'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਇੰਟੀਗ੍ਰੇਟਡ ਪੈਸਟ ਮੈਨੇਜਮੈਂਟ ਸਿਸਟਮ' : isHindi ? 'एकीकृत कीट प्रबंधन प्रणाली' : 'Integrated Pest Management System'}
              </p>
            </div>
          </div>

          {/* Field Info */}
          {fieldData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold">{fieldData.name}</h3>
                    <p className="text-sm text-gray-600">
                      {fieldData.crop_type} • {fieldData.area_acres} acres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="monitoring">
              {isPunjabi ? 'ਨਿਗਰਾਨੀ' : isHindi ? 'निगरानी' : 'Monitoring'}
            </TabsTrigger>
            <TabsTrigger value="incidents">
              {isPunjabi ? 'ਘਟਨਾਵਾਂ' : isHindi ? 'घटनाएं' : 'Incidents'}
            </TabsTrigger>
            <TabsTrigger value="treatment">
              {isPunjabi ? 'ਇਲਾਜ' : isHindi ? 'इलाज' : 'Treatment'}
            </TabsTrigger>
            <TabsTrigger value="prevention">
              {isPunjabi ? 'ਰੋਕਥਾਮ' : isHindi ? 'रोकथाम' : 'Prevention'}
            </TabsTrigger>
            <TabsTrigger value="reports">
              {isPunjabi ? 'ਰਿਪੋਰਟਸ' : isHindi ? 'रिपोर्ट्स' : 'Reports'}
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report New Incident */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-600" />
                    {isPunjabi ? 'ਨਵੀਂ ਘਟਨਾ ਰਿਪੋਰਟ ਕਰੋ' : isHindi ? 'नई घटना रिपोर्ट करें' : 'Report New Incident'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pestName">{isPunjabi ? 'ਕੀੜੇ ਦਾ ਨਾਮ' : isHindi ? 'कीट का नाम' : 'Pest Name'}</Label>
                      <Select value={incidentForm.pestName} onValueChange={(value) => handleInputChange('pestName', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isPunjabi ? 'ਕੀੜਾ ਚੁਣੋ' : isHindi ? 'कीट चुनें' : 'Select Pest'} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(pestDatabase).map((pest) => (
                            <SelectItem key={pest} value={pest}>{pest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cropAffected">{isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ ਫਸਲ' : isHindi ? 'प्रभावित फसल' : 'Affected Crop'}</Label>
                      <Input
                        id="cropAffected"
                        value={incidentForm.cropAffected}
                        onChange={(e) => handleInputChange('cropAffected', e.target.value)}
                        placeholder={isPunjabi ? 'ਫਸਲ ਦਾ ਨਾਮ' : isHindi ? 'फसल का नाम' : 'Crop name'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity">{isPunjabi ? 'ਤੀਬਰਤਾ' : isHindi ? 'तीव्रता' : 'Severity'}</Label>
                      <Select value={incidentForm.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isPunjabi ? 'ਤੀਬਰਤਾ ਚੁਣੋ' : isHindi ? 'तीव्रता चुनें' : 'Select Severity'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{isPunjabi ? 'ਘੱਟ' : isHindi ? 'कम' : 'Low'}</SelectItem>
                          <SelectItem value="medium">{isPunjabi ? 'ਮੱਧਮ' : isHindi ? 'मध्यम' : 'Medium'}</SelectItem>
                          <SelectItem value="high">{isPunjabi ? 'ਉੱਚ' : isHindi ? 'उच्च' : 'High'}</SelectItem>
                          <SelectItem value="critical">{isPunjabi ? 'ਗੰਭੀਰ' : isHindi ? 'गंभीर' : 'Critical'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="affectedArea">{isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ (%)' : isHindi ? 'प्रभावित क्षेत्र (%)' : 'Affected Area (%)'}</Label>
                      <Input
                        id="affectedArea"
                        type="number"
                        value={incidentForm.affectedArea}
                        onChange={(e) => handleInputChange('affectedArea', e.target.value)}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="symptoms">{isPunjabi ? 'ਲੱਛਣ' : isHindi ? 'लक्षण' : 'Symptoms'}</Label>
                    <Input
                      id="symptoms"
                      value={incidentForm.symptoms}
                      onChange={(e) => handleInputChange('symptoms', e.target.value)}
                      placeholder={isPunjabi ? 'ਲੱਛਣਾਂ ਨੂੰ ਕੌਮਾ ਨਾਲ ਵੱਖ ਕਰੋ' : isHindi ? 'लक्षणों को कॉमा से अलग करें' : 'Separate symptoms with commas'}
                    />
                  </div>

                  <Button 
                    onClick={reportPestIncident}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਰਿਪੋਰਟ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'रिपोर्ट कर रहा है...' : 'Reporting...')
                      : (isPunjabi ? 'ਘਟਨਾ ਰਿਪੋਰਟ ਕਰੋ' : isHindi ? 'घटना रिपोर्ट करें' : 'Report Incident')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Pest Database */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਕੀੜੇ ਡੇਟਾਬੇਸ' : isHindi ? 'कीट डेटाबेस' : 'Pest Database'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(pestDatabase).map(([pest, data]) => (
                      <div key={pest} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{pest}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>{isPunjabi ? 'ਫਸਲਾਂ:' : isHindi ? 'फसलें:' : 'Crops:'}</strong> {data.crops.join(', ')}</div>
                          <div><strong>{isPunjabi ? 'ਲੱਛਣ:' : isHindi ? 'लक्षण:' : 'Symptoms:'}</strong> {data.symptoms.join(', ')}</div>
                          <div><strong>{isPunjabi ? 'ਇਲਾਜ:' : isHindi ? 'इलाज:' : 'Treatment:'}</strong> {data.treatment.join(', ')}</div>
                          <div><strong>{isPunjabi ? 'ਥ੍ਰੈਸ਼ਹੋਲਡ:' : isHindi ? 'थ्रेशहोल्ड:' : 'Threshold:'}</strong> {data.threshold}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            {pestIncidents.length > 0 ? (
              <div className="space-y-4">
                {pestIncidents.map((incident) => (
                  <Card key={incident.id} className={`border-l-4 ${
                    incident.severity === 'critical' ? 'border-red-500' :
                    incident.severity === 'high' ? 'border-orange-500' :
                    incident.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Bug className="h-5 w-5 text-red-600" />
                            {incident.pestName} - {incident.cropAffected}
                          </CardTitle>
                          <CardDescription>
                            {incident.firstDetected} • {incident.affectedArea}% {isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ' : isHindi ? 'प्रभावित' : 'affected'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">{isPunjabi ? 'ਲੱਛਣ:' : isHindi ? 'लक्षण:' : 'Symptoms:'}</h5>
                          <ul className="text-sm space-y-1">
                            {incident.symptoms.map((symptom, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">{isPunjabi ? 'ਇਲਾਜ:' : isHindi ? 'इलाज:' : 'Treatment:'}</h5>
                          {incident.treatment.length > 0 ? (
                            <div className="space-y-2">
                              {incident.treatment.map((treatment, index) => (
                                <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                                  <div className="font-medium">{treatment.product}</div>
                                  <div className="text-gray-600">{treatment.method} • {treatment.dosage}</div>
                                  <div className="text-gray-600">{treatment.applicationDate}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              {isPunjabi ? 'ਕੋਈ ਇਲਾਜ ਨਹੀਂ ਦਿੱਤਾ ਗਿਆ' : isHindi ? 'कोई इलाज नहीं दिया गया' : 'No treatment given'}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਘਟਨਾ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई कीट-रोग की घटना नहीं मिली' : 'No Pest Incidents Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਖੇਤ ਸਾਫ਼ ਅਤੇ ਸਿਹਤਮੰਦ ਹੈ' : isHindi ? 'खेत साफ और स्वस्थ है' : 'Field is clean and healthy'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value="treatment" className="space-y-6">
            {selectedIncident ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਇਲਾਜ ਪ੍ਰੋਟੋਕੋਲ' : isHindi ? 'इलाज प्रोटोकॉल' : 'Treatment Protocol'}
                  </CardTitle>
                  <CardDescription>
                    {selectedIncident.pestName} - {selectedIncident.cropAffected}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">{isPunjabi ? 'ਸਿਫਾਰਸ਼ੀ ਇਲਾਜ' : isHindi ? 'सिफारिशी इलाज' : 'Recommended Treatment'}</h4>
                      <div className="space-y-3">
                        {pestDatabase[selectedIncident.pestName as keyof typeof pestDatabase]?.treatment.map((treatment, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{treatment}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {isPunjabi ? 'ਥ੍ਰੈਸ਼ਹੋਲਡ:' : isHindi ? 'थ्रेशहोल्ड:' : 'Threshold:'} {pestDatabase[selectedIncident.pestName as keyof typeof pestDatabase]?.threshold}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">{isPunjabi ? 'ਇਲਾਜ ਇਤਿਹਾਸ' : isHindi ? 'इलाज इतिहास' : 'Treatment History'}</h4>
                      {selectedIncident.treatment.length > 0 ? (
                        <div className="space-y-3">
                          {selectedIncident.treatment.map((treatment, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{treatment.product}</span>
                                <Badge variant="outline">{treatment.effectiveness}% {isPunjabi ? 'ਪ੍ਰਭਾਵਸ਼ੀਲ' : isHindi ? 'प्रभावी' : 'effective'}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>{treatment.method} • {treatment.dosage}</div>
                                <div>{treatment.applicationDate}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {isPunjabi ? 'ਕੋਈ ਇਲਾਜ ਨਹੀਂ ਦਿੱਤਾ ਗਿਆ' : isHindi ? 'कोई इलाज नहीं दिया गया' : 'No treatment given'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਇਲਾਜ ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई इलाज डेटा नहीं मिला' : 'No Treatment Data Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਕੀੜੇ-ਮਕੌੜੇ ਦੀ ਘਟਨਾ ਰਿਪੋਰਟ ਕਰੋ' : isHindi ? 'पहले कीट-रोग की घटना रिपोर्ट करें' : 'Report a pest incident first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Prevention Tab */}
          <TabsContent value="prevention" className="space-y-6">
            {controlPlans.length > 0 ? (
              <div className="space-y-6">
                {controlPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        {plan.cropType} - {plan.season} {isPunjabi ? 'ਰੋਕਥਾਮ ਯੋਜਨਾ' : isHindi ? 'रोकथाम योजना' : 'Prevention Plan'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">{isPunjabi ? 'ਰੋਕਥਾਮ ਉਪਾਅ' : isHindi ? 'रोकथाम उपाय' : 'Preventive Measures'}</h4>
                          <div className="space-y-2">
                            {plan.preventiveMeasures.map((measure, index) => (
                              <div key={index} className="p-2 bg-green-50 rounded text-sm">
                                <div className="font-medium">{measure.measure}</div>
                                <div className="text-gray-600">{measure.frequency} • ₹{measure.cost}</div>
                                <div className="text-gray-600">{measure.effectiveness}% {isPunjabi ? 'ਪ੍ਰਭਾਵਸ਼ੀਲ' : isHindi ? 'प्रभावी' : 'effective'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">{isPunjabi ? 'ਨਿਗਰਾਨੀ ਸਮਾਂ ਸਾਰਣੀ' : isHindi ? 'निगरानी समय सारणी' : 'Monitoring Schedule'}</h4>
                          <div className="space-y-2">
                            {plan.monitoringSchedule.map((schedule, index) => (
                              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                                <div className="font-medium">{schedule.activity}</div>
                                <div className="text-gray-600">{schedule.frequency} • {schedule.responsible}</div>
                                <div className="text-gray-600">₹{schedule.cost}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">{isPunjabi ? 'ਲਾਗਤ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'लागत विश्लेषण' : 'Cost Analysis'}</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="text-sm text-gray-600">{isPunjabi ? 'ਕੁੱਲ ਲਾਗਤ:' : isHindi ? 'कुल लागत:' : 'Total Cost:'}</div>
                              <div className="text-lg font-bold text-red-600">₹{plan.totalCost.toLocaleString()}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="text-sm text-gray-600">{isPunjabi ? 'ਅਪੇਖਿਤ ਬਚਤ:' : isHindi ? 'अपेक्षित बचत:' : 'Expected Savings:'}</div>
                              <div className="text-lg font-bold text-green-600">₹{plan.expectedSavings.toLocaleString()}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="text-sm text-gray-600">{isPunjabi ? 'ROI:' : isHindi ? 'ROI:' : 'ROI:'}</div>
                              <div className="text-lg font-bold text-blue-600">
                                {((plan.expectedSavings - plan.totalCost) / plan.totalCost * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਰੋਕਥਾਮ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई रोकथाम योजना नहीं मिली' : 'No Prevention Plan Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਰੋਕਥਾਮ ਯੋਜਨਾ ਤਿਆਰ ਕਰਨ ਲਈ ਸੰਪਰਕ ਕਰੋ' : isHindi ? 'रोकथाम योजना तैयार करने के लिए संपर्क करें' : 'Contact to create prevention plan'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਰਿਪੋਰਟ' : isHindi ? 'कीट-रोग रिपोर्ट' : 'Pest Control Reports'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {pestIncidents.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਕੁੱਲ ਘਟਨਾਵਾਂ' : isHindi ? 'कुल घटनाएं' : 'Total Incidents'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {pestIncidents.filter(i => i.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਸਰਗਰਮ ਘਟਨਾਵਾਂ' : isHindi ? 'सक्रिय घटनाएं' : 'Active Incidents'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {pestIncidents.filter(i => i.status === 'resolved').length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਹੱਲ ਹੋਈਆਂ' : isHindi ? 'हल हुईं' : 'Resolved'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiPestControl;
