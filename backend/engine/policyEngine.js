// ============================================
// PolicySphere AI — Policy Analysis Engine
// ============================================

// ── Economic Impact Matrices ──
// Each policy type × sector gives base impact coefficients
const IMPACT_MATRICES = {
  tax: {
    fuel:          { inflation: 0.75, employment: -0.30, gdp: -0.40, fiscal: -0.65 },
    healthcare:    { inflation: 0.40, employment: -0.20, gdp: -0.15, fiscal: -0.50 },
    education:     { inflation: 0.20, employment: -0.10, gdp: -0.10, fiscal: -0.40 },
    agriculture:   { inflation: 0.65, employment: -0.45, gdp: -0.30, fiscal: -0.55 },
    technology:    { inflation: 0.30, employment: -0.15, gdp: -0.50, fiscal: -0.45 },
    manufacturing: { inflation: 0.55, employment: -0.50, gdp: -0.40, fiscal: -0.50 },
    finance:       { inflation: 0.25, employment: -0.10, gdp: -0.35, fiscal: -0.60 },
    energy:        { inflation: 0.80, employment: -0.25, gdp: -0.35, fiscal: -0.55 },
  },
  subsidy: {
    fuel:          { inflation: -0.60, employment: 0.20, gdp: 0.25, fiscal: 0.80 },
    healthcare:    { inflation: -0.25, employment: 0.45, gdp: 0.20, fiscal: 0.70 },
    education:     { inflation: -0.10, employment: 0.50, gdp: 0.40, fiscal: 0.60 },
    agriculture:   { inflation: -0.50, employment: 0.60, gdp: 0.35, fiscal: 0.75 },
    technology:    { inflation: -0.15, employment: 0.70, gdp: 0.60, fiscal: 0.50 },
    manufacturing: { inflation: -0.35, employment: 0.55, gdp: 0.40, fiscal: 0.65 },
    finance:       { inflation: -0.20, employment: 0.20, gdp: 0.30, fiscal: 0.55 },
    energy:        { inflation: -0.65, employment: 0.30, gdp: 0.30, fiscal: 0.80 },
  },
  regulation: {
    fuel:          { inflation: 0.40, employment: -0.50, gdp: -0.30, fiscal: -0.15 },
    healthcare:    { inflation: 0.30, employment: -0.15, gdp: -0.10, fiscal: -0.10 },
    education:     { inflation: 0.10, employment: -0.05, gdp: 0.10, fiscal: -0.10 },
    agriculture:   { inflation: 0.35, employment: -0.40, gdp: -0.20, fiscal: -0.15 },
    technology:    { inflation: 0.20, employment: -0.25, gdp: -0.40, fiscal: -0.10 },
    manufacturing: { inflation: 0.45, employment: -0.60, gdp: -0.35, fiscal: -0.15 },
    finance:       { inflation: 0.20, employment: -0.20, gdp: -0.25, fiscal: -0.10 },
    energy:        { inflation: 0.50, employment: -0.40, gdp: -0.30, fiscal: -0.20 },
  },
};

const SECTOR_SENSITIVITY = {
  fuel: 0.90, healthcare: 0.70, education: 0.50, agriculture: 0.80,
  technology: 0.60, manufacturing: 0.75, finance: 0.80, energy: 0.90,
};

export const SECTOR_LABELS = {
  fuel: 'Fuel & Energy', healthcare: 'Healthcare', education: 'Education',
  agriculture: 'Agriculture', technology: 'Technology', manufacturing: 'Manufacturing',
  finance: 'Finance', energy: 'Energy',
};

export const POLICY_LABELS = {
  tax: 'Tax Reform', subsidy: 'Subsidy', regulation: 'Regulation',
};

// ── Core Analysis Function ──
export function analyzePolicy(policyType, sector, magnitude, duration) {
  const base = IMPACT_MATRICES[policyType]?.[sector];
  if (!base) return null;

  const magMultiplier = magnitude / 10;
  const durMultiplier = duration === 'long' ? 1.4 : 1.0;

  const impacts = {};
  for (const key of ['inflation', 'employment', 'gdp', 'fiscal']) {
    impacts[key] = Math.max(-10, Math.min(10,
      +(base[key] * magMultiplier * durMultiplier * 10).toFixed(2)
    ));
  }

  const sensitivity = SECTOR_SENSITIVITY[sector];

  // Risk Score = weighted sum of absolute impacts + sector sensitivity
  const riskScore = Math.min(100, Math.max(0, Math.round(
    (Math.abs(impacts.inflation) * 0.3 +
     Math.abs(impacts.fiscal) * 0.3 +
     Math.abs(impacts.employment) * 0.2 +
     sensitivity * 10 * 0.2)
  )));

  return { impacts, riskScore, sensitivity, policyType, sector, magnitude, duration };
}

// ── Decision Engine ──
export function getDecision(riskScore) {
  if (riskScore <= 35) {
    return { verdict: 'proceed', label: 'Proceed with Policy', confidence: Math.round(92 - riskScore * 0.3) };
  }
  if (riskScore <= 65) {
    return { verdict: 'modify', label: 'Proceed with Modifications', confidence: Math.round(78 - (riskScore - 35) * 0.5) };
  }
  return { verdict: 'reject', label: 'High Risk – Not Recommended', confidence: Math.round(85 - (100 - riskScore) * 0.3) };
}

// ── Explainable AI Generator ──
export function generateExplanation(result) {
  const { policyType, sector, magnitude, duration, impacts, riskScore } = result;
  const sectorName = SECTOR_LABELS[sector];
  const durText = duration === 'long' ? 'long-term' : 'short-term';

  const parts = [];

  // Opening
  if (policyType === 'tax') {
    parts.push(`Implementing a ${magnitude}% tax increase in the ${sectorName} sector`);
  } else if (policyType === 'subsidy') {
    parts.push(`Introducing a ${magnitude}% subsidy in the ${sectorName} sector`);
  } else {
    parts.push(`Applying new regulatory measures (${magnitude}% impact magnitude) in the ${sectorName} sector`);
  }

  // Inflation
  if (Math.abs(impacts.inflation) > 3) {
    parts.push(impacts.inflation > 0
      ? `is projected to significantly increase inflationary pressure by approximately ${Math.abs(impacts.inflation).toFixed(1)}%`
      : `may help reduce inflation by approximately ${Math.abs(impacts.inflation).toFixed(1)}% in the ${durText}`);
  } else if (Math.abs(impacts.inflation) > 1) {
    parts.push(impacts.inflation > 0
      ? `could moderately raise inflation by ~${Math.abs(impacts.inflation).toFixed(1)}%`
      : `may slightly ease inflationary pressure`);
  }

  // Employment
  if (Math.abs(impacts.employment) > 3) {
    parts.push(impacts.employment > 0
      ? `The job market is expected to see notable growth, with employment rising by ~${Math.abs(impacts.employment).toFixed(1)}%`
      : `However, this carries a significant risk of job losses (estimated ${Math.abs(impacts.employment).toFixed(1)}% decline)`);
  } else if (Math.abs(impacts.employment) > 1) {
    parts.push(impacts.employment > 0
      ? `Employment effects are mildly positive`
      : `There may be moderate pressure on employment`);
  } else {
    parts.push(`Employment impact is expected to be minimal`);
  }

  // Fiscal
  if (Math.abs(impacts.fiscal) > 4) {
    parts.push(impacts.fiscal > 0
      ? `The fiscal deficit is projected to increase substantially (+${Math.abs(impacts.fiscal).toFixed(1)}%), raising concerns about long-term fiscal sustainability`
      : `This policy should improve fiscal balance (deficit reduction of ~${Math.abs(impacts.fiscal).toFixed(1)}%)`);
  } else if (Math.abs(impacts.fiscal) > 1.5) {
    parts.push(impacts.fiscal > 0
      ? `Fiscal deficit may widen moderately`
      : `A moderate improvement in fiscal position is expected`);
  }

  // GDP
  if (Math.abs(impacts.gdp) > 2) {
    parts.push(impacts.gdp > 0
      ? `GDP growth is projected to benefit (+${Math.abs(impacts.gdp).toFixed(1)}%)`
      : `GDP growth may contract by approximately ${Math.abs(impacts.gdp).toFixed(1)}%`);
  }

  // Conclusion
  if (riskScore >= 66) {
    parts.push(`Overall, with a risk score of ${riskScore}/100, this ${durText} policy carries high risk and is not recommended without significant modifications to mitigate adverse economic effects.`);
  } else if (riskScore >= 36) {
    parts.push(`With a moderate risk score of ${riskScore}/100, this policy can proceed but requires careful modifications and monitoring to balance the trade-offs.`);
  } else {
    parts.push(`With a low risk score of ${riskScore}/100, this policy shows favorable projections and may be implemented with standard monitoring protocols.`);
  }

  return parts.join('. ').replace(/\.\./g, '.') + '.';
}
