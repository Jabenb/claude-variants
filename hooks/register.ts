import type { EngineInterface, Register } from 'claude-code'

import type { ChatMessage, FileCode, Lang, PageMessage, State, Variant, Via } from '../types'
import {
  ADD,
  ADD_DESCRIPTION,
  ADD_SCHEMA,
  ADD_TOOL,
  ANSWER_CHARS,
  CODE,
  CODE_DESCRIPTION,
  CODE_SCHEMA,
  CODE_TOOL,
  EMPTY,
  EMPTY_CODE,
  MARK,
  MOD,
  PROPOSE,
  PROPOSE_DESCRIPTION,
  PROPOSE_SCHEMA,
  PROPOSE_TOOL,
  QUICK_SYSTEM,
  allPaths,
  baseName,
  codePrompt,
  combine,
  deepPrompt,
  langOf,
  layCode,
  parseAction,
  parseCodeReply,
  parseFileCodes,
  parsePropose,
  parseState,
  parseVariant,
  quickPrompt,
  totals,
  words,
} from './model'
import { PAGE } from './page/page'

const TITLE = 'Варианты'
const ICON = '⑂'
const COMMAND = 'variants'
const PULL_WAIT_MS = 5000
const PULL_STUCK_MS = PULL_WAIT_MS + 10_000
/** Two failed forks for one variant's code, then the session writes it. */
const FORK_TRIES = 2

const PROPOSE_CALL = new RegExp(`^${PROPOSE}$`)
const ADD_CALL = new RegExp(`^${ADD}$`)
const CODE_CALL = new RegExp(`^${CODE}$`)

/** One load of this module: the hub hands the page's presses to the newest load only. */
const LISTENER = `${Date.now()}-${Math.random().toString(36).slice(2)}`

/** This load's own values; a reload runs `register` again and starts them over, and `session.start` fills them back. */
let current: State = EMPTY
let lang: Lang = 'en'
let url = ''
let root = ''
let sessionFile = ''
let listening = { since: 0, isFirst: true, isStale: false }
let isWriting = false
/** Why the last fork's code for a variant failed, and the files it tripped on: the next try is shown them. */
let failures: Record<string, { error: string; files: Record<string, string> }> = {}
/** The main loop's turn: whether one runs, and the id of the one a message of this mod started. */
let turn = { isRunning: false, ownId: '', awaitsOwn: false }
/** Messages for the session that wait for its turn to end. */
let outbox: string[] = []
let queue: Promise<unknown> = Promise.resolve()

/** Changes run one at a time: each reads the state the one before it left. */
const serial = <T>(work: () => Promise<T>): Promise<T> => {
  const run = queue.then(work, work)
  queue = run.catch(() => undefined)

  return run
}

const abs = (path: string): string => (path.startsWith('/') ? path : `${root}/${path}`)

const readText = async ($: EngineInterface, path: string): Promise<string> => {
  try {
    return (await $.fs.exists(path)) ? String(await $.fs.read(path)) : ''
  } catch {
    return ''
  }
}

const git = async ($: EngineInterface, args: string[]): Promise<string> => {
  try {
    const { exitCode, stdout } = await $.process.run(['git', '-C', root, ...args])

    return exitCode === 0 ? stdout.trim() : ''
  } catch {
    return ''
  }
}

const badgeOf = (state: State): number => (state.task !== null && state.applied === '' ? state.variants.length : 0)

const show = async ($: EngineInterface): Promise<boolean> => {
  try {
    const page = await $.webhub.page({ mod: MOD, title: TITLE, html: PAGE, icon: ICON })
    url = page.url
    await $.webhub.push({ mod: MOD, state: current, badge: badgeOf(current) })

    return page.isUp
  } catch {
    return false
  }
}

const persist = async ($: EngineInterface): Promise<void> => {
  try {
    if (sessionFile === '') {
      const home = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${(await $.env.get('HOME')) ?? ''}/.claude`
      sessionFile = `${home}/mods-data/variants/sessions/${await $.session.id()}.json`
    }

    await $.fs.write(sessionFile, `${JSON.stringify(current)}\n`)
  } catch {
    return
  }
}

/** Changes the state, then the page and the session's file follow. */
const update = ($: EngineInterface, change: (state: State) => State): Promise<State> =>
  serial(async () => {
    current = change(current)

    try {
      await $.webhub.push({ mod: MOD, state: current, badge: badgeOf(current) })
    } catch {
      // the page catches up at the next push
    }

    await persist($)

    return current
  })

const withVariant = (key: string, change: (variant: Variant) => Variant) => (state: State): State => ({
  ...state,
  variants: state.variants.map(variant => (variant.key === key ? change(variant) : variant)),
})

const say = ($: EngineInterface, message: Omit<ChatMessage, 'id' | 'at'>, at: number): Promise<State> =>
  update($, state => ({ ...state, chat: [...state.chat, { ...message, id: (state.chat.at(-1)?.id ?? 0) + 1, at }] }))

const claudeSays = async ($: EngineInterface, text: string, via: Via, variant: string, question = ''): Promise<void> => {
  const trimmed = text.trim()
  await say($, { by: 'claude', kind: 'ask', text: trimmed.length > ANSWER_CHARS ? `${trimmed.slice(0, ANSWER_CHARS - 1)}…` : trimmed, code: '', refs: [], via, variant, question }, await $.clock.now())
}

/** The text of each file the variants touch, as it is on disk now ("" for one that is not there). */
const readBases = async ($: EngineInterface, paths: string[], known: Record<string, string>): Promise<Record<string, string>> => {
  const bases = { ...known }

  for (const path of paths) {
    if (bases[path] === undefined) {
      bases[path] = await readText($, abs(path))
    }
  }

  return bases
}

/** Sends a message to the session as the user's; while a turn runs it waits in the outbox. */
const toSession = async ($: EngineInterface, text: string): Promise<boolean> => {
  if (turn.isRunning) {
    outbox.push(text)
    await update($, state => ({ ...state, queued: outbox.length }))

    return true
  }

  const news = current.news
  isWriting = true

  try {
    const sent = await $.prompt.submit({ text, asUser: true, ...(news.length > 0 ? { context: [news.join('\n')] } : {}) })

    if (sent.drop === undefined) {
      turn = { ...turn, awaitsOwn: true }
      await update($, state => ({ ...state, news: [], busy: { what: 'session', since: Date.now() } }))

      return true
    }
  } catch {
    // said below
  } finally {
    isWriting = false
  }

  $.ui.toast(words(lang).notSent, { timeoutMs: 5000 })

  return false
}

const flushOutbox = async ($: EngineInterface): Promise<void> => {
  if (turn.isRunning || outbox.length === 0) {
    return
  }

  const text = outbox.shift()!
  await update($, state => ({ ...state, queued: outbox.length }))
  await toSession($, text)
}

/** The code of a variant laid over the files: ready, or an error that says what went wrong. */
const takeCode = ($: EngineInterface, key: string, files: FileCode[], via: Variant['code']['via']): Promise<string> =>
  serial(async () => {
    const variant = current.variants.find(one => one.key === key)

    if (variant === undefined) {
      return `no variant ${key}`
    }

    const bases = await readBases($, variant.files.map(file => file.path), current.bases)
    const laid = layCode(variant, bases, files)
    const error = 'error' in laid ? laid.error : ''
    current = {
      ...withVariant(key, one => ({ ...one, code: 'error' in laid ? { ...one.code, status: 'error', error: laid.error } : { ...one.code, status: 'ready', error: '', after: laid.after, counts: laid.counts, via } }))(current),
      bases,
    }

    try {
      await $.webhub.push({ mod: MOD, state: current, badge: badgeOf(current) })
    } catch {
      // next push
    }

    await persist($)

    return error
  })

/** The next queued variant's code, written by a fork; a second failure goes to the session. */
const work = async ($: EngineInterface): Promise<void> => {
  const variant = current.variants.find(one => one.code.status === 'queued')

  if (variant === undefined || current.task === null || current.variants.some(one => one.code.status === 'loading' && one.code.via === 'fork')) {
    return
  }

  const key = variant.key
  await update($, withVariant(key, one => ({ ...one, code: { ...one.code, status: 'loading', via: 'fork', error: '' } })))
  let error = ''

  try {
    const reply = await $.model.fork({ prompt: codePrompt(current.task!, variant, failures[key] ?? null) })

    if (reply.isAnswered) {
      const files = parseCodeReply(reply.text, root)
      error = typeof files === 'string' ? files : await takeCode($, key, files, 'fork')
    } else {
      error = `no reply: ${reply.reason}`
    }
  } catch (thrown) {
    error = String(thrown)
  }

  if (error === '') {
    delete failures[key]

    return
  }

  const tries = variant.code.tries + 1
  failures[key] = { error, files: Object.fromEntries(variant.files.filter(file => error.startsWith(`${file.path}:`)).map(file => [file.path, current.bases[file.path] ?? ''])) }

  if (tries < FORK_TRIES) {
    await update($, withVariant(key, one => ({ ...one, code: { ...one.code, status: 'queued', tries, error } })))

    return
  }

  await update($, withVariant(key, one => ({ ...one, code: { ...one.code, status: 'loading', via: 'session', tries, error } })))

  if (!(await toSession($, words(lang).codeViaSession(key, variant.title, error)))) {
    await update($, withVariant(key, one => ({ ...one, code: { ...one.code, status: 'error' } })))
  }
}

/** The tests mod's run of the last applied variant, followed until it ends. */
const followTests = async ($: EngineInterface): Promise<void> => {
  const run = current.testRun

  if (run === null || run.state === 'passed' || run.state === 'failed' || run.state === 'error') {
    return
  }

  try {
    const status = await $.tests.status({ runId: run.runId })

    if (status.state !== run.state || status.passed !== run.passed || status.failed !== run.failed) {
      await update($, state => ({ ...state, testRun: { ...run, ...status } }))
    }
  } catch {
    await update($, state => ({ ...state, testRun: { ...run, state: 'error' } }))
  }
}

const queueCode = ($: EngineInterface, key: string): Promise<State> =>
  update($, withVariant(key, one => (one.code.status === 'none' || one.code.status === 'error' ? { ...one, code: { ...one.code, status: 'queued', tries: 0, error: '' } } : one)))

/** Writes the chosen variant's files; nothing is written when a file changed on disk since the variants were proposed. */
const apply = async ($: EngineInterface, key: string, runTests: boolean): Promise<void> => {
  const variant = current.variants.find(one => one.key === key)

  if (variant === undefined || variant.code.status !== 'ready' || current.applied !== '') {
    return
  }

  const drift: string[] = []

  for (const file of variant.files) {
    if ((await readText($, abs(file.path))) !== (current.bases[file.path] ?? '')) {
      drift.push(file.path)
    }
  }

  if (drift.length > 0) {
    await update($, state => ({ ...state, drift: [...new Set([...state.drift, ...drift])] }))

    return
  }

  for (const file of variant.files) {
    const path = abs(file.path)

    if (file.status === 'D') {
      await $.process.run(['rm', '-f', path])
      continue
    }

    await $.process.run(['mkdir', '-p', path.slice(0, path.lastIndexOf('/'))])
    await $.fs.write(path, variant.code.after[file.path] ?? '')
  }

  const sum = totals(variant.code)
  const note = words(lang).applied(key, variant.title, `${variant.files.map(file => file.path).join(', ')} (+${sum.add} −${sum.del})`)
  await update($, state => ({ ...state, applied: key, selected: key, news: [...state.news, note] }))

  if (!runTests || !current.hasTests || variant.tests.length === 0) {
    return
  }

  try {
    const run = await $.tests.run({ targets: variant.tests, label: `${variant.key} · ${variant.title}`, origin: { mod: MOD, ref: key } })
    await update($, state => ({ ...state, testRun: { runId: run.runId, url: run.url, key, state: 'running', passed: 0, failed: 0 } }))
  } catch {
    return
  }
}

/** Fetches a drifted variant's code again over the files as they are now: other variants on those files fetch theirs again too. */
const regen = async ($: EngineInterface, key: string): Promise<void> => {
  const variant = current.variants.find(one => one.key === key)

  if (variant === undefined) {
    return
  }

  const paths = variant.files.map(file => file.path)
  const fresh: Record<string, string> = {}

  for (const path of paths) {
    fresh[path] = await readText($, abs(path))
  }

  const changed = paths.filter(path => fresh[path] !== current.bases[path])
  delete failures[key]
  await update($, state => ({
    ...state,
    bases: { ...state.bases, ...fresh },
    drift: state.drift.filter(path => !paths.includes(path)),
    applied: changed.length > 0 ? '' : state.applied,
    variants: state.variants.map(one =>
      one.key === key
        ? { ...one, code: { ...EMPTY_CODE, status: 'queued' } }
        : one.files.some(file => changed.includes(file.path))
          ? { ...one, code: EMPTY_CODE }
          : one,
    ),
  }))
}

/** A question: a quick answer from a small context by default, the whole conversation when asked; the session when both fail. */
const ask = async ($: EngineInterface, action: Extract<PageMessage, { type: 'ask' }>): Promise<void> => {
  const at = await $.clock.now()
  await say($, { by: 'you', kind: 'ask', text: action.text, code: '', refs: action.refs, via: action.deep ? 'deep' : 'quick', variant: action.key, question: '' }, at)
  await update($, state => ({ ...state, busy: { what: action.deep ? 'deep' : 'ask', since: Date.now() } }))
  let answer = ''
  let via: Via = 'quick'

  if (!action.deep) {
    try {
      const model = (await $.env.get('VARIANTS_CHAT_MODEL')) ?? 'sonnet'
      const reply = await $.model.complete({ model, system: QUICK_SYSTEM(lang), prompt: quickPrompt(current, action.key, action.text, action.refs), effort: 'low', maxTokens: 1500 })
      answer = reply.isAnswered ? reply.text : ''
    } catch {
      answer = ''
    }
  }

  if (answer === '') {
    via = 'deep'

    try {
      const reply = await $.model.fork({ prompt: deepPrompt(current, action.key, action.text, action.refs, lang), effort: 'low' })
      answer = reply.isAnswered ? reply.text : ''
    } catch {
      answer = ''
    }
  }

  await update($, state => ({ ...state, busy: null }))

  if (answer !== '') {
    await claudeSays($, answer, via, action.key, via === 'quick' ? action.text : '')

    return
  }

  await toSession($, deepPrompt(current, action.key, action.text, action.refs, lang))
}

/** One press on the page. */
const handle = async ($: EngineInterface, raw: unknown): Promise<void> => {
  const action = parseAction(raw)

  if (action === null) {
    return
  }

  lang = action.lang
  const at = await $.clock.now()
  const w = words(lang)
  const taskTitle = current.task?.title ?? ''

  switch (action.type) {
    case 'open':
      await queueCode($, action.key)

      return
    case 'regen':
      return regen($, action.key)
    case 'choose':
      await update($, state => ({ ...state, selected: action.key }))

      return
    case 'unchoose':
      await update($, state => ({ ...state, selected: '' }))

      return
    case 'apply':
      return apply($, action.key, action.runTests)
    case 'combine': {
      const made = combine(current.variants, action.picks, current.bases, lang)

      if ('error' in made) {
        await say($, { by: 'claude', kind: 'note', text: made.error, code: '', refs: [], via: '', variant: '', question: '' }, at)

        return
      }

      await update($, state => ({ ...state, variants: [...state.variants, made], selected: '' }))

      if (action.checkSeams || action.note !== '') {
        const parts = Object.entries(made.from).map(([path, from]) => `${path} ← ${from}`).join(', ')
        await say($, { by: 'you', kind: 'combine', text: [parts, action.note].filter(Boolean).join('\n'), code: '', refs: [], via: 'session', variant: made.key, question: '' }, at)
        await toSession($, w.seams(made.key, parts, action.note))
      }

      return
    }
    case 'another':
      await say($, { by: 'you', kind: 'another', text: [action.constraints.join(', '), action.note].filter(Boolean).join('\n'), code: '', refs: [], via: 'session', variant: '', question: '' }, at)
      await toSession($, w.another(taskTitle, action.constraints, action.note))

      return
    case 'own':
      await say($, { by: 'you', kind: 'own', text: action.text, code: action.code, refs: action.refs, via: 'session', variant: action.key, question: '' }, at)
      await toSession($, w.own(taskTitle, action.text, action.code, action.refs))

      return
    case 'ask':
      return ask($, action)
  }
}

const listen = async ($: EngineInterface): Promise<void> => {
  const now = Date.now()

  if (listening.isStale || (listening.since !== 0 && now - listening.since < PULL_STUCK_MS)) {
    return
  }

  listening = { ...listening, since: now }

  try {
    const pulled = await $.webhub.pull({ mod: MOD, listener: LISTENER, isFirst: listening.isFirst, waitMs: PULL_WAIT_MS })
    listening = { ...listening, isStale: pulled.isStale, isFirst: listening.isFirst && !pulled.isUp }

    if (pulled.isUp && !pulled.isRegistered) {
      await show($)
    }

    for (const action of pulled.actions) {
      await handle($, action.data)
    }
  } finally {
    listening = { ...listening, since: 0 }
  }
}

/** Whether the tests mod is installed: its noun answers, whatever it says about a run that does not exist. */
const detectTests = async ($: EngineInterface): Promise<boolean> => {
  try {
    await $.tests.status({ runId: '' })

    return true
  } catch (error) {
    return !(error instanceof TypeError)
  }
}

const restore = async ($: EngineInterface): Promise<void> => {
  root = await $.session.root()
  const home = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${(await $.env.get('HOME')) ?? ''}/.claude`
  sessionFile = `${home}/mods-data/variants/sessions/${await $.session.id()}.json`
  let saved = parseState(await readText($, sessionFile))

  if (saved === null) {
    try {
      const held = await $.webhub.read({ mod: MOD })
      saved = held.state === null ? null : parseState(JSON.stringify(held.state))
    } catch {
      saved = null
    }
  }

  const base = saved ?? EMPTY
  current = {
    ...base,
    project: baseName(root),
    branch: await git($, ['rev-parse', '--abbrev-ref', 'HEAD']),
    hasTests: await detectTests($),
    variants: base.variants.map(variant => (variant.code.status === 'loading' ? { ...variant, code: { ...variant.code, status: 'queued', via: '' } } : variant)),
  }
}

export const register: Register = on => {
  current = EMPTY
  root = ''
  sessionFile = ''
  failures = {}
  outbox = []
  isWriting = false
  turn = { isRunning: false, ownId: '', awaitsOwn: false }
  listening = { since: 0, isFirst: true, isStale: false }

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await $.command.register({ name: COMMAND, description: 'Show the address of the Variants page' })
    await $.tool.register({ name: PROPOSE_TOOL, description: PROPOSE_DESCRIPTION, isDeferred: false, inputSchema: PROPOSE_SCHEMA })
    await $.tool.register({ name: ADD_TOOL, description: ADD_DESCRIPTION, isDeferred: false, inputSchema: ADD_SCHEMA })
    await $.tool.register({ name: CODE_TOOL, description: CODE_DESCRIPTION, isDeferred: false, inputSchema: CODE_SCHEMA })
    lang = langOf(await $.store.get('lang'))
    await restore($)
    await show($)
    $.clock.every(1000, () => {
      void listen($).catch(() => undefined)
      void work($).catch(() => undefined)
      void flushOutbox($).catch(() => undefined)
      void followTests($).catch(() => undefined)
    })

    return result
  })

  /** What was done on the page rides beside the user's own next message. */
  on('prompt.submit', async ($, e, next) => {
    if (isWriting || e.command !== undefined || e.origin?.kind === 'plugin' || current.news.length === 0) {
      return next(e)
    }

    const result = await next({ ...e, context: [...(e.context ?? []), current.news.join('\n')] })

    if (result.drop === undefined) {
      await update($, state => ({ ...state, news: [] }))
    }

    return result
  })

  on('turn.start', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId === undefined) {
      turn = { isRunning: true, ownId: turn.awaitsOwn && e.text.startsWith(MARK) ? e.turnId : '', awaitsOwn: false }
    }

    return result
  })

  /** The answer of a turn a message of this mod started goes to the page's chat. */
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId !== undefined) {
      return result
    }

    const isOwn = turn.ownId !== '' && turn.ownId === e.turnId
    turn = { isRunning: false, ownId: '', awaitsOwn: false }

    if (isOwn) {
      await update($, state => ({ ...state, busy: null }))

      if (e.answer.trim() !== '') {
        await claudeSays($, e.answer, 'session', '')
      }
    }

    return result
  })

  on('command.run', { command: COMMAND }, async $ => ({ text: (await show($)) ? words(lang).page(url) : words(lang).down }))

  on('tool.call', { tool: PROPOSE_CALL }, async ($, e) => {
    const parsed = parsePropose(e, root)

    if ('errors' in parsed) {
      return { deny: `${PROPOSE} refused, nothing was shown. Fix these and call it again:\n- ${parsed.errors.join('\n- ')}` }
    }

    const bases = await readBases($, allPaths(parsed.variants), {})
    failures = {}
    await update($, state => ({
      ...EMPTY,
      project: state.project,
      branch: state.branch,
      hasTests: state.hasTests,
      task: parsed.task,
      recommended: parsed.recommended,
      bases,
      variants: parsed.variants.map(variant => (variant.key === parsed.recommended ? { ...variant, code: { ...variant.code, status: 'queued' } } : variant)),
    }))
    const isUp = await show($)

    return {
      result: isUp
        ? `${parsed.variants.length} variants are on the Variants page: ${url}. Do not repeat them in chat: one line with the link. The page fetches the code itself.`
        : 'The hub does not answer (is docker running?): the page shows the variants once it is up. Say so in one line.',
    }
  })

  on('tool.call', { tool: ADD_CALL }, async ($, e) => {
    if (current.task === null) {
      return { deny: `No task on the Variants page: call ${PROPOSE} first.` }
    }

    const errors: string[] = []
    const variant = parseVariant(e, root, current.variants, errors)
    const input = e as unknown as { code?: unknown }
    const files = input.code === undefined ? null : parseFileCodes(input.code, root)

    if (typeof files === 'string') {
      errors.push(`code: ${files}`)
    }

    if (errors.length > 0) {
      return { deny: `${ADD} refused. Fix these and call it again:\n- ${errors.join('\n- ')}` }
    }

    const bases = await readBases($, variant.files.map(file => file.path), current.bases)
    await update($, state => ({ ...state, bases, variants: [...state.variants, variant], busy: null }))
    const error = Array.isArray(files) ? await takeCode($, variant.key, files, 'session') : ''

    return {
      result:
        error === ''
          ? `Variant ${variant.key} is on the Variants page. In chat, one line.`
          : `Variant ${variant.key} is on the page, but its code does not fit the files: ${error}. Call ${CODE} for ${variant.key} with old copied exactly from the file.`,
    }
  })

  on('tool.call', { tool: CODE_CALL }, async ($, e) => {
    const input = e as unknown as { key?: unknown; files?: unknown }
    const key = String(input.key ?? '').trim().toUpperCase()

    if (!current.variants.some(variant => variant.key === key)) {
      return { deny: `No variant ${key} on the Variants page.` }
    }

    const files = parseFileCodes(input.files, root)

    if (typeof files === 'string') {
      return { deny: `${CODE} refused: ${files}` }
    }

    const error = await takeCode($, key, files, 'session')
    delete failures[key]

    return { result: error === '' ? `The code of ${key} is on the Variants page. In chat, one line.` : `It does not fit the files: ${error}. Call ${CODE} again with old copied exactly from the file.` }
  })
}
