import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type LanguageCode = 'en' | 'ta' | 'hi'

interface Translations {
  [key: string]: string | Translations
}

// Flat translations for simplicity
const en: Record<string, string> = {
  "nav.backHome": "Back to home",
  "profile.welcome": "Welcome to",
  "profile.subtitle": "Tell us a bit about yourself to personalize your experience",
  "profile.name": "Your Name",
  "profile.age": "Age",
  "profile.sex": "Sex",
  "profile.language": "Language Preference",
  "profile.optional": "(optional)",
  "profile.disclaimer": "HEALNEST is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.",
  "btn.continue": "Continue",
  "btn.back": "Back",
  "btn.notSure": "Not sure",
  "btn.startAssessment": "Start Assessment",
  "btn.startNewCheck": "Start New Check",
  "btn.generateSummary": "Generate Doctor-Ready Summary",
  "btn.copyClipboard": "Copy to Clipboard",
  "btn.backToResults": "Back to Results",
  "btn.selectBurn": "Select Burn",
  "btn.selectStomach": "Select Stomach Pain",
  "btn.selectHeadache": "Select Headache",
  "heading.whatsBothering": "What's bothering you?",
  "heading.assessmentSummary": "Clinical Assessment Summary",
  "heading.recommendedActions": "Recommended Action Steps",
  "heading.doctorSummary": "Doctor-Ready Summary",
  "alert.urgentAttention": "This may need urgent medical attention",
  "alert.notDiagnosis": "This is not a diagnosis.",
  "outcome.urgent": "Emergency / Urgent Care Required",
  "outcome.see_doctor": "Medical Evaluation Recommended",
  "outcome.monitor": "Active Monitoring at Home",
  "outcome.self_care": "Self-Care at Home",
  "summary.mainConcern": "Main concern",
  "summary.started": "Started",
  "summary.location": "Location",
  "summary.severity": "Severity",
  "summary.keySymptoms": "Key symptoms/answers",
  "summary.redFlags": "Red flags noted",
  "summary.recommendedPathway": "Recommended pathway",
  "summary.notSpecified": "Not specified",
  "summary.footerNote": "User-reported information only",
  "label.triageLevel": "Triage Level",
  "label.confidence": "Confidence:",
  "label.whatToDoNow": "What To Do Now:",
  "label.whatToMonitor": "What To Monitor:",
  "label.whenToSeekCare": "When To Seek Immediate Care:",
}

const hi: Record<string, string> = {
  "nav.backHome": "होम पर वापस जाएं",
  "profile.welcome": "HEALNEST में आपका स्वागत है",
  "profile.subtitle": "अपने अनुभव को व्यक्तिगत बनाने के लिए हमें अपने बारे में थोड़ा बताएं",
  "profile.name": "आपका नाम",
  "profile.age": "आयु",
  "profile.sex": "लिंग",
  "profile.language": "भाषा की प्राथमिकता",
  "profile.optional": "(वैकल्पिक)",
  "profile.disclaimer": "HEALNEST पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। हमेशा अपने चिकित्सक या अन्य योग्य स्वास्थ्य प्रदाता की सलाह लें।",
  "btn.continue": "जारी रखें",
  "btn.back": "पीछे जाएं",
  "btn.notSure": "पक्का नहीं",
  "btn.startAssessment": "मूल्यांकन शुरू करें",
  "btn.startNewCheck": "नया चेक शुरू करें",
  "btn.generateSummary": "डॉक्टर-तैयार सारांश उत्पन्न करें",
  "btn.copyClipboard": "क्लिपबोर्ड पर कॉपी करें",
  "btn.backToResults": "परिणामों पर वापस जाएं",
  "btn.selectBurn": "जलन चुनें",
  "btn.selectStomach": "पेट दर्द चुनें",
  "btn.selectHeadache": "सिरदर्द चुनें",
  "heading.whatsBothering": "आपको क्या परेशानी है?",
  "heading.assessmentSummary": "नैदानिक मूल्यांकन सारांश",
  "heading.recommendedActions": "अनुशंसित कार्रवाई कदम",
  "heading.doctorSummary": "डॉक्टर-तैयार सारांश",
  "alert.urgentAttention": "इसके लिए तत्काल चिकित्सा ध्यान देने की आवश्यकता हो सकती है",
  "alert.notDiagnosis": "यह कोई निदान नहीं है।",
  "outcome.urgent": "आपातकालीन / तत्काल देखभाल की आवश्यकता",
  "outcome.see_doctor": "चिकित्सा मूल्यांकन अनुशंसित",
  "outcome.monitor": "घर पर सक्रिय निगरानी",
  "outcome.self_care": "घर पर स्वयं-देखभाल",
  "summary.mainConcern": "मुख्य चिंता",
  "summary.started": "शुरू हुआ",
  "summary.location": "स्थान",
  "summary.severity": "गंभीरता",
  "summary.keySymptoms": "मुख्य लक्षण/उत्तर",
  "summary.redFlags": "नोट किए गए खतरे के संकेत",
  "summary.recommendedPathway": "अनुशंसित मार्ग",
  "summary.notSpecified": "निर्दिष्ट नहीं",
  "summary.footerNote": "केवल उपयोगकर्ता द्वारा रिपोर्ट की गई जानकारी",
  "label.triageLevel": "ट्राइएज स्तर",
  "label.confidence": "आत्मविश्वास:",
  "label.whatToDoNow": "अब क्या करें:",
  "label.whatToMonitor": "क्या निगरानी करें:",
  "label.whenToSeekCare": "तत्काल देखभाल कब लें:",
}

const ta: Record<string, string> = {
  "nav.backHome": "முகப்புக்குத் திரும்பு",
  "profile.welcome": "HEALNEST க்கு வரவேற்கிறோம்",
  "profile.subtitle": "உங்கள் அனுபவத்தை தனிப்பயனாக்க உங்களைப் பற்றி சற்று சொல்லுங்கள்",
  "profile.name": "உங்கள் பெயர்",
  "profile.age": "வயது",
  "profile.sex": "பாலினம்",
  "profile.language": "மொழி முன்னுரிமை",
  "profile.optional": "(விருப்பத்திற்குரியது)",
  "profile.disclaimer": "HEALNEST தொழில்முறை மருத்துவ ஆலோசனை, நோயறிதல் அல்லது சிகிச்சைக்கு மாற்றாக இல்லை. எப்போதும் உங்கள் மருத்துவர் அல்லது பிற தகுதிவாய்ந்த சுகாதார வழங்குநரின் ஆலோசனையைப் பெறவும்.",
  "btn.continue": "தொடரவும்",
  "btn.back": "பின் செல்லவும்",
  "btn.notSure": "நிச்சயமில்லை",
  "btn.startAssessment": "மதிப்பீட்டைத் தொடங்கவும்",
  "btn.startNewCheck": "புதிய சோதனையைத் தொடங்கவும்",
  "btn.generateSummary": "மருத்துவர்-தயார் சுருக்கத்தை உருவாக்கவும்",
  "btn.copyClipboard": "கிளிப்போர்டுக்கு நகலெடுக்கவும்",
  "btn.backToResults": "முடிவுகளுக்குத் திரும்பு",
  "btn.selectBurn": "தீக்காயம் தேர்ந்தெடுக்கவும்",
  "btn.selectStomach": "வயிற்று வலி தேர்ந்தெடுக்கவும்",
  "btn.selectHeadache": "தலைவலி தேர்ந்தெடுக்கவும்",
  "heading.whatsBothering": "உங்களுக்கு என்ன தொந்தரவு அளிக்கிறது?",
  "heading.assessmentSummary": "மருத்துவ மதிப்பீட்டு சுருக்கம்",
  "heading.recommendedActions": "பரிந்துரைக்கப்பட்ட நடவடிக்கை படிகள்",
  "heading.doctorSummary": "மருத்துவர்-தயார் சுருக்கம்",
  "alert.urgentAttention": "இதற்கு அவசர மருத்துவ கவனிப்பு தேவைப்படலாம்",
  "alert.notDiagnosis": "இது ஒரு நோயறிதல் அல்ல.",
  "outcome.urgent": "அவசர / உடனடி கவனிப்பு தேவை",
  "outcome.see_doctor": "மருத்துவ மதிப்பீடு பரிந்துரைக்கப்படுகிறது",
  "outcome.monitor": "வீட்டில் செயலில் கண்காணிப்பு",
  "outcome.self_care": "வீட்டில் சுய பராமரிப்பு",
  "summary.mainConcern": "முக்கிய கவலை",
  "summary.started": "தொடங்கியது",
  "summary.location": "இடம்",
  "summary.severity": "தீவிரம்",
  "summary.keySymptoms": "முக்கிய அறிகுறிகள்/பதில்கள்",
  "summary.redFlags": "குறிப்பிடப்பட்ட அபாய அறிகுறிகள்",
  "summary.recommendedPathway": "பரிந்துரைக்கப்பட்ட பாதை",
  "summary.notSpecified": "குறிப்பிடப்படவில்லை",
  "summary.footerNote": "பயனர் வழங்கிய தகவல் மட்டுமே",
  "label.triageLevel": "டிரையேஜ் நிலை",
  "label.confidence": "நம்பிக்கை:",
  "label.whatToDoNow": "இப்போது என்ன செய்ய வேண்டும்:",
  "label.whatToMonitor": "எதை கண்காணிக்க வேண்டும்:",
  "label.whenToSeekCare": "உடனடி கவனிப்பை எப்போது பெற வேண்டும்:",
}

const translations: Record<LanguageCode, Record<string, string>> = { en, hi, ta }

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')

  // Attempt to load language from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('healnest_lang') as LanguageCode
    if (stored && ['en', 'hi', 'ta'].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    localStorage.setItem('healnest_lang', lang)
  }

  const t = (key: string): string => {
    const text = translations[language][key]
    if (!text) {
      console.warn(`Missing translation key for [${language}]: ${key}`)
      return translations['en'][key] || key // fallback to english or key
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
