/**
 * Anand Saathi Reports Component
 * Simple reports with export functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  MapPin,
  Target,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  fieldId: string;
  fieldName: string;
  cropType: string;
  season: string;
  yield: {
    predicted: number;
    actual?: number;
    unit: string;
  };
  costs: {
    seeds: number;
    fertilizer: number;
    pesticides: number;
    labor: number;
    irrigation: number;
    total: number;
  };
  revenue: {
    expected: number;
    actual?: number;
    marketPrice: number;
  };
  profit: {
    expected: number;
    actual?: number;
    margin: number;
  };
  date: string;
}

interface ReportsProps {
  fieldData?: FieldData;
}

export const AnandSaathiReports: React.FC<ReportsProps> = ({
  fieldData
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Mock report data
      const mockReports: ReportData[] = [
        {
          id: '1',
          fieldId: '1',
          fieldName: 'North Rice Field',
          cropType: 'Rice',
          season: 'Kharif 2024',
          yield: {
            predicted: 4.5,
            actual: 4.2,
            unit: 'tons/acre'
          },
          costs: {
            seeds: 2500,
            fertilizer: 3500,
            pesticides: 1200,
            labor: 4000,
            irrigation: 1500,
            total: 12700
          },
          revenue: {
            expected: 31500,
            actual: 29400,
            marketPrice: 2500
          },
          profit: {
            expected: 18800,
            actual: 16700,
            margin: 56.8
          },
          date: '2024-09-24'
        },
        {
          id: '2',
          fieldId: '2',
          fieldName: 'South Rice Field',
          cropType: 'Rice',
          season: 'Kharif 2024',
          yield: {
            predicted: 4.2,
            actual: 4.0,
            unit: 'tons/acre'
          },
          costs: {
            seeds: 2400,
            fertilizer: 3200,
            pesticides: 1100,
            labor: 3800,
            irrigation: 1400,
            total: 11900
          },
          revenue: {
            expected: 29400,
            actual: 28000,
            marketPrice: 2500
          },
          profit: {
            expected: 17500,
            actual: 16100,
            margin: 57.5
          },
          date: '2024-09-24'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error(isPunjabi ? 'ਰਿਪੋਰਟ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'रिपोर्ट लोड करने में त्रुटि' : 'Error loading reports');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    // Simple PDF export simulation
    toast.success(isPunjabi ? 'PDF ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਹੋ ਰਹੀ ਹੈ' : isHindi ? 'PDF रिपोर्ट डाउनलोड हो रही है' : 'PDF report downloading...');
  };

  const exportToExcel = () => {
    // Simple Excel export simulation
    toast.success(isPunjabi ? 'Excel ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਹੋ ਰਹੀ ਹੈ' : isHindi ? 'Excel रिपोर्ट डाउनलोड हो रही है' : 'Excel report downloading...');
  };

  const getTotalYield = () => {
    return reports.reduce((sum, report) => sum + (report.yield.actual || report.yield.predicted), 0);
  };

  const getTotalCosts = () => {
    return reports.reduce((sum, report) => sum + report.costs.total, 0);
  };

  const getTotalRevenue = () => {
    return reports.reduce((sum, report) => sum + (report.revenue.actual || report.revenue.expected), 0);
  };

  const getTotalProfit = () => {
    return reports.reduce((sum, report) => sum + (report.profit.actual || report.profit.expected), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਰਿਪੋਰਟਸ' : isHindi ? 'रिपोर्ट्स' : 'Reports'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਫਾਰਮ ਪ੍ਰਦਰਸ਼ਨ ਅਤੇ ਵਿੱਤੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'फार्म प्रदर्शन और वित्तीय विश्लेषण' : 'Farm performance and financial analysis'}
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 mb-6">
            <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
              <Download className="h-4 w-4 mr-2" />
              {isPunjabi ? 'PDF ਡਾਊਨਲੋਡ' : isHindi ? 'PDF डाउनलोड' : 'Download PDF'}
            </Button>
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              {isPunjabi ? 'Excel ਡਾਊਨਲੋਡ' : isHindi ? 'Excel डाउनलोड' : 'Download Excel'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isPunjabi ? 'ਕੁੱਲ ਉਪਜ' : isHindi ? 'कुल उपज' : 'Total Yield'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {getTotalYield().toFixed(1)} {isPunjabi ? 'ਟਨ' : isHindi ? 'टन' : 'tons'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isPunjabi ? 'ਕੁੱਲ ਲਾਗਤ' : isHindi ? 'कुल लागत' : 'Total Costs'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{getTotalCosts().toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isPunjabi ? 'ਕੁੱਲ ਆਮਦਨੀ' : isHindi ? 'कुल आमदनी' : 'Total Revenue'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{getTotalRevenue().toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isPunjabi ? 'ਕੁੱਲ ਲਾਭ' : isHindi ? 'कुल लाभ' : 'Total Profit'}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{getTotalProfit().toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="detailed">
              {isPunjabi ? 'ਵਿਸਤ੍ਰਿਤ' : isHindi ? 'विस्तृत' : 'Detailed'}
            </TabsTrigger>
            <TabsTrigger value="comparison">
              {isPunjabi ? 'ਤੁਲਨਾ' : isHindi ? 'तुलना' : 'Comparison'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Yield Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਉਪਜ ਪ੍ਰਦਰਸ਼ਨ' : isHindi ? 'उपज प्रदर्शन' : 'Yield Performance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{report.fieldName}</h4>
                            <p className="text-sm text-gray-600">{report.cropType} • {report.season}</p>
                          </div>
                          <Badge variant="outline">
                            {report.yield.actual ? 'Actual' : 'Predicted'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {isPunjabi ? 'ਉਪਜ:' : isHindi ? 'उपज:' : 'Yield:'}
                          </span>
                          <span className="font-bold">
                            {report.yield.actual || report.yield.predicted} {report.yield.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਵਿੱਤੀ ਸਾਰ' : isHindi ? 'वित्तीय सार' : 'Financial Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {isPunjabi ? 'ਕੁੱਲ ਲਾਗਤ:' : isHindi ? 'कुल लागत:' : 'Total Costs:'}
                      </span>
                      <span className="font-bold text-red-600">₹{getTotalCosts().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {isPunjabi ? 'ਕੁੱਲ ਆਮਦਨੀ:' : isHindi ? 'कुल आमदनी:' : 'Total Revenue:'}
                      </span>
                      <span className="font-bold text-blue-600">₹{getTotalRevenue().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {isPunjabi ? 'ਕੁੱਲ ਲਾਭ:' : isHindi ? 'कुल लाभ:' : 'Total Profit:'}
                      </span>
                      <span className="font-bold text-green-600">₹{getTotalProfit().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {isPunjabi ? 'ਲਾਭ ਮਾਰਜਿਨ:' : isHindi ? 'लाभ मार्जिन:' : 'Profit Margin:'}
                      </span>
                      <span className="font-bold text-purple-600">
                        {((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="space-y-6">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {report.fieldName}
                    </CardTitle>
                    <CardDescription>
                      {report.cropType} • {report.season} • {report.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Yield Details */}
                      <div>
                        <h4 className="font-medium mb-3">
                          {isPunjabi ? 'ਉਪਜ ਵਿਸਤਾਰ' : isHindi ? 'उपज विस्तार' : 'Yield Details'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਪੂਰਵਾਨੁਮਾਨ:' : isHindi ? 'पूर्वानुमान:' : 'Predicted:'}
                            </span>
                            <span>{report.yield.predicted} {report.yield.unit}</span>
                          </div>
                          {report.yield.actual && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                {isPunjabi ? 'ਅਸਲ:' : isHindi ? 'असल:' : 'Actual:'}
                              </span>
                              <span>{report.yield.actual} {report.yield.unit}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="font-medium mb-3">
                          {isPunjabi ? 'ਲਾਗਤ ਵਿਸਤਾਰ' : isHindi ? 'लागत विस्तार' : 'Cost Breakdown'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਬੀਜ:' : isHindi ? 'बीज:' : 'Seeds:'}
                            </span>
                            <span>₹{report.costs.seeds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਖਾਦ:' : isHindi ? 'खाद:' : 'Fertilizer:'}
                            </span>
                            <span>₹{report.costs.fertilizer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਕੀੜੇਮਾਰ:' : isHindi ? 'कीटनाशक:' : 'Pesticides:'}
                            </span>
                            <span>₹{report.costs.pesticides}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਮਜ਼ਦੂਰੀ:' : isHindi ? 'मजदूरी:' : 'Labor:'}
                            </span>
                            <span>₹{report.costs.labor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਸਿੰਚਾਈ:' : isHindi ? 'सिंचाई:' : 'Irrigation:'}
                            </span>
                            <span>₹{report.costs.irrigation}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold">
                            <span className="text-sm">
                              {isPunjabi ? 'ਕੁੱਲ:' : isHindi ? 'कुल:' : 'Total:'}
                            </span>
                            <span>₹{report.costs.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue & Profit */}
                      <div>
                        <h4 className="font-medium mb-3">
                          {isPunjabi ? 'ਆਮਦਨੀ ਅਤੇ ਲਾਭ' : isHindi ? 'आमदनी और लाभ' : 'Revenue & Profit'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਆਮਦਨੀ:' : isHindi ? 'आमदनी:' : 'Revenue:'}
                            </span>
                            <span>₹{report.revenue.actual || report.revenue.expected}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਲਾਭ:' : isHindi ? 'लाभ:' : 'Profit:'}
                            </span>
                            <span>₹{report.profit.actual || report.profit.expected}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {isPunjabi ? 'ਮਾਰਜਿਨ:' : isHindi ? 'मार्जिन:' : 'Margin:'}
                            </span>
                            <span>{report.profit.margin}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  {isPunjabi ? 'ਫੀਲਡ ਤੁਲਨਾ' : isHindi ? 'फील्ड तुलना' : 'Field Comparison'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਫੀਲਡ' : isHindi ? 'फील्ड' : 'Field'}
                        </th>
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਉਪਜ' : isHindi ? 'उपज' : 'Yield'}
                        </th>
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਲਾਗਤ' : isHindi ? 'लागत' : 'Costs'}
                        </th>
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਆਮਦਨੀ' : isHindi ? 'आमदनी' : 'Revenue'}
                        </th>
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਲਾਭ' : isHindi ? 'लाभ' : 'Profit'}
                        </th>
                        <th className="text-left p-2">
                          {isPunjabi ? 'ਮਾਰਜਿਨ' : isHindi ? 'मार्जिन' : 'Margin'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-2 font-medium">{report.fieldName}</td>
                          <td className="p-2">
                            {report.yield.actual || report.yield.predicted} {report.yield.unit}
                          </td>
                          <td className="p-2">₹{report.costs.total.toLocaleString()}</td>
                          <td className="p-2">₹{(report.revenue.actual || report.revenue.expected).toLocaleString()}</td>
                          <td className="p-2">₹{(report.profit.actual || report.profit.expected).toLocaleString()}</td>
                          <td className="p-2">{report.profit.margin}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiReports;
