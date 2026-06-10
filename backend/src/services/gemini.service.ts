import prisma from '../config/prisma';

function ruleBasedRecommend(symptoms: string, specialties: { name: string }[]): { department: string; confidence: number; reason: string } {
  const query = symptoms.toLowerCase();
  const specNames = specialties.map((s) => s.name);
  
  if (query.includes('heart') || query.includes('chest') || query.includes('breath') || query.includes('cardio') || query.includes('valve') || query.includes('pressure')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('cardio')) || 'Cardiologist';
    return {
      department: dep,
      confidence: 85,
      reason: 'Symptoms of chest discomfort, heart issues, or breathlessness are matched with the Cardiology department.'
    };
  }
  if (query.includes('child') || query.includes('baby') || query.includes('kid') || query.includes('pediatr') || query.includes('infant') || query.includes('boy') || query.includes('girl')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('pediatr')) || 'Pediatrician';
    return {
      department: dep,
      confidence: 85,
      reason: 'Pediatric department is recommended for symptoms in babies, children, and infants.'
    };
  }
  if (query.includes('skin') || query.includes('rash') || query.includes('acne') || query.includes('itching') || query.includes('dermat') || query.includes('pimple') || query.includes('eczema')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('dermat')) || 'Dermatologist';
    return {
      department: dep,
      confidence: 85,
      reason: 'Skin conditions, rashes, or acne are best evaluated by a Dermatologist.'
    };
  }
  if (query.includes('brain') || query.includes('nerve') || query.includes('headache') || query.includes('seizure') || query.includes('dizzy') || query.includes('migraine') || query.includes('paraly')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('neuro')) || 'Neurologist';
    return {
      department: dep,
      confidence: 80,
      reason: 'Brain, nerve-related conditions, or chronic headaches match the Neurology department.'
    };
  }
  if (query.includes('preg') || query.includes('women') || query.includes('gynae') || query.includes('period') || query.includes('uterus') || query.includes('vagina') || query.includes('obstetric')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('gyneco')) || 'Gynecologist';
    return {
      department: dep,
      confidence: 85,
      reason: 'Pregnancy, menstruation, or female reproductive health symptoms are referred to Gynecology.'
    };
  }
  if (query.includes('bone') || query.includes('joint') || query.includes('fracture') || query.includes('ortho') || query.includes('back pain') || query.includes('knee') || query.includes('sprain') || query.includes('muscle')) {
    const dep = specNames.find((s) => s.toLowerCase().includes('ortho')) || 'Orthopedic';
    return {
      department: dep,
      confidence: 80,
      reason: 'Joint, bone, or muscle injury complaints match the Orthopedics department.'
    };
  }
  
  // Default fallback
  return {
    department: specNames[0] || 'Cardiologist',
    confidence: 60,
    reason: 'Evaluating general symptoms, Cardiology / Internal Medicine is recommended as a starting point.'
  };
}

export class GeminiService {
  static async recommendDepartment(symptoms: string): Promise<{ department: string; confidence: number; reason: string }> {
    // 1. Get specialties dynamically from DB
    const specialties = await prisma.specialty.findMany({
      select: { name: true },
    });
    const specialtyNames = specialties.map((s) => s.name);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY is not set. Using rule-based fallback recommendation.');
      return ruleBasedRecommend(symptoms, specialties);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = `You are a medical triage assistant. You will analyze the patient symptom description and recommend the single most relevant medical department from the provided list.
You MUST choose one of the exact specialty/department names from this list:
${specialtyNames.map((name) => `- "${name}"`).join('\n')}

Format your response as a valid raw JSON object only. Do NOT wrap it in markdown block tags like \`\`\`json.
The JSON structure MUST match this exactly:
{
  "department": "exact name from the list provided",
  "confidence": 0-100 (an integer score),
  "reason": "a concise one-sentence explanation of why this specialty is recommended based on the patient symptoms."
}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this symptom description: "${symptoms}"`
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini API call failed:', errText);
        throw new Error('Gemini API request failed');
      }

      const resJson = (await response.json()) as any;
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const result = JSON.parse(text);
      
      // Post-process to ensure the department matches one of the exact DB names
      const matched = specialtyNames.find(
        (name) => name.toLowerCase() === result.department?.toLowerCase()
      );

      if (matched) {
        return {
          department: matched,
          confidence: result.confidence ?? 80,
          reason: result.reason ?? `Evaluation by a ${matched} is recommended.`
        };
      } else {
        // Fallback to fuzzy match or just return closest matching DB name
        const partialMatched = specialtyNames.find(
          (name) => symptoms.toLowerCase().includes(name.toLowerCase()) || result.department?.toLowerCase().includes(name.toLowerCase())
        );
        if (partialMatched) {
          return {
            department: partialMatched,
            confidence: result.confidence ?? 80,
            reason: result.reason ?? `Evaluation by a ${partialMatched} is recommended.`
          };
        }
      }
      
      throw new Error(`Gemini suggested department "${result.department}" which is not in our active specialty list.`);

    } catch (error: any) {
      console.error('Error in Gemini recommendation, falling back:', error.message);
      return ruleBasedRecommend(symptoms, specialties);
    }
  }
}
