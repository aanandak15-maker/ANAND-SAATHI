/**
 * Enhanced Field Mapper with Global State Integration
 * Integrates field mapping with AppStateContext and all services
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/contexts/AppStateContext';
import { DatabaseService } from '@/services/DatabaseService';
import { satelliteService } from '@/services/integrations/SatelliteService';
import { toast } from 'sonner';
import { MapPin, Save, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface EnhancedFieldMapperProps {
  onComplete?: () => void;
}

export const EnhancedFieldMapperWithState: React.FC<EnhancedFieldMapperProps> = ({ onComplete }) => {
  const { state, dispatch } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  
  const [fieldData, setFieldData] = useState({
    name: '',
    crop_type: 'rice' as const,
    area_acres: 0,
    latitude: 0,
    longitude: 0,
    soil_type: '',
    soil_ph: 7.0,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setFieldData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
          }));
        },
        (error) => {
          console.error('GPS Error:', error);
          toast.error(isPunjabi ? 'GPS ਲੋਕੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'GPS लोकेशन नहीं मिली' : 'GPS location not found');
        }
      );
    }
  }, [isPunjabi, isHindi]);

  const handleSaveField = async () => {
    if (!fieldData.name || fieldData.area_acres <= 0) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਫੀਲਡ ਭਰੋ' : isHindi ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Create field in database
      const result = await DatabaseService.createField({
        user_id: state.user?.id || 'demo-user',
        name: fieldData.name,
        crop_type: fieldData.crop_type,
        area_acres: fieldData.area_acres,
        latitude: fieldData.latitude,
        longitude: fieldData.longitude,
        soil_type: fieldData.soil_type,
        soil_ph: fieldData.soil_ph,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const newField = result.data;
      
      // Add to global state
      dispatch({
        type: 'ADD_FIELD',
        payload: {
          id: newField!.id,
          name: newField!.name,
          crop_type: newField!.crop_type as any,
          area_acres: isNaN(Number(fieldData.area_acres)) ? 0 : Number(fieldData.area_acres),
          latitude: fieldData.latitude,
          longitude: fieldData.longitude,
          farm_id: 1,
          created_at: newField!.created_at,
        },
      });

      // Trigger initial satellite analysis
      if (currentLocation) {
        try {
          const analysisResult = await satelliteService.analyzeField(
            newField!.id,
            [
              [currentLocation.lng, currentLocation.lat],
              // Add more boundary points as needed
            ]
          );

          if (analysisResult.success && analysisResult.data) {
            dispatch({
              type: 'ADD_VEGETATION_ANALYSIS',
              payload: {
                id: analysisResult.data.fieldId + '_analysis',
                fieldId: newField!.id,
                ndvi: analysisResult.data.indices.ndvi,
                ndmi: analysisResult.data.indices.ndmi,
                msavi2: analysisResult.data.indices.msavi2,
                ndre: analysisResult.data.indices.ndre,
                timestamp: new Date(),
                healthStatus: analysisResult.data.healthStatus as 'excellent' | 'good' | 'moderate' | 'poor',
              },
            });
          }
        } catch (error) {
          console.log('Satellite analysis failed, continuing...', error);
        }
      }

      toast.success(
        isPunjabi 
          ? 'ਖੇਤ ਸਫਲਤਾਪੂਰਵਕ ਜੋੜਿਆ ਗਿਆ!' 
          : isHindi 
          ? 'खेत सफलतापूर्वक जोड़ा गया!' 
          : 'Field added successfully!'
      );

      onComplete?.();
    } catch (error) {
      console.error('Error saving field:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to save field',
      });
      toast.error(isPunjabi ? 'ਖੇਤ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'खेत सेव करने में असफल' : 'Failed to save field');
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {isPunjabi ? 'ਨਵਾਂ ਖੇਤ ਜੋੜੋ' : isHindi ? 'नया खेत जोड़ें' : 'Add New Field'}
        </CardTitle>
        <CardDescription>
          {isPunjabi 
            ? 'ਆਪਣੇ ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਦਾਖਲ ਕਰੋ' 
            : isHindi 
            ? 'अपने खेत की जानकारी दर्ज करें' 
            : 'Enter your field information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ' : isHindi ? 'खेत का नाम' : 'Field Name'}
          </Label>
          <Input
            id="name"
            value={fieldData.name}
            onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={isPunjabi ? 'ਉਦਾਹਰਨ: ਪੂਰਬੀ ਖੇਤ' : isHindi ? 'उदाहरण: पूर्वी खेत' : 'e.g., East Field'}
          />
        </div>

        {/* Crop Type */}
        <div className="space-y-2">
          <Label htmlFor="crop">
            {isPunjabi ? 'ਫਸਲ ਦੀ ਕਿਸਮ' : isHindi ? 'फसल का प्रकार' : 'Crop Type'}
          </Label>
          <Select
            value={fieldData.crop_type}
            onValueChange={(value: any) => setFieldData(prev => ({ ...prev, crop_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rice">{isPunjabi ? 'ਚਾਵਲ' : isHindi ? 'चावल' : 'Rice'}</SelectItem>
              <SelectItem value="wheat">{isPunjabi ? 'ਕਣਕ' : isHindi ? 'गेहूं' : 'Wheat'}</SelectItem>
              <SelectItem value="maize">{isPunjabi ? 'ਮੱਕੀ' : isHindi ? 'मक्का' : 'Maize'}</SelectItem>
              <SelectItem value="sugarcane">{isPunjabi ? 'ਗੰਨਾ' : isHindi ? 'गन्ना' : 'Sugarcane'}</SelectItem>
              <SelectItem value="cotton">{isPunjabi ? 'ਕਪਾਹ' : isHindi ? 'कपास' : 'Cotton'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <Label htmlFor="area">
            {isPunjabi ? 'ਰਕਬਾ (ਏਕੜ)' : isHindi ? 'क्षेत्रफल (एकड़)' : 'Area (Acres)'}
          </Label>
          <Input
            id="area"
            type="number"
            value={fieldData.area_acres || ''}
            onChange={(e) => setFieldData(prev => ({ ...prev, area_acres: parseFloat(e.target.value) || 0 }))}
            placeholder="2.5"
          />
        </div>

        {/* Soil Type */}
        <div className="space-y-2">
          <Label htmlFor="soil">
            {isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ' : isHindi ? 'मिट्टी का प्रकार' : 'Soil Type'}
          </Label>
          <Input
            id="soil"
            value={fieldData.soil_type}
            onChange={(e) => setFieldData(prev => ({ ...prev, soil_type: e.target.value }))}
            placeholder={isPunjabi ? 'ਉਦਾਹਰਨ: ਦੋਮਟ' : isHindi ? 'उदाहरण: दोमट' : 'e.g., Loamy'}
          />
        </div>

        {/* Soil pH */}
        <div className="space-y-2">
          <Label htmlFor="ph">
            {isPunjabi ? 'ਮਿੱਟੀ pH' : isHindi ? 'मिट्टी pH' : 'Soil pH'}
          </Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            value={fieldData.soil_ph}
            onChange={(e) => setFieldData(prev => ({ ...prev, soil_ph: parseFloat(e.target.value) }))}
            placeholder="7.0"
          />
        </div>

        {/* Location Display */}
        {currentLocation && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>
                {isPunjabi ? 'ਸਥਿਤੀ:' : isHindi ? 'स्थिति:' : 'Location:'} {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSaveField} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPunjabi ? 'ਸੇਵ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'सेव किया जा रहा है...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isPunjabi ? 'ਖੇਤ ਸੇਵ ਕਰੋ' : isHindi ? 'खेत सेव करें' : 'Save Field'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedFieldMapperWithState;
