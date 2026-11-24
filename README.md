# Conversation Monitor

A live supervisor screen for AI conversations: a conversation list, a thread that streams the AI's reply word by word, hand-off to a human, and replies.

Built with React 19, TypeScript (strict), Vite, TanStack Query, Zustand, react-virtuoso, Tailwind CSS and Vitest.

**Live demo:** https://monitor.sayedesmail.com

The demo runs the app and the unchanged mock server on one host. The mock's data is shared by all visitors and resets every night.

## How to run it

You need Node 22.12 or newer.

```bash
npm install
npm run mock   # the mock server, on http://localhost:4000
npm run dev    # the app, on http://localhost:5173 (in a second terminal)
```

Other commands:

```bash
npm test       # unit tests
npm run build  # type check and production build
npm run lint
```

- `mock-server.mjs` is the file from the assessment, unchanged.
- If the mock runs on another port, set `VITE_API_URL`, for example `VITE_API_URL=http://localhost:5000 npm run dev`.
- Restarting the mock resets its event ids, so reload the app after a restart.

## How server state and live state are split

The rule: **what REST returned is never modified. Everything that arrives later on the stream is kept separately, and the screen combines the two.**

**Server state: TanStack Query** (`src/api`)

- The conversation list and each conversation's messages, exactly as the REST API returned them.
- They are snapshots. `staleTime: Infinity` stops any automatic refetch, because after loading, the stream is what keeps the screen up to date.
- Each snapshot carries its own `lastEventId`.

**Live state: Zustand** (`src/store/appStore.ts`)

- `live`: everything the stream has delivered since the list was loaded. It is produced by one pure function, `applyEvent(state, event)` in `src/stream/applyEvent.ts`. It holds:
  - the id of the last event applied,
  - per conversation: the messages from the stream, with the hand-off reason as a line among them,
  - the latest status of each conversation,
  - replies the user sent that the server has not confirmed yet.
- UI state: the selected conversation, what the user has already seen (for the unread count), the language, and the connection state.

**Combining them at render time**

- Thread: `mergeThread(snapshot, live)` in `src/stream/mergeThread.ts`. Old messages come from the snapshot, new ones from the stream, and a message that is in both is shown once.
- List: each item takes the conversation from the snapshot and reads its live status, last message and new customer messages from the store.

Why this split:

- Each piece of data has one writer. REST writes the snapshot once, the reducer writes the live state. Nothing has to be kept in sync by hand.
- `applyEvent` and `mergeThread` are pure functions with no React, no network and no clock, so the hard part of the app is covered by plain unit tests.
- The reducer copies only what changed. A message that did not change stays the same object, so a new token re-renders one message bubble, not the whole thread. Together with the virtual list, this is what keeps the 5,000-message conversation fast.

## How resuming after a drop works

1. The conversation list loads. Its `lastEventId` is the starting point.
2. `connectStream(startId)` (`src/stream/connectStream.ts`) opens `GET /events?since=<startId>`.
3. Every event goes through `applyEvent`. Its first line is the rule against duplicates:

   ```ts
   if (event.id <= state.lastEventId) return state
   ```

   Event ids only go up, so an id we have already passed is ignored. Otherwise the event is applied and `lastEventId` becomes its id.
4. When the connection drops, the client closes it, shows "Reconnecting…", and opens a new connection with `since` set to the store's current `lastEventId`. The wait starts at 0.5 s and doubles up to 10 s while the server stays unreachable.
5. The server replays from a few events early on purpose. The rule in step 3 drops them, so no token is shown twice. Because the client always asks from the last event it applied, no token is lost.

There is a second case: a conversation opened in the middle of an AI reply. Its messages snapshot already contains the first part of the text, and it has its own `lastEventId`, which is later than the stream's starting point. To handle this, the reducer keeps every token together with its event id, and `mergeThread` takes the snapshot's text and adds only the tokens whose event id is greater than the snapshot's `lastEventId`.

The tests in `src/stream` cover: tokens in order and in the right conversation with two replies streaming at once, replayed events after a resume, a reply that started before the stream connected, the hand-off event, a reply caught half-written by a snapshot, and the user's own reply coming back from the stream.

## A finding in the mock server

The built-in `EventSource` reconnects on its own and sends `Last-Event-ID`, but it always reuses the first URL. The mock reads the query parameter first:

```js
const since = url.searchParams.get('since') ?? req.headers['last-event-id'];
```

So if the first URL contains `since`, every automatic reconnect replays the stream from that first id again, and the replay grows with every drop. The state stays correct because duplicates are ignored, but the work is wasted. That is why the client closes the connection on an error and opens a new one itself. Preferring the header when it is present would fix it in the server.

## What I skipped

- **Unread counts only last for the session.** The API has no "mark as read", so the rule is on the client: opening or leaving a conversation marks it as read. After a reload the server's count comes back.
- **The hand-off reason is shown only for hand-offs that happen while the app is open.** The REST API does not return past tool calls.
- **The list is not re-sorted on every message.** A conversation moves to the top only when it is handed over to a human. Sorting on every message made the rows jump every few seconds. After a reload the order is the server's again.
- **A reply that is rejected after the user moved to another conversation** is removed from the thread, but the error and the text are not shown, because that reply box is gone.
- **Error messages from the server are shown as they are**, in English, also in the Arabic interface.
- **The chosen language is not saved** across reloads.
- **No layout for small screens.** The two panes are designed for a desktop window.
- **Only the stream handling has tests.** There are no component or end-to-end tests.

## What I would improve with more time

- Validate API responses and events at runtime (for example with zod). Today the TypeScript types trust the server.
- Detect gaps: event ids go up by one, so a jump means a missed event and should trigger a new snapshot.
- End-to-end tests (Playwright) for a drop in the middle of a reply and for a rejected reply.
- Keep reply drafts and errors per conversation in the store, to close the rejected-reply gap above.
- An i18n library once the app needs plural rules or more languages, and remember the chosen language.
- Accessibility: announce a finished AI reply to screen readers, and test with a real screen reader.
- A responsive layout for phones and tablets: one pane at a time, with a back button from the thread to the list.
- Group messages that follow each other from the same sender: one name and one time per group, and a date separator between days.
- Search and filters in the conversation list, for example show only the conversations that need a human.
- From the backend: a "mark as read" endpoint, tool calls in the message history, error codes instead of text, and a reset signal on the stream for when event ids start again.
