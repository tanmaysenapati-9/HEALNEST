import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send, Sparkles, User, Loader2, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react'
import { sendChatMessage } from '../ai/chatApi'
import { useLanguage } from '../i18n/LanguageContext'

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  isError?: boolean
}

// Type alias for cross-browser Speech Recognition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi, I'm HEALNEST AI. I can help answer general health questions, explain symptoms, and provide wellness tips. What's on your mind?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<AnySpeechRecognition | null>(null)
  const { language } = useLanguage()

  // Check for browser Speech Recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechAPI)
  }, [])

  // Cleanup recognition on unmount or close
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // Stop listening when chat closes
  useEffect(() => {
    if (!isOpen) stopListening()
  }, [isOpen, stopListening])

  const toggleVoiceInput = useCallback(() => {
    setVoiceError(null)

    if (isListening) {
      stopListening()
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechAPI) {
      setVoiceError('Voice input is not supported in your browser.')
      return
    }

    const recognition: AnySpeechRecognition = new SpeechAPI()
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError(null)
      finalTranscript = ''
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim = transcript
        }
      }
      // Show interim results immediately in the textarea
      setInput(finalTranscript + interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Please allow microphone access in your browser.')
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected. Please try again.')
      } else if (event.error !== 'aborted') {
        setVoiceError('Voice input error. Please try again.')
      }
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      // Focus textarea so user can review/edit before sending
      setTimeout(() => textareaRef.current?.focus(), 100)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, language, stopListening])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Prepare history for API (excluding the intro message if we want to save tokens, but keeping it is fine)
    const history = messages
      .filter(m => !m.isError)
      .map(m => ({ role: m.role, parts: [{ text: m.text }] }))

    try {
      const response = await sendChatMessage(history, userMessage.text, language)
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response
      }
      setMessages(prev => [...prev, modelMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  // Renders a single line with **bold** support
  const renderLine = (line: string, key: number) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-teal-300 font-semibold">{part.slice(2, -2)}</strong>
      }
      return <span key={j}>{part}</span>
    })
  }

  // Formatting markdown-lite (bolding and bullet points)
  const formatText = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let bulletBuffer: React.ReactNode[] = []

    const flushBullets = (keyPrefix: number) => {
      if (bulletBuffer.length > 0) {
        elements.push(
          <ul key={`ul-${keyPrefix}`} className="ml-4 my-1 space-y-0.5 list-disc list-inside">
            {bulletBuffer}
          </ul>
        )
        bulletBuffer = []
      }
    }

    lines.forEach((line, i) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.slice(2)
        bulletBuffer.push(
          <li key={i} className="text-slate-200">{renderLine(content, i)}</li>
        )
      } else if (trimmed === '') {
        flushBullets(i)
        // Don't add empty line elements — just a small gap via the list spacing
      } else if (trimmed.startsWith('### ')) {
        flushBullets(i)
        elements.push(<p key={i} className="font-bold text-teal-300 mt-2 mb-0.5">{trimmed.slice(4)}</p>)
      } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushBullets(i)
        const content = trimmed.replace(/^#+\s/, '')
        elements.push(<p key={i} className="font-bold text-white mt-2 mb-0.5">{content}</p>)
      } else {
        flushBullets(i)
        if (trimmed.length > 0) {
          elements.push(<p key={i} className="mt-1 leading-relaxed">{renderLine(trimmed, i)}</p>)
        }
      }
    })
    flushBullets(lines.length)
    return <>{elements}</>
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 p-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:scale-110 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] skew-x-12" />
          <MessageSquare size={24} className="relative z-10" />
          
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ease-in-out transform origin-bottom-right
            ${isExpanded 
              ? 'inset-0 sm:inset-4 lg:inset-x-[15vw] lg:inset-y-[10vh] rounded-none sm:rounded-3xl' 
              : 'bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-3xl'}
            bg-slate-900/90 backdrop-blur-2xl border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.15)]
            flex flex-col overflow-hidden
          `}
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-teal-500/10 blur-[50px] pointer-events-none" />

          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-teal-500/20 animate-pulse" />
                   <Sparkles size={18} className="text-teal-400 relative z-10" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-white tracking-wide">Ask HEALNEST</h3>
                <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  AI Assistant Online
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={14} className="text-teal-400" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div 
                  className={`
                    max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-md' 
                      : msg.isError
                      ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-sm'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md'
                    }
                  `}
                >
                  {msg.role === 'model' ? formatText(msg.text) : <p>{msg.text}</p>}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={14} className="text-teal-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-10 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only show if no user messages yet, or just initial) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 relative z-10">
              {["Why do I get hiccups?", "What helps a mild headache?", "My tooth hurts when I chew", "Tips for better sleep"].map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 transition-colors whitespace-nowrap"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20 relative z-10">
            {/* Voice error message */}
            {voiceError && (
              <div className="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {voiceError}
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs text-red-300 font-medium">Listening… speak now</span>
                <span className="ml-auto text-[10px] text-red-400">Tap mic to stop</span>
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening…' : 'Ask about a symptom or health topic...'}
                className={`w-full max-h-32 min-h-[44px] rounded-xl bg-white/5 border p-3 pr-20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 resize-none transition-all scrollbar-hide ${
                  isListening
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/30'
                    : 'border-white/10 focus:border-teal-500/50 focus:ring-teal-500/50'
                }`}
                rows={1}
                disabled={isTyping}
                style={{ 
                  height: input ? `${Math.min(120, Math.max(44, input.split('\n').length * 20 + 24))}px` : '44px' 
                }}
              />
              <div className="absolute right-1 bottom-1 flex items-center gap-1">
                {/* Mic button */}
                {voiceSupported && (
                  <button
                    onClick={toggleVoiceInput}
                    disabled={isTyping}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isListening
                        ? 'text-red-400 bg-red-500/15 hover:bg-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        : isTyping
                        ? 'text-slate-600 bg-transparent cursor-not-allowed'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className={`
                    p-2 rounded-lg transition-colors
                    ${!input.trim() || isTyping 
                      ? 'text-slate-500 bg-transparent' 
                      : 'text-white bg-teal-500 hover:bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'}
                  `}
                >
                  {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
            <div className="mt-2 text-center">
               <p className="text-[9px] text-slate-500">
                 HEALNEST AI is an assistant, not a doctor. Always consult a healthcare professional for serious concerns.
               </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
