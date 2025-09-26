/**
 * Punjab Government Integration UI Component
 * Interface for accessing government schemes, data, and services
 * Integrates with Punjab agricultural department APIs
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Award, 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  Globe,
  Building,
  Shield,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Share2,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  Archive,
  Flag,
  Tag,
  Hash,
  AtSign,
  Plus,
  Edit,
  Trash2,
  Settings,
  HelpCircle,
  Bell,
  Smartphone,
  MessageSquare,
  Activity,
  Target,
  Zap,
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  Bug,
  Mountain,
  TreePine,
  Waves,
  Lightbulb,
  Brain,
  Satellite
} from 'lucide-react';
import PunjabNavigation from './PunjabNavigation';
import { 
  governmentSchemes, 
  cropAdvisories, 
  pestAlerts, 
  historicalYields,
  type GovernmentScheme,
  type CropAdvisory,
  type PestAlert,
  type HistoricalYield
} from '@/data/punjabGovernmentData';

export default function PunjabGovernmentIntegration() {
  const [selectedTab, setSelectedTab] = useState('schemes');
  const [selectedDistrict, setSelectedDistrict] = useState('ludhiana');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSchemes = governmentSchemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || scheme.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || scheme.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'default';
      case 'technical': return 'secondary';
      case 'insurance': return 'outline';
      case 'subsidy': return 'default';
      case 'training': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'upcoming': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PunjabNavigation 
        currentPage="Government Services - PM Kisan, schemes, advisories"
        showBackButton={true}
        showSupportButtons={true}
      />

      <div className="container mx-auto px-6 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
            <TabsTrigger value="advisories">Crop Advisories</TabsTrigger>
            <TabsTrigger value="pest-alerts">Pest Alerts</TabsTrigger>
            <TabsTrigger value="yield-data">Yield Data</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Government Schemes */}
          <TabsContent value="schemes" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Schemes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search schemes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="subsidy">Subsidy</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ludhiana">Ludhiana</SelectItem>
                        <SelectItem value="amritsar">Amritsar</SelectItem>
                        <SelectItem value="patiala">Patiala</SelectItem>
                        <SelectItem value="sangrur">Sangrur</SelectItem>
                        <SelectItem value="bathinda">Bathinda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schemes List */}
            <div className="space-y-4">
              {filteredSchemes.map((scheme) => (
                <Card key={scheme.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{scheme.name}</h3>
                          <Badge variant={getCategoryColor(scheme.category)}>
                            {scheme.category}
                          </Badge>
                          <Badge variant={getStatusColor(scheme.status)}>
                            {scheme.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{scheme.description}</p>
                        <p className="text-gray-500">{scheme.localDescription}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Benefits</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {scheme.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Eligibility</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {scheme.eligibility.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Amount: ₹{scheme.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {new Date(scheme.applicationDeadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{scheme.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Crop Advisories */}
          <TabsContent value="advisories" className="space-y-6">
            <div className="space-y-4">
              {cropAdvisories.map((advisory) => (
                <Card key={advisory.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{advisory.title}</h3>
                        <Badge variant={getSeverityColor(advisory.severity)}>
                          {advisory.severity}
                        </Badge>
                        <Badge variant="outline">{advisory.district}</Badge>
                      </div>
                      <p className="text-gray-600">{advisory.content}</p>
                      <p className="text-gray-500">{advisory.localContent}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {advisory.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Local Recommendations</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {advisory.localRecommendations.map((rec, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Issued: {new Date(advisory.issuedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Valid Until: {new Date(advisory.validUntil).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{advisory.source}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pest Alerts */}
          <TabsContent value="pest-alerts" className="space-y-6">
            <div className="space-y-4">
              {pestAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{alert.pestName}</h3>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.affectedCrops.join(', ')}</Badge>
                      </div>
                      <p className="text-gray-600">{alert.description}</p>
                      <p className="text-gray-500">{alert.localDescription}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Preventive Measures</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alert.preventiveMeasures.map((measure, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                {measure}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Treatment Options</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alert.treatmentOptions.map((treatment, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-orange-600" />
                                {treatment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Alert Date: {new Date(alert.alertDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>Districts: {alert.affectedDistricts.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Yield Data */}
          <TabsContent value="yield-data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historical Yield Data</CardTitle>
                <CardDescription>Rice yield data for {selectedDistrict}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalYields.map((yieldData) => (
                    <div key={`${yieldData.year}-${yieldData.district}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{yieldData.year} - {yieldData.variety}</h4>
                            <Badge variant="outline">{yieldData.district}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Yield:</span> {yieldData.yieldAmount} {yieldData.unit}
                            </div>
                            <div>
                              <span className="font-medium">Area:</span> {yieldData.area.toLocaleString()} {yieldData.areaUnit}
                            </div>
                            <div>
                              <span className="font-medium">Rainfall:</span> {yieldData.rainfall} mm
                            </div>
                            <div>
                              <span className="font-medium">Temperature:</span> {yieldData.temperature}°C
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Chart
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Punjab Agriculture Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+91 172-270-1234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>agri@punjab.gov.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>agri.punjab.gov.in</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-600" />
                    Pest Warning System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+91 172-270-1234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>pestwarning@punjab.gov.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>pestwarning-agripunjab.punjab.gov.pk</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Report Pest
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    PM Kisan Helpline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+91 1800-180-1551</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>pmkisan@nic.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>pmkisan.gov.in</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Portal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}