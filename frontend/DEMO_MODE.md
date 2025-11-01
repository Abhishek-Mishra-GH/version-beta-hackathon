# Demo Mode Implementation

## Overview

This application uses **mock medical data** for demonstration purposes. Instead of parsing actual PDFs, we use pre-defined medical text that is then processed by Google Gemini AI to generate FHIR-compliant JSON.

## Why Mock Data?

1. **Reliability**: PDF parsing can be complex and error-prone with various PDF formats
2. **Demo Focus**: Allows focus on blockchain + IPFS + FHIR workflow
3. **Consistent Results**: Same mock data ensures predictable FHIR output
4. **Performance**: Faster processing without PDF extraction overhead

## How It Works

### Upload Flow

```
1. User uploads PDF file
   ↓
2. System uses mock medical text (not actual PDF content)
   ↓
3. Mock text sent to Gemini AI with FHIR conversion prompt
   ↓
4. Gemini generates FHIR Bundle (Patient, Condition, Observation, MedicationRequest)
   ↓
5. FHIR JSON displayed to user for review
   ↓
6. User uploads to IPFS (actual file content)
   ↓
7. IPFS CID recorded on blockchain
```

### Mock Medical Data

The system uses a sample medical record containing:
- **Patient Information**: Name, DOB, Gender, MRN
- **Chief Complaint**: Symptoms description
- **Vital Signs**: Temperature, BP, Heart Rate, Respiratory Rate
- **Diagnosis**: ICD-10 coded conditions
- **Medications**: Prescriptions with dosage instructions
- **Provider Info**: Doctor name and date

### Gemini AI Processing

The Gemini 2.5 Flash model receives a specialized prompt:

```
"You are a medical data parser specializing in FHIR format.
Convert the following medical record into a valid FHIR Bundle JSON.
Include these resources:
- Patient resource with demographics
- Condition resources for diagnoses
- Observation resources for vital signs
- MedicationRequest resources for prescriptions"
```

### FHIR Output Structure

Generated FHIR Bundle includes:

```json
{
  "resourceType": "Bundle",
  "type": "document",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [...],
        "birthDate": "1980-05-15",
        "gender": "male"
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": {
          "coding": [{
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": "J06.9"
          }]
        }
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": { "text": "Temperature" },
        "valueQuantity": {
          "value": 38.2,
          "unit": "°C"
        }
      }
    },
    {
      "resource": {
        "resourceType": "MedicationRequest",
        "medicationCodeableConcept": {
          "text": "Ibuprofen 400mg"
        },
        "dosageInstruction": [...]
      }
    }
  ]
}
```

## IPFS Storage

**Important**: While the FHIR conversion uses mock text, the **actual PDF file** is still uploaded to IPFS:

- Real file stored on Pinata IPFS
- Actual IPFS CID generated
- File accessible via gateway URL
- CID recorded on blockchain

This means:
- ✅ Real decentralized storage
- ✅ Real content addressing
- ✅ Real blockchain records
- 📄 Mock FHIR data (for demo UI)

## Production Considerations

For production deployment, you would:

### 1. Implement Real PDF Parsing
```typescript
// Option 1: Use pdf-parse (we removed it for demo)
import pdfParse from 'pdf-parse';
const data = await pdfParse(buffer);
const text = data.text;

// Option 2: Use pdf.js
import * as pdfjsLib from 'pdfjs-dist';
const pdf = await pdfjsLib.getDocument(buffer).promise;
// Extract text from all pages

// Option 3: Use external service
const response = await fetch('https://api.pdfparser.io/parse', {
  method: 'POST',
  body: formData
});
```

### 2. Handle Various Medical Document Formats
- Lab reports
- Radiology reports
- Discharge summaries
- Prescription forms
- Insurance claims

### 3. Improve FHIR Mapping
- More accurate ICD-10/SNOMED coding
- Proper LOINC codes for lab results
- Complete FHIR validation
- Handle edge cases

### 4. Add OCR for Scanned Documents
```typescript
import Tesseract from 'tesseract.js';
const { data: { text } } = await Tesseract.recognize(imageBuffer);
```

### 5. Implement Security
- PHI encryption before IPFS upload
- Access control via smart contracts
- Audit logging
- HIPAA compliance measures

## Testing the Demo

### Test Flow

1. **Upload Any PDF**
   ```
   Navigate to Patient Dashboard → Upload tab
   Select any PDF file (content doesn't matter for demo)
   ```

2. **View Mock Processing**
   ```
   System shows "Processing with AI..."
   Gemini converts mock text to FHIR
   FHIR JSON displayed in preview
   ```

3. **Upload to IPFS**
   ```
   Click "Upload to Blockchain"
   Actual PDF file uploaded to Pinata
   Real IPFS CID returned
   CID recorded on blockchain
   ```

4. **Verify Storage**
   ```
   Navigate to Records tab
   See uploaded document
   Click "View on IPFS" link
   Original PDF accessible via gateway
   ```

## Mock Data Customization

To change the mock medical data, edit:
```
src/app/api/upload/route.ts
```

Update the `MOCK_MEDICAL_TEXT` constant:

```typescript
const MOCK_MEDICAL_TEXT = `
YOUR CUSTOM MEDICAL DATA HERE

Patient: Jane Smith
Diagnosis: ...
Medications: ...
`;
```

The Gemini AI will automatically adapt to your custom format and generate appropriate FHIR resources.

## Benefits of This Approach

### For Demo/MVP
- ✅ **Fast**: No complex PDF parsing delays
- ✅ **Reliable**: Consistent FHIR output
- ✅ **Focused**: Demonstrates core blockchain + IPFS workflow
- ✅ **Simple**: Easier to test and debug

### Still Real
- ✅ Actual IPFS storage
- ✅ Real blockchain transactions
- ✅ True decentralization
- ✅ Production-ready infrastructure

## API Endpoints

### POST `/api/upload`

**Request**:
```typescript
FormData {
  file: File (PDF)
}
```

**Response**:
```json
{
  "message": "FHIR data generated successfully",
  "fhir_data": { /* FHIR Bundle */ },
  "source_text": "PATIENT MEDICAL RECORD..." // First 500 chars
}
```

### POST `/api/ipfs`

**Request**:
```typescript
FormData {
  file: File,
  metadata: JSON.stringify({ fileName, fileSize, ... })
}
```

**Response**:
```json
{
  "success": true,
  "ipfsHash": "QmX1234...",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmX1234...",
  "pinSize": 12345,
  "timestamp": "2025-11-01T..."
}
```

## Limitations

Current demo limitations:
- ⚠️ Doesn't parse actual PDF content
- ⚠️ Same mock data for all uploads
- ⚠️ FHIR output may vary based on Gemini response
- ⚠️ No validation of FHIR compliance

These are **intentional trade-offs** for demo simplicity and can be addressed in production.

## Future Enhancements

1. **Smart PDF Detection**
   - Detect document type (lab report, prescription, etc.)
   - Use type-specific parsers
   - Apply appropriate FHIR templates

2. **Multi-Format Support**
   - JPEG/PNG (with OCR)
   - DICOM (medical imaging)
   - HL7 v2 messages
   - CDA documents

3. **AI Improvements**
   - Fine-tune Gemini with medical data
   - Use specialized medical NLP models
   - Implement confidence scoring

4. **Validation Layer**
   - FHIR validator integration
   - ICD-10/SNOMED validation
   - Data quality checks

## Resources

- [FHIR Specification](http://hl7.org/fhir/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata Docs](https://docs.pinata.cloud/)

## Support

Questions about mock data implementation?
- Check the code: `src/app/api/upload/route.ts`
- Review FHIR output in browser console
- Test with different mock data samples
