import { analyzePolicy, getDecision, generateExplanation } from '../engine/policyEngine.js';
import { analyzeDocumentContent, answerQuestion } from '../engine/documentAnalyzer.js';
import { POLICY_TEMPLATES, getTemplateById, searchTemplates } from '../engine/policyTemplates.js';

describe('Policy Engine Tests', () => {
  
  test('analyzePolicy should return valid results for tax/fuel', () => {
    const result = analyzePolicy('tax', 'fuel', 10, 'short');
    
    expect(result).toBeDefined();
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.impacts).toBeDefined();
    expect(result.impacts.inflation).toBeDefined();
  });

  test('getDecision should return correct verdict based on risk', () => {
    const lowRisk = getDecision(25);
    expect(lowRisk.verdict).toBe('proceed');
    
    const mediumRisk = getDecision(50);
    expect(mediumRisk.verdict).toBe('modify');
    
    const highRisk = getDecision(80);
    expect(highRisk.verdict).toBe('reject');
  });

  test('generateExplanation should produce readable text', () => {
    const result = analyzePolicy('subsidy', 'technology', 15, 'long');
    const explanation = generateExplanation(result);
    
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(50);
  });

  test('analyzePolicy should handle all policy types', () => {
    const sectors = ['fuel', 'healthcare', 'education', 'agriculture', 'technology', 'manufacturing', 'finance', 'energy'];
    const types = ['tax', 'subsidy', 'regulation'];
    
    for (const type of types) {
      for (const sector of sectors) {
        const result = analyzePolicy(type, sector, 10, 'short');
        expect(result).toBeDefined();
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('analyzePolicy should respect magnitude bounds', () => {
    const lowMag = analyzePolicy('tax', 'fuel', 1, 'short');
    const highMag = analyzePolicy('tax', 'fuel', 25, 'short');
    
    expect(lowMag.riskScore).toBeGreaterThanOrEqual(0);
    expect(highMag.riskScore).toBeLessThanOrEqual(100);
  });

  test('long duration should have higher impact', () => {
    const short = analyzePolicy('tax', 'fuel', 10, 'short');
    const long = analyzePolicy('tax', 'fuel', 10, 'long');
    
    expect(Math.abs(long.impacts.inflation)).toBeGreaterThan(Math.abs(short.impacts.inflation));
  });
});

describe('Document Analyzer Tests', () => {
  test('analyzeDocumentContent should detect policy type', async () => {
    const result = await analyzeDocumentContent(
      'This tax reform will increase taxes on the healthcare sector by 15%.',
      'text'
    );
    
    expect(result.detectedPolicyType).toBe('tax');
    expect(result.detectedSector).toBe('healthcare');
  });

  test('analyzeDocumentContent should generate coverage', async () => {
    const result = await analyzeDocumentContent(
      'This policy affects employment and changes tax rates for the energy sector.',
      'text'
    );
    
    expect(result.coverage).toBeDefined();
    expect(result.coverage.covers).toBeDefined();
    expect(result.coverage.doesNotCover).toBeDefined();
  });

  test('answerQuestion should handle risk questions', () => {
    const answer = answerQuestion(
      'What are the risks of this policy?',
      '',
      { detectedPolicyType: 'tax', detectedSector: 'fuel', rawAnalysis: { riskScore: 75, impacts: { inflation: 3, fiscal: 4, employment: -2, gdp: -1 } } }
    );
    
    expect(typeof answer).toBe('string');
    expect(answer.length).toBeGreaterThan(10);
  });
});

describe('Policy Templates Tests', () => {
  test('should have required templates', () => {
    expect(POLICY_TEMPLATES.length).toBeGreaterThan(0);
    expect(POLICY_TEMPLATES[0]).toHaveProperty('id');
    expect(POLICY_TEMPLATES[0]).toHaveProperty('name');
    expect(POLICY_TEMPLATES[0]).toHaveProperty('policyType');
    expect(POLICY_TEMPLATES[0]).toHaveProperty('sector');
  });

  test('getTemplateById should return correct template', () => {
    const template = getTemplateById('carbon-tax');
    expect(template).toBeDefined();
    expect(template.name).toBe('Carbon Tax Implementation');
  });

  test('searchTemplates should work', () => {
    const results = searchTemplates('carbon');
    expect(results.length).toBeGreaterThan(0);
  });
});