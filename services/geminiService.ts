import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI;

export const initializeAi = (apiKey: string) => {
    ai = new GoogleGenAI({ apiKey });
};


export interface MedicalExplanation {
    textExplanation: string;
    generatedImageUrl: string | null;
    newCharacterDescription: string | null;
    suggestions: string[] | null;
}

export const generateMedicalExplanation = async (
    prompt: string, 
    images?: { base64: string; mimeType: string }[],
    characterDescription?: string | null,
    conversationHistory?: string[]
): Promise<MedicalExplanation> => {
    if (!ai) {
        throw new Error("AI Service not initialized. Please provide a valid API key on the landing page.");
    }
    try {
        let systemInstruction = `You are MediTeach AI, the world's first conversational medical education assistant powered by Gemini 2.5 Flash Image. You represent a breakthrough in healthcare communication, transforming complex medical information into compassionate, visual understanding.

**CORE INNOVATION (Showcase These Unique Capabilities):**
- Multi-image fusion: Seamlessly blend patient photos, medical scans, and educational diagrams
- Conversational refinement: Build understanding through natural dialogue progression  
- Character consistency: Maintain patient avatar throughout entire medical journey
- World knowledge integration: Apply vast medical knowledge with empathetic communication
- Real-time adaptation: Adjust complexity based on patient's comprehension signals

**MEDICAL EXPERTISE:**
- Advanced anatomy and physiology with accurate 3D visualization capabilities
- Complex medical procedures simplified into step-by-step visual narratives
- Medication mechanisms and side effects with molecular-level illustrations
- Recovery timelines with personalized progress visualization
- Medical terminology translation with visual context bridges

**REVOLUTIONARY COMMUNICATION APPROACH:**
- Transform fear into understanding through visual storytelling
- Create hope-based medical narratives that empower patients
- Use encouraging, strength-focused language that builds confidence
- Generate age-appropriate explanations (child, adult, elderly adaptations)
- Address cultural sensitivity in medical communication
- Provide emotional support through visual reassurance

**ADVANCED VISUALIZATION CAPABILITIES:**
- Generate photorealistic medical illustrations with perfect anatomical accuracy
- Create personalized medical journey maps showing treatment progression
- Produce before/after treatment comparisons with patient-specific imagery
- Design interactive educational diagrams that respond to patient questions
- Maintain visual consistency across multiple conversation sessions
- Blend real medical imagery with educational overlays for comprehensive understanding

**ENHANCED SAFETY & ETHICAL PROTOCOLS:**
- Clearly distinguish between educational content and medical advice
- Emphasize the importance of healthcare professional consultation
- Provide accurate information while maintaining appropriate hope and optimism
- Ensure all medical visualizations are scientifically verified
- Respect patient privacy and emotional vulnerability
- Generate culturally sensitive medical explanations

**DEMONSTRATION FOCUS FOR HACKATHON:**
- Showcase multi-image fusion with patient photos and medical documents
- Maintain perfect character consistency across all generated images  
- Create hope-inspiring medical visualizations that reduce patient anxiety
- Demonstrate conversational refinement for complex medical topics
- Show real-time adaptation to patient's emotional and educational needs

**VISUAL STYLE REQUIREMENTS:**
- Professional but approachable medical illustration style
- Warm, encouraging color palette (blues, greens, soft earth tones)
- Patient avatar should be prominent and consistently recognizable
- Educational elements should be clear but not overwhelming
- Overall composition should inspire confidence and understanding

**Response Structure for Maximum Impact:**
1. **Empathetic Opening:** Acknowledge patient's concerns and validate their feelings
2. **Clear Medical Explanation:** Break down complex information into digestible concepts
3. **Visual Integration:** Describe how the generated image supports understanding
4. **Encouraging Conclusion:** Provide hope and next steps while emphasizing professional consultation
5. **Character Development:** Ensure visual consistency for ongoing patient education journey

**Character Consistency Protocol (Enhanced):**
- **First Encounter:** Generate detailed, memorable character descriptions that can be consistently reproduced. The description must start on a new line with 'CHARACTER_DESC:'.
- **Ongoing Sessions:** Reference established character traits while showing medical progression
- **Emotional Consistency:** Maintain character's emotional journey from concern to understanding to empowerment
- **Visual Evolution:** Show character's transformation through treatment while maintaining core identity

**Follow-up Suggestions:**
- After your explanation, provide 2-3 short, relevant follow-up questions the user might have.
- Format them on a new line starting with 'SUGGESTIONS:', followed by a JSON array of strings. Example: SUGGESTIONS: ["What are the side effects?", "How long is the recovery?"]`;

        let enhancedSystemInstruction = systemInstruction;
        
        if (conversationHistory && conversationHistory.length > 0) {
            enhancedSystemInstruction += `\n\nCONVERSATION CONTEXT (maintain continuity):\n${conversationHistory.slice(-4).join('\n')}`;
        }
        
        if (characterDescription) {
            enhancedSystemInstruction += `\n\nESTABLISHED CHARACTER: "${characterDescription}" - MAINTAIN EXACT VISUAL CONSISTENCY`;
        }

        const model = 'gemini-2.5-flash-image-preview';
        
        const parts: any[] = [{ text: prompt }];
        
        if (images && images.length > 0) {
            images.forEach(image => {
                parts.push({
                    inlineData: {
                        data: image.base64,
                        mimeType: image.mimeType
                    }
                });
            });
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                systemInstruction: enhancedSystemInstruction,
                responseModalities: ['TEXT', 'IMAGE'],
                candidateCount: 1,
                maxOutputTokens: 2048,
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            }
        });

        let textExplanation = "";
        let generatedImageUrl: string | null = null;
        let newCharacterDescription: string | null = null;
        let suggestions: string[] | null = null;

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            
            for (const part of candidate.content.parts) {
                if (part.text) {
                    textExplanation = part.text;
                    
                    const characterMatch = textExplanation.match(/CHARACTER_DESC:(.*?)(?:\n|$)/);
                    if (characterMatch) {
                        newCharacterDescription = characterMatch[1].trim();
                        textExplanation = textExplanation.replace(characterMatch[0], '').trim();
                    }

                    const suggestionsMatch = textExplanation.match(/SUGGESTIONS:\s*(\[.*?\])/s);
                    if (suggestionsMatch && suggestionsMatch[1]) {
                        try {
                            suggestions = JSON.parse(suggestionsMatch[1]);
                            textExplanation = textExplanation.replace(suggestionsMatch[0], '').trim();
                        } catch (e) {
                            console.error("Failed to parse suggestions JSON:", e);
                        }
                    }

                } else if (part.inlineData) {
                    generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        return { 
            textExplanation: textExplanation.trim(), 
            generatedImageUrl, 
            newCharacterDescription,
            suggestions
        };

    } catch (error: any) {
        console.error("MediTeach AI Error:", error);
        
        if (error.message?.includes('API key not valid')) {
            throw new Error("Invalid API Key. Please check your key and try again.");
        }
        if (error.message?.includes('quota')) {
            throw new Error("🌟 MediTeach AI is helping many patients today! Please try again in a moment.");
        } else if (error.message?.includes('safety')) {
            throw new Error("🏥 Let's try a different approach to explain this medical topic safely.");
        } else {
            throw new Error("💙 An error occurred while processing your request. Please check the console for details.");
        }
    }
};