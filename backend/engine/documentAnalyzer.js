// ============================================
// PolicySphere AI — Document/URL Analysis Engine
// ============================================
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzePolicy, SECTOR_LABELS, POLICY_LABELS } from './policyEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function analyzeDocumentContent(content, type = 'text') {
  const lowerContent = content.toLowerCase();
  
  let detectedPolicyType = null;
  for (const type of Object.keys(POLICY_LABELS)) {
    if (lowerContent.includes(type) || 
        lowerContent.includes(POLICY_LABELS[type].toLowerCase())) {
      detectedPolicyType = type;
      break;
    }
  }
  
  if (!detectedPolicyType) {
    if (lowerContent.includes('tax') || lowerContent.includes('revenue') || lowerContent.includes('tariff')) {
      detectedPolicyType = 'tax';
    } else if (lowerContent.includes('subsidy') || lowerContent.includes('grant') || lowerContent.includes('incentive')) {
      detectedPolicyType = 'subsidy';
    } else if (lowerContent.includes('regulation') || lowerContent.includes('compliance') || lowerContent.includes('mandate')) {
      detectedPolicyType = 'regulation';
    } else {
      detectedPolicyType = 'regulation';
    }
  }
  
  let detectedSector = null;
  for (const sector of Object.keys(SECTOR_LABELS)) {
    if (lowerContent.includes(sector) || 
        lowerContent.includes(SECTOR_LABELS[sector].toLowerCase())) {
      detectedSector = sector;
      break;
    }
  }
  
  const sectorKeywords = {
    fuel: ['fuel', 'gas', 'oil', 'petroleum', 'energy', 'electricity'],
    healthcare: ['health', 'medical', 'hospital', 'healthcare', 'pharma', 'drug'],
    education: ['education', 'school', 'university', 'student', 'training'],
    agriculture: ['agriculture', 'farm', 'crop', 'food', 'rural'],
    technology: ['technology', 'tech', 'digital', 'software', 'ai', 'data'],
    manufacturing: ['manufacturing', 'factory', 'industrial', 'production'],
    finance: ['finance', 'bank', 'investment', 'financial', 'insurance'],
    energy: ['energy', 'renewable', 'solar', 'wind', 'power'],
  };
  
  if (!detectedSector) {
    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some(k => lowerContent.includes(k))) {
        detectedSector = sector;
        break;
      }
    }
  }
  if (!detectedSector) detectedSector = 'finance';
  
  const magnitudeEstimate = estimateMagnitude(lowerContent);
  
  const summary = generateSimpleSummary(content, detectedPolicyType, detectedSector, magnitudeEstimate);
  const coverage = determineCoverage(content);
  
  return {
    detectedPolicyType,
    detectedSector,
    magnitude: magnitudeEstimate,
    summary,
    coverage,
    rawAnalysis: analyzePolicy(detectedPolicyType, detectedSector, magnitudeEstimate, 'short')
  };
}

function estimateMagnitude(content) {
  const magnitudeKeywords = {
    high: ['significant', 'major', 'substantial', 'sweeping', 'comprehensive', 'extensive', 'large-scale', 'high'],
    medium: ['moderate', 'mid', 'medium', 'partial', 'targeted'],
    low: ['minor', 'small', 'limited', 'pilot', 'small-scale', 'minimal']
  };
  
  const contentLower = content.toLowerCase();
  
  for (const keyword of magnitudeKeywords.high) {
    if (contentLower.includes(keyword)) return Math.floor(Math.random() * 5) + 15;
  }
  for (const keyword of magnitudeKeywords.medium) {
    if (contentLower.includes(keyword)) return Math.floor(Math.random() * 5) + 10;
  }
  for (const keyword of magnitudeKeywords.low) {
    if (contentLower.includes(keyword)) return Math.floor(Math.random() * 5) + 5;
  }
  
  return 10;
}

function generateSimpleSummary(content, policyType, sector, magnitude) {
  const policyLabel = POLICY_LABELS[policyType] || 'Policy';
  const sectorLabel = SECTOR_LABELS[sector] || 'Unknown sector';
  
  const summaryParts = [];
  
  summaryParts.push(`This is a ${policyLabel.toLowerCase()} targeting the ${sectorLabel.toLowerCase()}.`);
  
  const keywords = extractKeyTerms(content);
  if (keywords.length > 0) {
    summaryParts.push(`Key focus areas: ${keywords.slice(0, 5).join(', ')}.`);
  }
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length > 0) {
    summaryParts.push(`Main objectives: ${sentences[0].trim().substring(0, 150)}...`);
  }
  
  summaryParts.push(`Estimated impact magnitude: ${magnitude}% (based on policy scope and keywords).`);
  
  return summaryParts.join(' ');
}

function extractKeyTerms(content) {
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'not', 'no', 'from', 'as', 'also', 'more', 'most', 'some', 'any', 'all', 'each', 'every', 'such', 'other', 'than', 'then', 'so', 'very', 'just']);
  
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq = {};
  
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function determineCoverage(content) {
  const coverage = {
    covers: [],
    doesNotCover: []
  };
  
  const contentLower = content.toLowerCase();
  
  const coverageMap = {
    'Tax implications': ['tax', 'revenue', 'tariff', 'rate', 'levy', 'bracket'],
    'Employment effects': ['employment', 'job', 'worker', 'labor', 'employment', 'unemployment'],
    'Industry support': ['industry', 'sector', 'business', 'company', 'enterprise'],
    'Environmental impact': ['environment', 'climate', 'carbon', 'emission', 'green'],
    'Consumer prices': ['price', 'cost', 'consumer', 'inflation', 'cost-of-living'],
    'Budget/fiscal': ['budget', 'deficit', 'surplus', 'fiscal', 'spending', 'government'],
    'International trade': ['trade', 'import', 'export', 'tariff', 'border', 'wto'],
    'Social welfare': ['welfare', 'social', 'benefit', 'assistance', 'support'],
  };
  
  for (const [aspect, keywords] of Object.entries(coverageMap)) {
    if (keywords.some(k => contentLower.includes(k))) {
      coverage.covers.push(aspect);
    } else {
      coverage.doesNotCover.push(aspect);
    }
  }
  
  if (coverage.covers.length === 0) {
    coverage.covers.push('General policy objectives');
    coverage.doesNotCover.push('Specific implementation details');
  }
  
  return coverage;
}

export async function fetchURLContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('script, style, nav, header, footer, .nav, .menu, .footer, .header, .advertisement, .ad').remove();
    
    let content = '';
    
    const title = $('title').text().trim();
    const h1 = $('h1').first().text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    
    content = `${title}. ${h1}. ${metaDesc} `;
    
    $('article, main, .content, .article, .post, .entry, section, .section').each((_, el) => {
      content += $(el).text().trim() + ' ';
    });
    
    if (content.trim().length < 100) {
      $('p').each((_, el) => {
        content += $(el).text().trim() + ' ';
      });
    }
    
    content = content.replace(/\s+/g, ' ').trim();
    
    if (content.length > 50000) {
      content = content.substring(0, 50000);
    }
    
    return content;
  } catch (error) {
    logger.error('URL fetch failed', { url, error: error.message });
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

export function answerQuestion(content, question, analysis) {
  const contentLower = content.toLowerCase();
  const questionLower = question.toLowerCase();
  
  const questionPatterns = {
    'risk': [
      'risk', 'danger', 'safe', 'secure', 'concern', 'problem', 'issue'
    ],
    'cost': [
      'cost', 'price', 'expensive', 'cheap', 'budget', 'fund', 'money'
    ],
    'timeline': [
      'when', 'timeline', 'duration', 'phase', 'implement', 'rollout', 'deadline'
    ],
    'who': [
      'who', 'affect', 'beneficiary', 'eligible', 'qualify', 'participant'
    ],
    'what': [
      'what', 'cover', 'include', 'provide', 'offer', 'support'
    ],
    'why': [
      'why', 'reason', 'purpose', 'goal', 'objective', 'intent'
    ],
    'how': [
      'how', 'apply', 'register', 'claim', 'access', 'obtain'
    ]
  };
  
  let category = 'general';
  for (const [cat, patterns] of Object.entries(questionPatterns)) {
    if (patterns.some(p => questionLower.includes(p))) {
      category = cat;
      break;
    }
  }
  
  let answer = '';
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const relevantSentences = sentences.filter(s => {
    const sLower = s.toLowerCase();
    const qWords = questionLower.split(/\s+/).filter(w => w.length > 3);
    return qWords.some(w => sLower.includes(w));
  });
  
  if (category === 'risk' && analysis?.rawAnalysis) {
    const riskScore = analysis.rawAnalysis.riskScore;
    const impacts = analysis.rawAnalysis.impacts;
    answer = `Based on the analysis, this policy has a risk score of ${riskScore}/100 (${riskScore <= 35 ? 'Low' : riskScore <= 65 ? 'Moderate' : 'High'} risk). `;
    if (impacts.inflation > 2) answer += `Key risk: Inflation may increase by ~${impacts.inflation.toFixed(1)}%. `;
    if (impacts.fiscal > 3) answer += `Fiscal deficit may increase by ~${impacts.fiscal.toFixed(1)}%. `;
  } else if (category === 'cost') {
    const fiscal = analysis?.rawAnalysis?.impacts?.fiscal;
    if (fiscal !== undefined) {
      answer = `The fiscal impact is estimated at ${fiscal > 0 ? '+' : ''}${fiscal.toFixed(1)}%. ${fiscal > 2 ? 'This represents a significant government spending implication.' : 'The fiscal impact is moderate.'}`;
    } else {
      answer = generateAnswerFromContent(relevantSentences, ['cost', 'fund', 'budget', 'price', 'expense']) || 
        'The document does not provide specific cost information. Please refer to the full policy document for detailed financial implications.';
    }
  } else if (category === 'what') {
    answer = generateAnswerFromContent(relevantSentences, ['cover', 'include', 'provide', 'support', 'benefit']) ||
      `This ${analysis?.detectedPolicyType || 'policy'} covers the ${analysis?.detectedSector || 'relevant sector'}. See the coverage analysis for details.`;
  } else if (relevantSentences.length > 0) {
    answer = relevantSentences.slice(0, 2).join('. ');
  } else {
    answer = generateFallbackAnswer(question, analysis);
  }
  
  if (answer.length < 50) {
    answer = generateFallbackAnswer(question, analysis);
  }
  
  return answer;
}

function generateAnswerFromContent(sentences, keywords) {
  for (const keyword of keywords) {
    const matching = sentences.filter(s => s.toLowerCase().includes(keyword));
    if (matching.length > 0) {
      return matching.slice(0, 2).join('. ');
    }
  }
  return null;
}

function generateFallbackAnswer(question, analysis) {
  const policyType = analysis?.detectedPolicyType || 'policy';
  const sector = analysis?.detectedSector || 'relevant';
  const riskScore = analysis?.rawAnalysis?.riskScore || 50;
  
  const qLower = question.toLowerCase();
  
  if (qLower.includes('risk') || qLower.includes('safe')) {
    return `This ${policyType} targeting ${sector} has a risk score of ${riskScore}/100. ${riskScore <= 35 ? 'It is considered low risk with manageable impacts.' : riskScore <= 65 ? 'Moderate risk - proceed with monitoring.' : 'High risk - significant modifications recommended.'}`;
  }
  
  if (qLower.includes('when') || qLower.includes('timeline')) {
    return 'The policy document does not specify exact implementation timelines. Please refer to the full document for dates and phases.';
  }
  
  if (qLower.includes('who') || qLower.includes('eligible')) {
    return 'Eligibility criteria should be detailed in the full policy document. The analysis identifies this as targeting the ' + SECTOR_LABELS[sector] + ' sector.';
  }
  
  return `This analysis is based on the ${policyType} in the ${SECTOR_LABELS[sector] || sector} sector. For specific questions about implementation details, please refer to the full policy document. The AI has identified this as a ${riskScore <= 35 ? 'low' : riskScore <= 65 ? 'moderate' : 'high'}-risk policy based on economic impact modeling.`;
}

export async function parsePDF(fileBuffer) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    logger.error('PDF parsing failed', { error: error.message });
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}