/**
 * Basic Information Step
 * Second step in the Anand Saathi journey
 * Collects essential user information
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface BasicInfoData {
  name: string;
  phone: string;
  email?: string;
  farmSize: number;
  experience: string;
  location?: string;
  additionalInfo?: string;
}

interface BasicInfoProps {
  onComplete: (data: BasicInfoData) => void;
  onPrevious?: () => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ onComplete, onPrevious }) => {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<BasicInfoData>({
    name: '',
    phone: '',
    email: '',
    farmSize: 0,
    experience: '',
    location: '',
    additionalInfo: ''
  });
  const [errors, setErrors] = useState<Partial<BasicInfoData>>({});

  const experienceOptions = [
    { value: 'beginner', label: language === 'punjabi' ? 'ਸ਼ੁਰੂਆਤੀ' : language === 'hindi' ? 'शुरुआती' : 'Beginner' },
    { value: 'intermediate', label: language === 'punjabi' ? 'ਮੱਧਮ' : language === 'hindi' ? 'मध्यम' : 'Intermediate' },
    { value: 'experienced', label: language === 'punjabi' ? 'ਅਨੁਭਵੀ' : language === 'hindi' ? 'अनुभवी' : 'Experienced' },
    { value: 'expert', label: language === 'punjabi' ? 'ਮਾਹਿਰ' : language === 'hindi' ? 'माहिर' : 'Expert' }
  ];

  const farmSizeOptions = [
    { value: 0.5, label: language === 'punjabi' ? '0.5 ਹੈਕਟੇਅਰ' : language === 'hindi' ? '0.5 हेक्टेयर' : '0.5 Hectare' },
    { value: 1, label: language === 'punjabi' ? '1 ਹੈਕਟੇਅਰ' : language === 'hindi' ? '1 हेक्टेयर' : '1 Hectare' },
    { value: 2, label: language === 'punjabi' ? '2 ਹੈਕਟੇਅਰ' : language === 'hindi' ? '2 हेक्टेयर' : '2 Hectares' },
    { value: 5, label: language === 'punjabi' ? '5 ਹੈਕਟੇਅਰ' : language === 'hindi' ? '5 हेक्टेयर' : '5 Hectares' },
    { value: 10, label: language === 'punjabi' ? '10 ਹੈਕਟੇਅਰ' : language === 'hindi' ? '10 हेक्टेयर' : '10 Hectares' },
    { value: 20, label: language === 'punjabi' ? '20+ ਹੈਕਟੇਅਰ' : language === 'hindi' ? '20+ हेक्टेयर' : '20+ Hectares' }
  ];

  const handleInputChange = (field: keyof BasicInfoData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BasicInfoData> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'punjabi' ? 'ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ' : language === 'hindi' ? 'नाम आवश्यक है' : 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = language === 'punjabi' ? 'ਫੋਨ ਨੰਬਰ ਲੋੜੀਂਦਾ ਹੈ' : language === 'hindi' ? 'फोन नंबर आवश्यक है' : 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = language === 'punjabi' ? 'ਵੈਧ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ' : language === 'hindi' ? 'वैध फोन नंबर दर्ज करें' : 'Enter valid phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'punjabi' ? 'ਵੈਧ ਈਮੇਲ ਦਰਜ ਕਰੋ' : language === 'hindi' ? 'वैध ईमेल दर्ज करें' : 'Enter valid email';
    }

    if (!formData.experience) {
      newErrors.experience = language === 'punjabi' ? 'ਅਨੁਭਵ ਚੁਣੋ' : language === 'hindi' ? 'अनुभव चुनें' : 'Select experience level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const getTitle = () => {
    switch (language) {
      case 'punjabi': return 'ਮੂਲ ਜਾਣਕਾਰੀ';
      case 'hindi': return 'मूल जानकारी';
      default: return 'Basic Information';
    }
  };

  const getDescription = () => {
    switch (language) {
      case 'punjabi': return 'ਆਪਣੀ ਜਾਣਕਾਰੀ ਦਰਜ ਕਰੋ ਤਾਂ ਜੋ ਅਸੀਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕੀਏ';
      case 'hindi': return 'अपनी जानकारी दर्ज करें ताकि हम आपकी मदद कर सकें';
      default: return 'Enter your information so we can help you better';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <User className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            {getTitle()}
          </h2>
        </div>
        <p className="text-gray-600">
          {getDescription()}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'punjabi' ? 'ਫਾਰਮ ਭਰੋ' : language === 'hindi' ? 'फॉर्म भरें' : 'Fill the Form'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {language === 'punjabi' ? 'ਨਾਮ *' : language === 'hindi' ? 'नाम *' : 'Name *'}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={language === 'punjabi' ? 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ' : language === 'hindi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              {language === 'punjabi' ? 'ਫੋਨ ਨੰਬਰ *' : language === 'hindi' ? 'फोन नंबर *' : 'Phone Number *'}
            </Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={language === 'punjabi' ? '9876543210' : language === 'hindi' ? '9876543210' : '9876543210'}
                className={errors.phone ? 'border-red-500' : ''}
                type="tel"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {language === 'punjabi' ? 'ਈਮੇਲ (ਵਿਕਲਪਿਕ)' : language === 'hindi' ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
            </Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={language === 'punjabi' ? 'example@email.com' : language === 'hindi' ? 'example@email.com' : 'example@email.com'}
                className={errors.email ? 'border-red-500' : ''}
                type="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Farm Size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'punjabi' ? 'ਖੇਤ ਦਾ ਆਕਾਰ' : language === 'hindi' ? 'खेत का आकार' : 'Farm Size'}
            </Label>
            <Select value={formData.farmSize.toString()} onValueChange={(value) => handleInputChange('farmSize', parseFloat(value))}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'punjabi' ? 'ਆਕਾਰ ਚੁਣੋ' : language === 'hindi' ? 'आकार चुनें' : 'Select size'} />
              </SelectTrigger>
              <SelectContent>
                {farmSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'punjabi' ? 'ਕਾਸ਼ਤ ਦਾ ਅਨੁਭਵ *' : language === 'hindi' ? 'खेती का अनुभव *' : 'Farming Experience *'}
            </Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
              <SelectTrigger className={errors.experience ? 'border-red-500' : ''}>
                <SelectValue placeholder={language === 'punjabi' ? 'ਅਨੁਭਵ ਚੁਣੋ' : language === 'hindi' ? 'अनुभव चुनें' : 'Select experience'} />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.experience && (
              <p className="text-sm text-red-500">{errors.experience}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              {language === 'punjabi' ? 'ਸਥਾਨ (ਵਿਕਲਪਿਕ)' : language === 'hindi' ? 'स्थान (वैकल्पिक)' : 'Location (Optional)'}
            </Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={language === 'punjabi' ? 'ਗ੍ਰਾਮ, ਜ਼ਿਲ੍ਹਾ, ਰਾਜ' : language === 'hindi' ? 'गांव, जिला, राज्य' : 'Village, District, State'}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-sm font-medium">
              {language === 'punjabi' ? 'ਵਾਧੂ ਜਾਣਕਾਰੀ' : language === 'hindi' ? 'अतिरिक्त जानकारी' : 'Additional Information'}
            </Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder={language === 'punjabi' ? 'ਕੋਈ ਵਾਧੂ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰੋ' : language === 'hindi' ? 'कोई अतिरिक्त जानकारी साझा करें' : 'Share any additional information'}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'punjabi' ? 'ਪਿਛਲਾ' : language === 'hindi' ? 'पिछला' : 'Previous'}
          </Button>
        )}
        <Button onClick={handleSubmit} className="ml-auto">
          {language === 'punjabi' ? 'ਜਾਰੀ ਰੱਖੋ' : language === 'hindi' ? 'जारी रखें' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-blue-800">
              {language === 'punjabi' ? 'ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਹੈ' : language === 'hindi' ? 'जानकारी सुरक्षित है' : 'Your Information is Secure'}
            </h3>
            <p className="text-sm text-blue-600">
              {language === 'punjabi' 
                ? 'ਤੁਹਾਡੀ ਸਾਰੀ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਅਤੇ ਨਿੱਜੀ ਰੱਖੀ ਜਾਂਦੀ ਹੈ।' 
                : language === 'hindi' 
                ? 'आपकी सारी जानकारी सुरक्षित और निजी रखी जाती है।' 
                : 'All your information is kept secure and private.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfo;
