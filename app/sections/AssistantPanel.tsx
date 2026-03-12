'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { callAIAgent, extractText } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { HiOutlineXMark, HiOutlinePaperAirplane, HiOutlineClipboardDocument, HiOutlineCheckCircle, HiOutlineArrowPath } from 'react-icons/hi2'
import { TbMessageChatbot } from 'react-icons/tb'

const AGENT_ID = '69b23873b4ae37dbd0601e42'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  codeSnippet?: string
  componentName?: string
  relatedComponents?: string[]
  error?: boolean
}

interface AssistantPanelProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToComponent?: (componentName: string) => void
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-xs leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-xs leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-xs leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

export default function AssistantPanel({ isOpen, onClose, onNavigateToComponent }: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    'Which component for forms?',
    'Show Button variants',
    'Explain DataTable props',
    'Accessibility guidelines',
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const result = await callAIAgent(text.trim(), AGENT_ID)
      if (result.success && result?.response?.result) {
        const data = result.response.result
        const answer = data?.answer || data?.text || data?.message || extractText(result.response) || 'No response received.'
        const codeSnippet = data?.code_snippet || ''
        const componentName = data?.component_name || ''
        const relatedComponents = Array.isArray(data?.related_components) ? data.related_components : []

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: answer,
          codeSnippet,
          componentName,
          relatedComponents,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result?.error || 'Something went wrong. Please try again.',
          error: true,
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error. Please try again.',
        error: true,
      }])
    }
    setLoading(false)
  }, [loading])

  const handleCopyCode = useCallback(async (code: string, idx: number) => {
    const ok = await copyToClipboard(code)
    if (ok) {
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }, [input, sendMessage])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-[hsl(0,0%,98%)]/90 backdrop-blur-[20px] border-l border-[hsl(214,32%,91%)] z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(214,32%,91%)]">
          <div className="flex items-center gap-2">
            <TbMessageChatbot className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-semibold text-[hsl(222,47%,11%)]">Component Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 transition-colors">
            <HiOutlineXMark className="h-5 w-5 text-[hsl(215,16%,47%)]" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="space-y-4 pt-4">
              <p className="text-xs text-[hsl(215,16%,47%)] text-center leading-relaxed">Ask me about components, props, variants, accessibility, or best practices.</p>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/60 border border-[hsl(214,32%,91%)] text-xs text-[hsl(222,47%,11%)] hover:bg-white/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 ${msg.role === 'user' ? 'bg-[hsl(222,47%,11%)] text-white' : msg.error ? 'bg-red-50 border border-red-200' : 'bg-white border border-[hsl(214,32%,91%)]'}`}>
                {msg.role === 'user' ? (
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="space-y-2">
                    {msg.componentName && (
                      <Badge variant="secondary" className="text-[10px] mb-1">{msg.componentName}</Badge>
                    )}
                    <div className="text-[hsl(222,47%,11%)]">
                      {renderMarkdown(msg.content)}
                    </div>
                    {msg.codeSnippet && (
                      <div className="mt-2 rounded-lg bg-slate-900 p-3 relative group">
                        <button
                          onClick={() => handleCopyCode(msg.codeSnippet || '', idx)}
                          className="absolute top-2 right-2 p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <HiOutlineClipboardDocument className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                        <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{msg.codeSnippet}</pre>
                      </div>
                    )}
                    {Array.isArray(msg.relatedComponents) && msg.relatedComponents.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px] text-[hsl(215,16%,47%)] mr-1">Related:</span>
                        {msg.relatedComponents.map((rc) => (
                          <button
                            key={rc}
                            onClick={() => onNavigateToComponent?.(rc)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                          >
                            {rc}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.error && (
                      <button
                        onClick={() => {
                          const lastUser = messages.filter(m => m.role === 'user').pop()
                          if (lastUser) sendMessage(lastUser.content)
                        }}
                        className="flex items-center gap-1 text-[10px] text-red-600 hover:text-red-700 mt-1"
                      >
                        <HiOutlineArrowPath className="h-3 w-3" /> Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-xl px-3 py-3 bg-white border border-[hsl(214,32%,91%)]">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />
        <div className="p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about components..."
              className="text-xs bg-white/60 border-[hsl(214,32%,91%)] rounded-lg"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,20%)] rounded-lg shrink-0"
            >
              <HiOutlinePaperAirplane className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
