import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const runtime = "nodejs";

// Mock medical data for demo purposes
const MOCK_MEDICAL_TEXT = `
PATIENT MEDICAL RECORD

Patient Information:
Name: John Doe
Date of Birth: 1980-05-15
Gender: Male
MRN: 123456789

Chief Complaint:
Patient presents with persistent headache and mild fever for the past 3 days.

Vital Signs:
Temperature: 38.2°C (100.8°F)
Blood Pressure: 120/80 mmHg
Heart Rate: 78 bpm
Respiratory Rate: 16 breaths/min

Diagnosis:
- Upper Respiratory Infection (ICD-10: J06.9)
- Tension Headache (ICD-10: G44.209)

Medications Prescribed:
1. Ibuprofen 400mg - Take 1 tablet every 6 hours as needed for pain
2. Amoxicillin 500mg - Take 1 capsule three times daily for 7 days

Follow-up:
Schedule follow-up appointment in 1 week if symptoms persist.

Provider: Dr. Sarah Smith, MD
Date: ${new Date().toLocaleDateString()}
`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // For demo: Use mock medical text instead of parsing PDF
    // In production, you would extract text from PDF here
    const medicalText = MOCK_MEDICAL_TEXT;

    // Use Gemini AI to convert medical text to FHIR format
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are a medical data parser specializing in FHIR (Fast Healthcare Interoperability Resources) format.

Convert the following medical record into a valid FHIR Bundle JSON. Include these resources:
- Patient resource with demographics
- Condition resources for diagnoses
- Observation resources for vital signs
- MedicationRequest resources for prescriptions

Return ONLY valid JSON, no markdown or explanations.

Medical Record:
${medicalText}

Return a FHIR Bundle with the above resources.
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = output.trim();
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      const lines = jsonText.split("\n");
      jsonText = lines.slice(1, -1).join("\n");
      if (jsonText.startsWith("json")) {
        jsonText = jsonText.slice(4).trim();
      }
    }

    // Parse the JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fhirJson: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      fhirJson = JSON.parse(jsonText);
    } catch {
      // If parsing fails, try to extract JSON object from text
      const jsonMatch = /\{[\s\S]*\}/.exec(jsonText);
      if (jsonMatch) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          fhirJson = JSON.parse(jsonMatch[0]);
        } catch {
          // If still fails, return raw data
          fhirJson = {
            resourceType: "Bundle",
            type: "document",
            entry: [
              {
                resource: {
                  resourceType: "DocumentReference",
                  status: "current",
                  content: [
                    {
                      attachment: {
                        title: file.name,
                        data: medicalText,
                      },
                    },
                  ],
                },
              },
            ],
          };
        }
      } else {
        // Fallback to basic structure
        fhirJson = {
          resourceType: "Bundle",
          type: "document",
          entry: [
            {
              resource: {
                resourceType: "DocumentReference",
                status: "current",
                content: [
                  {
                    attachment: {
                      title: file.name,
                      data: medicalText,
                    },
                  },
                ],
              },
            },
          ],
        };
      }
    }

    return NextResponse.json({
      message: "FHIR data generated successfully",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      fhir_data: fhirJson,
      source_text: medicalText.slice(0, 500) + "...", // First 500 chars for reference
    });
  } catch (error) {
    console.error("Upload processing error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message ?? "Server error processing document" },
      { status: 500 },
    );
  }
}
