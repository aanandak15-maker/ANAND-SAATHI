/**
 * Anand Saathi Multi-Language Support
 * Comprehensive i18n system for Punjabi, Hindi, and English
 */

import React from 'react';

export type Language = 'punjabi' | 'hindi' | 'english';

export interface TranslationKeys {
  // Navigation
  navigation: {
    dashboard: string;
    fieldMapping: string;
    governmentServices: string;
    aiForecasting: string;
    alerts: string;
    settings: string;
    profile: string;
  };
  
  // Field Mapping
  fieldMapping: {
    title: string;
    gpsWalk: string;
    satellitePin: string;
    estimatedArea: string;
    walkBoundary: string;
    pinOnMap: string;
    areaCalculation: string;
    saveField: string;
    fieldName: string;
    cropType: string;
    soilType: string;
    accuracy: string;
    method: string;
    gpsAccuracy: string;
    satelliteAccuracy: string;
    estimatedAccuracy: string;
  };
  
  // Government Services
  government: {
    title: string;
    pmKisan: string;
    schemes: string;
    advisories: string;
    pestAlerts: string;
    eligibility: string;
    benefits: string;
    applicationDeadline: string;
    contactInfo: string;
    applyNow: string;
    loading: string;
    viewDetails: string;
    department: string;
    status: string;
    active: string;
    upcoming: string;
    closed: string;
  };
  
  // AI Forecasting
  
  // Alerts
  alerts: {
    title: string;
    activeAlerts: string;
    newAlert: string;
    alertType: string;
    severity: string;
    high: string;
    medium: string;
    low: string;
    critical: string;
    actionRequired: string;
    dismiss: string;
    markAsRead: string;
  };
  
      // Dashboard
      dashboard: {
        totalFields: string;
        totalArea: string;
        governmentSchemes: string;
        aiForecasts: string;
        yourFields: string;
        fieldsDescription: string;
        noFields: string;
        addFirstField: string;
        recentActivity: string;
        activityDescription: string;
        quickActions: string;
        quickActionsDescription: string;
        addField: string;
        viewSchemes: string;
        generateForecast: string;
        noFieldsDescription: string;
        noFieldsForAI: string;
        noFieldsForAIDescription: string;
        forecast: string;
        analytics: string;
        aiForecastingDescription: string;
        viewForecast: string;
        viewAllFields: string;
      };
      
  // Health Assessment
  healthAssessment: {
    fieldRequired: string;
    reportError: string;
  };

  // AI Forecasting
  aiForecasting: {
        title: string;
        subtitle: string;
        yieldForecast: string;
        weatherForecast: string;
        marketForecast: string;
        comprehensiveAnalysis: string;
        generateCompleteAnalysis: string;
        yieldForecastDescription: string;
        noYieldForecast: string;
        generateYieldForecast: string;
        weatherForecastDescription: string;
        noWeatherForecast: string;
        generateWeatherForecast: string;
        marketForecastDescription: string;
        noMarketForecast: string;
        generateMarketForecast: string;
        yieldForecastComplete: string;
        analysisComplete: string;
        locationRequired: string;
        yieldForecastError: string;
        weatherForecastError: string;
        marketForecastError: string;
        analysisError: string;
        avgTemperature: string;
        predictedPrice: string;
        overallConfidence: string;
        confidence: string;
        maxTemp: string;
        minTemp: string;
        avgPrice: string;
        priceRange: string;
        increasing: string;
        decreasing: string;
        stable: string;
        rising: string;
        falling: string;
        warming: string;
        cooling: string;
        predictedYield: string;
        model: string;
      };
  
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    add: string;
    remove: string;
    search: string;
    filter: string;
    sort: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    confirm: string;
    area: string;
    location: string;
    date: string;
    time: string;
    status: string;
    type: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    loadingError: string;
  };
  
  // Units
  units: {
    acres: string;
    hectares: string;
    tons: string;
    kilograms: string;
    meters: string;
    kilometers: string;
    celsius: string;
    fahrenheit: string;
    percent: string;
    rupees: string;
    dollars: string;
  };
}

// Translation data
const translations: Record<Language, TranslationKeys> = {
  punjabi: {
    navigation: {
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      fieldMapping: 'ਖੇਤ ਮੈਪਿੰਗ',
      governmentServices: 'ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ',
      aiForecasting: 'ਏਆਈ ਭਵਿੱਖਬਾਣੀ',
      alerts: 'ਚੇਤਾਵਨੀਆਂ',
      settings: 'ਸੈਟਿੰਗਜ਼',
      profile: 'ਪ੍ਰੋਫਾਈਲ'
    },
    fieldMapping: {
      title: 'ਖੇਤ ਮੈਪਿੰਗ',
      gpsWalk: 'ਜੀਪੀਐਸ ਚੱਲੋ',
      satellitePin: 'ਸੈਟੇਲਾਈਟ ਪਿੰਨ',
      estimatedArea: 'ਅਨੁਮਾਨਿਤ ਖੇਤਰ',
      walkBoundary: 'ਸੀਮਾ ਤੇ ਚੱਲੋ',
      pinOnMap: 'ਨਕਸ਼ੇ ਤੇ ਪਿੰਨ ਕਰੋ',
      areaCalculation: 'ਖੇਤਰ ਦੀ ਗਣਨਾ',
      saveField: 'ਖੇਤ ਸੇਵ ਕਰੋ',
      fieldName: 'ਖੇਤ ਦਾ ਨਾਮ',
      cropType: 'ਫਸਲ ਦੀ ਕਿਸਮ',
      soilType: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
      accuracy: 'ਸ਼ੁੱਧਤਾ',
      method: 'ਵਿਧੀ',
      gpsAccuracy: '±3-13 ਮੀਟਰ',
      satelliteAccuracy: '±5-15 ਮੀਟਰ',
      estimatedAccuracy: '±20-50 ਮੀਟਰ'
    },
    government: {
      title: 'ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ',
      pmKisan: 'ਪੀਐਮ ਕਿਸਾਨ',
      schemes: 'ਯੋਜਨਾਵਾਂ',
      advisories: 'ਸਲਾਹ',
      pestAlerts: 'ਕੀਟ ਚੇਤਾਵਨੀਆਂ',
      eligibility: 'ਯੋਗਤਾ',
      benefits: 'ਫਾਇਦੇ',
      applicationDeadline: 'ਅਰਜ਼ੀ ਦੀ ਆਖਰੀ ਤਾਰੀਖ',
      contactInfo: 'ਸੰਪਰਕ ਜਾਣਕਾਰੀ',
      applyNow: 'ਹੁਣੇ ਅਰਜ਼ੀ ਦੇਓ',
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      viewDetails: 'ਵੇਰਵੇ ਦੇਖੋ',
      department: 'ਵਿਭਾਗ',
      status: 'ਸਥਿਤੀ',
      active: 'ਸਰਗਰਮ',
      upcoming: 'ਆਉਣ ਵਾਲਾ',
      closed: 'ਬੰਦ'
    },
    alerts: {
      title: 'ਚੇਤਾਵਨੀਆਂ',
      activeAlerts: 'ਸਰਗਰਮ ਚੇਤਾਵਨੀਆਂ',
      newAlert: 'ਨਵੀਂ ਚੇਤਾਵਨੀ',
      alertType: 'ਚੇਤਾਵਨੀ ਦੀ ਕਿਸਮ',
      severity: 'ਗੰਭੀਰਤਾ',
      high: 'ਉੱਚ',
      medium: 'ਮੱਧਮ',
      low: 'ਘੱਟ',
      critical: 'ਨਾਜ਼ੁਕ',
      actionRequired: 'ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ',
      dismiss: 'ਖਾਰਜ ਕਰੋ',
      markAsRead: 'ਪੜ੍ਹਿਆ ਗਿਆ ਮਾਰਕ ਕਰੋ'
    },
    dashboard: {
      totalFields: 'ਕੁੱਲ ਖੇਤ',
      totalArea: 'ਕੁੱਲ ਖੇਤਰ',
      governmentSchemes: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
      aiForecasts: 'ਏਆਈ ਭਵਿੱਖਬਾਣੀਆਂ',
      yourFields: 'ਤੁਹਾਡੇ ਖੇਤ',
      fieldsDescription: 'ਆਪਣੇ ਖੇਤਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ ਅਤੇ ਉਨ੍ਹਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ',
      noFields: 'ਕੋਈ ਖੇਤ ਨਹੀਂ',
      addFirstField: 'ਪਹਿਲਾ ਖੇਤ ਜੋੜੋ',
      recentActivity: 'ਤਾਜ਼ੀ ਗਤੀਵਿਧੀ',
      activityDescription: 'ਤੁਹਾਡੀਆਂ ਤਾਜ਼ੀਆਂ ਗਤੀਵਿਧੀਆਂ ਅਤੇ ਅਪਡੇਟਸ',
      quickActions: 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ',
      quickActionsDescription: 'ਆਮ ਕੰਮਾਂ ਲਈ ਤੇਜ਼ ਪਹੁੰਚ',
      addField: 'ਖੇਤ ਜੋੜੋ',
      viewSchemes: 'ਯੋਜਨਾਵਾਂ ਦੇਖੋ',
      generateForecast: 'ਭਵਿੱਖਬਾਣੀ ਬਣਾਓ',
      noFieldsDescription: 'ਆਪਣੇ ਪਹਿਲੇ ਖੇਤ ਨੂੰ ਜੋੜ ਕੇ ਸ਼ੁਰੂਆਤ ਕਰੋ',
      noFieldsForAI: 'ਏਆਈ ਭਵਿੱਖਬਾਣੀ ਲਈ ਕੋਈ ਖੇਤ ਨਹੀਂ',
      noFieldsForAIDescription: 'ਭਵਿੱਖਬਾਣੀ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਪਹਿਲਾਂ ਖੇਤ ਜੋੜੋ',
      forecast: 'ਭਵਿੱਖਬਾਣੀ',
      analytics: 'ਵਿਸ਼ਲੇਸ਼ਣ',
      aiForecastingDescription: 'ਏਆਈ ਦੁਆਰਾ ਉੱਨਤ ਭਵਿੱਖਬਾਣੀ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ',
      viewForecast: 'ਭਵਿੱਖਬਾਣੀ ਦੇਖੋ',
      viewAllFields: 'ਸਾਰੇ ਖੇਤ ਦੇਖੋ'
    },
    healthAssessment: {
      fieldRequired: 'ਖੇਤ ਚੁਣਨਾ ਲੋੜੀਂਦਾ ਹੈ',
      reportError: 'ਸਿਹਤ ਰਿਪੋਰਟ ਵਿੱਚ ਗਲਤੀ'
    },
    aiForecasting: {
      title: 'ਏਆਈ ਭਵਿੱਖਬਾਣੀ',
      subtitle: 'ਟਾਈਮਜ਼ਐਫਐਮ ਦੁਆਰਾ ਉੱਨਤ ਭਵਿੱਖਬਾਣੀ',
      yieldForecast: 'ਪੈਦਾਵਾਰ ਭਵਿੱਖਬਾਣੀ',
      weatherForecast: 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ',
      marketForecast: 'ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ',
      comprehensiveAnalysis: 'ਵਿਆਪਕ ਵਿਸ਼ਲੇਸ਼ਣ',
      generateCompleteAnalysis: 'ਸੰਪੂਰਨ ਵਿਸ਼ਲੇਸ਼ਣ ਬਣਾਓ',
      yieldForecastDescription: 'ਫਸਲ ਦੀ ਉਪਜ ਦੀ ਭਵਿੱਖਬਾਣੀ',
      noYieldForecast: 'ਕੋਈ ਉਪਜ ਭਵਿੱਖਬਾਣੀ ਨਹੀਂ',
      generateYieldForecast: 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ ਬਣਾਓ',
      weatherForecastDescription: 'ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ',
      noWeatherForecast: 'ਕੋਈ ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ ਨਹੀਂ',
      generateWeatherForecast: 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ ਬਣਾਓ',
      marketForecastDescription: 'ਬਾਜ਼ਾਰ ਦੀ ਭਵਿੱਖਬਾਣੀ',
      noMarketForecast: 'ਕੋਈ ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ ਨਹੀਂ',
      generateMarketForecast: 'ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ ਬਣਾਓ',
      yieldForecastComplete: 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ ਪੂਰੀ ਹੋ ਗਈ',
      analysisComplete: 'ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋ ਗਿਆ',
      locationRequired: 'ਸਥਾਨ ਲੋੜੀਂਦਾ ਹੈ',
      yieldForecastError: 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ ਵਿੱਚ ਗਲਤੀ',
      weatherForecastError: 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ ਵਿੱਚ ਗਲਤੀ',
      marketForecastError: 'ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ ਵਿੱਚ ਗਲਤੀ',
      analysisError: 'ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਗਲਤੀ',
      avgTemperature: 'ਔਸਤ ਤਾਪਮਾਨ',
      predictedPrice: 'ਭਵਿੱਖਬਾਣੀ ਮੁੱਲ',
      overallConfidence: 'ਕੁੱਲ ਭਰੋਸਾ',
      confidence: 'ਭਰੋਸਾ',
      maxTemp: 'ਵੱਧ ਤੋਂ ਵੱਧ ਤਾਪਮਾਨ',
      minTemp: 'ਘੱਟ ਤੋਂ ਘੱਟ ਤਾਪਮਾਨ',
      avgPrice: 'ਔਸਤ ਮੁੱਲ',
      priceRange: 'ਮੁੱਲ ਦੀ ਸੀਮਾ',
      increasing: 'ਵਧ ਰਿਹਾ',
      decreasing: 'ਘਟ ਰਿਹਾ',
      stable: 'ਸਥਿਰ',
      rising: 'ਚੜ੍ਹ ਰਿਹਾ',
      falling: 'ਡਿੱਗ ਰਿਹਾ',
      warming: 'ਗਰਮ ਹੋ ਰਿਹਾ',
      cooling: 'ਠੰਡਾ ਹੋ ਰਿਹਾ',
      predictedYield: 'ਭਵਿੱਖਬਾਣੀ ਉਪਜ',
      model: 'ਮਾਡਲ'
    },
    common: {
      save: 'ਸੇਵ ਕਰੋ',
      cancel: 'ਰੱਦ ਕਰੋ',
      delete: 'ਮਿਟਾਓ',
      edit: 'ਸੰਪਾਦਨ ਕਰੋ',
      view: 'ਦੇਖੋ',
      add: 'ਜੋੜੋ',
      remove: 'ਹਟਾਓ',
      search: 'ਖੋਜੋ',
      filter: 'ਫਿਲਟਰ',
      sort: 'ਸੌਰਟ',
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ',
      error: 'ਗਲਤੀ',
      success: 'ਸਫਲਤਾ',
      warning: 'ਚੇਤਾਵਨੀ',
      info: 'ਜਾਣਕਾਰੀ',
      yes: 'ਹਾਂ',
      no: 'ਨਹੀਂ',
      ok: 'ਠੀਕ ਹੈ',
      close: 'ਬੰਦ ਕਰੋ',
      back: 'ਵਾਪਸ',
      next: 'ਅਗਲਾ',
      previous: 'ਪਿਛਲਾ',
      submit: 'ਜਮ੍ਹਾ ਕਰੋ',
      reset: 'ਰੀਸੈਟ',
      confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
      area: 'ਖੇਤਰ',
      location: 'ਟਿਕਾਣਾ',
      date: 'ਤਾਰੀਖ',
      time: 'ਸਮਾਂ',
      status: 'ਸਥਿਤੀ',
      type: 'ਕਿਸਮ',
      name: 'ਨਾਮ',
      description: 'ਵਰਣਨ',
      phone: 'ਫੋਨ',
      email: 'ਈਮੇਲ',
      website: 'ਵੈਬਸਾਈਟ',
      loadingError: 'ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ'
    },
    units: {
      acres: 'ਏਕੜ',
      hectares: 'ਹੈਕਟੇਅਰ',
      tons: 'ਟਨ',
      kilograms: 'ਕਿਲੋਗ੍ਰਾਮ',
      meters: 'ਮੀਟਰ',
      kilometers: 'ਕਿਲੋਮੀਟਰ',
      celsius: 'ਸੈਲਸੀਅਸ',
      fahrenheit: 'ਫਾਰਨਹੀਟ',
      percent: 'ਪ੍ਰਤੀਸ਼ਤ',
      rupees: 'ਰੁਪਏ',
      dollars: 'ਡਾਲਰ'
    }
  },
  
  hindi: {
    navigation: {
      dashboard: 'डैशबोर्ड',
      fieldMapping: 'खेत मैपिंग',
      governmentServices: 'सरकारी सेवाएं',
      aiForecasting: 'एआई पूर्वानुमान',
      alerts: 'अलर्ट',
      settings: 'सेटिंग्स',
      profile: 'प्रोफाइल'
    },
    fieldMapping: {
      title: 'खेत मैपिंग',
      gpsWalk: 'जीपीएस चलें',
      satellitePin: 'सैटेलाइट पिन',
      estimatedArea: 'अनुमानित क्षेत्र',
      walkBoundary: 'सीमा पर चलें',
      pinOnMap: 'नक्शे पर पिन करें',
      areaCalculation: 'क्षेत्र की गणना',
      saveField: 'खेत सेव करें',
      fieldName: 'खेत का नाम',
      cropType: 'फसल का प्रकार',
      soilType: 'मिट्टी का प्रकार',
      accuracy: 'सटीकता',
      method: 'विधि',
      gpsAccuracy: '±3-13 मीटर',
      satelliteAccuracy: '±5-15 मीटर',
      estimatedAccuracy: '±20-50 मीटर'
    },
    government: {
      title: 'सरकारी सेवाएं',
      pmKisan: 'पीएम किसान',
      schemes: 'योजनाएं',
      advisories: 'सलाह',
      pestAlerts: 'कीट अलर्ट',
      eligibility: 'पात्रता',
      benefits: 'लाभ',
      applicationDeadline: 'आवेदन की अंतिम तिथि',
      contactInfo: 'संपर्क जानकारी',
      applyNow: 'अभी आवेदन करें',
      loading: 'लोड हो रहा है...',
      viewDetails: 'विवरण देखें',
      department: 'विभाग',
      status: 'स्थिति',
      active: 'सक्रिय',
      upcoming: 'आगामी',
      closed: 'बंद'
    },
    alerts: {
      title: 'अलर्ट',
      activeAlerts: 'सक्रिय अलर्ट',
      newAlert: 'नया अलर्ट',
      alertType: 'अलर्ट प्रकार',
      severity: 'गंभीरता',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
      critical: 'महत्वपूर्ण',
      actionRequired: 'कार्रवाई आवश्यक',
      dismiss: 'खारिज करें',
      markAsRead: 'पढ़ा गया मार्क करें'
    },
    dashboard: {
      totalFields: 'कुल खेत',
      totalArea: 'कुल क्षेत्र',
      governmentSchemes: 'सरकारी योजनाएं',
      aiForecasts: 'एआई पूर्वानुमान',
      yourFields: 'आपके खेत',
      fieldsDescription: 'अपने खेतों का प्रबंधन करें और उनकी निगरानी करें',
      noFields: 'कोई खेत नहीं',
      addFirstField: 'पहला खेत जोड़ें',
      recentActivity: 'हाल की गतिविधि',
      activityDescription: 'आपकी हाल की गतिविधियां और अपडेट्स',
      quickActions: 'त्वरित कार्य',
      quickActionsDescription: 'सामान्य कार्यों के लिए त्वरित पहुंच',
      addField: 'खेत जोड़ें',
      viewSchemes: 'योजनाएं देखें',
      generateForecast: 'पूर्वानुमान बनाएं',
      noFieldsDescription: 'अपने पहले खेत को जोड़कर शुरुआत करें',
      noFieldsForAI: 'एआई पूर्वानुमान के लिए कोई खेत नहीं',
      noFieldsForAIDescription: 'पूर्वानुमान प्राप्त करने के लिए पहले खेत जोड़ें',
      forecast: 'पूर्वानुमान',
      analytics: 'विश्लेषण',
      aiForecastingDescription: 'एआई द्वारा उन्नत पूर्वानुमान और विश्लेषण',
      viewForecast: 'पूर्वानुमान देखें',
      viewAllFields: 'सभी खेत देखें'
    },
    healthAssessment: {
      fieldRequired: 'खेत चुनना आवश्यक है',
      reportError: 'स्वास्थ्य रिपोर्ट में त्रुटि'
    },
    aiForecasting: {
      title: 'एआई पूर्वानुमान',
      subtitle: 'टाइम्सएफएम द्वारा उन्नत पूर्वानुमान',
      yieldForecast: 'उपज पूर्वानुमान',
      weatherForecast: 'मौसम पूर्वानुमान',
      marketForecast: 'बाजार पूर्वानुमान',
      comprehensiveAnalysis: 'व्यापक विश्लेषण',
      generateCompleteAnalysis: 'संपूर्ण विश्लेषण बनाएं',
      yieldForecastDescription: 'फसल उत्पादन का पूर्वानुमान',
      noYieldForecast: 'कोई उत्पादन पूर्वानुमान नहीं',
      generateYieldForecast: 'उत्पादन पूर्वानुमान बनाएं',
      weatherForecastDescription: 'मौसम का पूर्वानुमान',
      noWeatherForecast: 'कोई मौसम पूर्वानुमान नहीं',
      generateWeatherForecast: 'मौसम पूर्वानुमान बनाएं',
      marketForecastDescription: 'बाजार का पूर्वानुमान',
      noMarketForecast: 'कोई बाजार पूर्वानुमान नहीं',
      generateMarketForecast: 'बाजार पूर्वानुमान बनाएं',
      yieldForecastComplete: 'उत्पादन पूर्वानुमान पूरा हो गया',
      analysisComplete: 'विश्लेषण पूरा हो गया',
      locationRequired: 'स्थान आवश्यक है',
      yieldForecastError: 'उत्पादन पूर्वानुमान में त्रुटि',
      weatherForecastError: 'मौसम पूर्वानुमान में त्रुटि',
      marketForecastError: 'बाजार पूर्वानुमान में त्रुटि',
      analysisError: 'विश्लेषण में त्रुटि',
      avgTemperature: 'औसत तापमान',
      predictedPrice: 'पूर्वानुमानित मूल्य',
      overallConfidence: 'कुल आत्मविश्वास',
      confidence: 'आत्मविश्वास',
      maxTemp: 'अधिकतम तापमान',
      minTemp: 'न्यूनतम तापमान',
      avgPrice: 'औसत मूल्य',
      priceRange: 'मूल्य सीमा',
      increasing: 'बढ़ रहा',
      decreasing: 'घट रहा',
      stable: 'स्थिर',
      rising: 'बढ़ रहा',
      falling: 'गिर रहा',
      warming: 'गर्म हो रहा',
      cooling: 'ठंडा हो रहा',
      predictedYield: 'पूर्वानुमानित उपज',
      model: 'मॉडल'
    },
    common: {
      save: 'सेव करें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      add: 'जोड़ें',
      remove: 'हटाएं',
      search: 'खोजें',
      filter: 'फिल्टर',
      sort: 'सॉर्ट',
      loading: 'लोड हो रहा है',
      error: 'त्रुटि',
      success: 'सफलता',
      warning: 'चेतावनी',
      info: 'जानकारी',
      yes: 'हां',
      no: 'नहीं',
      ok: 'ठीक है',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      reset: 'रीसेट',
      confirm: 'पुष्टि करें',
      area: 'क्षेत्र',
      location: 'स्थान',
      date: 'तारीख',
      time: 'समय',
      status: 'स्थिति',
      type: 'प्रकार',
      name: 'नाम',
      description: 'विवरण',
      phone: 'फोन',
      email: 'ईमेल',
      website: 'वेबसाइट',
      loadingError: 'लोड करने में त्रुटि'
    },
    units: {
      acres: 'एकड़',
      hectares: 'हेक्टेयर',
      tons: 'टन',
      kilograms: 'किलोग्राम',
      meters: 'मीटर',
      kilometers: 'किलोमीटर',
      celsius: 'सेल्सियस',
      fahrenheit: 'फारेनहाइट',
      percent: 'प्रतिशत',
      rupees: 'रुपए',
      dollars: 'डॉलर'
    }
  },
  
  english: {
    navigation: {
      dashboard: 'Dashboard',
      fieldMapping: 'Field Mapping',
      governmentServices: 'Government Services',
      aiForecasting: 'AI Forecasting',
      alerts: 'Alerts',
      settings: 'Settings',
      profile: 'Profile'
    },
    fieldMapping: {
      title: 'Field Mapping',
      gpsWalk: 'GPS Walk',
      satellitePin: 'Satellite Pin',
      estimatedArea: 'Estimated Area',
      walkBoundary: 'Walk the Boundary',
      pinOnMap: 'Pin on Map',
      areaCalculation: 'Area Calculation',
      saveField: 'Save Field',
      fieldName: 'Field Name',
      cropType: 'Crop Type',
      soilType: 'Soil Type',
      accuracy: 'Accuracy',
      method: 'Method',
      gpsAccuracy: '±3-13 meters',
      satelliteAccuracy: '±5-15 meters',
      estimatedAccuracy: '±20-50 meters'
    },
    government: {
      title: 'Government Services',
      pmKisan: 'PM Kisan',
      schemes: 'Schemes',
      advisories: 'Advisories',
      pestAlerts: 'Pest Alerts',
      eligibility: 'Eligibility',
      benefits: 'Benefits',
      applicationDeadline: 'Application Deadline',
      contactInfo: 'Contact Information',
      applyNow: 'Apply Now',
      loading: 'Loading...',
      viewDetails: 'View Details',
      department: 'Department',
      status: 'Status',
      active: 'Active',
      upcoming: 'Upcoming',
      closed: 'Closed'
    },
    alerts: {
      title: 'Alerts',
      activeAlerts: 'Active Alerts',
      newAlert: 'New Alert',
      alertType: 'Alert Type',
      severity: 'Severity',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      critical: 'Critical',
      actionRequired: 'Action Required',
      dismiss: 'Dismiss',
      markAsRead: 'Mark as Read'
    },
    dashboard: {
      totalFields: 'Total Fields',
      totalArea: 'Total Area',
      governmentSchemes: 'Government Schemes',
      aiForecasts: 'AI Forecasts',
      yourFields: 'Your Fields',
      fieldsDescription: 'Manage and monitor your fields',
      noFields: 'No Fields',
      addFirstField: 'Add First Field',
      recentActivity: 'Recent Activity',
      activityDescription: 'Your recent activities and updates',
      quickActions: 'Quick Actions',
      quickActionsDescription: 'Quick access to common tasks',
      addField: 'Add Field',
      viewSchemes: 'View Schemes',
      generateForecast: 'Generate Forecast',
      noFieldsDescription: 'Start by adding your first field',
      noFieldsForAI: 'No Fields for AI Forecasting',
      noFieldsForAIDescription: 'Add fields first to get forecasts',
      forecast: 'Forecast',
      analytics: 'Analytics',
      aiForecastingDescription: 'Advanced forecasting and analytics powered by AI',
      viewForecast: 'View Forecast',
      viewAllFields: 'View All Fields'
    },
    healthAssessment: {
      fieldRequired: 'Field selection required',
      reportError: 'Health report error'
    },
    aiForecasting: {
      title: 'AI Forecasting',
      subtitle: 'Advanced forecasting powered by TimesFM',
      yieldForecast: 'Yield Forecast',
      weatherForecast: 'Weather Forecast',
      marketForecast: 'Market Forecast',
      comprehensiveAnalysis: 'Comprehensive Analysis',
      generateCompleteAnalysis: 'Generate Complete Analysis',
      yieldForecastDescription: 'Crop yield forecasting',
      noYieldForecast: 'No yield forecast available',
      generateYieldForecast: 'Generate Yield Forecast',
      weatherForecastDescription: 'Weather forecasting',
      noWeatherForecast: 'No weather forecast available',
      generateWeatherForecast: 'Generate Weather Forecast',
      marketForecastDescription: 'Market forecasting',
      noMarketForecast: 'No market forecast available',
      generateMarketForecast: 'Generate Market Forecast',
      yieldForecastComplete: 'Yield forecast completed',
      analysisComplete: 'Analysis completed',
      locationRequired: 'Location required',
      yieldForecastError: 'Yield forecast error',
      weatherForecastError: 'Weather forecast error',
      marketForecastError: 'Market forecast error',
      analysisError: 'Analysis error',
      avgTemperature: 'Average Temperature',
      predictedPrice: 'Predicted Price',
      overallConfidence: 'Overall Confidence',
      confidence: 'Confidence',
      maxTemp: 'Maximum Temperature',
      minTemp: 'Minimum Temperature',
      avgPrice: 'Average Price',
      priceRange: 'Price Range',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      stable: 'Stable',
      rising: 'Rising',
      falling: 'Falling',
      warming: 'Warming',
      cooling: 'Cooling',
      predictedYield: 'Predicted Yield',
      model: 'Model'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',
      remove: 'Remove',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      confirm: 'Confirm',
      area: 'Area',
      location: 'Location',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      type: 'Type',
      name: 'Name',
      description: 'Description',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      loadingError: 'Loading Error'
    },
    units: {
      acres: 'acres',
      hectares: 'hectares',
      tons: 'tons',
      kilograms: 'kg',
      meters: 'm',
      kilometers: 'km',
      celsius: '°C',
      fahrenheit: '°F',
      percent: '%',
      rupees: '₹',
      dollars: '$'
    }
  }
};

// Language context and hooks
export class LanguageService {
  private currentLanguage: Language = 'english';
  private listeners: Array<(language: Language) => void> = [];

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('anand-saathi-language') as Language;
    if (savedLanguage && this.isValidLanguage(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    }
  }

  private isValidLanguage(language: string): language is Language {
    return ['punjabi', 'hindi', 'english'].includes(language);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    if (this.isValidLanguage(language)) {
      this.currentLanguage = language;
      localStorage.setItem('anand-saathi-language', language);
      this.notifyListeners();
    }
  }

  subscribe(listener: (language: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  getTranslations(): TranslationKeys {
    return translations[this.currentLanguage];
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.getTranslations();
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Utility methods for common translations
  getCommonTranslations() {
    return this.getTranslations().common;
  }

  getNavigationTranslations() {
    return this.getTranslations().navigation;
  }

  getFieldMappingTranslations() {
    return this.getTranslations().fieldMapping;
  }

  getGovernmentTranslations() {
    return this.getTranslations().government;
  }

  getAIForecastingTranslations() {
    return this.getTranslations().aiForecasting;
  }

  getAlertsTranslations() {
    return this.getTranslations().alerts;
  }

  getUnitsTranslations() {
    return this.getTranslations().units;
  }

  getDashboardTranslations() {
    return this.getTranslations().dashboard;
  }
}

// Export singleton instance
export const languageService = new LanguageService();

// React hook for using translations
export const useTranslation = () => {
  const [language, setLanguage] = React.useState<Language>(languageService.getCurrentLanguage());
  const [translations, setTranslations] = React.useState<TranslationKeys>(languageService.getTranslations());

  React.useEffect(() => {
    const unsubscribe = languageService.subscribe((newLanguage) => {
      setLanguage(newLanguage);
      setTranslations(languageService.getTranslations());
    });

    return unsubscribe;
  }, []);

  const t = React.useCallback((key: string) => {
    return languageService.t(key);
  }, [language]);

  const changeLanguage = React.useCallback((newLanguage: Language) => {
    languageService.setLanguage(newLanguage);
  }, []);

  return {
    language,
    translations,
    t,
    changeLanguage,
    isPunjabi: language === 'punjabi',
    isHindi: language === 'hindi',
    isEnglish: language === 'english'
  };
};

// Utility functions
export const formatNumber = (num: number, language: Language): string => {
  if (language === 'punjabi' || language === 'hindi') {
    return num.toLocaleString('en-IN');
  }
  return num.toLocaleString('en-US');
};

export const formatCurrency = (amount: number, language: Language, currency: string = 'INR'): string => {
  const formatted = formatNumber(amount, language);
  
  if (currency === 'INR') {
    return `₹${formatted}`;
  }
  return `${currency} ${formatted}`;
};

export const formatDate = (date: Date, language: Language): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (language === 'punjabi') {
    return date.toLocaleDateString('en-IN', options);
  } else if (language === 'hindi') {
    return date.toLocaleDateString('hi-IN', options);
  }
  
  return date.toLocaleDateString('en-US', options);
};

// Language detection utility
export const detectLanguageFromLocale = (locale: string): Language => {
  if (locale.startsWith('pa')) return 'punjabi';
  if (locale.startsWith('hi')) return 'hindi';
  return 'english';
};

// RTL support
export const isRTLLanguage = (language: Language): boolean => {
  return language === 'punjabi' || language === 'hindi';
};

// Font family mapping
export const getFontFamily = (language: Language): string => {
  switch (language) {
    case 'punjabi':
      return "'Noto Sans Gurmukhi', 'Gurbani Akhar', sans-serif";
    case 'hindi':
      return "'Noto Sans Devanagari', 'Mangal', sans-serif";
    default:
      return "'Inter', 'Segoe UI', sans-serif";
  }
};

