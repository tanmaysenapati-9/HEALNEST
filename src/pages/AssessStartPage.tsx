import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, Mic, MicOff, AlertCircle, Activity } from 'lucide-react'
import { Card, Button, Badge, LoadingPulse } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import { extractSymptoms } from '../ai/extractSymptoms'
import { useLanguage } from '../i18n/LanguageContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

export function AssessStartPage() {
  const navigate = useNavigate()
  const { rawText, setRawText, setExtractionResult, setSelectedCategory } = useAssessment()
  const { language, t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<AnySpeechRecognition | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check for Speech API support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setVoiceSupported(!!(( window as any).SpeechRecognition || (window as any).webkitSpeechRecognition))
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const toggleVoiceInput = useCallback(() => {
    setVoiceError(null)
    if (isListening) { stopListening(); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechAPI) {
      setVoiceError('Voice input is not supported in your browser. Please type your symptoms.')
      return
    }

    const recognition: AnySpeechRecognition = new SpeechAPI()
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onstart = () => { setIsListening(true); setVoiceError(null); finalTranscript = '' }

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) finalTranscript += t
        else interim = t
      }
      setRawText(finalTranscript + interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') setVoiceError('Microphone access denied. Please allow microphone access and try again.')
      else if (event.error === 'no-speech') setVoiceError("I couldn't hear anything. Please try again or type your symptoms.")
      else if (event.error !== 'aborted') setVoiceError('Voice input error. Please try again or type your symptoms.')
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      setTimeout(() => textareaRef.current?.focus(), 100)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, language, setRawText, stopListening])

  const handleContinue = async () => {
    if (!rawText.trim()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // PART 3: Call AI to extract structured fields and determine category
      const result = await extractSymptoms(rawText, language)
      setExtractionResult(result)
      navigate('/app/assess/confirm')
    } catch (err) {
      console.error('Extraction error:', err)
      setErrorMessage(
        t('We encountered an issue analyzing your description. You can try again or manually select your symptom category below.') ||
        'We encountered an issue analyzing your description. You can try again or manually select your symptom category below.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualFallback = () => {
    setSelectedCategory(null as any)
    setExtractionResult({
      category: 'unrecognized',
      extractedFields: {},
      originalText: rawText || 'Manual selection',
      confidence: 'low',
    })
    navigate('/app/assess/confirm')
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4 animate-fade-in">
      {/* Top context badge */}
      <div className="mb-4">
        <Badge variant="teal">
          <Sparkles size={12} className="mr-1" />
          STEP 1 OF 3 · SYMPTOM DESCRIPTION
        </Badge>
      </div>

      <Card glass className="p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none rotate-12">
          <Activity size={240} className="text-white" />
        </div>
        
        {/* Main Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold dark:text-white text-heal-text-light-heading mb-2 tracking-tight">
          {t('heading.whatsBothering')}
        </h1>
        <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted mb-6 leading-relaxed">
          Describe what you are experiencing in your own words. Include details like where it hurts,
          what caused it, or how long it has been going on.
        </p>

        {/* Text Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="symptom-description-input"
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              disabled={isLoading}
              placeholder="e.g. I accidentally burned my hand with boiling water about 20 minutes ago"
              className="w-full p-4 rounded-xl dark:bg-heal-bg-elevated/40 bg-slate-50 border border-heal-border
                         dark:text-white text-heal-text-light placeholder:dark:text-heal-text-muted/50 placeholder:text-heal-text-light-muted/50
                         focus:outline-none focus:border-heal-teal focus:ring-2 focus:ring-heal-teal/20 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300
                         resize-none text-base leading-relaxed backdrop-blur-md"
            />
            <div className="absolute right-3 bottom-3 text-xs text-heal-text-muted select-none">
              {rawText.length > 0 && `${rawText.length} characters`}
            </div>
          </div>

          {/* Voice input button */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
              isListening
                ? 'border-red-500/40 bg-red-500/5'
                : 'border-dashed border-white/10 dark:bg-heal-bg-elevated/30 bg-slate-100/50'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                title={isListening ? 'Stop listening' : voiceSupported ? 'Click to speak your symptoms' : 'Voice input not supported'}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  !voiceSupported || isLoading
                    ? 'bg-heal-blue/10 text-heal-blue opacity-40 cursor-not-allowed'
                    : isListening
                    ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)] cursor-pointer'
                    : 'bg-heal-blue/10 text-heal-blue hover:bg-heal-blue/20 cursor-pointer'
                }`}
              >
                {isListening ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                ) : (
                  isListening ? <MicOff size={14} /> : <Mic size={14} />
                )}
              </button>
              <span className={`${
                isListening ? 'text-red-400 font-medium' : 'text-heal-text-muted'
              }`}>
                {isListening
                  ? 'Listening… speak your symptoms now'
                  : voiceSupported
                  ? 'Prefer to speak? Click the mic to describe your symptoms.'
                  : 'Voice input is not available in your browser. Please type below.'}
              </span>
            </div>
            {isListening && (
              <button
                type="button"
                onClick={stopListening}
                className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Stop
              </button>
            )}
          </div>

          {/* Voice error message */}
          {voiceError && (
            <div className="px-3 py-2 rounded-xl bg-heal-danger/10 border border-heal-danger/20 text-xs text-heal-danger flex items-start gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Inline Error Display if API/Network Fails */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-heal-danger/10 border border-heal-danger/20 text-sm space-y-3">
              <div className="flex items-start gap-2.5 text-heal-danger">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleManualFallback}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Manually Select Category
                </button>
              </div>
            </div>
          )}

          {/* Loading State In Flight */}
          {isLoading && (
            <div className="py-4 flex justify-center">
              <LoadingPulse label="Understanding your description..." size="md" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              disabled={!rawText.trim() || isLoading}
              onClick={handleContinue}
              className={!rawText.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {t('btn.continue')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
