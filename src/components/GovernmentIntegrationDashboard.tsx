/**
 * Government Integration Dashboard
 * Farmer verification, land records, subsidies, and schemes
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppState } from '@/contexts/AppStateContext';
import { governmentAPI } from '@/services/integrations/GovernmentAPIService';
import { toast } from 'sonner';
import { Shield, FileText, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const GovernmentIntegrationDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  
  const [farmerId, setFarmerId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const verifyFarmer = async () => {
    if (!farmerId) {
      toast.error(isPunjabi ? 'ਕਿਸਾਨ ID ਦਾਖਲ ਕਰੋ' : isHindi ? 'किसान ID दर्ज करें' : 'Enter Farmer ID');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await governmentAPI.verifyFarmer(farmerId);
      
      if (result.success && result.data) {
        // Add government records to state
        result.data.landRecords.forEach(record => {
          dispatch({
            type: 'ADD_GOVERNMENT_RECORD',
            payload: {
              id: record.id,
              farmerId: result.data!.farmerId,
              recordType: 'land_ownership',
              verificationStatus: record.verificationStatus,
              data: record,
            },
          });
        });

        dispatch({
          type: 'UPDATE_INTEGRATION_STATUS',
          payload: { government: 'connected' },
        });

        toast.success(
          isPunjabi 
            ? 'ਕਿਸਾਨ ਤਸਦੀਕ ਸਫਲ!' 
            : isHindi 
            ? 'किसान सत्यापन सफल!' 
            : 'Farmer verification successful!'
        );
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(isPunjabi ? 'ਤਸਦੀਕ ਅਸਫਲ' : isHindi ? 'सत्यापन असफल' : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const applyForScheme = async (schemeId: string) => {
    setIsLoading(true);
    try {
      const result = await governmentAPI.applyForScheme(farmerId, schemeId, {
        applicantName: state.user?.name,
        fields: state.fields,
      });

      if (result.success) {
        toast.success(
          isPunjabi 
            ? 'ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਹੋ ਗਈ!' 
            : isHindi 
            ? 'आवेदन जमा हो गया!' 
            : 'Application submitted!'
        );
      }
    } catch (error) {
      toast.error(isPunjabi ? 'ਅਰਜ਼ੀ ਅਸਫਲ' : isHindi ? 'आवेदन असफल' : 'Application failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      verified: { label: isPunjabi ? 'ਤਸਦੀਕਸ਼ੁਦਾ' : isHindi ? 'सत्यापित' : 'Verified', class: 'bg-green-100 text-green-700' },
      pending: { label: isPunjabi ? 'ਲੰਬਿਤ' : isHindi ? 'लंबित' : 'Pending', class: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: isPunjabi ? 'ਅਸਵੀਕਾਰ' : isHindi ? 'अस्वीकृत' : 'Rejected', class: 'bg-red-100 text-red-700' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return statusInfo ? <Badge className={statusInfo.class}>{statusInfo.label}</Badge> : null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {isPunjabi ? 'ਸਰਕਾਰੀ ਏਕੀਕਰਨ' : isHindi ? 'सरकारी एकीकरण' : 'Government Integration'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPunjabi 
              ? 'ਤਸਦੀਕ, ਜ਼ਮੀਨ ਰਿਕਾਰਡ, ਅਤੇ ਯੋਜਨਾਵਾਂ' 
              : isHindi 
              ? 'सत्यापन, भूमि रिकॉर्ड, और योजनाएं' 
              : 'Verification, land records, and schemes'}
          </p>
        </div>
        <Badge className={state.integrationStatus.government === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {state.integrationStatus.government === 'connected' 
            ? (isPunjabi ? 'ਕਨੈਕਟ' : isHindi ? 'कनेक्टेड' : 'Connected')
            : (isPunjabi ? 'ਡਿਸਕਨੈਕਟ' : isHindi ? 'डिसकनेक्ट' : 'Disconnected')}
        </Badge>
      </div>

      {/* Farmer Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isPunjabi ? 'ਕਿਸਾਨ ਤਸਦੀਕ' : isHindi ? 'किसान सत्यापन' : 'Farmer Verification'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਆਪਣੀ ਕਿਸਾਨ ID ਨਾਲ ਤਸਦੀਕ ਕਰੋ' : isHindi ? 'अपनी किसान ID से सत्यापित करें' : 'Verify with your Farmer ID'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder={isPunjabi ? 'ਕਿਸਾਨ ID ਦਾਖਲ ਕਰੋ' : isHindi ? 'किसान ID दर्ज करें' : 'Enter Farmer ID'}
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={verifyFarmer} disabled={isVerifying}>
              {isVerifying 
                ? (isPunjabi ? 'ਤਸਦੀਕ ਹੋ ਰਹੀ ਹੈ...' : isHindi ? 'सत्यापन हो रहा है...' : 'Verifying...')
                : (isPunjabi ? 'ਤਸਦੀਕ ਕਰੋ' : isHindi ? 'सत्यापित करें' : 'Verify')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">
            <FileText className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਜ਼ਮੀਨ ਰਿਕਾਰਡ' : isHindi ? 'भूमि रिकॉर्ड' : 'Land Records'}
          </TabsTrigger>
          <TabsTrigger value="subsidies">
            <DollarSign className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਸਬਸਿਡੀ' : isHindi ? 'सब्सिडी' : 'Subsidies'}
          </TabsTrigger>
          <TabsTrigger value="schemes">
            <CheckCircle className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਯੋਜਨਾਵਾਂ' : isHindi ? 'योजनाएं' : 'Schemes'}
          </TabsTrigger>
        </TabsList>

        {/* Land Records */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਤੁਹਾਡੇ ਜ਼ਮੀਨ ਰਿਕਾਰਡ' : isHindi ? 'आपके भूमि रिकॉर्ड' : 'Your Land Records'}</CardTitle>
            </CardHeader>
            <CardContent>
              {state.governmentRecords.filter(r => r.recordType === 'land_ownership').length > 0 ? (
                <div className="space-y-3">
                  {state.governmentRecords
                    .filter(r => r.recordType === 'land_ownership')
                    .map(record => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.verificationStatus)}
                            <span className="font-medium">
                              {isPunjabi ? 'ਖਸਰਾ' : isHindi ? 'खसरा' : 'Khasra'}: {record.data.khasraNumber || 'N/A'}
                            </span>
                          </div>
                          {getStatusBadge(record.verificationStatus)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{isPunjabi ? 'ਰਕਬਾ' : isHindi ? 'क्षेत्र' : 'Area'}: {record.data.area || 'N/A'} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</p>
                          <p>{isPunjabi ? 'ਪਿੰਡ' : isHindi ? 'गांव' : 'Village'}: {record.data.village || 'N/A'}</p>
                          <p>{isPunjabi ? 'ਜ਼ਿਲ੍ਹਾ' : isHindi ? 'जिला' : 'District'}: {record.data.district || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{isPunjabi ? 'ਕੋਈ ਜ਼ਮੀਨ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲੇ' : isHindi ? 'कोई भूमि रिकॉर्ड नहीं मिले' : 'No land records found'}</p>
                  <p className="text-sm mt-1">{isPunjabi ? 'ਤਸਦੀਕ ਕਰਨ ਲਈ ਕਿਸਾਨ ID ਦਾਖਲ ਕਰੋ' : isHindi ? 'सत्यापित करने के लिए किसान ID दर्ज करें' : 'Enter Farmer ID to verify'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subsidies */}
        <TabsContent value="subsidies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਤੁਹਾਡੀ ਸਬਸਿਡੀ ਸਥਿਤੀ' : isHindi ? 'आपकी सब्सिडी स्थिति' : 'Your Subsidy Status'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{isPunjabi ? 'ਸਬਸਿਡੀ ਜਾਣਕਾਰੀ ਉਪਲਬਧ ਹੋਵੇਗੀ' : isHindi ? 'सब्सिडी जानकारी उपलब्ध होगी' : 'Subsidy information will be available'}</p>
                <p className="text-sm mt-1">{isPunjabi ? 'ਤਸਦੀਕ ਤੋਂ ਬਾਅਦ' : isHindi ? 'सत्यापन के बाद' : 'After verification'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Government Schemes */}
        <TabsContent value="schemes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mock schemes */}
            {[
              {
                id: 'pmkisan',
                name: isPunjabi ? 'PM-KISAN ਯੋਜਨਾ' : isHindi ? 'PM-KISAN योजना' : 'PM-KISAN Scheme',
                description: isPunjabi ? 'ਸਾਲਾਨਾ ਸਹਾਇਤਾ ₹6000' : isHindi ? 'वार्षिक सहायता ₹6000' : 'Annual assistance ₹6000',
                eligible: true,
              },
              {
                id: 'crop-insurance',
                name: isPunjabi ? 'ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ' : isHindi ? 'फसल बीमा योजना' : 'Crop Insurance Scheme',
                description: isPunjabi ? 'ਫਸਲ ਨੁਕਸਾਨ ਲਈ ਬੀਮਾ' : isHindi ? 'फसल हानि के लिए बीमा' : 'Insurance for crop loss',
                eligible: true,
              },
            ].map(scheme => (
              <Card key={scheme.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{scheme.name}</CardTitle>
                    {scheme.eligible && (
                      <Badge className="bg-green-100 text-green-700">
                        {isPunjabi ? 'ਯੋਗ' : isHindi ? 'योग्य' : 'Eligible'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => applyForScheme(scheme.id)} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isPunjabi ? 'ਅਰਜ਼ੀ ਦਿਓ' : isHindi ? 'आवेदन करें' : 'Apply Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentIntegrationDashboard;
