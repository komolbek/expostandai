import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage, ChatState, ChatResponse } from './types'
import { getSystemPrompt } from './prompts'

// Lazy initialization to avoid build-time errors
let _anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }
    _anthropic = new Anthropic({ apiKey })
  }
  return _anthropic
}

export async function processChat(
  messages: ChatMessage[],
  currentState: ChatState
): Promise<ChatResponse> {
  const systemPrompt = getSystemPrompt(currentState)

  // Convert our messages to Anthropic format
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))

  // If this is the start of conversation, add initial context
  if (messages.length === 0) {
    anthropicMessages.push({
      role: 'user',
      content: 'Начать разговор',
    })
  }

  try {
    const anthropic = getAnthropic()
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    })

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let parsed: {
      message: string
      quickReplies?: string[] | null
      multiSelect?: boolean
      inputType?: 'text' | 'number' | 'date' | 'file' | null
      extractedData?: Record<string, unknown> | null
      nextPhase: string
      isComplete: boolean
    }

    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        // If Claude didn't return JSON, create a default response
        parsed = {
          message: textContent.text,
          nextPhase: currentState.phase,
          isComplete: false,
        }
      }
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        message: textContent.text,
        nextPhase: currentState.phase,
        isComplete: false,
      }
    }

    // Update collected data if Claude extracted anything
    const updatedData = { ...currentState.collectedData }
    if (parsed.extractedData) {
      Object.assign(updatedData, parsed.extractedData)
    }

    return {
      message: parsed.message,
      quickReplies: parsed.quickReplies || undefined,
      multiSelect: parsed.multiSelect,
      inputType: parsed.inputType || undefined,
      updatedState: {
        phase: parsed.nextPhase as ChatState['phase'],
        collectedData: updatedData,
        isComplete: parsed.isComplete,
      },
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw error
  }
}

// Initial greeting message
export function getInitialMessage(): ChatResponse {
  return {
    message:
      'Привет! 👋 Я помогу вам создать дизайн выставочного стенда. Давайте начнём! Как называется ваша компания?',
    inputType: 'text',
    updatedState: {
      phase: 'company_name',
      collectedData: {},
      isComplete: false,
    },
  }
}
