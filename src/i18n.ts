import { useAppStore } from './store/appStore'

const timeOptions = { hour: '2-digit', minute: '2-digit' } as const

const en = {
  title: 'Conversation Monitor',
  /** The language button shows the language it switches to. */
  otherLanguage: 'العربية',
  conversations: 'Conversations',
  selectConversation: 'Select a conversation',
  loadingConversations: 'Loading conversations…',
  loadingMessages: 'Loading messages…',
  loadConversationsFailed: 'Could not load conversations:',
  loadMessagesFailed: 'Could not load messages:',
  retry: 'Retry',
  connection: { connecting: 'Connecting…', connected: 'Live', reconnecting: 'Reconnecting…' },
  status: {
    ai: 'AI handling',
    needs_human: 'Needs human',
    human: 'Human handling',
    closed: 'Closed',
  },
  role: { customer: 'Customer', ai: 'AI', human: 'Human' },
  unread: (count: number) => `${count} unread messages`,
  handedOver: 'Handed over to a human:',
  takeOver: 'Take over',
  takingOver: 'Taking over…',
  takeOverFailed: 'Could not take over',
  typing: 'AI is typing…',
  sending: 'Sending…',
  notSent: 'Not sent:',
  reply: 'Reply',
  replyPlaceholder: 'Write a reply…',
  send: 'Send',
  stop: 'Stop',
  resume: 'Resume',
  // One formatter per language, created once: building one per message would be
  // wasteful in a conversation with thousands of messages.
  time: new Intl.DateTimeFormat('en', timeOptions),
}

// `typeof en`: TypeScript reports an error if a text is missing here.
const ar: typeof en = {
  title: 'مراقبة المحادثات',
  otherLanguage: 'English',
  conversations: 'المحادثات',
  selectConversation: 'اختر محادثة',
  loadingConversations: 'جارٍ تحميل المحادثات…',
  loadingMessages: 'جارٍ تحميل الرسائل…',
  loadConversationsFailed: 'تعذّر تحميل المحادثات:',
  loadMessagesFailed: 'تعذّر تحميل الرسائل:',
  retry: 'إعادة المحاولة',
  connection: {
    connecting: 'جارٍ الاتصال…',
    connected: 'متصل',
    reconnecting: 'جارٍ إعادة الاتصال…',
  },
  status: {
    ai: 'مع المساعد الآلي',
    needs_human: 'تحتاج موظفاً',
    human: 'مع موظف',
    closed: 'مغلقة',
  },
  role: { customer: 'العميل', ai: 'المساعد الآلي', human: 'الموظف' },
  unread: (count: number) => `غير مقروءة: ${count}`,
  handedOver: 'حُوّلت إلى موظف:',
  takeOver: 'استلام المحادثة',
  takingOver: 'جارٍ الاستلام…',
  takeOverFailed: 'تعذّر الاستلام',
  typing: 'المساعد الآلي يكتب…',
  sending: 'جارٍ الإرسال…',
  notSent: 'لم تُرسل:',
  reply: 'الرد',
  replyPlaceholder: 'اكتب رداً…',
  send: 'إرسال',
  stop: 'إيقاف',
  resume: 'متابعة',
  time: new Intl.DateTimeFormat('ar', timeOptions),
}

const text = { en, ar }

/** The interface text in the current language. */
export function useText() {
  return text[useAppStore((state) => state.lang)]
}
