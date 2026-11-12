/** The languages the hub offers; the page and the messages to Claude follow the one chosen there. */
export type Lang = 'en' | 'ru' | 'uk'

export type TaskKind = 'bug' | 'feature'

export type Task = { kind: TaskKind; title: string; summary: string; ref: string; steps: string[] }

/** A: the variant adds the file, M: changes it, D: deletes it. */
export type FileStatus = 'A' | 'M' | 'D'

export type FileRef = { path: string; status: FileStatus }

export type Edit = { old: string; new: string }

/** One file of a variant's code, as Claude gives it: edits for a changed file, the content of a new one, or its deletion. */
export type FileCode = { path: string; edits: Edit[] } | { path: string; content: string } | { path: string; deleted: true }

export type CodeStatus = 'none' | 'queued' | 'loading' | 'ready' | 'error'

/** A variant's code once laid over the files: each file's text after the variant, and how many lines it adds and removes. */
export type Code = {
  status: CodeStatus
  error: string
  after: Record<string, string>
  counts: Record<string, { add: number; del: number }>
  /** Who wrote it: a fork, the session (a fallback, or a variant that came with code), or the page's combination. */
  via: 'fork' | 'session' | 'combine' | ''
  /** How many times a fork failed it: the second failure goes through the session. */
  tries: number
}

export type Variant = {
  key: string
  title: string
  short: string
  essence: string
  pros: string[]
  cons: string[]
  files: FileRef[]
  /** Test files or filters that cover the variant, as Claude named them; run by the tests mod after Apply. */
  tests: string[]
  origin: 'claude' | 'combined'
  /** For a combined variant: which variant each file came from. */
  from: Record<string, string>
  code: Code
}

export type Via = 'quick' | 'deep' | 'session'

export type ChatKind = 'ask' | 'own' | 'another' | 'combine' | 'note'

export type ChatMessage = {
  id: number
  at: number
  by: 'you' | 'claude'
  kind: ChatKind
  text: string
  code: string
  refs: string[]
  via: Via | ''
  /** The variant the message was about. */
  variant: string
  /** For a quick answer: the question, so "ask with the whole conversation" can ask it again. */
  question: string
}

export type Busy = { what: 'ask' | 'deep' | 'session'; since: number } | null

export type TestRun = { runId: string; url: string; key: string; state: string; passed: number; failed: number }

export type State = {
  v: 1
  project: string
  branch: string
  task: Task | null
  recommended: string
  variants: Variant[]
  /** Each file a variant touches, as it was on disk when the variants were proposed ("" for a file that is not there). */
  bases: Record<string, string>
  selected: string
  applied: string
  /** Files that changed on disk since the variants were proposed: Apply waits until the code is fetched again. */
  drift: string[]
  chat: ChatMessage[]
  busy: Busy
  /** How many messages wait for the session's turn to end. */
  queued: number
  hasTests: boolean
  testRun: TestRun | null
  /** What was done on the page that Claude has not heard of yet: it rides beside the user's next message. */
  news: string[]
}

/** One press on the page, as the mod reads it. */
export type PageAction =
  | { type: 'open'; key: string }
  | { type: 'regen'; key: string }
  | { type: 'choose'; key: string }
  | { type: 'unchoose' }
  | { type: 'apply'; key: string; runTests: boolean }
  | { type: 'combine'; picks: Record<string, string>; note: string; checkSeams: boolean }
  | { type: 'another'; constraints: string[]; note: string }
  | { type: 'own'; text: string; code: string; refs: string[]; key: string }
  | { type: 'ask'; text: string; refs: string[]; key: string; deep: boolean }

export type PageMessage = PageAction & { lang: Lang }
