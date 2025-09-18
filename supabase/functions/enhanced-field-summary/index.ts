import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a default user for non-authenticated access
    const user = { id: 'anonymous-user' };

    const { fieldId, language = 'hi' } = await req.json();

    if (!fieldId) {
      return new Response(JSON.stringify({ error: 'Field ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get field data
    const { data: field, error: fieldError } = await supabaseClient
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .single();

    if (fieldError || !field) {
      return new Response(JSON.stringify({ error: 'Field not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get latest satellite analysis
    const { data: latestAnalysis } = await supabaseClient
      .from('satellite_analyses')
      .select('*')
      .eq('field_id', fieldId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    // Get recent recommendations
    const { data: recommendations } = await supabaseClient
      .from('recommendations')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Use Gemini to generate comprehensive field summary
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const fieldSummaryPrompt = `
    You are an agricultural expert providing insights to Indian farmers in ${language === 'hi' ? 'Hindi' : 'English'}.
    
    Field Information:
    - Name: ${field.name}
    - Crop: ${field.crop_type} (${field.crop_variety || 'Not specified'})
    - Area: ${field.area_hectares} hectares
    - Planting Date: ${field.planting_date || 'Not specified'}
    - Current Status: ${field.status}
    
    Latest Satellite Analysis:
    ${latestAnalysis ? `
    - Analysis Date: ${latestAnalysis.analysis_date}
    - NDVI: ${latestAnalysis.ndvi_value} (Vegetation health)
    - MSAVI2: ${latestAnalysis.msavi2_value} (Early stage assessment)
    - NDRE: ${latestAnalysis.ndre_value} (Mature crop assessment)
    - NDMI: ${latestAnalysis.ndmi_value} (Water stress indicator)
    - Crop Stage: ${latestAnalysis.crop_stage}
    - Health Status: ${latestAnalysis.health_status}
    - Water Stress: ${latestAnalysis.water_stress_level}
    - Cloud Cover: ${latestAnalysis.cloud_cover_percentage}%
    ` : 'No recent satellite analysis available'}
    
    Recent Recommendations:
    ${recommendations?.map(r => `- ${r.title}: ${r.description} (Priority: ${r.priority})`).join('\n') || 'No recent recommendations'}
    
    Provide a comprehensive field summary including:
    1. Current field status and health assessment
    2. Key insights from satellite data
    3. Immediate action items (if any)
    4. Seasonal recommendations for ${field.crop_type}
    5. Expected timeline for next major farming activities
    
    Keep the response practical, actionable, and appropriate for the local farming context in India.
    ${language === 'hi' ? 'Please respond in Hindi.' : 'Please respond in English.'}
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fieldSummaryPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      throw new Error('Failed to generate field summary');
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';

    // Structure the response
    const fieldInsights = {
      summary: summary,
      field: {
        name: field.name,
        crop: field.crop_type,
        variety: field.crop_variety,
        area: field.area_hectares,
        status: field.status,
        plantingDate: field.planting_date
      },
      latestAnalysis: latestAnalysis ? {
        date: latestAnalysis.analysis_date,
        ndvi: latestAnalysis.ndvi_value,
        msavi2: latestAnalysis.msavi2_value,
        healthStatus: latestAnalysis.health_status,
        cropStage: latestAnalysis.crop_stage,
        waterStress: latestAnalysis.water_stress_level
      } : null,
      recommendations: recommendations?.slice(0, 3).map(r => ({
        title: r.title,
        description: r.description,
        priority: r.priority,
        category: r.category
      })) || []
    };

    return new Response(JSON.stringify(fieldInsights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced field summary:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate field summary',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});