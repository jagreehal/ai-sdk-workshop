import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ToolUIPart } from 'ai';

import { Conversation, ConversationContent, ConversationScrollButton } from './components/ai-elements/conversation';
import { Message, MessageContent } from './components/ai-elements/message';
import { Response } from './components/ai-elements/response';
import { PromptInput, PromptInputTextarea, PromptInputSubmit, PromptInputToolbar } from './components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from './components/ai-elements/suggestion';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from './components/ai-elements/tool';

import { destinations } from './data';

const budgetColors = {
  budget: 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/25',
  medium: 'bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/25',
  luxury: 'bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/25',
};

const typeColors = {
  city: 'text-sky-200',
  beach: 'text-cyan-200',
  adventure: 'text-orange-200',
  cultural: 'text-fuchsia-200',
};

const samplePrompts = [
  'Plan a 3-day Lisbon city break under £500 from London.',
  'Compare Tokyo and Kyoto for a first trip to Japan in spring.',
  'I want a warm beach holiday on a budget with good food.',
];

export default function App() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';

  const askAbout = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const handleSubmit = (message: { text?: string }) => {
    if (!message.text?.trim() || isLoading) return;
    sendMessage({ text: message.text });
    setInput('');
  };

  return (
    <div className="h-screen overflow-hidden bg-[var(--surface)] text-slate-50">
      <div className="mx-auto flex h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">

        {/* ── Sidebar ── */}
        <aside className="tripmate-panel flex w-full shrink-0 flex-col overflow-hidden lg:w-[360px]">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">TripMate Workshop</p>
            <h1 className="tripmate-display mt-3 text-3xl text-white">Build the travel agent you wish booking sites had.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Explore the curated destinations dataset, trigger tools, and watch an AI SDK agent plan in real time.
            </p>
          </div>

          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Quick prompts</p>
            <Suggestions className="mt-3">
              {samplePrompts.map((prompt) => (
                <Suggestion
                  key={prompt}
                  suggestion={prompt}
                  onClick={askAbout}
                />
              ))}
            </Suggestions>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() =>
                    askAbout(`Plan a 3-day trip to ${dest.name}. Include weather, standout experiences, and budget notes.`)
                  }
                  className="group w-full rounded-[24px] border border-white/10 bg-white/6 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{dest.name}</p>
                      <p className={`mt-1 text-xs uppercase tracking-[0.22em] ${typeColors[dest.type]}`}>
                        {dest.type}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${budgetColors[dest.budget]}`}>
                      {dest.budget}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{dest.description.slice(0, 132)}...</p>
                  <p className="mt-3 text-xs text-slate-400">Climate: {dest.climate}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Chat (AI Elements) ── */}
        <main className="tripmate-panel flex min-h-[70vh] flex-1 flex-col overflow-hidden">
          <header className="border-b border-white/10 px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">Streaming Agent UI</p>
                <h2 className="tripmate-display mt-2 text-3xl text-white">TripMate Control Room</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ask for recommendations, compare destinations, or build a plan. Tool calls appear inline as the assistant works.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Model</span>
                  granite4:latest
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Mode</span>
                  {isLoading ? 'Streaming' : 'Ready'}
                </div>
              </div>
            </div>
          </header>

          {/* Chat area — AI Elements Conversation */}
          <Conversation className="flex-1 px-5 py-5">
            <ConversationContent>
              {messages.length === 0 ? (
                <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.16),_transparent_52%),rgba(15,23,42,0.84)] p-6">
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Start Here</p>
                    <h3 className="tripmate-display mt-3 text-4xl text-white">Pick a destination or drop in a real trip brief.</h3>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                      Good prompts mention origin, timing, budget, and trip style. TripMate can search destinations, check weather, compare flights, convert currencies, and pull activity ideas into one answer.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/6 p-6">
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Suggested asks</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-200">
                      <button className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left transition hover:bg-white/10" onClick={() => askAbout('Find me a cultural city break in Europe with great food and moderate prices.')}>
                        Find me a cultural city break in Europe with great food and moderate prices.
                      </button>
                      <button className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left transition hover:bg-white/10" onClick={() => askAbout('I want an adventure destination with cool weather, scenic hikes, and a mid-range budget.')}>
                        I want an adventure destination with cool weather, scenic hikes, and a mid-range budget.
                      </button>
                      <button className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left transition hover:bg-white/10" onClick={() => askAbout('Plan a friends trip with beach time, nightlife, and cheap flights from London.')}>
                        Plan a friends trip with beach time, nightlife, and cheap flights from London.
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  {messages.map((msg) => {
                    const textParts = msg.parts?.filter((p) => p.type === 'text') ?? [];
                    const toolParts = (msg.parts?.filter((p) => p.type.startsWith('tool-')) ?? []) as ToolUIPart[];
                    const text = textParts.map((p) => ('text' in p ? p.text : '')).join('');

                    return (
                      <Message key={msg.id} from={msg.role}>
                        <MessageContent variant="flat">
                          {text ? <Response>{text}</Response> : null}
                          {toolParts.length > 0 && msg.role === 'assistant' ? (
                            <div className="mt-2 space-y-2">
                              {toolParts.map((part) => (
                                <Tool key={part.toolCallId ?? `${part.type}-${part.state}`}>
                                  <ToolHeader type={part.type} state={part.state} />
                                  <ToolContent>
                                    {'input' in part && part.input ? <ToolInput input={part.input} /> : null}
                                    {'output' in part || 'errorText' in part ? (
                                      <ToolOutput output={'output' in part ? part.output : undefined} errorText={'errorText' in part ? part.errorText : undefined} />
                                    ) : null}
                                  </ToolContent>
                                </Tool>
                              ))}
                            </div>
                          ) : null}
                        </MessageContent>
                      </Message>
                    );
                  })}

                  {isLoading ? (
                    <Message from="assistant">
                      <MessageContent variant="flat">
                        <div className="flex items-center gap-2 text-cyan-200 text-xs">
                          <div className="size-3 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                          TripMate is planning
                        </div>
                      </MessageContent>
                    </Message>
                  ) : null}
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input area — AI Elements PromptInput */}
          <div className="border-t border-white/10 px-5 py-5">
            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error.message}
              </div>
            ) : null}

            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about destinations, flight budgets, weather, activities, or a full itinerary..."
              />
              <PromptInputToolbar>
                <div />
                <PromptInputSubmit status={status} disabled={!input.trim() && !isLoading} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </main>
      </div>
    </div>
  );
}
