// Enhanced Diagnosis System with Multi-language Support
// Provides specific, actionable insights in English, Hindi, and Punjabi

export interface DiagnosisData {
  ndvi: number;
  ndmi: number;
  msavi2: number;
  ndre: number;
  rvi: number;
  cropType: string;
  cropStage: string;
  waterStressLevel: string;
  healthStatus: string;
  qualityScore: number;
  fieldArea: number;
  season: string;
  location?: string;
}

export interface MultiLanguageDiagnosis {
  english: DiagnosisInsight;
  hindi: DiagnosisInsight;
  punjabi: DiagnosisInsight;
}

export interface DiagnosisInsight {
  title: string;
  summary: string;
  detailedAnalysis: string;
  specificRecommendations: string[];
  immediateActions: string[];
  timeline: string;
  economicImpact: string;
  riskAssessment: string;
}

// Generate comprehensive diagnosis in multiple languages
export function generateEnhancedDiagnosis(data: DiagnosisData): MultiLanguageDiagnosis {
  return {
    english: generateEnglishDiagnosis(data),
    hindi: generateHindiDiagnosis(data),
    punjabi: generatePunjabiDiagnosis(data)
  };
}

// English Diagnosis
function generateEnglishDiagnosis(data: DiagnosisData): DiagnosisInsight {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel, healthStatus, fieldArea } = data;
  
  // Determine crop-specific insights
  const cropInsights = getCropSpecificInsights(cropType, cropStage, ndvi, ndmi);
  const seasonInsights = getSeasonalInsights(data.season, cropType);
  const economicInsights = getEconomicInsights(ndvi, fieldArea, cropType);
  
  return {
    title: `${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Field Health Assessment`,
    summary: generateSummary(ndvi, healthStatus, waterStressLevel, cropType),
    detailedAnalysis: generateDetailedAnalysis(data, cropInsights, seasonInsights),
    specificRecommendations: generateSpecificRecommendations(data, cropInsights),
    immediateActions: generateImmediateActions(data, cropInsights),
    timeline: generateTimeline(cropStage, cropType, ndvi),
    economicImpact: economicInsights,
    riskAssessment: generateRiskAssessment(data)
  };
}

// Hindi Diagnosis
function generateHindiDiagnosis(data: DiagnosisData): DiagnosisInsight {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel, healthStatus, fieldArea } = data;
  
  const cropInsights = getCropSpecificInsights(cropType, cropStage, ndvi, ndmi);
  const seasonInsights = getSeasonalInsights(data.season, cropType);
  const economicInsights = getEconomicInsights(ndvi, fieldArea, cropType);
  
  return {
    title: `${getCropNameHindi(cropType)} खेत की स्वास्थ्य जांच`,
    summary: generateSummaryHindi(ndvi, healthStatus, waterStressLevel, cropType),
    detailedAnalysis: generateDetailedAnalysisHindi(data, cropInsights, seasonInsights),
    specificRecommendations: generateSpecificRecommendationsHindi(data, cropInsights),
    immediateActions: generateImmediateActionsHindi(data, cropInsights),
    timeline: generateTimelineHindi(cropStage, cropType, ndvi),
    economicImpact: economicInsights,
    riskAssessment: generateRiskAssessmentHindi(data)
  };
}

// Punjabi Diagnosis
function generatePunjabiDiagnosis(data: DiagnosisData): DiagnosisInsight {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel, healthStatus, fieldArea } = data;
  
  const cropInsights = getCropSpecificInsights(cropType, cropStage, ndvi, ndmi);
  const seasonInsights = getSeasonalInsights(data.season, cropType);
  const economicInsights = getEconomicInsights(ndvi, fieldArea, cropType);
  
  return {
    title: `${getCropNamePunjabi(cropType)} ਖੇਤ ਦੀ ਸਿਹਤ ਜਾਂਚ`,
    summary: generateSummaryPunjabi(ndvi, healthStatus, waterStressLevel, cropType),
    detailedAnalysis: generateDetailedAnalysisPunjabi(data, cropInsights, seasonInsights),
    specificRecommendations: generateSpecificRecommendationsPunjabi(data, cropInsights),
    immediateActions: generateImmediateActionsPunjabi(data, cropInsights),
    timeline: generateTimelinePunjabi(cropStage, cropType, ndvi),
    economicImpact: economicInsights,
    riskAssessment: generateRiskAssessmentPunjabi(data)
  };
}

// Helper functions for English
function generateSummary(ndvi: number, healthStatus: string, waterStressLevel: string, cropType: string): string {
  if (ndvi > 0.8) {
    return `Your ${cropType} field shows excellent health with NDVI of ${ndvi.toFixed(2)}. The crop is thriving with optimal vegetation density and should yield well this season.`;
  } else if (ndvi > 0.6) {
    return `Your ${cropType} field is in good condition with NDVI of ${ndvi.toFixed(2)}. The crop is healthy but could benefit from some targeted improvements.`;
  } else if (ndvi > 0.4) {
    return `Your ${cropType} field shows moderate health with NDVI of ${ndvi.toFixed(2)}. Immediate attention is needed to prevent yield loss.`;
  } else {
    return `Your ${cropType} field requires urgent intervention with NDVI of ${ndvi.toFixed(2)}. The crop is severely stressed and needs immediate care.`;
  }
}

function generateDetailedAnalysis(data: DiagnosisData, cropInsights: any, seasonInsights: any): string {
  const { ndvi, ndmi, msavi2, ndre, rvi, cropType, cropStage, waterStressLevel } = data;
  
  let analysis = `Detailed Analysis for ${cropType} field:\n\n`;
  
  // Vegetation Health
  analysis += `🌱 Vegetation Health (NDVI: ${ndvi.toFixed(2)}): `;
  if (ndvi > 0.8) {
    analysis += `Excellent crop density and chlorophyll content. Your plants are photosynthesizing optimally.\n`;
  } else if (ndvi > 0.6) {
    analysis += `Good vegetation health with room for improvement. Consider nitrogen application.\n`;
  } else if (ndvi > 0.4) {
    analysis += `Moderate stress detected. Check for nutrient deficiencies or pest damage.\n`;
  } else {
    analysis += `Severe vegetation stress. Immediate intervention required.\n`;
  }
  
  // Water Status
  analysis += `💧 Water Status (NDMI: ${ndmi.toFixed(2)}): `;
  if (waterStressLevel === 'none') {
    analysis += `Optimal soil moisture levels maintained.\n`;
  } else if (waterStressLevel === 'mild') {
    analysis += `Slight water stress detected. Monitor irrigation schedule.\n`;
  } else if (waterStressLevel === 'moderate') {
    analysis += `Moderate water stress. Increase irrigation frequency.\n`;
  } else {
    analysis += `Severe water stress. Emergency irrigation needed.\n`;
  }
  
  // Crop Stage Analysis
  analysis += `🌾 Crop Stage (${cropStage}): `;
  analysis += cropInsights.stageAnalysis;
  
  // Seasonal Considerations
  analysis += `\n📅 Seasonal Factors: ${seasonInsights.analysis}`;
  
  return analysis;
}

function generateSpecificRecommendations(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel } = data;
  const recommendations: string[] = [];
  
  // NDVI-based recommendations
  if (ndvi < 0.4) {
    recommendations.push(`🚨 CRITICAL: Apply emergency nitrogen fertilizer (Urea 46-0-0) at 50kg/hectare immediately`);
    recommendations.push(`🔍 Check for pest damage - inspect leaves for holes, spots, or discoloration`);
    recommendations.push(`💧 Increase irrigation to 2-3 times per week until NDVI improves`);
    recommendations.push(`🧪 Test soil pH - should be 6.0-7.5 for ${cropType}`);
  } else if (ndvi < 0.6) {
    recommendations.push(`🌱 Apply balanced NPK fertilizer (20-20-20) at 40kg/hectare within 3 days`);
    recommendations.push(`💧 Increase irrigation frequency by 25%`);
    recommendations.push(`🔍 Monitor for early signs of disease or pest infestation`);
  } else if (ndvi > 0.8) {
    recommendations.push(`✅ Continue current management practices - excellent results`);
    recommendations.push(`📊 Consider precision farming techniques for even better yields`);
    recommendations.push(`🎯 Maintain optimal irrigation schedule`);
  }
  
  // Water stress recommendations
  if (waterStressLevel === 'severe') {
    recommendations.push(`💧 EMERGENCY: Irrigate immediately - 2-3 inches of water needed`);
    recommendations.push(`🔧 Check irrigation system for blockages or leaks`);
    recommendations.push(`⏰ Schedule irrigation every 2 days until stress reduces`);
  } else if (waterStressLevel === 'moderate') {
    recommendations.push(`💧 Increase irrigation by 30% - add 1 extra irrigation per week`);
    recommendations.push(`🌡️ Monitor soil temperature - keep below 25°C`);
  }
  
  // Crop-specific recommendations
  recommendations.push(...cropInsights.recommendations);
  
  return recommendations;
}

function generateImmediateActions(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, waterStressLevel, cropType } = data;
  const actions: string[] = [];
  
  if (ndvi < 0.4) {
    actions.push(`🚨 URGENT: Apply emergency fertilizer within 24 hours`);
    actions.push(`💧 Irrigate immediately with 2-3 inches of water`);
    actions.push(`🔍 Inspect field for pest damage or disease`);
  } else if (waterStressLevel === 'severe') {
    actions.push(`💧 EMERGENCY IRRIGATION: Apply water immediately`);
    actions.push(`🔧 Check irrigation system functionality`);
  } else if (ndvi < 0.6) {
    actions.push(`🌱 Apply fertilizer within 3 days`);
    actions.push(`💧 Adjust irrigation schedule`);
  }
  
  actions.push(`📅 Schedule follow-up analysis in 7 days`);
  actions.push(`📊 Monitor field daily for changes`);
  
  return actions;
}

function generateTimeline(cropStage: string, cropType: string, ndvi: number): string {
  const timelines: { [key: string]: string } = {
    'vegetative': `Vegetative stage: Focus on nitrogen application and pest control. Harvest in 60-90 days.`,
    'reproductive': `Reproductive stage: Critical for yield formation. Ensure adequate water and potassium. Harvest in 30-45 days.`,
    'maturity': `Maturity stage: Prepare for harvest. Reduce irrigation gradually. Harvest in 7-14 days.`
  };
  
  let timeline = timelines[cropStage] || `Monitor crop development and adjust management accordingly.`;
  
  if (ndvi < 0.4) {
    timeline += ` URGENT: Immediate intervention needed to save crop.`;
  }
  
  return timeline;
}

function generateRiskAssessment(data: DiagnosisData): string {
  const { ndvi, waterStressLevel, qualityScore } = data;
  let riskLevel = 'Low';
  let riskFactors: string[] = [];
  
  if (ndvi < 0.4) {
    riskLevel = 'Critical';
    riskFactors.push('Severe vegetation stress');
    riskFactors.push('High yield loss risk (60-80%)');
  } else if (ndvi < 0.6) {
    riskLevel = 'High';
    riskFactors.push('Moderate vegetation stress');
    riskFactors.push('Yield loss risk (20-40%)');
  }
  
  if (waterStressLevel === 'severe') {
    riskLevel = 'Critical';
    riskFactors.push('Severe water stress');
  }
  
  if (qualityScore < 0.7) {
    riskFactors.push('Low analysis confidence');
  }
  
  return `Risk Level: ${riskLevel}. Factors: ${riskFactors.join(', ')}`;
}

// Helper functions for Hindi
function generateSummaryHindi(ndvi: number, healthStatus: string, waterStressLevel: string, cropType: string): string {
  const cropName = getCropNameHindi(cropType);
  
  if (ndvi > 0.8) {
    return `आपके ${cropName} खेत में उत्कृष्ट स्वास्थ्य दिख रहा है (NDVI: ${ndvi.toFixed(2)})। फसल बहुत अच्छी स्थिति में है और इस सीजन में अच्छी पैदावार होगी।`;
  } else if (ndvi > 0.6) {
    return `आपके ${cropName} खेत की स्थिति अच्छी है (NDVI: ${ndvi.toFixed(2)})। फसल स्वस्थ है लेकिन कुछ सुधार की जरूरत है।`;
  } else if (ndvi > 0.4) {
    return `आपके ${cropName} खेत में मध्यम स्वास्थ्य दिख रहा है (NDVI: ${ndvi.toFixed(2)})। पैदावार की हानि रोकने के लिए तुरंत ध्यान देने की जरूरत है।`;
  } else {
    return `आपके ${cropName} खेत में तुरंत हस्तक्षेप की जरूरत है (NDVI: ${ndvi.toFixed(2)})। फसल में गंभीर तनाव है और तुरंत देखभाल की जरूरत है।`;
  }
}

function generateDetailedAnalysisHindi(data: DiagnosisData, cropInsights: any, seasonInsights: any): string {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel } = data;
  const cropName = getCropNameHindi(cropType);
  
  let analysis = `${cropName} खेत का विस्तृत विश्लेषण:\n\n`;
  
  // Vegetation Health
  analysis += `🌱 वनस्पति स्वास्थ्य (NDVI: ${ndvi.toFixed(2)}): `;
  if (ndvi > 0.8) {
    analysis += `उत्कृष्ट फसल घनत्व और क्लोरोफिल सामग्री। आपके पौधे इष्टतम प्रकाश संश्लेषण कर रहे हैं।\n`;
  } else if (ndvi > 0.6) {
    analysis += `अच्छा वनस्पति स्वास्थ्य, सुधार की गुंजाइश है। नाइट्रोजन उर्वरक पर विचार करें।\n`;
  } else if (ndvi > 0.4) {
    analysis += `मध्यम तनाव का पता चला। पोषक तत्वों की कमी या कीट क्षति की जांच करें।\n`;
  } else {
    analysis += `गंभीर वनस्पति तनाव। तुरंत हस्तक्षेप आवश्यक।\n`;
  }
  
  // Water Status
  analysis += `💧 पानी की स्थिति (NDMI: ${ndmi.toFixed(2)}): `;
  if (waterStressLevel === 'none') {
    analysis += `इष्टतम मिट्टी की नमी बनाए रखी गई।\n`;
  } else if (waterStressLevel === 'mild') {
    analysis += `हल्का पानी का तनाव पता चला। सिंचाई कार्यक्रम की निगरानी करें।\n`;
  } else if (waterStressLevel === 'moderate') {
    analysis += `मध्यम पानी का तनाव। सिंचाई की आवृत्ति बढ़ाएं।\n`;
  } else {
    analysis += `गंभीर पानी का तनाव। आपातकालीन सिंचाई आवश्यक।\n`;
  }
  
  return analysis;
}

function generateSpecificRecommendationsHindi(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, cropType } = data;
  const cropName = getCropNameHindi(cropType);
  const recommendations: string[] = [];
  
  if (ndvi < 0.4) {
    recommendations.push(`🚨 गंभीर: तुरंत आपातकालीन नाइट्रोजन उर्वरक (यूरिया 46-0-0) 50 किलो/हेक्टेयर लगाएं`);
    recommendations.push(`🔍 कीट क्षति की जांच करें - पत्तियों में छेद, धब्बे या रंग बदलाव देखें`);
    recommendations.push(`💧 NDVI में सुधार तक सिंचाई 2-3 बार प्रति सप्ताह बढ़ाएं`);
    recommendations.push(`🧪 मिट्टी का pH टेस्ट करें - ${cropName} के लिए 6.0-7.5 होना चाहिए`);
  } else if (ndvi < 0.6) {
    recommendations.push(`🌱 3 दिनों के भीतर संतुलित NPK उर्वरक (20-20-20) 40 किलो/हेक्टेयर लगाएं`);
    recommendations.push(`💧 सिंचाई की आवृत्ति 25% बढ़ाएं`);
    recommendations.push(`🔍 रोग या कीट संक्रमण के शुरुआती लक्षणों की निगरानी करें`);
  }
  
  return recommendations;
}

function generateImmediateActionsHindi(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, waterStressLevel } = data;
  const actions: string[] = [];
  
  if (ndvi < 0.4) {
    actions.push(`🚨 तत्काल: 24 घंटे के भीतर आपातकालीन उर्वरक लगाएं`);
    actions.push(`💧 तुरंत 2-3 इंच पानी से सिंचाई करें`);
    actions.push(`🔍 कीट क्षति या रोग के लिए खेत का निरीक्षण करें`);
  }
  
  actions.push(`📅 7 दिनों में अनुवर्ती विश्लेषण का समय निर्धारित करें`);
  actions.push(`📊 बदलावों के लिए खेत की दैनिक निगरानी करें`);
  
  return actions;
}

function generateTimelineHindi(cropStage: string, cropType: string, ndvi: number): string {
  const cropName = getCropNameHindi(cropType);
  
  const timelines: { [key: string]: string } = {
    'vegetative': `वानस्पतिक अवस्था: नाइट्रोजन अनुप्रयोग और कीट नियंत्रण पर ध्यान दें। 60-90 दिनों में कटाई।`,
    'reproductive': `प्रजनन अवस्था: पैदावार निर्माण के लिए महत्वपूर्ण। पर्याप्त पानी और पोटेशियम सुनिश्चित करें। 30-45 दिनों में कटाई।`,
    'maturity': `परिपक्वता अवस्था: कटाई की तैयारी करें। सिंचाई को धीरे-धीरे कम करें। 7-14 दिनों में कटाई।`
  };
  
  let timeline = timelines[cropStage] || `फसल विकास की निगरानी करें और प्रबंधन को तदनुसार समायोजित करें।`;
  
  if (ndvi < 0.4) {
    timeline += ` तत्काल: फसल बचाने के लिए तुरंत हस्तक्षेप आवश्यक।`;
  }
  
  return timeline;
}

function generateRiskAssessmentHindi(data: DiagnosisData): string {
  const { ndvi, waterStressLevel } = data;
  let riskLevel = 'कम';
  let riskFactors: string[] = [];
  
  if (ndvi < 0.4) {
    riskLevel = 'गंभीर';
    riskFactors.push('गंभीर वनस्पति तनाव');
    riskFactors.push('उच्च पैदावार हानि जोखिम (60-80%)');
  } else if (ndvi < 0.6) {
    riskLevel = 'उच्च';
    riskFactors.push('मध्यम वनस्पति तनाव');
    riskFactors.push('पैदावार हानि जोखिम (20-40%)');
  }
  
  if (waterStressLevel === 'severe') {
    riskLevel = 'गंभीर';
    riskFactors.push('गंभीर पानी का तनाव');
  }
  
  return `जोखिम स्तर: ${riskLevel}। कारक: ${riskFactors.join(', ')}`;
}

// Helper functions for Punjabi
function generateSummaryPunjabi(ndvi: number, healthStatus: string, waterStressLevel: string, cropType: string): string {
  const cropName = getCropNamePunjabi(cropType);
  
  if (ndvi > 0.8) {
    return `ਤੁਹਾਡੇ ${cropName} ਖੇਤ ਵਿੱਚ ਬਹੁਤ ਵਧੀਆ ਸਿਹਤ ਦਿਖਾਈ ਦੇ ਰਹੀ ਹੈ (NDVI: ${ndvi.toFixed(2)})। ਫਸਲ ਬਹੁਤ ਚੰਗੀ ਹਾਲਤ ਵਿੱਚ ਹੈ ਅਤੇ ਇਸ ਸੀਜ਼ਨ ਵਿੱਚ ਵਧੀਆ ਪੈਦਾਵਾਰ ਹੋਵੇਗੀ।`;
  } else if (ndvi > 0.6) {
    return `ਤੁਹਾਡੇ ${cropName} ਖੇਤ ਦੀ ਹਾਲਤ ਚੰਗੀ ਹੈ (NDVI: ${ndvi.toFixed(2)})। ਫਸਲ ਸਿਹਤਮੰਦ ਹੈ ਪਰ ਕੁਝ ਸੁਧਾਰ ਦੀ ਲੋੜ ਹੈ।`;
  } else if (ndvi > 0.4) {
    return `ਤੁਹਾਡੇ ${cropName} ਖੇਤ ਵਿੱਚ ਮੱਧਮ ਸਿਹਤ ਦਿਖਾਈ ਦੇ ਰਹੀ ਹੈ (NDVI: ${ndvi.toFixed(2)})। ਪੈਦਾਵਾਰ ਦੀ ਹਾਨੀ ਰੋਕਣ ਲਈ ਤੁਰੰਤ ਧਿਆਨ ਦੇਣ ਦੀ ਲੋੜ ਹੈ।`;
  } else {
    return `ਤੁਹਾਡੇ ${cropName} ਖੇਤ ਵਿੱਚ ਤੁਰੰਤ ਦਖਲਅੰਦਾਜ਼ੀ ਦੀ ਲੋੜ ਹੈ (NDVI: ${ndvi.toFixed(2)})। ਫਸਲ ਵਿੱਚ ਗੰਭੀਰ ਤਣਾਅ ਹੈ ਅਤੇ ਤੁਰੰਤ ਦੇਖਭਾਲ ਦੀ ਲੋੜ ਹੈ।`;
  }
}

function generateDetailedAnalysisPunjabi(data: DiagnosisData, cropInsights: any, seasonInsights: any): string {
  const { ndvi, ndmi, cropType, cropStage, waterStressLevel } = data;
  const cropName = getCropNamePunjabi(cropType);
  
  let analysis = `${cropName} ਖੇਤ ਦਾ ਵਿਸਤ੍ਰਿਤ ਵਿਸ਼ਲੇਸ਼ਣ:\n\n`;
  
  // Vegetation Health
  analysis += `🌱 ਵਨਸਪਤੀ ਸਿਹਤ (NDVI: ${ndvi.toFixed(2)}): `;
  if (ndvi > 0.8) {
    analysis += `ਬਹੁਤ ਵਧੀਆ ਫਸਲ ਘਣਤਾ ਅਤੇ ਕਲੋਰੋਫਿਲ ਸਮੱਗਰੀ। ਤੁਹਾਡੇ ਪੌਦੇ ਆਦਰਸ਼ਕ ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੇ ਹਨ।\n`;
  } else if (ndvi > 0.6) {
    analysis += `ਚੰਗੀ ਵਨਸਪਤੀ ਸਿਹਤ, ਸੁਧਾਰ ਦੀ ਗੁੰਜਾਇਸ਼ ਹੈ। ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ 'ਤੇ ਵਿਚਾਰ ਕਰੋ।\n`;
  } else if (ndvi > 0.4) {
    analysis += `ਮੱਧਮ ਤਣਾਅ ਦਾ ਪਤਾ ਚਲਿਆ। ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਕਮੀ ਜਾਂ ਕੀੜੇ ਦੇ ਨੁਕਸਾਨ ਦੀ ਜਾਂਚ ਕਰੋ।\n`;
  } else {
    analysis += `ਗੰਭੀਰ ਵਨਸਪਤੀ ਤਣਾਅ। ਤੁਰੰਤ ਦਖਲਅੰਦਾਜ਼ੀ ਜ਼ਰੂਰੀ।\n`;
  }
  
  // Water Status
  analysis += `💧 ਪਾਣੀ ਦੀ ਸਥਿਤੀ (NDMI: ${ndmi.toFixed(2)}): `;
  if (waterStressLevel === 'none') {
    analysis += `ਆਦਰਸ਼ਕ ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਣਾਈ ਰੱਖੀ ਗਈ।\n`;
  } else if (waterStressLevel === 'mild') {
    analysis += `ਹਲਕਾ ਪਾਣੀ ਦਾ ਤਣਾਅ ਦਾ ਪਤਾ ਚਲਿਆ। ਸਿੰਚਾਈ ਸਮਾਸੂਚੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।\n`;
  } else if (waterStressLevel === 'moderate') {
    analysis += `ਮੱਧਮ ਪਾਣੀ ਦਾ ਤਣਾਅ। ਸਿੰਚਾਈ ਦੀ ਬਾਰੰਬਾਰਤਾ ਵਧਾਓ।\n`;
  } else {
    analysis += `ਗੰਭੀਰ ਪਾਣੀ ਦਾ ਤਣਾਅ। ਐਮਰਜੈਂਸੀ ਸਿੰਚਾਈ ਜ਼ਰੂਰੀ।\n`;
  }
  
  return analysis;
}

function generateSpecificRecommendationsPunjabi(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, cropType } = data;
  const cropName = getCropNamePunjabi(cropType);
  const recommendations: string[] = [];
  
  if (ndvi < 0.4) {
    recommendations.push(`🚨 ਗੰਭੀਰ: ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ (ਯੂਰੀਆ 46-0-0) 50 ਕਿਲੋ/ਹੈਕਟੇਅਰ ਲਗਾਓ`);
    recommendations.push(`🔍 ਕੀੜੇ ਦੇ ਨੁਕਸਾਨ ਦੀ ਜਾਂਚ ਕਰੋ - ਪੱਤਿਆਂ ਵਿੱਚ ਛੇਕ, ਧੱਬੇ ਜਾਂ ਰੰਗ ਬਦਲਾਅ ਦੇਖੋ`);
    recommendations.push(`💧 NDVI ਵਿੱਚ ਸੁਧਾਰ ਤੱਕ ਸਿੰਚਾਈ 2-3 ਵਾਰ ਪ੍ਰਤੀ ਹਫ਼ਤਾ ਵਧਾਓ`);
    recommendations.push(`🧪 ਮਿੱਟੀ ਦਾ pH ਟੈਸਟ ਕਰੋ - ${cropName} ਲਈ 6.0-7.5 ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ`);
  } else if (ndvi < 0.6) {
    recommendations.push(`🌱 3 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਸੰਤੁਲਿਤ NPK ਖਾਦ (20-20-20) 40 ਕਿਲੋ/ਹੈਕਟੇਅਰ ਲਗਾਓ`);
    recommendations.push(`💧 ਸਿੰਚਾਈ ਦੀ ਬਾਰੰਬਾਰਤਾ 25% ਵਧਾਓ`);
    recommendations.push(`🔍 ਰੋਗ ਜਾਂ ਕੀੜੇ ਦੇ ਸੰਕਰਮਣ ਦੇ ਸ਼ੁਰੂਆਤੀ ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ`);
  }
  
  return recommendations;
}

function generateImmediateActionsPunjabi(data: DiagnosisData, cropInsights: any): string[] {
  const { ndvi, waterStressLevel } = data;
  const actions: string[] = [];
  
  if (ndvi < 0.4) {
    actions.push(`🚨 ਤੁਰੰਤ: 24 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਐਮਰਜੈਂਸੀ ਖਾਦ ਲਗਾਓ`);
    actions.push(`💧 ਤੁਰੰਤ 2-3 ਇੰਚ ਪਾਣੀ ਨਾਲ ਸਿੰਚਾਈ ਕਰੋ`);
    actions.push(`🔍 ਕੀੜੇ ਦੇ ਨੁਕਸਾਨ ਜਾਂ ਰੋਗ ਲਈ ਖੇਤ ਦਾ ਨਿਰੀਖਣ ਕਰੋ`);
  }
  
  actions.push(`📅 7 ਦਿਨਾਂ ਵਿੱਚ ਅਨੁਵਰਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਦਾ ਸਮਾਂ ਨਿਰਧਾਰਿਤ ਕਰੋ`);
  actions.push(`📊 ਬਦਲਾਅ ਲਈ ਖੇਤ ਦੀ ਰੋਜ਼ਾਨਾ ਨਿਗਰਾਨੀ ਕਰੋ`);
  
  return actions;
}

function generateTimelinePunjabi(cropStage: string, cropType: string, ndvi: number): string {
  const cropName = getCropNamePunjabi(cropType);
  
  const timelines: { [key: string]: string } = {
    'vegetative': `ਵਨਸਪਤੀ ਪੜਾਅ: ਨਾਈਟ੍ਰੋਜਨ ਲਗਾਉਣ ਅਤੇ ਕੀੜੇ ਨਿਯੰਤਰਣ 'ਤੇ ਧਿਆਨ ਦਿਓ। 60-90 ਦਿਨਾਂ ਵਿੱਚ ਕਟਾਈ।`,
    'reproductive': `ਪ੍ਰਜਨਨ ਪੜਾਅ: ਪੈਦਾਵਾਰ ਨਿਰਮਾਣ ਲਈ ਮਹੱਤਵਪੂਰਨ। ਕਾਫ਼ੀ ਪਾਣੀ ਅਤੇ ਪੋਟਾਸ਼ੀਅਮ ਯਕੀਨੀ ਬਣਾਓ। 30-45 ਦਿਨਾਂ ਵਿੱਚ ਕਟਾਈ।`,
    'maturity': `ਪਰਿਪੱਕਤਾ ਪੜਾਅ: ਕਟਾਈ ਦੀ ਤਿਆਰੀ ਕਰੋ। ਸਿੰਚਾਈ ਨੂੰ ਹੌਲੀ-ਹੌਲੀ ਘਟਾਓ। 7-14 ਦਿਨਾਂ ਵਿੱਚ ਕਟਾਈ।`
  };
  
  let timeline = timelines[cropStage] || `ਫਸਲ ਵਿਕਾਸ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਪ੍ਰਬੰਧਨ ਨੂੰ ਤਦਨੁਸਾਰ ਅਨੁਕੂਲ ਬਣਾਓ।`;
  
  if (ndvi < 0.4) {
    timeline += ` ਤੁਰੰਤ: ਫਸਲ ਬਚਾਉਣ ਲਈ ਤੁਰੰਤ ਦਖਲਅੰਦਾਜ਼ੀ ਜ਼ਰੂਰੀ।`;
  }
  
  return timeline;
}

function generateRiskAssessmentPunjabi(data: DiagnosisData): string {
  const { ndvi, waterStressLevel } = data;
  let riskLevel = 'ਘੱਟ';
  let riskFactors: string[] = [];
  
  if (ndvi < 0.4) {
    riskLevel = 'ਗੰਭੀਰ';
    riskFactors.push('ਗੰਭੀਰ ਵਨਸਪਤੀ ਤਣਾਅ');
    riskFactors.push('ਉੱਚ ਪੈਦਾਵਾਰ ਹਾਨੀ ਜੋਖਮ (60-80%)');
  } else if (ndvi < 0.6) {
    riskLevel = 'ਉੱਚ';
    riskFactors.push('ਮੱਧਮ ਵਨਸਪਤੀ ਤਣਾਅ');
    riskFactors.push('ਪੈਦਾਵਾਰ ਹਾਨੀ ਜੋਖਮ (20-40%)');
  }
  
  if (waterStressLevel === 'severe') {
    riskLevel = 'ਗੰਭੀਰ';
    riskFactors.push('ਗੰਭੀਰ ਪਾਣੀ ਦਾ ਤਣਾਅ');
  }
  
  return `ਜੋਖਮ ਪੱਧਰ: ${riskLevel}। ਕਾਰਕ: ${riskFactors.join(', ')}`;
}

// Utility functions
function getCropNameHindi(cropType: string): string {
  const cropNames: { [key: string]: string } = {
    'rice': 'चावल',
    'wheat': 'गेहूं',
    'cotton': 'कपास',
    'maize': 'मक्का',
    'sugarcane': 'गन्ना',
    'potato': 'आलू',
    'tomato': 'टमाटर',
    'onion': 'प्याज'
  };
  return cropNames[cropType.toLowerCase()] || cropType;
}

function getCropNamePunjabi(cropType: string): string {
  const cropNames: { [key: string]: string } = {
    'rice': 'ਚੌਲ',
    'wheat': 'ਕਣਕ',
    'cotton': 'ਕਪਾਹ',
    'maize': 'ਮੱਕੀ',
    'sugarcane': 'ਗੰਨਾ',
    'potato': 'ਆਲੂ',
    'tomato': 'ਟਮਾਟਰ',
    'onion': 'ਪਿਆਜ਼'
  };
  return cropNames[cropType.toLowerCase()] || cropType;
}

function getCropSpecificInsights(cropType: string, cropStage: string, ndvi: number, ndmi: number): any {
  const insights: { [key: string]: any } = {
    'rice': {
      stageAnalysis: 'Rice requires consistent water management throughout its growth cycle.',
      recommendations: [
        'Maintain 2-5cm water level in fields',
        'Apply nitrogen fertilizer during tillering stage',
        'Monitor for blast disease during flowering'
      ]
    },
    'wheat': {
      stageAnalysis: 'Wheat needs good drainage and proper nutrient management.',
      recommendations: [
        'Apply phosphorus at sowing time',
        'Monitor for rust diseases',
        'Ensure proper drainage to prevent waterlogging'
      ]
    },
    'cotton': {
      stageAnalysis: 'Cotton requires careful pest management and adequate spacing.',
      recommendations: [
        'Monitor for bollworm activity',
        'Apply potassium during boll development',
        'Maintain proper plant spacing'
      ]
    }
  };
  
  return insights[cropType.toLowerCase()] || {
    stageAnalysis: 'Monitor crop development and adjust management accordingly.',
    recommendations: ['Follow standard agricultural practices', 'Monitor for pests and diseases']
  };
}

function getSeasonalInsights(season: string, cropType: string): any {
  const currentMonth = new Date().getMonth();
  const isKharif = currentMonth >= 5 && currentMonth <= 9;
  const isRabi = currentMonth >= 10 || currentMonth <= 3;
  
  if (isKharif) {
    return {
      analysis: 'Kharif season - focus on monsoon management and pest control during humid conditions.'
    };
  } else if (isRabi) {
    return {
      analysis: 'Rabi season - manage irrigation carefully and protect from cold stress.'
    };
  }
  
  return {
    analysis: 'Monitor seasonal conditions and adjust management practices accordingly.'
  };
}

function getEconomicInsights(ndvi: number, fieldArea: number, cropType: string): string {
  const baseYield = getBaseYield(cropType);
  const yieldMultiplier = ndvi > 0.8 ? 1.2 : ndvi > 0.6 ? 1.0 : ndvi > 0.4 ? 0.7 : 0.4;
  const expectedYield = baseYield * yieldMultiplier * fieldArea;
  const marketPrice = getMarketPrice(cropType);
  const expectedRevenue = expectedYield * marketPrice;
  
  return `Expected yield: ${expectedYield.toFixed(1)} quintals. Estimated revenue: ₹${expectedRevenue.toLocaleString()}. Investment needed: ₹${(fieldArea * 2000).toLocaleString()}.`;
}

function getBaseYield(cropType: string): number {
  const yields: { [key: string]: number } = {
    'rice': 40,
    'wheat': 35,
    'cotton': 15,
    'maize': 30
  };
  return yields[cropType.toLowerCase()] || 25;
}

function getMarketPrice(cropType: string): number {
  const prices: { [key: string]: number } = {
    'rice': 2000,
    'wheat': 1800,
    'cotton': 6000,
    'maize': 1500
  };
  return prices[cropType.toLowerCase()] || 1500;
}
