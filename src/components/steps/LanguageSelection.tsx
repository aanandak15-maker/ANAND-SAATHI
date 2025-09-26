/**
 * Language Selection Step
 * First step in the Anand Saathi journey
 * Allows users to select their preferred language (Punjabi, Hindi, English)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  description: string;
}

interface LanguageSelectionProps {
  onComplete: (language: string) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onComplete }) => {
  const { t, setLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages: Language[] = [
    {
      code: 'punjabi',
      name: 'Punjabi',
      native: 'ਪੰਜਾਬੀ',
      flag: '🇮🇳',
      description: 'Punjabi language for Punjab farmers'
    },
    {
      code: 'hindi',
      name: 'Hindi',
      native: 'हिंदी',
      flag: '🇮🇳',
      description: 'Hindi language for Indian farmers'
    },
    {
      code: 'english',
      name: 'English',
      native: 'English',
      flag: '🇺🇸',
      description: 'English language for international users'
    }
  ];

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setLanguage(languageCode);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onComplete(selectedLanguage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Globe className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to Anand Saathi
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your preferred language to get started with your agricultural journey. 
          We support Punjabi, Hindi, and English to serve farmers across India.
        </p>
      </div>

      {/* Language Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {languages.map((language) => (
          <Card 
            key={language.code}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedLanguage === language.code 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleLanguageSelect(language.code)}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{language.flag}</span>
                {selectedLanguage === language.code && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              <CardTitle className="text-xl">{language.name}</CardTitle>
              <CardDescription className="text-lg font-medium">
                {language.native}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                {language.description}
              </p>
              {selectedLanguage === language.code && (
                <Badge variant="default" className="mt-2">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Language Preview */}
      {selectedLanguage && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">
              Language Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedLanguage === 'punjabi' && (
                <div className="text-punjabi">
                  <p className="font-medium">ਅਨੰਦ ਸਾਥੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ!</p>
                  <p className="text-sm">ਤੁਸੀਂ ਆਪਣੇ ਖੇਤ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ।</p>
                </div>
              )}
              {selectedLanguage === 'hindi' && (
                <div className="text-hindi">
                  <p className="font-medium">आनंद साथी में आपका स्वागत है!</p>
                  <p className="text-sm">आप अपने खेत की पूरी जानकारी प्राप्त कर सकते हैं।</p>
                </div>
              )}
              {selectedLanguage === 'english' && (
                <div>
                  <p className="font-medium">Welcome to Anand Saathi!</p>
                  <p className="text-sm">You can get complete information about your field.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedLanguage}
          size="lg"
          className="px-8 py-3"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-800">
              Why Choose Your Language?
            </h3>
            <p className="text-sm text-gray-600">
              Selecting your preferred language ensures that all recommendations, 
              alerts, and information will be provided in your native language, 
              making it easier to understand and implement agricultural advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelection;
