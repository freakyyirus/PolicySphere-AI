// ============================================
// PolicySphere AI — OpenAI Service (Production)
// ============================================
import OpenAI from 'openai';
import { config } from '../config/index.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

export async function generatePolicyAnalysis(policyType, sector, magnitude, duration) {
  const prompt = `You are a senior economic policy analyst with expertise in fiscal policy, labor markets, and macroeconomic impact assessment. Analyze this proposed government policy.

Policy Details:
- Type: ${policyType} (tax/subsidy/regulation)
- Sector: ${sector} (fuel/healthcare/education/agriculture/technology/manufacturing/finance/energy)
- Magnitude: ${magnitude}% (scale of change)
- Duration: ${duration} (short-term/long-term)

Provide a detailed JSON analysis:
{
  "riskScore": number (0-100),
  "impacts": {
    "inflation": number (-10 to +10),
    "employment": number (-10 to +10),
    "gdp": number (-10 to +10),
    "fiscal": number (-10 to +10)
  },
  "decision": {
    "verdict": "proceed" | "modify" | "reject",
    "label": "Proceed with Policy" | "Proceed with Modifications" | "High Risk – Not Recommended",
    "confidence": number (60-95)
  },
  "summary": "2-3 sentence executive summary",
  "keyFactors": ["factor 1", "factor 2", "factor 3", "factor 4"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert policy analyst AI with deep knowledge of economics, public finance, and government regulation. Provide accurate, nuanced analysis with confidence scores.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1200
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('OpenAI analysis error:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

export async function analyzeDocumentWithAI(content) {
  const prompt = `You are an expert policy document analyst. Extract and analyze key information from this policy document.

Document (excerpt):
${content.substring(0, 5000)}

Provide detailed JSON analysis:
{
  "detectedPolicyType": "tax" | "subsidy" | "regulation",
  "detectedSector": "fuel" | "healthcare" | "education" | "agriculture" | "technology" | "manufacturing" | "finance" | "energy",
  "estimatedMagnitude": number (5-25),
  "summary": "Plain-language 2-3 sentence summary explaining what this policy is about",
  "coverage": {
    "covers": ["aspect 1", "aspect 2", "aspect 3"],
    "doesNotCover": ["aspect 1", "aspect 2"]
  },
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "stakeholders": ["stakeholder 1", "stakeholder 2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You specialize in analyzing government policy documents, legislative texts, and regulatory proposals. Extract key information and provide structured analysis.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI document analysis error:', error.message);
    throw new Error(`Document analysis failed: ${error.message}`);
  }
}

export async function answerPolicyQuestion(question, policyContext, analysisData) {
  const prompt = `You are a senior policy advisor. Answer questions about government policies with depth and accuracy.

Policy Context:
${policyContext || 'General policy analysis'}

Analysis Data:
- Risk Score: ${analysisData?.riskScore || 'N/A'}
- Policy Type: ${analysisData?.policyType || 'N/A'}  
- Sector: ${analysisData?.sector || 'N/A'}
- Impacts: Inflation ${analysisData?.impacts?.inflation || 0}%, Employment ${analysisData?.impacts?.employment || 0}%, GDP ${analysisData?.impacts?.gdp || 0}%, Fiscal ${analysisData?.impacts?.fiscal || 0}%

User Question: ${question}

Provide a comprehensive, helpful answer in 2-4 sentences. Be specific and actionable.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a knowledgeable policy advisor. Answer questions clearly, with specific references to the policy context when available. Provide actionable insights.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const answer = response.choices[0]?.message?.content;
    if (!answer) {
      throw new Error('Empty response from AI');
    }
    
    return answer;
  } catch (error) {
    console.error('OpenAI Q&A error:', error.message);
    throw new Error(`Question answering failed: ${error.message}`);
  }
}

export async function generateAIInsights(policyType, sector, magnitude, impacts, riskScore) {
  const impactSummary = `Inflation: ${impacts?.inflation || 0}%, Employment: ${impacts?.employment || 0}%, GDP: ${impacts?.gdp || 0}%, Fiscal: ${impacts?.fiscal || 0}%`;
  
  const prompt = `You are a senior policy advisor AI. Generate actionable insights and recommendations for this policy proposal.

Policy: ${policyType} targeting ${sector} sector at ${magnitude}% magnitude
Risk Score: ${riskScore}/100
Economic Impacts: ${impactSummary}

Generate 5-7 specific, actionable insights as a JSON array:
["💡 First insight with specific recommendation...", "⚠️ Second insight about risk...", etc]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Generate actionable policy insights with emoji prefixes. Each insight should be a complete, specific recommendation.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI insights error:', error.message);
    throw new Error(`Insights generation failed: ${error.message}`);
  }
}