import { NextRequest, NextResponse } from 'next/server'
import { processChat, getInitialMessage } from '@/lib/ai'
import type { ChatRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, currentState } = body

    // If no messages, return initial greeting
    if (!messages || messages.length === 0) {
      const initialResponse = getInitialMessage()
      return NextResponse.json(initialResponse)
    }

    // Process the chat with Claude
    const response = await processChat(messages, currentState)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        message: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        updatedState: {
          phase: 'greeting',
          collectedData: {},
          isComplete: false,
        },
      },
      { status: 500 }
    )
  }
}
