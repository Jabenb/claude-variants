import type { ChatMessage, Code, Edit, FileCode, FileRef, FileStatus, Lang, PageMessage, State, Task, Variant } from '../types'

export const MOD = 'variants'
export const PROPOSE_TOOL = 'propose'
export const ADD_TOOL = 'add_variant'
export const CODE_TOOL = 'variant_code'
export const PROPOSE = `mcp__${MOD}__${PROPOSE_TOOL}`
export const ADD = `mcp__${MOD}__${ADD_TOOL}`
export const CODE = `mcp__${MOD}__${CODE_TOOL}`
/** What starts every message the mod writes to the session, so the turn it starts can be told apart. */
export const MARK = '[variants]'
export const CHAT_TAIL = 6
export const QUICK_CONTEXT_CHARS = 14_000
export const ANSWER_CHARS = 6000
/** A line diff gives up on the middle of two files beyond this many cells and calls it all replaced. */
const DIFF_CELLS = 4_000_000

export const EMPTY_CODE: Code = { status: 'none', error: '', after: {}, counts: {}, via: '', tries: 0 }

export const EMPTY: State = {
  v: 1,
  project: '',
  branch: '',
  task: null,
  recommended: '',
  variants: [],
  bases: {},
  selected: '',
  applied: '',
  drift: [],
  chat: [],
  busy: null,
  queued: 0,
  hasTests: false,
  testRun: null,
  news: [],
}

const VARIANT_PROPS = {
  key: { type: 'string', description: 'A, B, C… (add_variant: leave out for the next free letter)' },
  title: { type: 'string' },
  short: { type: 'string', description: 'One line for the card' },
  essence: { type: 'string', description: 'The approach in 1-3 sentences' },
  pros: { type: 'array', items: { type: 'string' } },
  cons: { type: 'array', items: { type: 'string' } },
  files: {
    type: 'array',
    items: { type: 'object', properties: { path: { type: 'string', description: 'Relative to the project root' }, status: { type: 'string', enum: ['A', 'M', 'D'] } }, required: ['path', 'status'] },
  },
  tests: { type: 'array', items: { type: 'string' }, description: 'Test files or filters that cover this variant' },
} as const

const FILE_CODE_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      edits: { type: 'array', items: { type: 'object', properties: { old: { type: 'string' }, new: { type: 'string' } }, required: ['old', 'new'] } },
      content: { type: 'string', description: 'Whole text of a new file (A)' },
      deleted: { type: 'boolean' },
    },
    required: ['path'],
  },
} as const

export const PROPOSE_DESCRIPTION =
  'Show implementation variants of a task on the user\'s Variants browser page. Call it ONLY when the user asks for variants or options. ' +
  'Give no code: the page fetches each variant\'s code itself. Replaces the task shown there.'

export const PROPOSE_SCHEMA = {
  type: 'object',
  properties: {
    task: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['bug', 'feature'] },
        title: { type: 'string' },
        summary: { type: 'string', description: 'What is wrong or wanted, 2-4 sentences; `code` in backticks' },
        ref: { type: 'string', description: 'Ticket or issue id' },
        steps: { type: 'array', items: { type: 'string' }, description: 'For a bug: how it happens, 2-4 short steps' },
      },
      required: ['kind', 'title', 'summary'],
    },
    recommended: { type: 'string', description: 'Key of the variant you recommend' },
    variants: { type: 'array', items: { type: 'object', properties: VARIANT_PROPS, required: ['title', 'short', 'essence', 'pros', 'cons', 'files'] } },
  },
  required: ['task', 'recommended', 'variants'],
} as const

export const ADD_DESCRIPTION = 'Add one variant to the Variants page, when the page asked for one. code is optional: Edit-style edits (old copied exactly from the file), content for a new file.'

export const ADD_SCHEMA = {
  type: 'object',
  properties: { ...VARIANT_PROPS, code: FILE_CODE_SCHEMA },
  required: ['title', 'short', 'essence', 'pros', 'cons', 'files'],
} as const

export const CODE_DESCRIPTION = 'Give the code of a variant the Variants page asked for: Edit-style edits (old copied exactly from the file), content for a new file.'

export const CODE_SCHEMA = {
  type: 'object',
  properties: { key: { type: 'string' }, files: FILE_CODE_SCHEMA },
  required: ['key', 'files'],
} as const

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const strs = (value: unknown): string[] => (Array.isArray(value) ? value.map(str).filter(item => item !== '') : [])

const rec = (value: unknown): Record<string, unknown> => (value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {})

export const langOf = (value: unknown): Lang => (value === 'ru' || value === 'uk' ? value : 'en')

/** A path as the mod keeps it: relative to the project root, no leading `./`. */
export const relPath = (root: string, path: string): string => {
  const trimmed = path.trim().replace(/^\.\//, '')

  return root !== '' && trimmed.startsWith(`${root}/`) ? trimmed.slice(root.length + 1) : trimmed
}

const isSafePath = (path: string): boolean => path !== '' && !path.startsWith('/') && !path.split('/').includes('..')

export const nextKey = (variants: Variant[]): string => {
  for (let code = 65; code <= 90; code++) {
    const key = String.fromCharCode(code)

    if (!variants.some(variant => variant.key === key)) {
      return key
    }
  }

  return `V${variants.length + 1}`
}

const parseFiles = (raw: unknown, root: string, errors: string[], where: string): FileRef[] => {
  const files = (Array.isArray(raw) ? raw : []).map(item => {
    const one = rec(item)
    const status = str(one.status).toUpperCase()

    return { path: relPath(root, str(one.path)), status: (status === 'A' || status === 'D' ? status : 'M') as FileStatus }
  })

  if (files.length === 0) {
    errors.push(`${where}: files is empty`)
  }

  files.filter(file => !isSafePath(file.path)).forEach(file => errors.push(`${where}: path "${file.path}" must be relative to the project root`))

  return files.filter((file, index) => files.findIndex(other => other.path === file.path) === index)
}

/** A variant as Claude gave it; `key` falls back to the next free letter. */
export const parseVariant = (raw: unknown, root: string, taken: Variant[], errors: string[]): Variant => {
  const input = rec(raw)
  const wanted = str(input.key).toUpperCase()
  const key = wanted !== '' && !taken.some(variant => variant.key === wanted) ? wanted : nextKey(taken)
  const title = str(input.title)
  const where = `variant ${key}`

  if (title === '') {
    errors.push(`${where}: title is empty`)
  }

  if (str(input.essence) === '') {
    errors.push(`${where}: essence is empty`)
  }

  return {
    key,
    title,
    short: str(input.short),
    essence: str(input.essence),
    pros: strs(input.pros),
    cons: strs(input.cons),
    files: parseFiles(input.files, root, errors, where),
    tests: strs(input.tests),
    origin: 'claude',
    from: {},
    code: EMPTY_CODE,
  }
}

export const parseTask = (raw: unknown, errors: string[]): Task => {
  const input = rec(raw)
  const task = { kind: input.kind === 'feature' ? 'feature' : 'bug', title: str(input.title), summary: str(input.summary), ref: str(input.ref), steps: strs(input.steps) } as Task

  if (task.title === '') {
    errors.push('task.title is empty')
  }

  return task
}

export type Proposal = { task: Task; recommended: string; variants: Variant[] }

export const parsePropose = (raw: unknown, root: string): Proposal | { errors: string[] } => {
  const input = rec(raw)
  const errors: string[] = []
  const task = parseTask(input.task, errors)
  const variants: Variant[] = []

  for (const item of Array.isArray(input.variants) ? input.variants : []) {
    variants.push(parseVariant(item, root, variants, errors))
  }

  if (variants.length < 2) {
    errors.push('give at least 2 variants')
  }

  const wanted = str(input.recommended).toUpperCase()
  const recommended = variants.some(variant => variant.key === wanted) ? wanted : (variants[0]?.key ?? '')

  return errors.length > 0 ? { errors } : { task, recommended, variants }
}

/** The files of a variant's code; a string says what is wrong. */
export const parseFileCodes = (raw: unknown, root: string): FileCode[] | string => {
  if (!Array.isArray(raw)) {
    return 'files must be an array'
  }

  const out: FileCode[] = []

  for (const item of raw) {
    const one = rec(item)
    const path = relPath(root, str(one.path))

    if (!isSafePath(path)) {
      return `path "${path}" must be relative to the project root`
    }

    if (one.deleted === true) {
      out.push({ path, deleted: true })
    } else if (typeof one.content === 'string') {
      out.push({ path, content: one.content })
    } else if (Array.isArray(one.edits)) {
      const edits: Edit[] = one.edits.map(edit => ({ old: String(rec(edit).old ?? ''), new: String(rec(edit).new ?? '') }))

      if (edits.some(edit => edit.old === '')) {
        return `${path}: an edit has an empty old`
      }

      out.push({ path, edits })
    } else {
      return `${path}: give edits, content or deleted`
    }
  }

  return out
}

/** The JSON object in a model's reply: the whole text, else the part between the first `{` and the last `}`. */
const jsonIn = (text: string): unknown => {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')

  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')

    if (start < 0 || end <= start) {
      return null
    }

    try {
      return JSON.parse(trimmed.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

export const parseCodeReply = (text: string, root: string): FileCode[] | string => {
  const parsed = jsonIn(text)

  return parsed === null ? 'the reply is not JSON' : parseFileCodes(rec(parsed).files, root)
}

const occurrences = (text: string, part: string): number => text.split(part).length - 1

/** One line diff: `=` keeps a line of both, `-` drops a line of `a`, `+` adds a line of `b`. */
export type DiffOp = { t: '=' | '-' | '+'; a: number; b: number }

export const linesOf = (text: string): string[] => (text === '' ? [] : text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n'))

/** A line diff by the longest common subsequence of the lines between the common head and tail. */
export const lineDiff = (a: string[], b: string[]): DiffOp[] => {
  let head = 0

  while (head < a.length && head < b.length && a[head] === b[head]) {
    head++
  }

  let tail = 0

  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) {
    tail++
  }

  const n = a.length - head - tail
  const m = b.length - head - tail
  const ops: DiffOp[] = []

  for (let i = 0; i < head; i++) {
    ops.push({ t: '=', a: i, b: i })
  }

  if (n * m > DIFF_CELLS) {
    for (let i = 0; i < n; i++) ops.push({ t: '-', a: head + i, b: -1 })
    for (let j = 0; j < m; j++) ops.push({ t: '+', a: -1, b: head + j })
  } else {
    const width = m + 1
    const table = new Uint32Array((n + 1) * width)

    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * width + j] = a[head + i] === b[head + j] ? table[(i + 1) * width + j + 1]! + 1 : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!)
      }
    }

    let i = 0
    let j = 0

    while (i < n || j < m) {
      if (i < n && j < m && a[head + i] === b[head + j]) {
        ops.push({ t: '=', a: head + i, b: head + j })
        i++
        j++
      } else if (j < m && (i === n || table[i * width + j + 1]! >= table[(i + 1) * width + j]!)) {
        ops.push({ t: '+', a: -1, b: head + j })
        j++
      } else {
        ops.push({ t: '-', a: head + i, b: -1 })
        i++
      }
    }
  }

  for (let k = tail; k > 0; k--) {
    ops.push({ t: '=', a: a.length - k, b: b.length - k })
  }

  return ops
}

export const countLines = (before: string, after: string): { add: number; del: number } => {
  const ops = lineDiff(linesOf(before), linesOf(after))

  return { add: ops.filter(op => op.t === '+').length, del: ops.filter(op => op.t === '-').length }
}

/** Lays a variant's code over the files as they were: each edit's old must stand in the file exactly once. */
export const layCode = (variant: Variant, bases: Record<string, string>, files: FileCode[]): Pick<Code, 'after' | 'counts'> | { error: string } => {
  const after: Record<string, string> = {}
  const counts: Record<string, { add: number; del: number }> = {}
  const listed = new Set(variant.files.map(file => file.path))
  const missing = [...listed].filter(path => !files.some(file => file.path === path))

  if (missing.length > 0) {
    return { error: `no code for ${missing.join(', ')}` }
  }

  for (const file of files) {
    if (!listed.has(file.path)) {
      continue
    }

    const before = bases[file.path] ?? ''
    let text = before

    if ('deleted' in file) {
      text = ''
    } else if ('content' in file) {
      text = file.content
    } else {
      for (const edit of file.edits) {
        const found = occurrences(text, edit.old)

        if (found !== 1) {
          return { error: `${file.path}: old ${found === 0 ? 'is not in the file' : `stands ${found} times in the file`}: ${JSON.stringify(edit.old.slice(0, 80))}` }
        }

        text = text.replace(edit.old, () => edit.new)
      }
    }

    after[file.path] = text
    counts[file.path] = countLines(before, text)
  }

  return { after, counts }
}

export const totals = (code: Code): { add: number; del: number } =>
  Object.values(code.counts).reduce((sum, one) => ({ add: sum.add + one.add, del: sum.del + one.del }), { add: 0, del: 0 })

/** Every file any variant touches, in the order the variants name them. */
export const allPaths = (variants: Variant[]): string[] => [...new Set(variants.flatMap(variant => variant.files.map(file => file.path)))]

/** A variant made on the page from the files of others; each source's code must be there. */
export const combine = (variants: Variant[], picks: Record<string, string>, bases: Record<string, string>, lang: Lang): Variant | { error: string } => {
  const chosen = Object.entries(picks).filter(([, key]) => key !== '')

  if (chosen.length === 0) {
    return { error: 'nothing picked' }
  }

  const files: FileRef[] = []
  const after: Record<string, string> = {}
  const counts: Record<string, { add: number; del: number }> = {}
  const sources = new Set<string>()

  for (const [path, key] of chosen) {
    const source = variants.find(variant => variant.key === key)
    const ref = source?.files.find(file => file.path === path)

    if (source === undefined || ref === undefined) {
      return { error: `${key} does not touch ${path}` }
    }

    if (source.code.status !== 'ready') {
      return { error: `the code of ${key} is not there yet` }
    }

    files.push(ref)
    after[path] = source.code.after[path] ?? ''
    counts[path] = countLines(bases[path] ?? '', after[path]!)
    sources.add(key)
  }

  const picked = variants.filter(variant => sources.has(variant.key))
  const key = nextKey(variants)
  const w = WORDS[lang]

  return {
    key,
    title: w.combinedTitle(chosen.map(([path, from]) => `${baseName(path)} ← ${from}`).join(', ')),
    short: w.combinedShort([...sources].join(' + ')),
    essence: picked.map(variant => `${variant.key}: ${variant.essence}`).join('\n'),
    pros: [...new Set(picked.flatMap(variant => variant.pros))],
    cons: [...new Set(picked.flatMap(variant => variant.cons))],
    files,
    tests: [...new Set(picked.flatMap(variant => variant.tests))],
    origin: 'combined',
    from: Object.fromEntries(chosen),
    code: { status: 'ready', error: '', after, counts, via: 'combine', tries: 0 },
  }
}

export const baseName = (path: string): string => path.split('/').pop() ?? path

const list = (items: string[]): string => items.map(item => `- ${item}`).join('\n')

const fileLines = (variant: Variant): string => variant.files.map(file => `${file.path} (${file.status})`).join(', ')

/** What the fork that writes a variant's code is asked. `failed` brings the error of the try before and the files it tripped on. */
export const codePrompt = (task: Task, variant: Variant, failed: { error: string; files: Record<string, string> } | null): string =>
  [
    `${MARK} Write the code of variant ${variant.key} «${variant.title}» for the task «${task.title}».`,
    `Approach: ${variant.essence}`,
    `Files: ${fileLines(variant)}`,
    'Reply with JSON only, no prose and no fences: {"files":[{"path":"…","edits":[{"old":"…","new":"…"}]} | {"path":"…","content":"…"} | {"path":"…","deleted":true}]}.',
    'M files: edits only; each old is text copied exactly from the current file, the shortest that is unique in it. A files: the whole content. Every listed file, no other.',
    ...(failed === null
      ? []
      : [
          `Your previous answer failed: ${failed.error}. Fix it.`,
          ...Object.entries(failed.files).map(([path, text]) => `Current ${path}:\n<<<\n${text}\n>>>`),
        ]),
  ].join('\n')

const LANG_NAME: Record<Lang, string> = { en: 'English', ru: 'Russian', uk: 'Ukrainian' }

export const QUICK_SYSTEM = (lang: Lang): string =>
  `You answer questions about implementation variants shown on a page. Answer briefly and concretely, in ${LANG_NAME[lang]}, plain text, \`code\` in backticks. If the context is not enough to answer, say so in one line.`

/** The lines around each line a question refers to (`B · path:42`), from the variant's text after it. */
export const refLines = (variants: Variant[], bases: Record<string, string>, refs: string[]): string =>
  refs
    .map(ref => {
      const match = /^(\S+) · (.+):(\d+)$/.exec(ref)

      if (match === null) {
        return ''
      }

      const [, key, name, no] = match
      const variant = variants.find(one => one.key === key)
      const path = variant?.files.find(file => file.path === name || baseName(file.path) === name)?.path ?? ''
      const text = variant?.code.after[path] ?? bases[path] ?? ''
      const lines = linesOf(text)
      const at = Number(no) - 1
      const from = Math.max(0, at - 10)

      return lines.length === 0 ? '' : `${ref}:\n${lines.slice(from, at + 11).map((line, index) => `${from + index + 1}${from + index === at ? '>' : ' '} ${line}`).join('\n')}`
    })
    .filter(part => part !== '')
    .join('\n\n')

/** A variant's changes as short hunks: the changed lines with two lines around them. */
export const changesOf = (variant: Variant, bases: Record<string, string>): string =>
  variant.files
    .map(file => {
      const before = linesOf(bases[file.path] ?? '')
      const after = linesOf(variant.code.after[file.path] ?? '')
      const ops = lineDiff(before, after)
      const keep = ops.map((op, index) => op.t !== '=' || ops.slice(Math.max(0, index - 2), index + 3).some(near => near.t !== '='))
      const lines = ops.flatMap((op, index) => (keep[index] ? [`${op.t === '=' ? ' ' : op.t} ${op.t === '-' ? before[op.a] : after[op.b]}`] : index > 0 && keep[index - 1] ? ['…'] : []))

      return `${file.path} (${file.status})\n${lines.join('\n')}`
    })
    .join('\n\n')

const chatTail = (chat: ChatMessage[]): string =>
  chat
    .filter(message => message.kind !== 'note')
    .slice(-CHAT_TAIL)
    .map(message => `${message.by === 'you' ? 'User' : 'Claude'}: ${message.text.length > 600 ? `${message.text.slice(0, 599)}…` : message.text}`)
    .join('\n')

/** The small context of a quick answer: the task, the variant asked about with its changes, the lines referred to, the chat's last lines. */
export const quickPrompt = (state: State, key: string, question: string, refs: string[]): string => {
  const variant = state.variants.find(one => one.key === key)
  const parts = [
    state.task === null ? '' : `Task: ${state.task.title}\n${state.task.summary}`,
    state.variants.map(one => `Variant ${one.key} «${one.title}»: ${one.essence}`).join('\n'),
    variant === undefined ? '' : `Pros of ${variant.key}:\n${list(variant.pros)}\nCons of ${variant.key}:\n${list(variant.cons)}`,
    variant !== undefined && variant.code.status === 'ready' ? `Changes of ${variant.key}:\n${changesOf(variant, state.bases)}` : '',
    refLines(state.variants, state.bases, refs),
    chatTail(state.chat),
  ].filter(part => part !== '')
  const context = parts.join('\n\n')

  return `${context.length > QUICK_CONTEXT_CHARS ? `${context.slice(0, QUICK_CONTEXT_CHARS)}\n…` : context}\n\nQuestion${key === '' ? '' : ` about variant ${key}`}: ${question}`
}

/** A question asked with the whole conversation: a fork of the session, so only what the session does not know is added. */
export const deepPrompt = (state: State, key: string, question: string, refs: string[], lang: Lang): string =>
  [
    `${MARK} A question from the Variants page${key === '' ? '' : ` about variant ${key}`}. Answer briefly in ${LANG_NAME[lang]}: the answer is shown on the page, not in chat. Use no tools.`,
    refLines(state.variants, state.bases, refs),
    state.chat.length > 0 ? `The page's chat so far:\n${chatTail(state.chat)}` : '',
    `Question: ${question}`,
  ]
    .filter(part => part !== '')
    .join('\n\n')

type Words = {
  combinedTitle: (parts: string) => string
  combinedShort: (keys: string) => string
  another: (task: string, constraints: string[], note: string) => string
  own: (task: string, text: string, code: string, refs: string[]) => string
  seams: (key: string, parts: string, note: string) => string
  codeViaSession: (key: string, title: string, error: string) => string
  applied: (key: string, title: string, files: string) => string
  answerShown: string
  notSent: string
  page: (url: string) => string
  down: string
}

const WORDS: Record<Lang, Words> = {
  en: {
    combinedTitle: parts => `Combination: ${parts}`,
    combinedShort: keys => `Files taken from ${keys}`,
    another: (task, constraints, note) =>
      [`${MARK} Propose one more variant for «${task}».`, constraints.length > 0 ? `Constraints: ${constraints.join(', ')}.` : '', note, `Call ${ADD} without code; in chat, one line.`].filter(Boolean).join(' '),
    own: (task, text, code, refs) =>
      [`${MARK} My solution for «${task}»: ${text}`, code === '' ? '' : `\`\`\`\n${code}\n\`\`\``, refs.length > 0 ? `Refs: ${refs.join(', ')}.` : '', `Judge it against the code, briefly: the answer is shown on the Variants page. If it is worth it, add it as a variant with ${ADD}.`].filter(Boolean).join('\n'),
    seams: (key, parts, note) => [`${MARK} Variant ${key} was put together from: ${parts}.`, note, `Check the seams and fix them if needed: call ${ADD} with the fixed variant and its code. In chat, one line.`].filter(Boolean).join(' '),
    codeViaSession: (key, title, error) => `${MARK} The Variants page could not get the code of variant ${key} «${title}» (${error}). Read the files and give it with ${CODE}. In chat, one line.`,
    applied: (key, title, files) => `${MARK} The user applied variant ${key} «${title}» from the Variants page: ${files}. The files are already written on disk; read them again before relying on them.`,
    answerShown: 'The answer is on the Variants page',
    notSent: 'The message did not reach Claude',
    page: url => `Variants page: ${url}`,
    down: 'The hub does not answer (is docker running?)',
  },
  ru: {
    combinedTitle: parts => `Сборка: ${parts}`,
    combinedShort: keys => `Файлы из ${keys}`,
    another: (task, constraints, note) =>
      [`${MARK} Предложи ещё один вариант для «${task}».`, constraints.length > 0 ? `Ограничения: ${constraints.join(', ')}.` : '', note, `Вызови ${ADD} без кода, в чате — одна строка.`].filter(Boolean).join(' '),
    own: (task, text, code, refs) =>
      [`${MARK} Моё решение для «${task}»: ${text}`, code === '' ? '' : `\`\`\`\n${code}\n\`\`\``, refs.length > 0 ? `Ссылки: ${refs.join(', ')}.` : '', `Оцени его по коду, коротко: ответ покажется на странице вариантов. Если стоит, добавь его вариантом через ${ADD}.`].filter(Boolean).join('\n'),
    seams: (key, parts, note) => [`${MARK} Вариант ${key} собран из: ${parts}.`, note, `Проверь стыки и, если нужно, поправь: вызови ${ADD} с исправленным вариантом и кодом. В чате — одна строка.`].filter(Boolean).join(' '),
    codeViaSession: (key, title, error) => `${MARK} Странице вариантов не удалось получить код варианта ${key} «${title}» (${error}). Прочитай файлы и дай код через ${CODE}. В чате — одна строка.`,
    applied: (key, title, files) => `${MARK} Пользователь применил вариант ${key} «${title}» со страницы вариантов: ${files}. Файлы уже записаны на диск, перечитай их, прежде чем на них опираться.`,
    answerShown: 'Ответ на странице вариантов',
    notSent: 'Сообщение не дошло до Claude',
    page: url => `Страница вариантов: ${url}`,
    down: 'Хаб не отвечает (docker запущен?)',
  },
  uk: {
    combinedTitle: parts => `Збірка: ${parts}`,
    combinedShort: keys => `Файли з ${keys}`,
    another: (task, constraints, note) =>
      [`${MARK} Запропонуй ще один варіант для «${task}».`, constraints.length > 0 ? `Обмеження: ${constraints.join(', ')}.` : '', note, `Виклич ${ADD} без коду, у чаті — один рядок.`].filter(Boolean).join(' '),
    own: (task, text, code, refs) =>
      [`${MARK} Моє рішення для «${task}»: ${text}`, code === '' ? '' : `\`\`\`\n${code}\n\`\`\``, refs.length > 0 ? `Посилання: ${refs.join(', ')}.` : '', `Оціни його за кодом, коротко: відповідь з'явиться на сторінці варіантів. Якщо варто, додай його варіантом через ${ADD}.`].filter(Boolean).join('\n'),
    seams: (key, parts, note) => [`${MARK} Варіант ${key} зібрано з: ${parts}.`, note, `Перевір стики й, якщо треба, виправ: виклич ${ADD} з виправленим варіантом і кодом. У чаті — один рядок.`].filter(Boolean).join(' '),
    codeViaSession: (key, title, error) => `${MARK} Сторінці варіантів не вдалося отримати код варіанта ${key} «${title}» (${error}). Прочитай файли й дай код через ${CODE}. У чаті — один рядок.`,
    applied: (key, title, files) => `${MARK} Користувач застосував варіант ${key} «${title}» зі сторінки варіантів: ${files}. Файли вже записані на диск, перечитай їх, перш ніж на них спиратися.`,
    answerShown: 'Відповідь на сторінці варіантів',
    notSent: 'Повідомлення не дійшло до Claude',
    page: url => `Сторінка варіантів: ${url}`,
    down: 'Хаб не відповідає (docker запущено?)',
  },
}

export const words = (lang: Lang): Words => WORDS[lang]

/** A press on the page, checked; null for anything the mod does not know. */
export const parseAction = (raw: unknown): PageMessage | null => {
  const input = rec(raw)
  const lang = langOf(input.lang)
  const key = str(input.key).toUpperCase()

  switch (input.type) {
    case 'open':
    case 'regen':
    case 'choose':
      return key === '' ? null : { type: input.type, key, lang }
    case 'unchoose':
      return { type: 'unchoose', lang }
    case 'apply':
      return key === '' ? null : { type: 'apply', key, runTests: input.runTests === true, lang }
    case 'combine': {
      const picks = Object.fromEntries(Object.entries(rec(input.picks)).map(([path, from]) => [path, str(from).toUpperCase()]))

      return { type: 'combine', picks, note: str(input.note), checkSeams: input.checkSeams === true, lang }
    }
    case 'another':
      return { type: 'another', constraints: strs(input.constraints), note: str(input.note), lang }
    case 'own': {
      const text = str(input.text)
      const code = typeof input.code === 'string' ? input.code.replace(/\s+$/, '') : ''

      return text === '' && code === '' ? null : { type: 'own', text, code, refs: strs(input.refs), key, lang }
    }
    case 'ask': {
      const text = str(input.text)

      return text === '' ? null : { type: 'ask', text, refs: strs(input.refs), key, deep: input.deep === true, lang }
    }
    default:
      return null
  }
}

/** A saved state, read back; null when the text is not one. */
export const parseState = (text: string): State | null => {
  try {
    const parsed = JSON.parse(text) as Partial<State>

    return parsed !== null && typeof parsed === 'object' && parsed.v === 1 && Array.isArray(parsed.variants) ? { ...EMPTY, ...parsed, busy: null, queued: 0 } : null
  } catch {
    return null
  }
}
