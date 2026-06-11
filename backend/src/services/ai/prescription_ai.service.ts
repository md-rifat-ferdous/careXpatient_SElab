export interface MedicineSuggestion {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence: number;
  reasoning: string;
}

export class PrescriptionAIService {
  private static SUGGESTION_MAP: Record<string, MedicineSuggestion[]> = {
    'Hypertension': [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', confidence: 0.95, reasoning: 'First-line treatment for stage 1 hypertension.' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', confidence: 0.88, reasoning: 'Effective ACE inhibitor for blood pressure control.' }
    ],
    'Diabetes Type 2': [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days', confidence: 0.98, reasoning: 'Standard initial therapy for T2D management.' }
    ],
    'Common Cold': [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3 days', confidence: 0.92, reasoning: 'Relieves fever and mild body aches.' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily (Night)', duration: '5 days', confidence: 0.85, reasoning: 'Antihistamine to manage nasal congestion.' }
    ]
  };

  static async getSuggestions(diagnosis: string): Promise<MedicineSuggestion[]> {
    console.log(`[AI] Analyzing diagnosis: ${diagnosis}`);
    // Simulate network delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Match keywords if exact match fails
    const key = Object.keys(this.SUGGESTION_MAP).find(k => 
      diagnosis.toLowerCase().includes(k.toLowerCase())
    );

    return key ? this.SUGGESTION_MAP[key] : [];
  }

  static async analyzeDrugInteraction(medicines: string[]): Promise<{ safe: boolean; warning?: string }> {
    // Mock drug-drug interaction check
    if (medicines.includes('Warfarin') && medicines.includes('Aspirin')) {
      return { safe: false, warning: 'Increased risk of bleeding detected between Warfarin and Aspirin.' };
    }
    return { safe: true };
  }
}
