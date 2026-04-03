// ============================================
// PolicySphere AI — Policy Templates
// ============================================

export const POLICY_TEMPLATES = [
  {
    id: 'carbon-tax',
    name: 'Carbon Tax Implementation',
    description: 'Simulate carbon pricing to reduce emissions',
    icon: '🌱',
    policyType: 'tax',
    sector: 'energy',
    magnitude: 15,
    duration: 'long',
    tags: ['environment', 'climate', 'emissions'],
    scenario: {
      description: 'Implement a carbon tax of $50/ton on fossil fuel emissions to encourage clean energy adoption and reduce carbon footprint.',
      expectedOutcomes: [
        'Reduced carbon emissions over time',
        'Increased investment in renewable energy',
        'Higher energy costs initially',
        'Revenue can fund green initiatives'
      ],
      risks: [
        'Potential increase in energy costs for consumers',
        'Industry competitiveness concerns',
        'Need for complementary policies'
      ]
    }
  },
  {
    id: 'tech-subsidy',
    name: 'Technology R&D Subsidy',
    description: 'Government incentives for tech innovation',
    icon: '💻',
    policyType: 'subsidy',
    sector: 'technology',
    magnitude: 20,
    duration: 'long',
    tags: ['innovation', 'research', 'jobs'],
    scenario: {
      description: 'Provide 25% tax credit for R&D spending by technology companies to foster innovation and create high-paying jobs.',
      expectedOutcomes: [
        'Increased R&D investment',
        'Job creation in tech sector',
        'Higher productivity growth',
        'Better competitiveness'
      ],
      risks: [
        'Cost to government treasury',
        'May benefit large companies more',
        'Need for skilled workforce'
      ]
    }
  },
  {
    id: 'healthcare-reform',
    name: 'Healthcare Regulation',
    description: 'Healthcare policy reform analysis',
    icon: '🏥',
    policyType: 'regulation',
    sector: 'healthcare',
    magnitude: 18,
    duration: 'long',
    tags: ['health', 'access', 'insurance'],
    scenario: {
      description: 'Implement universal healthcare coverage requirements with mandated insurance participation.',
      expectedOutcomes: [
        'Improved healthcare access',
        'Reduced medical bankruptcy',
        'Stable insurance markets',
        'Better public health outcomes'
      ],
      risks: [
        'Higher taxes or premiums',
        'Provider reimbursement challenges',
        'Implementation complexity'
      ]
    }
  },
  {
    id: 'agriculture-subsidy',
    name: 'Farm Subsidy Program',
    description: 'Support for agricultural sector',
    icon: '🌾',
    policyType: 'subsidy',
    sector: 'agriculture',
    magnitude: 12,
    duration: 'short',
    tags: ['farmers', 'food', 'rural'],
    scenario: {
      description: 'Provide direct payments to small and medium farmers to stabilize food production and support rural communities.',
      expectedOutcomes: [
        'Stable food supply',
        'Support for small farms',
        'Rural economic development',
        'Food security'
      ],
      risks: [
        'Market distortion',
        'Budget cost',
        'Dependency on subsidies'
      ]
    }
  },
  {
    id: 'minimum-wage',
    name: 'Minimum Wage Increase',
    description: 'Labor market regulation analysis',
    icon: '💼',
    policyType: 'regulation',
    sector: 'manufacturing',
    magnitude: 10,
    duration: 'short',
    tags: ['labor', 'wages', 'workers'],
    scenario: {
      description: 'Increase minimum wage by 15% to reduce poverty and improve worker welfare.',
      expectedOutcomes: [
        'Higher wages for low-income workers',
        'Reduced poverty rate',
        'Increased consumer spending',
        'Better worker retention'
      ],
      risks: [
        'Potential job losses',
        'Increased automation',
        'Higher costs for businesses'
      ]
    }
  },
  {
    id: 'green-energy-tax',
    name: 'Green Energy Tax Credit',
    description: 'Tax incentives for renewable energy',
    icon: '☀️',
    policyType: 'tax',
    sector: 'fuel',
    magnitude: 8,
    duration: 'long',
    tags: ['renewable', 'clean-energy', 'investment'],
    scenario: {
      description: 'Offer tax credits for residential and commercial solar panel installations.',
      expectedOutcomes: [
        'Increased solar adoption',
        'Reduced grid pressure',
        'Lower electricity bills long-term',
        'Job creation in solar industry'
      ],
      risks: [
        'Upfront government cost',
        'Installation quality concerns',
        'Grid integration challenges'
      ]
    }
  },
  {
    id: 'education-reform',
    name: 'Education Investment',
    description: 'Funding for education sector',
    icon: '📚',
    policyType: 'subsidy',
    sector: 'education',
    magnitude: 15,
    duration: 'long',
    tags: ['schools', 'students', 'future'],
    scenario: {
      description: 'Increase government funding for K-12 education by 15% to improve school infrastructure and teacher salaries.',
      expectedOutcomes: [
        'Better educational outcomes',
        'Improved teacher quality',
        'Reduced achievement gap',
        'Higher graduation rates'
      ],
      risks: [
        'Significant budget allocation',
        'Bureaucratic inefficiency',
        'Teacher shortages remain'
      ]
    }
  },
  {
    id: 'financial-reg',
    name: 'Financial Sector Regulation',
    description: 'Banking and finance oversight',
    icon: '🏦',
    policyType: 'regulation',
    sector: 'finance',
    magnitude: 14,
    duration: 'long',
    tags: ['banks', 'stability', 'consumer'],
    scenario: {
      description: 'Implement stricter capital requirements and consumer protection rules for financial institutions.',
      expectedOutcomes: [
        'More stable financial system',
        'Better consumer protection',
        'Reduced risky lending',
        'Fewer bank failures'
      ],
      risks: [
        'Reduced lending activity',
        'Higher compliance costs',
        'Competitiveness vs other markets'
      ]
    }
  }
];

export function getTemplatesByCategory(category) {
  return POLICY_TEMPLATES.filter(t => t.tags.includes(category));
}

export function getTemplateById(id) {
  return POLICY_TEMPLATES.find(t => t.id === id);
}

export function searchTemplates(query) {
  const q = query.toLowerCase();
  return POLICY_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q))
  );
}

export const TEMPLATE_CATEGORIES = [
  { id: 'environment', label: 'Environment & Climate', icon: '🌱' },
  { id: 'technology', label: 'Technology & Innovation', icon: '💻' },
  { id: 'health', label: 'Healthcare', icon: '🏥' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'labor', label: 'Labor & Employment', icon: '💼' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { id: 'energy', label: 'Energy', icon: '⚡' }
];