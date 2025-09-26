/**
 * Farmer Knowledge Base for RAG System
 * Comprehensive agricultural knowledge for Indian farmers
 */

export interface KnowledgeItem {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  content: string;
  keywords: string[];
  language: 'hi' | 'en' | 'pa';
  region?: string;
  season?: string;
  crop?: string;
  priority: 'high' | 'medium' | 'low';
}

export const farmerKnowledgeBase: KnowledgeItem[] = [
  // Crop Health & Diseases
  {
    id: 'crop_health_1',
    category: 'crop_health',
    subcategory: 'diseases',
    title: 'गेहूं में पीले पत्ते - नाइट्रोजन की कमी',
    content: 'गेहूं में पीले पत्ते नाइट्रोजन की कमी का संकेत है। तुरंत यूरिया (46% N) का छिड़काव करें। 50 किलो प्रति एकड़ यूरिया डालें। बारिश से पहले या सुबह-शाम करें।',
    keywords: ['गेहूं', 'पीले पत्ते', 'नाइट्रोजन', 'यूरिया', 'wheat', 'yellow leaves', 'nitrogen deficiency'],
    language: 'hi',
    crop: 'wheat',
    priority: 'high'
  },
  {
    id: 'crop_health_2',
    category: 'crop_health',
    subcategory: 'diseases',
    title: 'Rice Blast Disease Treatment',
    content: 'Rice blast is a fungal disease. Apply Tricyclazole 75% WP at 0.6g per liter. Spray in early morning or evening. Repeat after 10-15 days if needed.',
    keywords: ['rice', 'blast', 'fungal', 'tricyclazole', 'disease', 'treatment'],
    language: 'en',
    crop: 'rice',
    priority: 'high'
  },
  {
    id: 'crop_health_3',
    category: 'crop_health',
    subcategory: 'pests',
    title: 'ਪੰਜਾਬ ਵਿੱਚ ਖੇਤੀ ਦੇ ਕੀੜੇ',
    content: 'ਪੰਜਾਬ ਵਿੱਚ ਆਮ ਕੀੜੇ: ਚੂਹੇ, ਟਿੱਡੇ, ਫਲੀਆਂ। ਨੀਮ ਦਾ ਤੇਲ 2% ਦਾ ਛਿੜਕਾਅ ਕਰੋ। ਜੈਵਿਕ ਖੇਤੀ ਦੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ।',
    keywords: ['ਪੰਜਾਬ', 'ਕੀੜੇ', 'ਨੀਮ', 'ਜੈਵਿਕ', 'pests', 'neem', 'organic'],
    language: 'pa',
    region: 'punjab',
    priority: 'medium'
  },

  // Irrigation & Water Management
  {
    id: 'irrigation_1',
    category: 'irrigation',
    subcategory: 'water_management',
    title: 'स्मार्ट सिंचाई के तरीके',
    content: 'ड्रिप सिंचाई से 40% पानी बचाया जा सकता है। सुबह 6-8 बजे या शाम 5-7 बजे सिंचाई करें। मिट्टी की नमी जांचते रहें।',
    keywords: ['सिंचाई', 'ड्रिप', 'पानी', 'बचत', 'irrigation', 'drip', 'water saving'],
    language: 'hi',
    priority: 'high'
  },
  {
    id: 'irrigation_2',
    category: 'irrigation',
    subcategory: 'timing',
    title: 'Best Irrigation Timing for Different Crops',
    content: 'Wheat: Early morning (6-8 AM), Rice: Evening (5-7 PM), Sugarcane: Early morning, Cotton: Early morning. Avoid irrigation during peak sun hours.',
    keywords: ['irrigation', 'timing', 'wheat', 'rice', 'sugarcane', 'cotton', 'morning', 'evening'],
    language: 'en',
    priority: 'medium'
  },

  // Fertilizer & Nutrition
  {
    id: 'fertilizer_1',
    category: 'fertilizer',
    subcategory: 'organic',
    title: 'जैविक खाद बनाने की विधि',
    content: 'गोबर, पत्ते, रसोई का कचरा मिलाकर 3 महीने में जैविक खाद तैयार होती है। 1:1:1 अनुपात में मिलाएं। नमी बनाए रखें।',
    keywords: ['जैविक', 'खाद', 'गोबर', 'कम्पोस्ट', 'organic', 'manure', 'compost'],
    language: 'hi',
    priority: 'medium'
  },
  {
    id: 'fertilizer_2',
    category: 'fertilizer',
    subcategory: 'chemical',
    title: 'NPK Fertilizer Application Guide',
    content: 'N-P-K ratio for wheat: 120-60-40 kg/ha, Rice: 100-50-50 kg/ha, Cotton: 150-75-75 kg/ha. Apply in 2-3 splits during crop growth.',
    keywords: ['NPK', 'fertilizer', 'wheat', 'rice', 'cotton', 'ratio', 'application'],
    language: 'en',
    priority: 'high'
  },

  // Weather & Climate
  {
    id: 'weather_1',
    category: 'weather',
    subcategory: 'monsoon',
    title: 'मानसून की भविष्यवाणी और खेती',
    content: 'मानसून आने से पहले बीज बोएं। अच्छी बारिश की संभावना हो तो अधिक बीज बोएं। सूखे की तैयारी भी रखें।',
    keywords: ['मानसून', 'बारिश', 'बीज', 'सूखा', 'monsoon', 'rain', 'seeds', 'drought'],
    language: 'hi',
    season: 'monsoon',
    priority: 'high'
  },
  {
    id: 'weather_2',
    category: 'weather',
    subcategory: 'temperature',
    title: 'Temperature Impact on Crop Growth',
    content: 'Optimal temperature for wheat: 15-25°C, Rice: 20-35°C, Cotton: 21-30°C. High temperature (>35°C) can cause heat stress and reduce yield.',
    keywords: ['temperature', 'wheat', 'rice', 'cotton', 'heat stress', 'yield', 'optimal'],
    language: 'en',
    priority: 'medium'
  },

  // Market & Economics
  {
    id: 'market_1',
    category: 'market',
    subcategory: 'pricing',
    title: 'फसल की कीमत और बाजार',
    content: 'गेहूं की MSP ₹2,125 प्रति क्विंटल है। सरकारी मंडी में बेचें। निजी व्यापारियों से अधिक कीमत मिल सकती है।',
    keywords: ['गेहूं', 'MSP', 'कीमत', 'मंडी', 'wheat', 'price', 'market', 'MSP'],
    language: 'hi',
    crop: 'wheat',
    priority: 'high'
  },
  {
    id: 'market_2',
    category: 'market',
    subcategory: 'storage',
    title: 'Grain Storage Best Practices',
    content: 'Store grains in cool, dry place. Use airtight containers. Check for moisture content (<12%). Fumigate with aluminum phosphide if needed.',
    keywords: ['storage', 'grain', 'moisture', 'fumigation', 'aluminum phosphide', 'containers'],
    language: 'en',
    priority: 'medium'
  },

  // Technology & Modern Farming
  {
    id: 'technology_1',
    category: 'technology',
    subcategory: 'precision_farming',
    title: 'सटीक खेती के लाभ',
    content: 'सैटेलाइट डेटा से खेत की स्थिति जानें। GPS से सटीक बुवाई करें। ड्रोन से खाद और दवाई छिड़कें। उपज 20-30% बढ़ सकती है।',
    keywords: ['सटीक खेती', 'सैटेलाइट', 'GPS', 'ड्रोन', 'precision farming', 'satellite', 'drone'],
    language: 'hi',
    priority: 'medium'
  },
  {
    id: 'technology_2',
    category: 'technology',
    subcategory: 'soil_testing',
    title: 'Soil Testing and Analysis',
    content: 'Test soil every 2-3 years. Check pH, NPK, organic matter. Based on results, apply fertilizers. Contact local agriculture department for testing.',
    keywords: ['soil testing', 'pH', 'NPK', 'organic matter', 'fertilizers', 'analysis'],
    language: 'en',
    priority: 'high'
  },

  // Seasonal Farming
  {
    id: 'seasonal_1',
    category: 'seasonal',
    subcategory: 'kharif',
    title: 'खरीफ फसलों की बुवाई',
    content: 'खरीफ में चावल, मक्का, कपास, मूंगफली बोएं। जून-जुलाई में बुवाई करें। मानसून की शुरुआत में बोएं।',
    keywords: ['खरीफ', 'चावल', 'मक्का', 'कपास', 'kharif', 'rice', 'maize', 'cotton'],
    language: 'hi',
    season: 'kharif',
    priority: 'high'
  },
  {
    id: 'seasonal_2',
    category: 'seasonal',
    subcategory: 'rabi',
    title: 'Rabi Season Crop Planning',
    content: 'Rabi crops: wheat, barley, mustard, gram. Sow in October-November. Requires irrigation. Good for winter season farming.',
    keywords: ['rabi', 'wheat', 'barley', 'mustard', 'gram', 'winter', 'irrigation'],
    language: 'en',
    season: 'rabi',
    priority: 'high'
  }
];

/**
 * Search knowledge base for relevant information
 */
export function searchKnowledgeBase(query: string, language: string = 'hi', limit: number = 5): KnowledgeItem[] {
  const queryLower = query.toLowerCase();
  
  return farmerKnowledgeBase
    .filter(item => {
      // Language match
      if (item.language !== language) return false;
      
      // Keyword match
      const keywordMatch = item.keywords.some(keyword => 
        keyword.toLowerCase().includes(queryLower) || 
        queryLower.includes(keyword.toLowerCase())
      );
      
      // Content match
      const contentMatch = item.content.toLowerCase().includes(queryLower) ||
                          item.title.toLowerCase().includes(queryLower);
      
      return keywordMatch || contentMatch;
    })
    .sort((a, b) => {
      // Prioritize high priority items
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      
      // Then by relevance (more keyword matches)
      const aMatches = a.keywords.filter(k => 
        k.toLowerCase().includes(queryLower) || queryLower.includes(k.toLowerCase())
      ).length;
      const bMatches = b.keywords.filter(k => 
        k.toLowerCase().includes(queryLower) || queryLower.includes(k.toLowerCase())
      ).length;
      
      return bMatches - aMatches;
    })
    .slice(0, limit);
}

/**
 * Get contextual knowledge based on current field data
 */
export function getContextualKnowledge(fieldData: any, language: string = 'hi'): KnowledgeItem[] {
  const contextKeywords: string[] = [];
  
  // Add crop-specific keywords
  if (fieldData.crop) {
    contextKeywords.push(fieldData.crop.toLowerCase());
  }
  
  // Add health status keywords
  if (fieldData.healthStatus) {
    contextKeywords.push(fieldData.healthStatus.toLowerCase());
  }
  
  // Add season keywords
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 5 && currentMonth <= 9) {
    contextKeywords.push('kharif', 'खरीफ');
  } else {
    contextKeywords.push('rabi', 'रबी');
  }
  
  // Search with contextual keywords
  return searchKnowledgeBase(contextKeywords.join(' '), language, 3);
}

