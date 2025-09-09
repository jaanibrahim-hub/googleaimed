import { MedicalSpecialty, UserPreferences } from '../types';

// Comprehensive medical specialties with detailed information
export const medicalSpecialties: MedicalSpecialty[] = [
  {
    id: 'general',
    name: 'General Medicine',
    icon: 'fas fa-user-md',
    description: 'Comprehensive primary care and general health concerns',
    color: '#2E7D95',
    keywords: [
      'checkup', 'prevention', 'wellness', 'primary care', 'screening',
      'general health', 'lifestyle', 'nutrition', 'exercise', 'stress'
    ],
    commonConditions: [
      'Annual physical exam', 'Preventive care', 'Health screening',
      'Lifestyle counseling', 'Basic health concerns', 'Wellness checks'
    ],
    quickActions: [
      'Understand my symptoms',
      'Explain prevention strategies',
      'Review my health screening results'
    ]
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: 'fas fa-heartbeat',
    description: 'Heart and cardiovascular system conditions',
    color: '#E74C3C',
    keywords: [
      'heart', 'cardiac', 'cardiovascular', 'blood pressure', 'hypertension',
      'chest pain', 'arrhythmia', 'heart attack', 'coronary', 'cholesterol',
      'ecg', 'ekg', 'stress test', 'angiogram', 'pacemaker'
    ],
    commonConditions: [
      'High blood pressure', 'Heart disease', 'Chest pain', 'Arrhythmia',
      'Heart attack', 'Heart failure', 'Coronary artery disease', 'Cholesterol'
    ],
    quickActions: [
      'Explain my ECG results',
      'Understand blood pressure readings',
      'Learn about heart medications'
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: 'fas fa-brain',
    description: 'Brain, nervous system, and neurological disorders',
    color: '#9B59B6',
    keywords: [
      'brain', 'neurological', 'headache', 'migraine', 'seizure', 'stroke',
      'memory', 'dementia', 'alzheimer', 'parkinson', 'epilepsy', 'neuropathy',
      'mri brain', 'ct brain', 'eeg', 'lumbar puncture', 'nerve conduction'
    ],
    commonConditions: [
      'Headaches and migraines', 'Stroke', 'Epilepsy', 'Memory problems',
      'Neuropathy', 'Parkinson\'s disease', 'Multiple sclerosis', 'Seizures'
    ],
    quickActions: [
      'Explain my brain MRI',
      'Understand seizure triggers',
      'Learn about memory symptoms'
    ]
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    icon: 'fas fa-dna',
    description: 'Hormones, diabetes, thyroid, and metabolic disorders',
    color: '#F39C12',
    keywords: [
      'diabetes', 'thyroid', 'hormone', 'insulin', 'blood sugar', 'glucose',
      'metabolism', 'endocrine', 'hba1c', 'tsh', 't3', 't4', 'cortisol',
      'growth hormone', 'testosterone', 'estrogen', 'adrenal', 'pituitary'
    ],
    commonConditions: [
      'Diabetes (Type 1 & 2)', 'Thyroid disorders', 'Hormone imbalances',
      'Metabolic syndrome', 'Adrenal disorders', 'Pituitary disorders'
    ],
    quickActions: [
      'Explain my diabetes lab results',
      'Understand thyroid function tests',
      'Learn about hormone levels'
    ]
  },
  {
    id: 'oncology',
    name: 'Oncology',
    icon: 'fas fa-ribbon',
    description: 'Cancer diagnosis, treatment, and care',
    color: '#E91E63',
    keywords: [
      'cancer', 'tumor', 'oncology', 'chemotherapy', 'radiation', 'biopsy',
      'malignant', 'benign', 'metastasis', 'staging', 'immunotherapy',
      'pet scan', 'ct scan', 'bone scan', 'tumor markers', 'lymph nodes'
    ],
    commonConditions: [
      'Cancer diagnosis', 'Tumor evaluation', 'Treatment planning',
      'Side effect management', 'Follow-up care', 'Screening results'
    ],
    quickActions: [
      'Understand my biopsy results',
      'Explain treatment options',
      'Learn about side effects'
    ]
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: 'fas fa-bone',
    description: 'Bones, joints, muscles, and musculoskeletal system',
    color: '#795548',
    keywords: [
      'bone', 'joint', 'orthopedic', 'fracture', 'arthritis', 'back pain',
      'knee pain', 'shoulder', 'hip', 'spine', 'muscle', 'ligament',
      'x-ray', 'mri joint', 'ct bone', 'physical therapy', 'surgery'
    ],
    commonConditions: [
      'Arthritis', 'Fractures', 'Back pain', 'Joint pain', 'Sports injuries',
      'Osteoporosis', 'Muscle strains', 'Ligament injuries'
    ],
    quickActions: [
      'Explain my X-ray results',
      'Understand joint problems',
      'Learn about physical therapy'
    ]
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    icon: 'fas fa-stomach',
    description: 'Digestive system, stomach, liver, and intestinal health',
    color: '#FF7043',
    keywords: [
      'stomach', 'digestive', 'gastro', 'liver', 'intestine', 'colon',
      'endoscopy', 'colonoscopy', 'reflux', 'ulcer', 'ibs', 'crohns',
      'hepatitis', 'cirrhosis', 'gallbladder', 'pancreas', 'biopsy liver'
    ],
    commonConditions: [
      'GERD/Acid reflux', 'IBS', 'Inflammatory bowel disease', 'Liver disease',
      'Gallbladder problems', 'Pancreatic disorders', 'Ulcers', 'Colon polyps'
    ],
    quickActions: [
      'Explain my endoscopy results',
      'Understand digestive symptoms',
      'Learn about liver function tests'
    ]
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    icon: 'fas fa-lungs',
    description: 'Lungs, respiratory system, and breathing disorders',
    color: '#00BCD4',
    keywords: [
      'lung', 'respiratory', 'breathing', 'asthma', 'copd', 'pneumonia',
      'chest x-ray', 'ct chest', 'pulmonary function', 'oxygen', 'ventilator',
      'bronchoscopy', 'sleep apnea', 'tuberculosis', 'emphysema', 'bronchitis'
    ],
    commonConditions: [
      'Asthma', 'COPD', 'Pneumonia', 'Sleep apnea', 'Lung cancer',
      'Pulmonary embolism', 'Tuberculosis', 'Respiratory infections'
    ],
    quickActions: [
      'Explain my chest X-ray',
      'Understand breathing tests',
      'Learn about asthma management'
    ]
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: 'fas fa-hand-paper',
    description: 'Skin, hair, nails, and related conditions',
    color: '#FFC107',
    keywords: [
      'skin', 'dermatology', 'rash', 'mole', 'acne', 'eczema', 'psoriasis',
      'melanoma', 'biopsy skin', 'hair loss', 'nail problems', 'allergy',
      'sun damage', 'wrinkles', 'dermatitis', 'fungal infection'
    ],
    commonConditions: [
      'Skin cancer', 'Acne', 'Eczema', 'Psoriasis', 'Rashes',
      'Mole evaluation', 'Hair loss', 'Fungal infections'
    ],
    quickActions: [
      'Understand my skin biopsy',
      'Explain mole changes',
      'Learn about skin treatments'
    ]
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry & Mental Health',
    icon: 'fas fa-mind-share',
    description: 'Mental health, emotional well-being, and psychiatric conditions',
    color: '#673AB7',
    keywords: [
      'mental health', 'depression', 'anxiety', 'psychiatric', 'therapy',
      'medication', 'bipolar', 'schizophrenia', 'adhd', 'ptsd', 'ocd',
      'stress', 'counseling', 'psychotherapy', 'antidepressant', 'mood'
    ],
    commonConditions: [
      'Depression', 'Anxiety disorders', 'Bipolar disorder', 'ADHD', 'PTSD',
      'OCD', 'Panic attacks', 'Eating disorders'
    ],
    quickActions: [
      'Understand mental health symptoms',
      'Learn about therapy options',
      'Explain psychiatric medications'
    ]
  },
  {
    id: 'gynecology',
    name: 'Gynecology & Women\'s Health',
    icon: 'fas fa-female',
    description: 'Women\'s reproductive health and gynecological conditions',
    color: '#E91E63',
    keywords: [
      'gynecology', 'womens health', 'menstrual', 'pregnancy', 'pap smear',
      'mammogram', 'ovarian', 'uterine', 'cervical', 'breast', 'fertility',
      'menopause', 'hormones', 'contraception', 'pcos', 'endometriosis'
    ],
    commonConditions: [
      'Menstrual irregularities', 'PCOS', 'Endometriosis', 'Fibroids',
      'Breast health', 'Cervical screening', 'Menopause', 'Fertility issues'
    ],
    quickActions: [
      'Explain my Pap smear results',
      'Understand hormone levels',
      'Learn about reproductive health'
    ]
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: 'fas fa-baby',
    description: 'Children\'s health, development, and pediatric conditions',
    color: '#4CAF50',
    keywords: [
      'pediatric', 'children', 'baby', 'infant', 'child development',
      'vaccination', 'growth chart', 'fever', 'pediatric surgery',
      'developmental delays', 'autism', 'allergies', 'ear infection'
    ],
    commonConditions: [
      'Childhood infections', 'Growth and development', 'Vaccination schedules',
      'Allergies', 'Developmental disorders', 'Pediatric emergencies'
    ],
    quickActions: [
      'Understand growth charts',
      'Explain vaccination schedules',
      'Learn about child development'
    ]
  }
];

// User preferences management
const PREFERENCES_KEY = 'mediteach-user-preferences';

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  
  private constructor() {}
  
  static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  // Get current user preferences
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(PREFERENCES_KEY);
      if (data) {
        const preferences = JSON.parse(data);
        return {
          selectedSpecialty: preferences.selectedSpecialty || null,
          responseComplexity: preferences.responseComplexity || 'intermediate',
          visualPreference: preferences.visualPreference !== false, // Default true
          language: preferences.language || 'en',
          autoSave: preferences.autoSave !== false // Default true
        };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }

    // Return default preferences
    return {
      selectedSpecialty: null,
      responseComplexity: 'intermediate',
      visualPreference: true,
      language: 'en',
      autoSave: true
    };
  }

  // Save user preferences
  savePreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      console.log('👤 User preferences saved:', updated);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  // Get selected specialty details
  getSelectedSpecialty(): MedicalSpecialty | null {
    const preferences = this.getPreferences();
    if (!preferences.selectedSpecialty) return null;
    
    return medicalSpecialties.find(s => s.id === preferences.selectedSpecialty) || null;
  }

  // Set selected specialty
  setSelectedSpecialty(specialtyId: string | null): void {
    this.savePreferences({ selectedSpecialty: specialtyId });
  }

  // Get specialty by ID
  getSpecialtyById(id: string): MedicalSpecialty | null {
    return medicalSpecialties.find(s => s.id === id) || null;
  }

  // Get all specialties
  getAllSpecialties(): MedicalSpecialty[] {
    return medicalSpecialties;
  }

  // Detect specialty from text content
  detectSpecialtyFromText(text: string): MedicalSpecialty[] {
    const normalizedText = text.toLowerCase();
    const detectedSpecialties: { specialty: MedicalSpecialty; score: number }[] = [];

    medicalSpecialties.forEach(specialty => {
      let score = 0;
      
      // Check for keyword matches
      specialty.keywords.forEach(keyword => {
        if (normalizedText.includes(keyword.toLowerCase())) {
          score += 2; // Keywords have higher weight
        }
      });

      // Check for condition matches
      specialty.commonConditions.forEach(condition => {
        if (normalizedText.includes(condition.toLowerCase())) {
          score += 1;
        }
      });

      if (score > 0) {
        detectedSpecialties.push({ specialty, score });
      }
    });

    // Sort by score and return top matches
    return detectedSpecialties
      .sort((a, b) => b.score - a.score)
      .map(item => item.specialty);
  }

  // Generate specialty-specific prompt enhancement
  generateSpecialtyPrompt(specialtyId: string | null, userQuery: string): string {
    if (!specialtyId) return '';

    const specialty = this.getSpecialtyById(specialtyId);
    if (!specialty) return '';

    const preferences = this.getPreferences();
    
    let promptEnhancement = `\n\n**MEDICAL SPECIALTY CONTEXT: ${specialty.name.toUpperCase()}**\n`;
    
    promptEnhancement += `As a ${specialty.name} specialist, provide responses that are:\n`;
    promptEnhancement += `- Focused on ${specialty.description.toLowerCase()}\n`;
    promptEnhancement += `- Appropriate for ${preferences.responseComplexity} complexity level\n`;
    
    if (preferences.visualPreference) {
      promptEnhancement += `- Enhanced with specialty-specific visual explanations\n`;
    }

    promptEnhancement += `- Relevant to conditions like: ${specialty.commonConditions.slice(0, 4).join(', ')}\n`;
    
    // Add specialty-specific guidance
    switch (specialtyId) {
      case 'cardiology':
        promptEnhancement += `- Include cardiovascular risk factors and lifestyle modifications\n`;
        promptEnhancement += `- Explain cardiac tests and procedures in patient-friendly terms\n`;
        break;
      case 'neurology':
        promptEnhancement += `- Focus on neurological symptoms and their significance\n`;
        promptEnhancement += `- Explain complex brain/nerve functions clearly\n`;
        break;
      case 'oncology':
        promptEnhancement += `- Provide hopeful yet realistic cancer information\n`;
        promptEnhancement += `- Emphasize treatment options and support resources\n`;
        break;
      case 'endocrinology':
        promptEnhancement += `- Focus on hormone balance and metabolic health\n`;
        promptEnhancement += `- Explain lab values and their clinical significance\n`;
        break;
      case 'pediatrics':
        promptEnhancement += `- Use age-appropriate explanations for children/parents\n`;
        promptEnhancement += `- Focus on growth, development, and family concerns\n`;
        break;
    }

    promptEnhancement += `\n**VISUAL REQUIREMENTS**: Create ${specialty.name}-specific medical illustrations using the specialty color theme (${specialty.color}).`;
    
    return promptEnhancement;
  }

  // Get quick actions for a specialty
  getQuickActionsForSpecialty(specialtyId: string | null): string[] {
    if (!specialtyId) {
      return [
        'Explain my symptoms',
        'Understand my diagnosis', 
        'Learn about treatment options'
      ];
    }

    const specialty = this.getSpecialtyById(specialtyId);
    return specialty ? specialty.quickActions : [];
  }

  // Clear all preferences
  clearPreferences(): void {
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      console.log('🧹 User preferences cleared');
    } catch (error) {
      console.error('Failed to clear user preferences:', error);
    }
  }
}

// Export singleton instance
export const userPreferencesService = UserPreferencesService.getInstance();