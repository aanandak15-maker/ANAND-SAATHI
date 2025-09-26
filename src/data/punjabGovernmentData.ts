/**
 * Punjab Government Data
 * Contains government schemes, advisories, and other data for Punjab integration
 */

export interface GovernmentScheme {
  id: string;
  name: string;
  localName: string;
  description: string;
  localDescription: string;
  category: 'financial' | 'technical' | 'insurance' | 'subsidy' | 'training';
  status: 'active' | 'upcoming' | 'closed';
  eligibility: string[];
  benefits: string[];
  applicationDeadline: string;
  amount: number;
  currency: string;
  department: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  documents: string[];
  applicationProcess: string[];
  localApplicationProcess: string[];
}

export interface CropAdvisory {
  id: string;
  title: string;
  localTitle: string;
  content: string;
  localContent: string;
  district: string;
  crop: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issuedDate: string;
  validUntil: string;
  source: string;
  recommendations: string[];
  localRecommendations: string[];
}

export interface PestAlert {
  id: string;
  pestName: string;
  localPestName: string;
  affectedCrops: string[];
  affectedDistricts: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertDate: string;
  description: string;
  localDescription: string;
  preventiveMeasures: string[];
  localPreventiveMeasures: string[];
  treatmentOptions: string[];
  localTreatmentOptions: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
}

export interface HistoricalYield {
  year: number;
  district: string;
  crop: string;
  variety: string;
  yieldAmount: number;
  unit: string;
  area: number;
  areaUnit: string;
  rainfall: number;
  temperature: number;
  source: string;
}

export const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'scheme_001',
    name: 'PM Kisan',
    localName: 'ਪੀਐਮ ਕਿਸਾਨ',
    description: 'Direct income support scheme for farmers',
    localDescription: 'ਕਿਸਾਨਾਂ ਲਈ ਸਿੱਧੀ ਆਮਦਨ ਸਹਾਇਤਾ ਯੋਜਨਾ',
    category: 'financial',
    status: 'active',
    eligibility: ['Landholding farmers', 'Small and marginal farmers'],
    benefits: ['₹6,000 per year', 'Direct bank transfer', 'No middlemen'],
    applicationDeadline: '2024-12-31',
    amount: 6000,
    currency: 'INR',
    department: 'Ministry of Agriculture',
    contactInfo: {
      phone: '+91 1800-180-1551',
      email: 'pmkisan@nic.in',
      website: 'https://pmkisan.gov.in'
    },
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
    applicationProcess: [
      'Visit PM Kisan portal',
      'Register with Aadhaar',
      'Upload documents',
      'Submit application'
    ],
    localApplicationProcess: [
      'ਪੀਐਮ ਕਿਸਾਨ ਪੋਰਟਲ ਤੇ ਜਾਓ',
      'ਆਧਾਰ ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ',
      'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ',
      'ਅਰਜ਼ੀ ਜਮ੍ਹਾ ਕਰੋ'
    ]
  },
  {
    id: 'scheme_002',
    name: 'Crop Insurance Scheme',
    localName: 'ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ',
    description: 'Comprehensive crop insurance coverage',
    localDescription: 'ਵਿਆਪਕ ਫਸਲ ਬੀਮਾ ਕਵਰੇਜ',
    category: 'insurance',
    status: 'active',
    eligibility: ['All farmers', 'Landholding farmers'],
    benefits: ['Up to 90% coverage', 'Weather-based claims', 'Quick settlement'],
    applicationDeadline: '2024-11-30',
    amount: 0,
    currency: 'INR',
    department: 'Punjab Agriculture Department',
    contactInfo: {
      phone: '+91 172-270-1234',
      email: 'cropinsurance@punjab.gov.in',
      website: 'https://agri.punjab.gov.in'
    },
    documents: ['Land Records', 'Crop Details', 'Bank Account'],
    applicationProcess: [
      'Contact local agriculture office',
      'Submit crop details',
      'Pay premium',
      'Receive policy'
    ],
    localApplicationProcess: [
      'ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਦਫਤਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
      'ਫਸਲ ਦੇ ਵੇਰਵੇ ਜਮ੍ਹਾ ਕਰੋ',
      'ਪ੍ਰੀਮੀਅਮ ਦਾ ਭੁਗਤਾਨ ਕਰੋ',
      'ਪਾਲਿਸੀ ਪ੍ਰਾਪਤ ਕਰੋ'
    ]
  },
  {
    id: 'scheme_003',
    name: 'Direct Seeding Subsidy',
    localName: 'ਡਾਇਰੈਕਟ ਸੀਡਿੰਗ ਸਬਸਿਡੀ',
    description: 'Subsidy for direct seeding of rice',
    localDescription: 'ਚੌਲਾਂ ਦੀ ਡਾਇਰੈਕਟ ਸੀਡਿੰਗ ਲਈ ਸਬਸਿਡੀ',
    category: 'subsidy',
    status: 'active',
    eligibility: ['Rice farmers', 'Minimum 1 acre'],
    benefits: ['₹1,500 per acre', 'Water saving', 'Labor reduction'],
    applicationDeadline: '2024-10-15',
    amount: 1500,
    currency: 'INR',
    department: 'Punjab Agriculture Department',
    contactInfo: {
      phone: '+91 172-270-1234',
      email: 'subsidy@punjab.gov.in',
      website: 'https://agri.punjab.gov.in'
    },
    documents: ['Land Records', 'Crop Plan', 'Bank Account'],
    applicationProcess: [
      'Submit application form',
      'Field verification',
      'Approval',
      'Subsidy disbursement'
    ],
    localApplicationProcess: [
      'ਅਰਜ਼ੀ ਫਾਰਮ ਜਮ੍ਹਾ ਕਰੋ',
      'ਖੇਤ ਸਰਟੀਫਿਕੇਸ਼ਨ',
      'ਅਪ੍ਰੂਵਲ',
      'ਸਬਸਿਡੀ ਵਿਤਰਣ'
    ]
  }
];

export const cropAdvisories: CropAdvisory[] = [
  {
    id: 'advisory_001',
    title: 'Water Management for Rice',
    localTitle: 'ਚੌਲਾਂ ਲਈ ਪਾਣੀ ਪ੍ਰਬੰਧਨ',
    content: 'Proper water management is crucial for rice cultivation during this season.',
    localContent: 'ਇਸ ਮੌਸਮ ਦੌਰਾਨ ਚੌਲਾਂ ਦੀ ਖੇਤੀ ਲਈ ਉਚਿਤ ਪਾਣੀ ਪ੍ਰਬੰਧਨ ਜ਼ਰੂਰੀ ਹੈ।',
    district: 'ludhiana',
    crop: 'rice',
    severity: 'high',
    issuedDate: '2024-01-15',
    validUntil: '2024-02-15',
    source: 'Punjab Agriculture Department',
    recommendations: [
      'Maintain 2-3 cm water depth',
      'Avoid waterlogging',
      'Monitor soil moisture'
    ],
    localRecommendations: [
      '2-3 ਸੈਂਟੀਮੀਟਰ ਪਾਣੀ ਦੀ ਡੂੰਘਾਈ ਬਣਾਈ ਰੱਖੋ',
      'ਪਾਣੀ ਭਰਾਵ ਤੋਂ ਬਚੋ',
      'ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ'
    ]
  }
];

export const pestAlerts: PestAlert[] = [
  {
    id: 'pest_001',
    pestName: 'Brown Plant Hopper',
    localPestName: 'ਬ੍ਰਾਊਨ ਪਲਾਂਟ ਹੌਪਰ',
    affectedCrops: ['rice'],
    affectedDistricts: ['ludhiana', 'patiala', 'sangrur'],
    severity: 'high',
    alertDate: '2024-01-14',
    description: 'High activity of brown plant hopper detected in rice fields.',
    localDescription: 'ਚੌਲਾਂ ਦੇ ਖੇਤਾਂ ਵਿੱਚ ਬ੍ਰਾਊਨ ਪਲਾਂਟ ਹੌਪਰ ਦੀ ਉੱਚ ਗਤਿਵਿਧੀ ਦੇਖੀ ਗਈ।',
    preventiveMeasures: [
      'Use resistant varieties',
      'Avoid excessive nitrogen',
      'Maintain proper water level'
    ],
    localPreventiveMeasures: [
      'ਰੋਧਕ ਕਿਸਮਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ',
      'ਅਧਿਕ ਨਾਈਟ੍ਰੋਜਨ ਤੋਂ ਬਚੋ',
      'ਉਚਿਤ ਪਾਣੀ ਦਾ ਪੱਧਰ ਬਣਾਈ ਰੱਖੋ'
    ],
    treatmentOptions: [
      'Spray imidacloprid',
      'Use neem oil',
      'Biological control'
    ],
    localTreatmentOptions: [
      'ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ ਦਾ ਸਪਰੇ ਕਰੋ',
      'ਨੀਮ ਦੇ ਤੇਲ ਦੀ ਵਰਤੋਂ ਕਰੋ',
      'ਜੈਵਿਕ ਨਿਯੰਤਰਣ'
    ],
    contactInfo: {
      phone: '+91 172-270-1234',
      email: 'pestwarning@punjab.gov.in'
    }
  }
];

export const historicalYields: HistoricalYield[] = [
  {
    year: 2023,
    district: 'ludhiana',
    crop: 'rice',
    variety: 'PR-126',
    yieldAmount: 30.5,
    unit: 'quintals/acre',
    area: 125000,
    areaUnit: 'acres',
    rainfall: 650,
    temperature: 28.5,
    source: 'Punjab Agriculture Department'
  },
  {
    year: 2022,
    district: 'ludhiana',
    crop: 'rice',
    variety: 'PR-126',
    yieldAmount: 29.8,
    unit: 'quintals/acre',
    area: 120000,
    areaUnit: 'acres',
    rainfall: 580,
    temperature: 29.2,
    source: 'Punjab Agriculture Department'
  }
];
