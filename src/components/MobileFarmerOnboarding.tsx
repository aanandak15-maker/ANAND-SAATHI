import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { offlineSyncService } from '../services/OfflineSyncService';
import { communityDataService } from '../services/integrations/CommunityDataService';

interface AadhaarData {
  number: string;
  name: string;
  village: string;
  district: string;
  state: string;
}

interface FieldBoundary {
  latitude: number;
  longitude: number;
}

interface FieldData {
  farmerId: string;
  fieldId: string;
  boundary: FieldBoundary[];
  areaHectares: number;
  soilType: string;
  cropType: string;
  irrigationSource: string;
  photos?: string[];
}

export const MobileFarmerOnboarding: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'aadhaar' | 'location' | 'field_map' | 'verification' | 'complete'>('welcome');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);

  // Aadhaar verification state
  const [aadhaarData, setAadhaarData] = useState<AadhaarData>({
    number: '',
    name: '',
    village: '',
    district: '',
    state: ''
  });

  // Location and field mapping state
  const [currentLocation, setCurrentLocation] = useState<FieldBoundary | null>(null);
  const [fieldBoundaries, setFieldBoundaries] = useState<FieldBoundary[]>([]);
  const [fieldData, setFieldData] = useState<FieldData>({
    farmerId: '',
    fieldId: `field_${Date.now()}`,
    boundary: [],
    areaHectares: 0,
    soilType: '',
    cropType: '',
    irrigationSource: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync on mount
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSync = async () => {
    const hasPending = await offlineSyncService.hasPendingSync();
    setPendingSync(hasPending);
  };

  // Step 1: Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="mobile-onboarding bg-gradient-to-br from-green-50 to-blue-50 min-h-screen p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">अनंद साथी में आपका स्वागत है</h1>
          <p className="text-gray-600">आपके खेतों की देखभाल के लिए स्मार्ट समाधान</p>
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">⚠️</div>
              <div className="ml-3">
                <p className="text-sm">आप ऑफलाइन हैं। सभी डेटा बाद में सिंक हो जाएगा।</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending sync indicator */}
        {pendingSync && isOnline && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">🔄</div>
              <div className="ml-3">
                <p className="text-sm">डेटा सिंक हो रहा है। कृपया प्रतीक्षा करें।</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => setStep('aadhaar')}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            शुरू करें 🔰
          </button>

          <div className="text-sm text-gray-500 text-center">
            <p>• Aadhaar से आसानी से रजिस्ट्रेशन</p>
            <p>• GPS से खेत का मैपिंग</p>
            <p>• डेटा प्राइवेसी के साथ सुरक्षित</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Aadhaar Verification
  if (step === 'aadhaar') {
    const handleAadhaarSubmit = async () => {
      if (aadhaarData.number.length !== 12) {
        setError('कृपया 12 अंको का Aadhaar नंबर दर्ज करें');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // In a real app, this would call actual Aadhaar API
        // For now, we'll simulate verification
        const mockVerification = {
          success: true,
          data: {
            name: aadhaarData.number === '123412341234' ? 'राज कुमार' : 'सिमुलेटेड नाम',
            village: 'दहिया',
            district: 'लudhiana',
            state: 'पंजाब'
          }
        };

        if (mockVerification.success) {
          setAadhaarData(prev => ({
            ...prev,
            ...mockVerification.data
          }));

          setFieldData(prev => ({
            ...prev,
            farmerId: `farmer_${aadhaarData.number}`
          }));

          setStep('location');
        }
      } catch (err) {
        setError('Aadhaar सत्यापन विफल रहा। कृपया पुन: प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mobile-onboarding p-6">
        <div className="mb-6">
          <button onClick={() => setStep('welcome')} className="text-green-600 mb-4">← वापस</button>
          <h2 className="text-xl font-bold mb-2">Aadhaar सत्यापन</h2>
          <p className="text-gray-600">आपका पहला खाता बनाने के लिए</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aadhaar नंबर</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              placeholder="1234 1234 1234"
              maxLength={12}
              value={aadhaarData.number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setAadhaarData(prev => ({ ...prev, number: value }));
              }}
            />
            <p className="text-xs text-gray-500 mt-1">12 अंकों का नंबर दर्ज करें</p>
          </div>

          <button
            onClick={handleAadhaarSubmit}
            disabled={loading || aadhaarData.number.length !== 12}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'सत्यापित किया जा रहा...' : 'सत्यापित करें ✅'}
          </button>
        </div>

        {/* Demo data hint */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">
            <strong>डेमो डेटा:</strong> 123412341234 दर्ज करें
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Location Permission
  if (step === 'location') {
    const requestLocationPermission = async () => {
      setLoading(true);
      setError('');

      try {
        if (Capacitor.isNativePlatform()) {
          const permission = await Geolocation.requestPermissions();

          if (permission.location === 'granted') {
            const position = await Geolocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 10000
            });

            const location: FieldBoundary = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            setCurrentLocation(location);
            setFieldBoundaries([location]); // Start with current location
            setStep('field_map');
          } else {
            setError('GPS अनुमति आवश्यक है। कृपया ऑन करें।');
          }
        } else {
          // Browser fallback
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location: FieldBoundary = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                };
                setCurrentLocation(location);
                setFieldBoundaries([location]);
                setStep('field_map');
              },
              (error) => {
                console.error('GPS error:', error);
                setError('GPS स्थान प्राप्त करने में असमर्थ। कृपया GPS ऑन करें।');
              },
              {
                enableHighAccuracy: true,
                timeout: 10000
              }
            );
          } else {
            setError('आपका ब्राउज़र GPS सपोर्ट नहीं करता।');
          }
        }
      } catch (err) {
        console.error('Location error:', err);
        setError('GPS अनुमति या स्थान प्राप्त करने में त्रुटि।');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mobile-onboarding p-6">
        <div className="mb-6">
          <button onClick={() => setStep('aadhaar')} className="text-green-600 mb-4">← वापस</button>
          <h2 className="text-xl font-bold mb-2">GPS अनुमति</h2>
          <p className="text-gray-600">आपके खेतों को मैप करने के लिए स्थान की आवश्यकता है</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <div className="text-2xl mr-3">📍</div>
            <div>
              <h3 className="font-semibold text-green-800">GPS क्यों जरूरी?</h3>
              <ul className="text-sm text-green-700 mt-1">
                <li>• सटीक खेत का मैपिंग</li>
                <li>• सैटेलाइट स्वास्थ्य डेटा</li>
                <li>• Irrigation प्लानिंग</li>
                <li>• सब्सिडी क्लेम के लिए</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={requestLocationPermission}
          disabled={loading}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'GPS ऑन किया जा रहा...' : 'GPS अनुमति दें 📍'}
        </button>

        {/* Manual location entry fallback */}
        <button
          onClick={() => setStep('field_map')}
          className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-sm mt-3"
        >
          GPS ना मिला? मैन्युअल दर्ज करें →
        </button>
      </div>
    );
  }

  // Step 4: Field Mapping
  if (step === 'field_map') {
    const addBoundaryPoint = async () => {
      // In a real app, this would walk the field boundary
      // For now, we'll simulate adding points
      if (currentLocation) {
        const newPoint: FieldBoundary = {
          latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001
        };

        setFieldBoundaries(prev => [...prev, newPoint]);
      }
    };

    const takeFieldPhoto = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const image = await Camera.getPhoto({
            quality: 80,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera
          });

          // Store photo with field data
          if (image.base64String) {
            setFieldData(prev => ({
              ...prev,
              photos: [...(prev.photos || []), image.base64String]
            }));
          }
        } else {
          alert('फोटो कैप्चर ब्राउज़र में उपलब्ध नहीं है। मोबाइल ऐप में उपयोग करें।');
        }
      } catch (error) {
        console.error('Camera error:', error);
        setError('फोटो लेने में त्रुटि हुई।');
      }
    };

    const completeFieldMapping = () => {
      if (fieldBoundaries.length < 3) {
        setError('कम से कम 3 सीमाएँ दर्ज करें।');
        return;
      }

      // Calculate approximate area (simplified)
      const area = calculateFieldArea(fieldBoundaries);
      setFieldData(prev => ({
        ...prev,
        boundary: fieldBoundaries,
        areaHectares: area
      }));

      setStep('verification');
    };

    const calculateFieldArea = (points: FieldBoundary[]): number => {
      // Simplified area calculation for demonstration
      // In reality, this would use proper geospatial calculations
      if (points.length < 3) return 0;

      // Approximate 0.5-2 hectares for demo
      return 0.5 + Math.random() * 1.5;
    };

    return (
      <div className="mobile-onboarding p-6">
        <div className="mb-6">
          <button onClick={() => setStep('location')} className="text-green-600 mb-4">← वापस</button>
          <h2 className="text-xl font-bold mb-2">खेत का मैपिंग</h2>
          <p className="text-gray-600">खेत की सीमाएँ और क्षेत्रफल दर्ज करें</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Field boundary visualization */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">खेत की सीमाएँ ({fieldBoundaries.length} पॉइंट)</h3>

          {fieldBoundaries.map((point, index) => (
            <div key={index} className="text-sm text-gray-600 mb-1">
              पॉइंट {index + 1}: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
            </div>
          ))}

          <button
            onClick={addBoundaryPoint}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm mt-3"
          >
            + सीमा पॉइंट जोड़ें
          </button>
        </div>

        {/* Photo capture */}
        <button
          onClick={takeFieldPhoto}
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg text-sm mb-4"
        >
          📸 खेत की फोटो लें
        </button>

        <button
          onClick={completeFieldMapping}
          disabled={fieldBoundaries.length < 3}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          मैपिंग पूरा करें ✅
        </button>
      </div>
    );
  }

  // Step 5: Verification & Details
  if (step === 'verification') {
    const handleFieldDetailsSubmit = async () => {
      if (!fieldData.soilType || !fieldData.cropType || !fieldData.irrigationSource) {
        setError('सभी विवरण भरें।');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Queue the field registration for offline sync
        const success = await offlineSyncService.queueOfflineAction('register_field', {
          farmer_id: fieldData.farmerId,
          field_id: fieldData.fieldId,
          field_data: {
            village: aadhaarData.village,
            district: aadhaarData.district,
            boundary: fieldData.boundary,
            area_hectares: fieldData.areaHectares,
            soil_type: fieldData.soilType,
            irrigation_source: fieldData.irrigationSource,
            current_crop: fieldData.cropType
          }
        });

        if (success) {
          setStep('complete');
        } else {
          setError('डेटा सेव करने में त्रुटि हुई। बाद में सिंक हो जाएगा।');
          setStep('complete'); // Still proceed to completion
        }
      } catch (err) {
        setError('डेटा सबमिट करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mobile-onboarding p-6">
        <div className="mb-6">
          <button onClick={() => setStep('field_map')} className="text-green-600 mb-4">← वापस</button>
          <h2 className="text-xl font-bold mb-2">खेत का विवरण</h2>
          <p className="text-gray-600">मिट्टी और सिंचाई की जानकारी</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Field summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">खेत का सारांश</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>क्षेत्रफल: <strong>{fieldData.areaHectares.toFixed(2)} हेक्टेयर</strong></p>
            <p>स्थान: {aadhaarData.village}, {aadhaarData.district}</p>
            <p>सीमाएँ: {fieldData.boundary.length} पॉइंट</p>
          </div>
        </div>

        {/* Field details form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">मिट्टी का प्रकार</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              value={fieldData.soilType}
              onChange={(e) => setFieldData(prev => ({ ...prev, soilType: e.target.value }))}
            >
              <option value="">चुनें</option>
              <option value="black_soil">काली मिट्टी</option>
              <option value="red_soil">लाल मिट्टी</option>
              <option value="alluvial">दोआबी मिट्टी</option>
              <option value="sandy_loam">रेतीली दोमट मिट्टी</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">वर्तमान फसल</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              value={fieldData.cropType}
              onChange={(e) => setFieldData(prev => ({ ...prev, cropType: e.target.value }))}
            >
              <option value="">चुनें</option>
              <option value="rice">धान</option>
              <option value="wheat">गेंहू</option>
              <option value="cotton">कपास</option>
              <option value="sugarcane">गन्ना</option>
              <option value="maize">मक्का</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">सिंचाई स्रोत</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              value={fieldData.irrigationSource}
              onChange={(e) => setFieldData(prev => ({ ...prev, irrigationSource: e.target.value }))}
            >
              <option value="">चुनें</option>
              <option value="canal">नहर</option>
              <option value="tubewell">ट्यूबवेल</option>
              <option value="rainfed">वर्षा आधारित</option>
              <option value="drip_irrigation">ड्रिप सिंचाई</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleFieldDetailsSubmit}
          disabled={loading || !fieldData.soilType || !fieldData.cropType || !fieldData.irrigationSource}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'सेव किया जा रहा...' : 'रजिस्ट्रेशन पूरा करें ✅'}
        </button>
      </div>
    );
  }

  // Step 6: Completion
  if (step === 'complete') {
    const handleFinish = () => {
      // Navigate to main app
      window.location.href = '/dashboard';
    };

    return (
      <div className="mobile-onboarding bg-gradient-to-br from-green-50 to-blue-50 min-h-screen p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">बधाई! रजिस्ट्रेशन पूरा हुआ</h1>
          <p className="text-gray-600 mb-8">अनंद साथी पर आपका स्वागत है</p>

          {/* Summary */}
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">आपका रजिस्टर्ड खेत</h3>

            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">फार्मर ID:</span>
                <span className="font-medium">{fieldData.farmerId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">क्षेत्रफल:</span>
                <span className="font-medium">{fieldData.areaHectares.toFixed(2)} हेक्टेयर</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">मिट्टी प्रकार:</span>
                <span className="font-medium">
                  {fieldData.soilType === 'sandy_loam' ? 'रेतीली दोमट' :
                   fieldData.soilType === 'black_soil' ? 'काली' :
                   fieldData.soilType === 'red_soil' ? 'लाल' :
                   fieldData.soilType === 'alluvial' ? 'दोआबी' : fieldData.soilType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">वर्तमान फसल:</span>
                <span className="font-medium">
                  {fieldData.cropType === 'rice' ? 'धान' :
                   fieldData.cropType === 'wheat' ? 'गेंहू' :
                   fieldData.cropType === 'cotton' ? 'कपास' :
                   fieldData.cropType === 'sugarcane' ? 'गन्ना' :
                   fieldData.cropType === 'maize' ? 'मक्का' : fieldData.cropType}
                </span>
              </div>
            </div>
          </div>

          {/* Features preview */}
          <div className="text-sm text-gray-500 mb-8">
            <p className="mb-2">अब आप उपयोग कर सकते हैं:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>🌦️ मौसम पूर्वानुमान</span>
              <span>💰 मूल्य अलर्ट</span>
              <span>🤖 AI सिफारिशें</span>
              <span>📊 उपज ट्रैकिंग</span>
            </div>
          </div>

          {/* Sync status */}
          {pendingSync && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">⏳</div>
                <div className="ml-3">
                  <p className="text-sm">आपका डेटा अभी सिंक हो रहा है। कुछ समय लग सकता है।</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleFinish}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            मुख्य ऐप शुरू करें 🚀
          </button>
        </div>
      </div>
    );
  }

  return null;
};
