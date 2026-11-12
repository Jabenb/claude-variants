import { expect, mock, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import type { State, Variant } from '../types'
import { EMPTY, EMPTY_CODE, combine, countLines, layCode, parseAction, parseCodeReply, parsePropose, quickPrompt } from '../hooks/model'
import { PAGE, SHIKI_VERSION } from '../hooks/page/page'

type On = Parameters<TestBody>[1]

const ROOT = '/w/shop'
const HOME = '/home/u'
const OWN = 'aaaaaaaa-1111-2222-3333-444444444444'
const PROPOSE = 'mcp__variants__propose'
const ADD = 'mcp__variants__add_variant'
const CODE = 'mcp__variants__variant_code'
const START = { cwd: ROOT, surface: 'desktop', isInteractive: true } as const
const CTRL = 'app/Http/StripeController.php'
const MODEL = 'app/Models/ProcessedWebhook.php'
const CTRL_TEXT = '<?php\nclass StripeController\n{\n    public function handle()\n    {\n        $this->payments->markPaid($order);\n    }\n}\n'

const PROPOSAL = {
  task: { kind: 'bug', title: 'Webhook processed twice', summary: 'Stripe retries `payment_intent.succeeded`.', ref: '#482', steps: ['Stripe sends', 'Retry', 'markPaid twice'] },
  recommended: 'A',
  variants: [
    { key: 'A', title: 'Unique event id', short: 'Table of processed events', essence: 'Remember event ids.', pros: ['Reliable'], cons: ['Migration'], files: [{ path: CTRL, status: 'M' }, { path: MODEL, status: 'A' }], tests: ['tests/Feature/StripeTest.php'] },
    { key: 'B', title: 'Idempotent markPaid', short: 'Guard in the service', essence: 'Skip a paid order.', pros: ['Small'], cons: ['Race'], files: [{ path: CTRL, status: 'M' }] },
  ],
}

const A_REPLY = JSON.stringify({
  files: [
    { path: CTRL, edits: [{ old: '        $this->payments->markPaid($order);', new: '        ProcessedWebhook::create([\'event_id\' => $event->id]);\n        $this->payments->markPaid($order);' }] },
    { path: MODEL, content: '<?php\nclass ProcessedWebhook extends Model {}\n' },
  ],
})

type Reply = { isAnswered: true; text: string } | { isAnswered: false; reason: string }
type World = {
  files: Map<string, string>
  pushed: State[]
  presses: unknown[][]
  submitted: Array<{ text: string; context?: readonly string[] }>
  forked: string[]
  forkReplies: Reply[]
  completed: string[]
  completeReplies: Reply[]
  pages: number
}

const usage = { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

const world = (on: On): World => {
  const held: World = { files: new Map([[`${ROOT}/${CTRL}`, CTRL_TEXT]]), pushed: [], presses: [], submitted: [], forked: [], forkReplies: [], completed: [], completeReplies: [], pages: 0 }

  on('engine.create', async (_, e, next) => ({
    ...(await next(e)),
    webhub: {
      page: async () => {
        held.pages += 1

        return { isUp: true, url: 'http://localhost:7777/#/s/variants' }
      },
      push: async ({ state }: { state: unknown }) => {
        held.pushed.push(state as State)

        return { isUp: true }
      },
      read: async () => ({ isUp: true, state: null }),
      pull: async () => {
        const data = held.presses.shift() ?? []

        return { isUp: true, isStale: false, isRegistered: true, actions: data.map((one, index) => ({ id: index + 1, at: 0, data: { lang: 'ru', ...(one as object) } })) }
      },
    },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: undefined }) as never)
  on('tool.register', () => ({ value: undefined }) as never)
  on('session.id', () => ({ value: OWN }))
  on('session.root', () => ({ value: ROOT }))
  on('env.get', (_, e) => ({ value: e.name === 'HOME' ? HOME : undefined }))
  on('store.get', () => ({ value: 'ru' }))
  on('process.run', (_, e) => {
    if (e.argv[0] === 'rm') {
      held.files.delete(e.argv[2]!)
    }

    return { value: { exitCode: 0, stdout: e.argv.includes('rev-parse') ? 'fix/stripe\n' : '', stderr: '' } } as never
  })
  on('fs.exists', (_, e) => ({ value: held.files.has(e.path) }))
  on('fs.read', (_, e) => {
    if (!held.files.has(e.path)) {
      throw new Error(`ENOENT ${e.path}`)
    }

    return { value: held.files.get(e.path)! }
  })
  on('fs.write', (_, e) => {
    held.files.set(e.path, e.text)

    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.submit', (_, e) => {
    held.submitted.push({ text: e.text, ...(e.context === undefined ? {} : { context: e.context }) })

    return { text: e.text }
  })
  on('model.fork', (_, e) => {
    held.forked.push(e.prompt)

    return { value: { ...(held.forkReplies.shift() ?? { isAnswered: false, reason: 'nothing-to-fork' }), usage } } as never
  })
  on('model.complete', (_, e) => {
    held.completed.push(String(e.prompt))

    return { value: { ...(held.completeReplies.shift() ?? { isAnswered: false, reason: 'empty-reply' }), usage } } as never
  })

  return held
}

const call = ($: { tool: { call: (input: never) => Promise<{ result?: unknown; deny?: string }> } }, tool: string, input: Record<string, unknown>) => $.tool.call({ tool, ...input } as never)

const shown = (held: World): State => held.pushed.at(-1) ?? EMPTY

const one = (held: World, key: string): Variant => shown(held).variants.find(variant => variant.key === key)!

const ready = (key: string, files: Variant['files'], after: Record<string, string>): Variant => ({
  key,
  title: key,
  short: '',
  essence: `essence ${key}`,
  pros: [`pro ${key}`],
  cons: [],
  files,
  tests: [],
  origin: 'claude',
  from: {},
  code: { ...EMPTY_CODE, status: 'ready', after, counts: {} },
})

const started = async ($: Parameters<TestBody>[0], on: On): Promise<{ held: World; clock: { advance: (ms: number) => Promise<void> } }> => {
  const held = world(on)
  const clock = mock.clock(on, { now: 1_000_000 })
  await $.session.start(START)

  return { held, clock }
}

test('a proposal is checked: two variants at least, paths relative to the project, the recommended one known', async () => {
  const parsed = parsePropose(PROPOSAL, ROOT)
  expect('errors' in parsed).toBe(false)
  expect(parsePropose({ ...PROPOSAL, recommended: 'Z' }, ROOT)).toMatchObject({ recommended: 'A' })
  expect(parsePropose({ ...PROPOSAL, variants: [{ ...PROPOSAL.variants[0], files: [{ path: `${ROOT}/${CTRL}`, status: 'M' }] }, { ...PROPOSAL.variants[1], files: [{ path: '../etc/passwd', status: 'M' }] }] }, ROOT)).toEqual({
    errors: ['variant B: path "../etc/passwd" must be relative to the project root'],
  })
  expect(parsePropose({ ...PROPOSAL, variants: [PROPOSAL.variants[0]] }, ROOT)).toEqual({ errors: ['give at least 2 variants'] })
})

test('code is laid over the files: an old that is missing or not unique is refused, a new file and a deletion are taken whole', async () => {
  const variant = { ...ready('A', [{ path: CTRL, status: 'M' }, { path: MODEL, status: 'A' }], {}), code: EMPTY_CODE }
  const files = parseCodeReply(A_REPLY, ROOT)
  expect(Array.isArray(files)).toBe(true)
  const laid = layCode(variant, { [CTRL]: CTRL_TEXT, [MODEL]: '' }, files as never)
  expect(laid).toMatchObject({ counts: { [CTRL]: { add: 1, del: 0 }, [MODEL]: { add: 2, del: 0 } } })

  expect(layCode(variant, { [CTRL]: CTRL_TEXT }, [{ path: CTRL, edits: [{ old: 'nope', new: 'x' }] }, { path: MODEL, content: '' }])).toEqual({ error: `${CTRL}: old is not in the file: "nope"` })
  expect(layCode(variant, { [CTRL]: CTRL_TEXT }, [{ path: CTRL, edits: [{ old: '    ', new: 'x' }] }, { path: MODEL, content: '' }])).toMatchObject({ error: expect.stringContaining('stands 5 times') })
  expect(layCode(variant, { [CTRL]: CTRL_TEXT }, [{ path: CTRL, edits: [] }])).toEqual({ error: `no code for ${MODEL}` })
  expect(layCode({ ...variant, files: [{ path: CTRL, status: 'D' }] }, { [CTRL]: CTRL_TEXT }, [{ path: CTRL, deleted: true }])).toMatchObject({ after: { [CTRL]: '' }, counts: { [CTRL]: { add: 0, del: 8 } } })
})

test('a fork\'s reply is read as JSON even inside a fence or prose; anything else says what is wrong', async () => {
  expect(parseCodeReply(`\`\`\`json\n${A_REPLY}\n\`\`\``, ROOT)).toHaveLength(2)
  expect(parseCodeReply(`Here: ${A_REPLY} done`, ROOT)).toHaveLength(2)
  expect(parseCodeReply('no json', ROOT)).toBe('the reply is not JSON')
  expect(parseCodeReply('{"files":[{"path":"a.php"}]}', ROOT)).toBe('a.php: give edits, content or deleted')
})

test('lines are counted by a line diff', async () => {
  expect(countLines('a\nb\nc\n', 'a\nB\nc\nd\n')).toEqual({ add: 2, del: 1 })
  expect(countLines('', 'x\n')).toEqual({ add: 1, del: 0 })
})

test('a combination takes each file from the picked variant and needs every source\'s code', async () => {
  const variants = [ready('A', [{ path: CTRL, status: 'M' }, { path: MODEL, status: 'A' }], { [CTRL]: 'a\n', [MODEL]: 'm\n' }), ready('B', [{ path: CTRL, status: 'M' }], { [CTRL]: 'b\n' })]
  const made = combine(variants, { [CTRL]: 'B', [MODEL]: 'A' }, { [CTRL]: 'x\n' }, 'ru')
  expect(made).toMatchObject({ key: 'C', origin: 'combined', from: { [CTRL]: 'B', [MODEL]: 'A' }, title: 'Сборка: StripeController.php ← B, ProcessedWebhook.php ← A', code: { status: 'ready', after: { [CTRL]: 'b\n', [MODEL]: 'm\n' } } })
  expect(combine([{ ...variants[0]!, code: EMPTY_CODE }, variants[1]!], { [MODEL]: 'A' }, {}, 'en')).toEqual({ error: 'the code of A is not there yet' })
  expect(combine(variants, { [MODEL]: 'B' }, {}, 'en')).toEqual({ error: `B does not touch ${MODEL}` })
})

test('presses are checked; unknown ones and empty questions are dropped', async () => {
  expect(parseAction({ type: 'open', key: 'b', lang: 'ru' })).toEqual({ type: 'open', key: 'B', lang: 'ru' })
  expect(parseAction({ type: 'ask', text: ' ', key: 'A' })).toBe(null)
  expect(parseAction({ type: 'own', text: '', code: 'x();\n\n', refs: ['A · x.php:3'] })).toEqual({ type: 'own', text: '', code: 'x();', refs: ['A · x.php:3'], key: '', lang: 'en' })
  expect(parseAction({ type: 'rm -rf' })).toBe(null)
})

test('a quick question carries only a small context: the task, the variants, the asked one\'s changes and the lines referred to', async () => {
  const variant = ready('A', [{ path: CTRL, status: 'M' }], { [CTRL]: CTRL_TEXT.replace('markPaid', 'markPaidOnce') })
  const prompt = quickPrompt({ ...EMPTY, task: { kind: 'bug', title: 'Twice', summary: 'Retries', ref: '', steps: [] }, variants: [variant], bases: { [CTRL]: CTRL_TEXT } }, 'A', 'Why?', ['A · StripeController.php:6'])
  expect(prompt).toContain('Task: Twice')
  expect(prompt).toContain('-         $this->payments->markPaid($order);')
  expect(prompt).toContain('+         $this->payments->markPaidOnce($order);')
  expect(prompt).toContain('6>         $this->payments->markPaidOnce($order);')
  expect(prompt.endsWith('Question about variant A: Why?')).toBe(true)
})

test('the page loads Shiki pinned and has no template holes left', async () => {
  expect(PAGE).toContain(`https://esm.sh/shiki@${SHIKI_VERSION}`)
  expect(PAGE).not.toContain('__THEME__')
  expect(PAGE).toContain('"name":"Islands Dark"')
})

test('variants are shown without code, and the recommended one\'s code is fetched at once by a fork', async ($, on) => {
  const { held, clock } = await started($, on)
  expect(held.pages).toBe(1)
  expect(shown(held)).toMatchObject({ project: 'shop', branch: 'fix/stripe', hasTests: false })

  const result = await call($, PROPOSE, PROPOSAL)
  expect(String(result.result)).toContain('2 variants are on the Variants page')
  expect(shown(held).bases).toEqual({ [CTRL]: CTRL_TEXT, [MODEL]: '' })
  expect(one(held, 'A').code.status).toBe('queued')
  expect(one(held, 'B').code.status).toBe('none')

  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await clock.advance(1000)
  expect(held.forked).toHaveLength(1)
  expect(held.forked[0]).toContain('[variants] Write the code of variant A «Unique event id»')
  expect(one(held, 'A').code).toMatchObject({ status: 'ready', via: 'fork', counts: { [CTRL]: { add: 1, del: 0 } } })
  expect(held.submitted).toEqual([])
})

test('another variant\'s code is fetched only when it is opened', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await clock.advance(1000)

  held.presses.push([{ type: 'open', key: 'B' }])
  held.forkReplies.push({ isAnswered: true, text: JSON.stringify({ files: [{ path: CTRL, edits: [{ old: 'markPaid($order)', new: 'markPaidOnce($order)' }] }] }) })
  await clock.advance(1000)
  await clock.advance(1000)
  expect(held.forked).toHaveLength(2)
  expect(one(held, 'B').code).toMatchObject({ status: 'ready', counts: { [CTRL]: { add: 1, del: 1 } } })
})

test('a fork that fails twice hands the code to the session, which gives it through variant_code', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  const wrong = JSON.stringify({ files: [{ path: CTRL, edits: [{ old: 'nope', new: 'x' }] }, { path: MODEL, content: 'm' }] })
  held.forkReplies.push({ isAnswered: true, text: wrong }, { isAnswered: true, text: wrong })
  await clock.advance(1000)
  await clock.advance(1000)
  expect(held.forked[1]).toContain(`Your previous answer failed: ${CTRL}: old is not in the file`)
  expect(held.forked[1]).toContain(`Current ${CTRL}:\n<<<\n${CTRL_TEXT}`)
  expect(one(held, 'A').code).toMatchObject({ status: 'loading', via: 'session', tries: 2 })
  expect(held.submitted.at(-1)?.text).toContain('[variants] Странице вариантов не удалось получить код варианта A')

  const answer = await call($, CODE, { key: 'A', files: JSON.parse(A_REPLY).files })
  expect(String(answer.result)).toContain('The code of A is on the Variants page')
  expect(one(held, 'A').code).toMatchObject({ status: 'ready', via: 'session' })
})

test('apply writes the files, tells Claude with the next own message, and refuses a file changed on disk', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await clock.advance(1000)

  held.files.set(`${ROOT}/${CTRL}`, `${CTRL_TEXT}// edited\n`)
  held.presses.push([{ type: 'apply', key: 'A', runTests: true }])
  await clock.advance(1000)
  expect(shown(held)).toMatchObject({ applied: '', drift: [CTRL] })

  held.files.set(`${ROOT}/${CTRL}`, CTRL_TEXT)
  held.presses.push([{ type: 'apply', key: 'A', runTests: true }])
  await clock.advance(1000)
  expect(shown(held).applied).toBe('A')
  expect(held.files.get(`${ROOT}/${CTRL}`)).toContain('ProcessedWebhook::create')
  expect(held.files.get(`${ROOT}/${MODEL}`)).toBe('<?php\nclass ProcessedWebhook extends Model {}\n')
  expect(held.submitted).toEqual([])

  await $.prompt.submit({ text: 'what next?' } as never)
  expect(held.submitted.at(-1)?.context?.[0]).toContain('[variants] Пользователь применил вариант A «Unique event id»')
  expect(shown(held).news).toEqual([])
})

test('a question is answered from a small context by sonnet; a failed quick answer falls back to a fork', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await clock.advance(1000)

  held.completeReplies.push({ isAnswered: true, text: 'Because retries.' })
  held.presses.push([{ type: 'ask', text: 'Why a table?', refs: [], key: 'A', deep: false }])
  await clock.advance(1000)
  expect(held.completed).toHaveLength(1)
  expect(shown(held).chat.map(message => [message.by, message.text, message.via])).toEqual([
    ['you', 'Why a table?', 'quick'],
    ['claude', 'Because retries.', 'quick'],
  ])

  held.forkReplies.push({ isAnswered: true, text: 'Deep answer.' })
  held.presses.push([{ type: 'ask', text: 'And Redis?', refs: [], key: 'A', deep: false }])
  await clock.advance(1000)
  expect(held.forked.at(-1)).toContain('Question: And Redis?')
  expect(shown(held).chat.at(-1)).toMatchObject({ by: 'claude', text: 'Deep answer.', via: 'deep' })
  expect(held.submitted).toEqual([])
})

test('my own solution goes through the session, and the answer of that turn comes back to the page', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await clock.advance(1000)

  held.presses.push([{ type: 'own', text: 'Use a lock', code: 'Cache::lock()', refs: [], key: 'A' }])
  await clock.advance(1000)
  const sent = held.submitted.at(-1)!.text
  expect(sent.startsWith('[variants] Моё решение для «Webhook processed twice»: Use a lock')).toBe(true)
  expect(shown(held).busy?.what).toBe('session')

  await $.turn.start({ text: sent, turnId: 't1' })
  await $.turn.complete({ answer: 'A lock is fine here.', turnId: 't1', durationMs: 1, isAborted: false, reason: 'answer' })
  expect(shown(held).chat.at(-1)).toMatchObject({ by: 'claude', text: 'A lock is fine here.', via: 'session' })
  expect(shown(held).busy).toBe(null)

  await $.turn.start({ text: 'a turn of the user', turnId: 't2' })
  await $.turn.complete({ answer: 'Not for the page.', turnId: 't2', durationMs: 1, isAborted: false, reason: 'answer' })
  expect(shown(held).chat.at(-1)?.text).toBe('A lock is fine here.')
})

test('a message for the session waits while a turn runs and goes when it ends', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY })
  await $.turn.start({ text: 'working', turnId: 't1' })

  held.presses.push([{ type: 'another', constraints: ['Без миграций'], note: '' }])
  await clock.advance(1000)
  expect(held.submitted).toEqual([])
  expect(shown(held).queued).toBe(1)

  await $.turn.complete({ answer: '', turnId: 't1', durationMs: 1, isAborted: false, reason: 'answer' })
  await clock.advance(1000)
  expect(held.submitted.at(-1)?.text).toBe('[variants] Предложи ещё один вариант для «Webhook processed twice». Ограничения: Без миграций. Вызови mcp__variants__add_variant без кода, в чате — одна строка.')
  expect(shown(held).queued).toBe(0)
})

test('a variant added by Claude comes without code, or with code that is laid over the files', async ($, on) => {
  const { held } = await started($, on)
  expect(String((await call($, ADD, { title: 'x', short: '', essence: 'y', pros: [], cons: [], files: [{ path: CTRL, status: 'M' }] })).deny)).toContain('call mcp__variants__propose first')
  await call($, PROPOSE, PROPOSAL)

  await call($, ADD, { title: 'Lock', short: 'Cache lock', essence: 'Lock the order.', pros: ['Simple'], cons: ['Redis'], files: [{ path: CTRL, status: 'M' }] })
  expect(one(held, 'C')).toMatchObject({ title: 'Lock', code: { status: 'none' } })

  const result = await call($, ADD, { title: 'Bad', short: '', essence: 'z', pros: [], cons: [], files: [{ path: CTRL, status: 'M' }], code: [{ path: CTRL, edits: [{ old: 'nope', new: 'x' }] }] })
  expect(String(result.result)).toContain('its code does not fit the files')
  expect(one(held, 'D').code.status).toBe('error')
})

test('a combination is made on the page with no model, and goes to Claude only when the seams are to be checked', async ($, on) => {
  const { held, clock } = await started($, on)
  await call($, PROPOSE, PROPOSAL)
  held.forkReplies.push({ isAnswered: true, text: A_REPLY }, { isAnswered: true, text: JSON.stringify({ files: [{ path: CTRL, edits: [{ old: 'markPaid($order)', new: 'markPaidOnce($order)' }] }] }) })
  await clock.advance(1000)
  held.presses.push([{ type: 'open', key: 'B' }])
  await clock.advance(1000)
  await clock.advance(1000)

  held.presses.push([{ type: 'combine', picks: { [CTRL]: 'B', [MODEL]: 'A' }, note: '', checkSeams: false }])
  await clock.advance(1000)
  expect(one(held, 'C')).toMatchObject({ origin: 'combined', code: { status: 'ready', via: 'combine' } })
  expect(held.submitted).toEqual([])

  held.presses.push([{ type: 'combine', picks: { [CTRL]: 'A' }, note: 'keep it small', checkSeams: true }])
  await clock.advance(1000)
  expect(held.submitted.at(-1)?.text).toContain(`[variants] Вариант D собран из: ${CTRL} ← A. keep it small`)
})
