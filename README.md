# SynCure - Decentralized Healthcare Records

A Web3 healthcare application that enables patients to securely store and share medical records using blockchain technology and IPFS.

> **Note**: This demo uses mock medical data for AI processing. See [DEMO_MODE.md](./DEMO_MODE.md) for details.

## Features

- 🔐 **MetaMask Wallet Authentication** - Secure, passwordless login
- 📄 **Medical Document Processing** - AI-powered FHIR conversion with Gemini 2.5 Flash
- 🗂️ **FHIR Compliance** - Medical data converted to FHIR-compliant JSON
- 🌐 **IPFS Storage** - Decentralized file storage using Pinata (actual files stored)
- ⛓️ **Blockchain Records** - Smart contracts on Arbitrum for access control
- 👨‍⚕️ **Doctor Portal** - Search and request access to patient records
- 🎨 **Modern UI** - Dark theme with gradient effects and animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: wagmi, viem, RainbowKit, ethers.js
- **Storage**: Pinata (IPFS)
- **AI**: Google Gemini 2.5 Flash API
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Blockchain**: Arbitrum (smart contracts)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Pinata account (for IPFS storage)
- Google Gemini API key
- EmailJS account (for notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` file with the following:
   ```bash
   # Gemini AI API Key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Pinata IPFS Configuration
   PINATA_JWT=your_pinata_jwt_token
   NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
   
   # EmailJS Configuration
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

5. See setup guides for detailed configuration:
   - [Pinata IPFS Setup Guide](./PINATA_SETUP.md)
   - [EmailJS Setup Guide](./EMAILJS_SETUP.md)
   - [Demo Mode Explanation](./DEMO_MODE.md)

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Demo Mode

**Important**: This demo uses **mock medical data** for AI processing to ensure reliability and consistent results. However, actual PDF files are still uploaded to IPFS.

- ✅ **Real IPFS Storage**: Files stored on Pinata with actual CIDs
- ✅ **Real Blockchain**: Transactions recorded on Arbitrum
- 📄 **Mock FHIR Data**: AI converts predefined medical text (not actual PDF content)

See [DEMO_MODE.md](./DEMO_MODE.md) for complete details and production considerations.

## IPFS Storage Implementation

The application uses **Pinata** for decentralized IPFS storage. Medical documents are:

1. **Processed** - Mock data converted to FHIR format using Gemini AI
2. **Uploaded to IPFS** - Actual PDF stored on Pinata with permanent CID
3. **Recorded on Blockchain** - IPFS hash stored in smart contract with access controls

### How It Works

```typescript
// Upload flow
PDF File → Mock Text → AI Processing (FHIR) → IPFS Upload (Real File) → Blockchain Record

// Patient uploads document
1. PDF is parsed and converted to FHIR JSON
2. File is uploaded to Pinata via /api/ipfs endpoint
3. Returns IPFS CID (Content Identifier)
4. CID + metadata stored in smart contract
5. Patient controls access permissions

// Doctor requests access
1. Doctor searches by patient wallet address
2. Sends access request transaction
3. Patient approves via smart contract
4. Doctor retrieves IPFS CID from blockchain
5. Fetches file from IPFS gateway
```

### IPFS Gateway URLs

Files are accessible via:
```
https://your-gateway.mypinata.cloud/ipfs/{CID}
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ipfs/          # IPFS upload endpoint
│   │   │   └── upload/        # AI processing endpoint
│   │   ├── patient-dashboard/ # Patient interface
│   │   ├── doctor-portal/     # Doctor interface
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── connect.tsx        # Wallet connection
│   │   ├── fhir-display.tsx   # FHIR data viewer
│   │   └── main-nav.tsx       # Navigation bar
│   ├── config/
│   │   └── wagmi.ts           # Web3 configuration
│   └── utils/
│       └── user-ids.ts        # Authentication utilities
├── PINATA_SETUP.md            # IPFS setup guide
├── EMAILJS_SETUP.md           # Email setup guide
└── README.md
```

## Features Breakdown

### Patient Dashboard
- Upload medical documents (PDF)
- AI-powered FHIR conversion
- View all records with IPFS links
- Manage doctor access permissions
- Wallet-based authentication

### Doctor Portal
- Search patients by wallet address
- Request access to medical records
- View granted records
- FHIR-compliant data display
- Access request notifications

### Landing Page
- Modern dark theme with gradients
- Hero section with wallet connect
- Features showcase
- Workflow explanation
- Testimonials
- Tech stack display

## Security

- ✅ **Wallet Authentication** - No passwords, MetaMask-based login
- ✅ **Client-side Encryption** - Sensitive data never leaves unencrypted
- ✅ **Smart Contract Access Control** - Blockchain-enforced permissions
- ✅ **IPFS Content Addressing** - Tamper-proof file storage
- ✅ **HIPAA Compliance Ready** - Designed for healthcare standards

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run typecheck    # Type checking
npm run format:check # Check formatting
npm run format:write # Format code
```

### Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Common Issues

**MetaMask not connecting:**
- Ensure MetaMask extension is installed
- Check that you're on the correct network (Arbitrum)
- Clear browser cache and reload

**IPFS upload failing:**
- Verify PINATA_JWT is correctly set in .env.local
- Check Pinata dashboard for API key status
- Ensure you haven't exceeded free tier limits (1GB)

**AI processing errors:**
- Verify NEXT_PUBLIC_GEMINI_API_KEY is valid
- Check API quota in Google AI Studio
- Ensure PDF is not corrupted or password-protected

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Pinata Setup Guide](./PINATA_SETUP.md)
- Review [EmailJS documentation](https://www.emailjs.com/docs/)

## Acknowledgments

- Scaffold from [`create-w3-app`](https://github.com/gopiinho/create-w3-app/)
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- IPFS storage by [Pinata](https://pinata.cloud/)
- AI processing by [Google Gemini](https://ai.google.dev/)
