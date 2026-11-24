import { expect, test } from 'vitest'
import type { Message } from '../api/types'
import type { LiveMessage } from './applyEvent'
import { mergeThread } from './mergeThread'

// A message as the REST snapshot returns it.
function message(id: string, text: string, extra: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'c-1',
    role: 'ai',
    text,
    createdAt: '2026-11-24T10:00:00.000Z',
    ...extra,
  }
}

// The same message as the reducer stores it.
function entry(id: string, text: string, extra: Partial<LiveMessage> = {}): LiveMessage {
  return { ...message(id, text), tokens: [], ...extra }
}

test('a reply the snapshot caught half-written gets only the newer tokens', () => {
  // The snapshot was taken at event 12, in the middle of reply m-2.
  const snapshot = {
    lastEventId: 12,
    messages: [message('m-1', 'Hi'), message('m-2', 'Thanks for', { streaming: true })],
  }
  // The stream connected after the reply had started, so it has the tail only.
  const live = [
    entry('m-2', ' for waiting.', {
      tokens: [
        { eventId: 12, text: ' for' },
        { eventId: 13, text: ' waiting.' },
      ],
    }),
  ]

  const thread = mergeThread(snapshot, live)

  expect(thread.map((item) => item.text)).toEqual(['Hi', 'Thanks for waiting.'])
  expect(thread[1].streaming).toBeUndefined()
})

test('shows each message once and keeps the hand-off line in its place', () => {
  const snapshot = {
    lastEventId: 20,
    messages: [message('m-1', 'Old'), message('m-2', 'Help'), message('m-3', 'Hello?')],
  }
  const live = [
    entry('m-2', 'Help'),
    entry('handoff-15', 'Customer asked to speak to a person', { role: 'handoff' }),
    entry('m-3', 'Hello?'),
    entry('m-4', 'New'),
  ]

  const ids = mergeThread(snapshot, live).map((item) => item.id)

  expect(ids).toEqual(['m-1', 'm-2', 'handoff-15', 'm-3', 'm-4'])
})
