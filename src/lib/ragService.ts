/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines farmer knowledge base with Gemini API for intelligent responses
 */

import { searchKnowledgeBase, getContextualKnowledge, KnowledgeItem } from './farmerKnowledgeBase';

export interface RAGResponse {
  answer: string;
  sources: KnowledgeItem[];
  confidence: number;
  language: string;
  context: string;
}

export interface RAGRequest {
  query: string;
  language: string;
  fieldData?: any;
  context?: string;
}

class RAGService {
  private geminiApiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAmc78NU-vGwvjajje2YBD3LI2uYqub3tE';
  }

  /**
   * Generate farmer-friendly response using RAG
   */
  async generateResponse(request: RAGRequest): Promise<RAGResponse> {
    try {
      // Step 1: Retrieve relevant knowledge
      const relevantKnowledge = this.retrieveKnowledge(request);
      
      // Step 2: Generate response using Gemini with retrieved context
      const response = await this.generateWithGemini(request, relevantKnowledge);
      
      return response;
    } catch (error) {
      console.error('RAG Service Error:', error);
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Retrieve relevant knowledge from the knowledge base
   */
  private retrieveKnowledge(request: RAGRequest): KnowledgeItem[] {
    let knowledge: KnowledgeItem[] = [];
    
    if (request.fieldData) {
      // Get contextual knowledge based on field data
      knowledge = getContextualKnowledge(request.fieldData, request.language);
    }
    
    // Add query-specific knowledge
    const queryKnowledge = searchKnowledgeBase(request.query, request.language, 3);
    
    // Combine and deduplicate
    const combinedKnowledge = [...knowledge, ...queryKnowledge];
    const uniqueKnowledge = combinedKnowledge.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    return uniqueKnowledge.slice(0, 5); // Limit to 5 most relevant items
  }

  /**
   * Generate response using Gemini API with retrieved context
   */
  private async generateWithGemini(request: RAGRequest, knowledge: KnowledgeItem[]): Promise<RAGResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.language);
      const contextPrompt = this.buildContextPrompt(knowledge, request.language);
      const userPrompt = this.buildUserPrompt(request);

      const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${userPrompt}`;

      const response = await fetch(`${this.baseUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Gemini API rate limit reached, using fallback response');
          return this.getIntelligentFallbackResponse(request, knowledge);
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        answer: generatedText,
        sources: knowledge,
        confidence: this.calculateConfidence(knowledge, request.query),
        language: request.language,
        context: request.context || 'general'
      };
    } catch (error) {
      console.warn('Gemini API call failed, using intelligent fallback:', error);
      return this.getIntelligentFallbackResponse(request, knowledge);
    }
  }

  /**
   * Build system prompt for farmer-friendly responses
   */
  private buildSystemPrompt(language: string): string {
    if (language === 'hi') {
      return `आप "सॉयल साथी" हैं - एक अनुभवी कृषि सलाहकार। आपका व्यक्तित्व:
- गर्मजोशी से भरा और सहायक
- सरल, समझने योग्य भाषा का प्रयोग करें
- व्यावहारिक और क्रियान्वयन योग्य सुझाव दें
- किसानों की समस्याओं को गहराई से समझें
- स्थानीय कृषि शब्दावली का प्रयोग करें
- हमेशा प्रोत्साहित करने वाली भाषा का प्रयोग करें

निर्देश:
- दिए गए ज्ञान का उपयोग करके सटीक जवाब दें
- अगर ज्ञान में जानकारी नहीं है तो सामान्य सलाह दें
- हमेशा किसान के लिए उपयोगी और व्यावहारिक सुझाव दें
- जवाब संक्षिप्त लेकिन पूर्ण होना चाहिए`;
    } else if (language === 'pa') {
      return `ਤੁਸੀਂ "ਸੌਇਲ ਸਾਥੀ" ਹੋ - ਇੱਕ ਤਜਰਬੇਕਾਰ ਖੇਤੀ ਸਲਾਹਕਾਰ। ਤੁਹਾਡਾ ਸੁਭਾਅ:
- ਗਰਮਜੋਸ਼ੀ ਨਾਲ ਭਰਪੂਰ ਅਤੇ ਸਹਾਇਕ
- ਸਧਾਰਨ, ਸਮਝਣਯੋਗ ਭਾਸ਼ਾ ਦਾ ਪ੍ਰਯੋਗ ਕਰੋ
- ਵਿਹਾਰਕ ਅਤੇ ਲਾਗੂ ਕਰਨਯੋਗ ਸੁਝਾਅ ਦਿਓ
- ਕਿਸਾਨਾਂ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਨੂੰ ਡੂੰਘਾਈ ਨਾਲ ਸਮਝੋ
- ਸਥਾਨਕ ਖੇਤੀ ਸ਼ਬਦਾਵਲੀ ਦਾ ਪ੍ਰਯੋਗ ਕਰੋ
- ਹਮੇਸ਼ਾ ਉਤਸ਼ਾਹਿਤ ਕਰਨ ਵਾਲੀ ਭਾਸ਼ਾ ਦਾ ਪ੍ਰਯੋਗ ਕਰੋ

ਹਦਾਇਤਾਂ:
- ਦਿੱਤੇ ਗਏ ਗਿਆਨ ਦਾ ਉਪਯੋਗ ਕਰਕੇ ਸਹੀ ਜਵਾਬ ਦਿਓ
- ਜੇ ਗਿਆਨ ਵਿੱਚ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ ਤਾਂ ਆਮ ਸਲਾਹ ਦਿਓ
- ਹਮੇਸ਼ਾ ਕਿਸਾਨ ਲਈ ਲਾਭਦਾਇਕ ਅਤੇ ਵਿਹਾਰਕ ਸੁਝਾਅ ਦਿਓ
- ਜਵਾਬ ਸੰਖੇਪ ਪਰ ਪੂਰਨ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ`;
    } else {
      return `You are "Soil Saathi" - an experienced agricultural advisor. Your personality:
- Warm and supportive
- Use simple, understandable language
- Provide practical and actionable advice
- Understand farmers' problems deeply
- Use local farming terminology
- Always use encouraging language

Instructions:
- Use the provided knowledge to give accurate answers
- If knowledge doesn't contain information, give general advice
- Always provide useful and practical suggestions for farmers
- Answer should be concise but complete`;
    }
  }

  /**
   * Build context prompt with retrieved knowledge
   */
  private buildContextPrompt(knowledge: KnowledgeItem[], language: string): string {
    if (knowledge.length === 0) {
      return language === 'hi' 
        ? 'कोई विशिष्ट ज्ञान उपलब्ध नहीं है। सामान्य कृषि सलाह दें।'
        : language === 'pa'
        ? 'ਕੋਈ ਵਿਸ਼ੇਸ਼ ਗਿਆਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਆਮ ਖੇਤੀ ਸਲਾਹ ਦਿਓ।'
        : 'No specific knowledge available. Provide general agricultural advice.';
    }

    const contextText = knowledge.map(item => 
      `श्रेणी: ${item.category}\nशीर्षक: ${item.title}\nसामग्री: ${item.content}`
    ).join('\n\n');

    return language === 'hi'
      ? `निम्नलिखित कृषि ज्ञान का उपयोग करें:\n\n${contextText}`
      : language === 'pa'
      ? `ਹੇਠ ਲਿਖੇ ਖੇਤੀ ਗਿਆਨ ਦਾ ਉਪਯੋਗ ਕਰੋ:\n\n${contextText}`
      : `Use the following agricultural knowledge:\n\n${contextText}`;
  }

  /**
   * Build user prompt
   */
  private buildUserPrompt(request: RAGRequest): string {
    const fieldContext = request.fieldData 
      ? `\nखेत की जानकारी: ${JSON.stringify(request.fieldData, null, 2)}`
      : '';

    return `किसान का प्रश्न: ${request.query}${fieldContext}

कृपया उपरोक्त ज्ञान का उपयोग करके किसान के प्रश्न का उत्तर दें।`;
  }

  /**
   * Calculate confidence score based on knowledge relevance
   */
  private calculateConfidence(knowledge: KnowledgeItem[], query: string): number {
    if (knowledge.length === 0) return 0.3;
    
    const queryLower = query.toLowerCase();
    let totalRelevance = 0;
    
    knowledge.forEach(item => {
      let relevance = 0;
      
      // Check title relevance
      if (item.title.toLowerCase().includes(queryLower)) relevance += 0.4;
      
      // Check content relevance
      if (item.content.toLowerCase().includes(queryLower)) relevance += 0.3;
      
      // Check keyword relevance
      const keywordMatches = item.keywords.filter(keyword => 
        keyword.toLowerCase().includes(queryLower) || 
        queryLower.includes(keyword.toLowerCase())
      ).length;
      relevance += (keywordMatches / item.keywords.length) * 0.3;
      
      totalRelevance += relevance;
    });
    
    return Math.min(totalRelevance / knowledge.length, 1.0);
  }

  /**
   * Get intelligent fallback response using knowledge base
   */
  private getIntelligentFallbackResponse(request: RAGRequest, knowledge: KnowledgeItem[]): RAGResponse {
    // Try to generate a response based on available knowledge
    if (knowledge.length > 0) {
      const relevantKnowledge = knowledge[0]; // Use most relevant knowledge
      const answer = this.generateAnswerFromKnowledge(relevantKnowledge, request.query, request.language);
      
      return {
        answer: answer,
        sources: [relevantKnowledge],
        confidence: 0.6,
        language: request.language,
        context: 'knowledge-based'
      };
    }

    // Fall back to quick response if available
    const quickResponse = this.getQuickResponse(request.query, request.language);
    if (quickResponse) {
      return {
        answer: quickResponse,
        sources: [],
        confidence: 0.8,
        language: request.language,
        context: 'quick-response'
      };
    }

    // Final fallback
    return this.getFallbackResponse(request);
  }

  /**
   * Generate answer from knowledge base item
   */
  private generateAnswerFromKnowledge(knowledge: KnowledgeItem, query: string, language: string): string {
    const queryLower = query.toLowerCase();
    
    if (language === 'hi') {
      if (queryLower.includes('खेत') || queryLower.includes('field')) {
        return `आपके खेत के लिए, ${knowledge.content} यह सुझाव आपके लिए उपयोगी हो सकता है। कृपया अपने स्थानीय कृषि विशेषज्ञ से भी सलाह लें।`;
      } else if (queryLower.includes('फसल') || queryLower.includes('crop')) {
        return `फसल संबंधी आपके प्रश्न के लिए: ${knowledge.content} यह जानकारी आपकी मदद कर सकती है।`;
      } else {
        return `${knowledge.content} यह जानकारी आपके प्रश्न से संबंधित है। अधिक विस्तृत जानकारी के लिए कृषि विभाग से संपर्क करें।`;
      }
    } else if (language === 'pa') {
      if (queryLower.includes('ਖੇਤ') || queryLower.includes('field')) {
        return `ਤੁਹਾਡੇ ਖੇਤ ਲਈ, ${knowledge.content} ਇਹ ਸੁਝਾਅ ਤੁਹਾਡੇ ਲਈ ਲਾਭਦਾਇਕ ਹੋ ਸਕਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀ ਮਾਹਿਰ ਤੋਂ ਵੀ ਸਲਾਹ ਲਓ।`;
      } else if (queryLower.includes('ਫਸਲ') || queryLower.includes('crop')) {
        return `ਫਸਲ ਸਬੰਧੀ ਤੁਹਾਡੇ ਸਵਾਲ ਲਈ: ${knowledge.content} ਇਹ ਜਾਣਕਾਰੀ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦੀ ਹੈ।`;
      } else {
        return `${knowledge.content} ਇਹ ਜਾਣਕਾਰੀ ਤੁਹਾਡੇ ਸਵਾਲ ਨਾਲ ਸਬੰਧਤ ਹੈ। ਹੋਰ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ ਲਈ ਖੇਤੀ ਵਿਭਾਗ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।`;
      }
    } else {
      if (queryLower.includes('field') || queryLower.includes('farm')) {
        return `For your field, ${knowledge.content} This suggestion might be helpful for you. Please also consult your local agriculture expert.`;
      } else if (queryLower.includes('crop')) {
        return `Regarding your crop question: ${knowledge.content} This information can help you.`;
      } else {
        return `${knowledge.content} This information is related to your question. Contact the agriculture department for more detailed information.`;
      }
    }
  }

  /**
   * Get fallback response when RAG fails
   */
  private getFallbackResponse(request: RAGRequest): RAGResponse {
    const fallbackAnswers = {
      hi: 'मुझे खेद है, मैं इस समय आपके प्रश्न का उत्तर नहीं दे सकता। कृपया अपने स्थानीय कृषि विभाग से संपर्क करें या फिर से प्रयास करें।',
      pa: 'ਮੈਨੂੰ ਅਫ਼ਸੋਸ ਹੈ, ਮੈਂ ਇਸ ਸਮੇਂ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀ ਵਿਭਾਗ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਜਾਂ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      en: 'I apologize, I cannot answer your question at this time. Please contact your local agriculture department or try again.'
    };

    return {
      answer: fallbackAnswers[request.language as keyof typeof fallbackAnswers] || fallbackAnswers.en,
      sources: [],
      confidence: 0.1,
      language: request.language,
      context: 'fallback'
    };
  }

  /**
   * Get quick responses for common queries
   */
  getQuickResponse(query: string, language: string): string {
    const quickResponses = {
      hi: {
        'नमस्ते': 'नमस्ते! मैं आपका सॉयल साथी हूं। आप मुझसे अपने खेत के बारे में कुछ भी पूछ सकते हैं।',
        'धन्यवाद': 'आपका स्वागत है! मैं हमेशा आपकी मदद के लिए यहां हूं।',
        'मदद': 'मैं आपकी कैसे मदद कर सकता हूं? आप अपने खेत, फसल, या किसी भी कृषि समस्या के बारे में पूछ सकते हैं।'
      },
      pa: {
        'ਸਤ ਸ੍ਰੀ ਅਕਾਲ': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸੌਇਲ ਸਾਥੀ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਆਪਣੇ ਖੇਤ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛ ਸਕਦੇ ਹੋ।',
        'ਧੰਨਵਾਦ': 'ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਮੈਂ ਹਮੇਸ਼ਾ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਇੱਥੇ ਹਾਂ।',
        'ਮਦਦ': 'ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਤੁਸੀਂ ਆਪਣੇ ਖੇਤ, ਫਸਲ, ਜਾਂ ਕਿਸੇ ਵੀ ਖੇਤੀ ਸਮੱਸਿਆ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।'
      },
      en: {
        'hello': 'Hello! I am your Soil Saathi. You can ask me anything about your farm.',
        'thank you': 'You are welcome! I am always here to help you.',
        'help': 'How can I help you? You can ask about your field, crops, or any agricultural problem.'
      }
    };

    const responses = quickResponses[language as keyof typeof quickResponses];
    if (responses) {
      const queryLower = query.toLowerCase();
      for (const [key, value] of Object.entries(responses)) {
        if (queryLower.includes(key)) {
          return value;
        }
      }
    }

    return '';
  }
}

// Export singleton instance
export const ragService = new RAGService();
