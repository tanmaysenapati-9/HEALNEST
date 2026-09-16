# 🏥 HEALNEST

> **Your intelligent personal health companion** — AI-powered symptom checking, adaptive assessment, health timeline, and conversational medical guidance.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ Features

### 🔍 Symptom Checker
- **Natural language input** — describe symptoms the way you naturally speak
- **Typo-tolerant NLU** — understands "gastic", "fevr", "headake", "stomch pain", and more
- **Fuzzy semantic matching** — maps informal language to structured medical categories
- **Multi-symptom detection** — recognizes compound inputs like *"I have fever and headache"*
- **Voice input** — speak your symptoms via built-in Speech Recognition

### 🤖 Ask HEALNEST AI
- **Conversational AI assistant** powered by Google Gemini
- **Multi-model failover** — automatically switches models on quota exhaustion
- **Context isolation** — new health topics are treated as fresh concerns
- **Non-diagnostic safety** — provides general health guidance without making diagnoses
- **Voice input support** — speak naturally to the AI chatbot

### 📋 Adaptive Assessment Engine
- **Dynamic question flow** — questions adapt based on previous answers
- **Red flag detection** — escalates urgency when critical symptoms are detected
- **Risk stratification** — categorizes severity (low / moderate / high / emergency)
- **Care pathway recommendations** — suggests appropriate next steps

### 📅 Health Timeline
- **Persistent symptom log** — track all assessments over time
- **Visual timeline** — see your health journey at a glance
- **Multi-profile support** — manage health for yourself and family members

### 👨‍👩‍👧 Caregiver Mode
- Multi-profile management for family members
- Per-profile health history

---

## 🏗️ Architecture

```
src/
├── ai/                     # AI & NLU layer
│   ├── serverExtractor.ts  # Typo-tolerant symptom NLU (heuristic + LLM)
│   ├── serverChat.ts       # Ask HEALNEST conversational AI backend
│   ├── keyRotation.ts      # Multi-model failover & API key rotation
│   ├── extractionSchema.ts # Zod schema for extracted symptom fields
│   ├── chatApi.ts          # Frontend API client for chat
│   └── extractSymptoms.ts  # Symptom extraction orchestrator
│
├── engine/                 # Assessment engine
│   └── adaptiveFlow.ts     # Dynamic question flow logic
│
├── pages/                  # React page components
│   ├── LandingPage.tsx
│   ├── AssessStartPage.tsx
│   ├── AssessConfirmPage.tsx
│   ├── AssessQuestionsPage.tsx
│   ├── AssessResultsPage.tsx
│   ├── TimelinePage.tsx
│   └── ...
│
├── context/
│   └── AssessmentContext.tsx  # Global assessment state
│
├── store/
│   └── TimelineStore.ts    # Persistent health timeline
│
└── components/
    └── AiChatbot.tsx       # Ask HEALNEST floating chat widget
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Google Gemini API key — get one free at https://ai.google.dev

### 1. Clone the repository
```bash
git clone https://github.com/tanmaysenapati-9/HEALNEST.git
cd HEALNEST
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit .env and add your API keys:
```env
VITE_GEMINI_API_KEY_1=your_gemini_api_key_here
VITE_GEMINI_API_KEY_2=your_second_key_here
VITE_GEMINI_API_KEY_3=your_third_key_here
```

> Tip: Adding multiple API keys enables automatic key rotation and higher throughput on free-tier quotas.

### 4. Start the development server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🧪 Testing

```bash
npm test
```

**64 tests — all passing ✅**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS 3 + Vanilla CSS |
| Routing | React Router DOM 7 |
| AI Provider | Google Gemini (via @google/genai) |
| Schema Validation | Zod 4 |
| Icons | Lucide React |
| Testing | Vitest |
| Voice Input | Web Speech API (SpeechRecognition) |

---

## 🤖 AI Model Strategy

HEALNEST uses a multi-model failover system for maximum resilience:

- Primary:   gemini-flash-lite-latest   (fastest, lowest quota usage)
- Fallback1: gemini-2.0-flash
- Fallback2: gemini-2.0-flash-lite
- Fallback3: gemini-flash-latest

If one model hits a quota limit (HTTP 429), the system automatically tries the next model with zero user-facing errors.

---

## 📊 Supported Symptom Categories

| Category | Example Inputs Detected |
|---|---|
| 🤒 Fever | "fever", "feverish", "running a temperature", "fevr" |
| 🤕 Headache | "headache", "head pain", "migraine", "headake" |
| 🫁 Cough | "cough", "coughing", "dry cough", "caugh" |
| 🤢 Nausea & Vomiting | "nausea", "vomiting", "throwing up", "sick to stomach" |
| 🫀 Chest Pain | "chest pain", "chest tightness", "heart pain" |
| 🤸 Stomach / Digestive | "stomach pain", "gastic", "bloated", "acid reflux", "stomch" |
| 🦷 Dental Pain | "tooth ache", "toothache", "tooth pain", "toothach" |
| 💊 Diarrhea | "diarrhea", "loose stools", "diarhea" |
| 😴 Fatigue | "tired", "exhausted", "no energy", "fatigue" |
| 🌬️ Breathing Issues | "shortness of breath", "can't breathe", "wheezing" |
| 🦴 Joint / Muscle Pain | "joint pain", "muscle ache", "body pain" |
| 🧠 Dizziness | "dizzy", "vertigo", "lightheaded" |
| 🔴 Skin / Rash | "rash", "itching", "hives" |
| 🔥 Burns | "burn", "burned my hand", "scalded" |

---

## ⚠️ Medical Disclaimer

HEALNEST is an **informational tool only** and does not provide medical diagnoses. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment. In a medical emergency, call your local emergency services immediately.

---

## 🔒 Security

- API keys are stored in .env and never committed to version control
- .env is listed in .gitignore
- API keys are never exposed in the client-side bundle

---

## 📄 License

This project was built for **Vmediathon** — a healthcare hackathon.

---

## 👨‍💻 Author

**Tanmay Senapati**
- GitHub: [@tanmaysenapati-9](https://github.com/tanmaysenapati-9)

---

<p align="center">Built with ❤️ for better healthcare access</p>
