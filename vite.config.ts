import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import { performAIExtraction } from './src/ai/serverExtractor'
import { performAIExplanation } from './src/ai/serverExplanation'
import { performSummaryFormatting } from './src/ai/serverFormatSummary'
import { performAIChat } from './src/ai/serverChat'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function apiExtractPlugin(): Plugin {
  return {
    name: 'api-extract-plugin',
    configureServer(server) {
      server.middlewares.use('/api/extract', async (req, res, next) => {
        if (req.originalUrl !== '/api/extract') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { text, language } = JSON.parse(body || '{}')
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const apiKeys = [env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(Boolean) as string[]
            const result = await performAIExtraction(apiKeys, text, language || 'en')
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Extraction failed', message: String(err) }))
          }
        })
      })

      server.middlewares.use('/api/explain', async (req, res, next) => {
        if (req.originalUrl !== '/api/explain') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { outcome, reason, carePathwayTemplate, language, caregiverContext } = JSON.parse(body || '{}')
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const apiKeys = [env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(Boolean) as string[]
            
            console.log('[HEALNEST BACKEND DEBUG] /api/explain called.')
            console.log(`[HEALNEST BACKEND DEBUG] Available API keys: ${apiKeys.length}`)
            
            const result = await performAIExplanation(apiKeys, outcome, reason, carePathwayTemplate, language || 'en', caregiverContext)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            console.error('[HEALNEST BACKEND DEBUG] /api/explain Error:', err)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Explanation failed', message: String(err) }))
          }
        })
      })

      server.middlewares.use('/api/formatSummary', async (req, res, next) => {
        if (req.originalUrl !== '/api/formatSummary') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { context, result: assessResult, language, caregiverContext } = JSON.parse(body || '{}')
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const apiKeys = [env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(Boolean) as string[]
            
            const summaryText = await performSummaryFormatting(context, assessResult, language || 'en', apiKeys, caregiverContext)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ summary: summaryText }))
          } catch (err) {
            console.error('[HEALNEST BACKEND DEBUG] /api/formatSummary Error:', err)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Formatting failed', message: String(err) }))
          }
        })
      })

      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.originalUrl !== '/api/chat') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { history, newMessage, language } = JSON.parse(body || '{}')
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const apiKeys = [env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(Boolean) as string[]

            console.log(`[HEALNEST CHAT API] /api/chat called. Keys configured: ${apiKeys.length}. Message: "${String(newMessage).substring(0, 80)}"`)

            if (apiKeys.length === 0) {
              console.error('[HEALNEST CHAT API] No API keys found in environment. Check .env file for GEMINI_API_KEY_1.')
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ response: 'HEALNEST AI is temporarily offline. Please check that API keys are configured in your .env file.' }))
              return
            }

            const responseText = await performAIChat(apiKeys, history || [], newMessage, language || 'en')
            console.log(`[HEALNEST CHAT API] Response ready, length: ${responseText.length}`)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ response: responseText }))
          } catch (err) {
            console.error('[HEALNEST BACKEND DEBUG] /api/chat Error:', err)
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ response: 'HEALNEST AI is temporarily unavailable. Please try again shortly, or use the Symptom Checker for structured guidance.' }))
          }
        })
      })

      // Diagnostic endpoint — returns key configuration status WITHOUT exposing key values
      server.middlewares.use('/api/diagnostic', async (req, res, next) => {
        if (!req.originalUrl?.startsWith('/api/diagnostic')) return next()
        const env = loadEnv(server.config.mode, process.cwd(), '')
        const keys = [
          { name: 'GEMINI_API_KEY_1', value: env.GEMINI_API_KEY_1 },
          { name: 'GEMINI_API_KEY_2', value: env.GEMINI_API_KEY_2 },
          { name: 'GEMINI_API_KEY_3', value: env.GEMINI_API_KEY_3 },
        ]
        const report = keys.map(k => ({
          name: k.name,
          configured: !!k.value,
          length: k.value?.length || 0,
          prefix: k.value ? `${k.value.substring(0, 8)}...` : 'NOT SET',
        }))
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({
          model: 'gemini-flash-lite-latest (with automated failover to gemini-3.5-flash)',
          keysConfigured: report.filter(k => k.configured).length,
          keys: report,
          note: 'Google Gemini API keys (supports AIza... and AQ... formats with multi-model failover).',
        }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiExtractPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
