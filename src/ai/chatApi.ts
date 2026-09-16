/**
 * Client-Side AI Chat Caller
 */
export async function sendChatMessage(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  language: string = 'en'
): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for chat

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, newMessage, language }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('[HEALNEST Chat] Network request failed:', error)
    throw error
  }
}
