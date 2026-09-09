'use client'
import { useState } from 'react'
import { aiApi } from '@/lib/api/ai'
import { Button } from '@/components/ui/button'
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hello! I am your AI Opportunity Analyst. I can help evaluate bidding feasibility, compute qualification checklists, compare opportunities, and summarize tender clauses. How can I assist your pipeline today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiApi.chat(text)
      const aiMsg: Message = {
        role: 'ai',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'I encountered an error connecting to the intelligence engine. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestedPrompts = [
    'Which opportunities in our radar should we pursue this week?',
    'What funding schemes are available for early-stage tech MSMEs?',
    'What are the mandatory compliance documents for GeM tenders?',
    'Compare high-score tenders vs grants currently closing in 14 days'
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[var(--border)] shrink-0">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-1)]">AI Opportunity Analyst</h1>
          <p className="text-xs text-[var(--text-3)]">Natural language opportunity exploration & decision engine</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="h-7 w-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] rounded-bl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-line">{m.content}</p>
              <span className={`block text-[10px] mt-2 font-mono text-right ${m.role === 'user' ? 'text-blue-200' : 'text-[var(--text-3)]'}`}>
                {m.timestamp}
              </span>
            </div>
            {m.role === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-7 w-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2 text-xs text-[var(--text-3)]">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              <span>Analyzing opportunities & Business DNA...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-left p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/40 text-xs text-[var(--text-2)] hover:text-blue-500 transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
              <span className="truncate">{p}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about tenders, grant eligibility, or match scoring..."
          className="flex-1 h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <Button size="lg" className="h-11 px-5" onClick={() => handleSend()} disabled={loading || !input.trim()} rightIcon={<Send className="h-4 w-4" />}>
          Send
        </Button>
      </div>
      <p className="text-[10px] text-center text-[var(--text-3)] mt-2">
        AI responses are estimates based on indexed registries. Always verify strict RFP requirements with issuing bodies.
      </p>
    </div>
  )
}
