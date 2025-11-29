export const getPrescriptionReminderPrompt = () => {
    return `
    Analyze this prescription image and extract detailed dosage information for each medicine.
    
    For each medicine found, provide information in this exact format as provided by the schema.
    
    Guidelines:
    - Extract the exact medicine names as written in the prescription. If names are abbreviated, transcribe them as-is. If names are unclear, write the name that is most similar.
    - Include strength/dosage amounts (mg, ml, etc.) as specified in the prescription. If not mentioned, write "Not specified".
    - Duration should be clear (1, 2 representing 1 day or 2 days, etc.). 
    - Parse symbols like 0-0-1 as  true for night, 1-1-0 as true for morning and noon, etc.
    - Duration should mention period (7 days, 1 month, etc.). If not specified, return 0 by default.
    - Instructions should include timing and meal-related directions (before food, after food, with water, etc.). If not mentioned, write "Not specified".
    - Include any special notes or warnings from the prescription (e.g., "avoid driving", "take with food", etc.). If none, write "Not specified".
    
    Follow this exact format. Do not output anything else.
    `
}