import { expect, test } from 'vitest'
import type { StreamEvent } from '../api/types'
import { applyEvent, initialLiveState } from './applyEvent'

const NOW = '2026-11-24T10:00:00.000Z'

function applyAll(events: StreamEvent[], state = initialLiveState) {
  return events.reduce((current, event) => applyEvent(current, event, NOW), state)
}

// Two AI replies streaming at the same time, the way the server interleaves them.
const twoReplies: StreamEvent[] = [
  { id: 1, type: 'message_start', conversationId: 'c-1', messageId: 'm-1', role: 'ai' },
  { id: 2, type: 'message_start', conversationId: 'c-2', messageId: 'm-2', role: 'ai' },
  { id: 3, type: 'token', conversationId: 'c-1', messageId: 'm-1', text: 'Hello' },
  { id: 4, type: 'token', conversationId: 'c-2', messageId: 'm-2', text: 'مرحبا' },
  { id: 5, type: 'token', conversationId: 'c-1', messageId: 'm-1', text: ' world' },
  { id: 6, type: 'message_end', conversationId: 'c-1', messageId: 'm-1' },
]

test('appends tokens in order and to the right conversation', () => {
  const state = applyAll(twoReplies)

  expect(state.lastEventId).toBe(6)
  expect(state.messages['c-1']).toHaveLength(1)
  expect(state.messages['c-1'][0]).toMatchObject({ id: 'm-1', role: 'ai', text: 'Hello world' })
  expect(state.messages['c-1'][0].streaming).toBeUndefined()
  expect(state.messages['c-2'][0]).toMatchObject({ id: 'm-2', text: 'مرحبا', streaming: true })
})

test('ignores events replayed after a resume', () => {
  const state = applyAll(twoReplies)

  // The server replays from a few events before the one we asked for.
  const replayed = applyAll(twoReplies.slice(-3), state)

  // Same object, not just an equal one: nothing changed, so nothing re-renders.
  expect(replayed).toBe(state)
})

test('adds a complete message after the ones already there', () => {
  const state = applyAll([
    ...twoReplies,
    {
      id: 7,
      type: 'message',
      conversationId: 'c-1',
      message: { id: 'm-3', conversationId: 'c-1', role: 'customer', text: 'Thanks', createdAt: NOW },
    },
  ])

  expect(state.messages['c-1'].map((message) => message.id)).toEqual(['m-1', 'm-3'])
  expect(state.lastEventId).toBe(7)
})

test('picks up a reply that started before the stream connected', () => {
  const state = applyAll([
    { id: 40, type: 'token', conversationId: 'c-1', messageId: 'm-9', text: ' late' },
    { id: 41, type: 'token', conversationId: 'c-1', messageId: 'm-9', text: ' tokens' },
  ])

  expect(state.messages['c-1'][0]).toMatchObject({
    id: 'm-9',
    role: 'ai',
    text: ' late tokens',
    streaming: true,
    createdAt: NOW,
    tokens: [
      { eventId: 40, text: ' late' },
      { eventId: 41, text: ' tokens' },
    ],
  })
})

test('a hand-off adds the reason to the thread and changes the status', () => {
  const state = applyAll([
    {
      id: 1,
      type: 'message',
      conversationId: 'c-3',
      message: { id: 'm-1', conversationId: 'c-3', role: 'customer', text: 'Hi', createdAt: NOW },
    },
    {
      id: 2,
      type: 'tool_call',
      conversationId: 'c-3',
      name: 'transfer_to_human',
      args: { reason: 'Customer asked to speak to a person' },
    },
    { id: 3, type: 'status', conversationId: 'c-3', status: 'needs_human' },
  ])

  expect(state.messages['c-3']).toMatchObject([
    { id: 'm-1', role: 'customer' },
    { id: 'handoff-2', role: 'handoff', text: 'Customer asked to speak to a person' },
  ])
  expect(state.statuses['c-3']).toBe('needs_human')
  expect(state.statuses['c-1']).toBeUndefined()
  expect(state.lastEventId).toBe(3)
})
