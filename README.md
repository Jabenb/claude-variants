# Variants for Claude Code

English | [Русский](README.ru.md)

When a feature or a bug fix can be done in more than one sensible way, Claude usually describes the options in the chat, and only the chosen one ever gets code. This mod puts the options side by side on a page in your browser, each with its approach, pros and cons, the files it touches and a real diff, so you can compare them, combine them, ask about them, and apply one without leaving the page.

The page is built on [Claude Hub (webhub)](https://github.com/jabenb/claude-webhub): the hub hosts it, keeps it live and hands your presses back to the session.

## What the page shows

- **The task**: bug or feature, the ticket, what is wrong or wanted, and for a bug how it happens step by step.
- **Variant cards**: one per variant, with the one Claude recommends marked; lines added and removed once its code is in.
- **A variant in detail**: the approach, pros and cons, the files it touches as badges (`A` new, `M` changed, `D` deleted) with a line on what changes in each, and the code block.
- **Three levels of detail**, each only on a press: the description (always there), a **Sketch** (short pseudocode per file) and **Show code** (the exact diff).
- **The code**: the diff in one column or side by side, or the whole file with the changes in it (also in one column or side by side), highlighted with Islands Dark. Long unchanged stretches are folded. Click a line number to refer to that line in the chat.
- **The discussion**: a chat with Claude right on the page.

## What you can do

| Action | What happens |
|---|---|
| **Sketch** | Short pseudocode per file: which classes and methods appear and the key logic. Cheap; enough to judge a variant. |
| **Show code** | The exact diff. Asked only when you press it; the code follows the sketch when there is one. |
| **Choose variant X**, then **Apply** | Applying needs the code: a chosen variant without it offers **Get the code** first, so you see the diff before anything is written. The mod writes the variant's files itself; no model is involved. If a file changed on disk since the variants were proposed, nothing is written and the page offers to fetch the code again. Claude hears of the applied variant together with your next message. |
| **Combine** | Pick, file by file, which variant each file comes from. Building asks for the code of the picked variants that have none, then the new variant is put together on the page with no model; a simple check by file names warns when a file relies on a new file of its variant that you did not take. Tick **Check the seams with Claude** to have Claude review and fix the joins. |
| **Another variant** | Ask Claude for one more variant, with constraints (no migrations, fewest changes, …) and a note. It appears as a new card. |
| **My solution** | Describe your own solution, paste its code, and Claude judges it against the code; if it is worth it, Claude adds it as a variant. |
| **Question** | Ask about a variant or a line. |

## Low token use

The mod keeps everything it can away from the model:

- **Variants come without code**, with one line per file on what changes. Nothing is fetched by itself: a sketch or the code is asked only when you press its button. A variant you only read costs no extra tokens.
- **Sketches and code are written by a fork** of the session, so it does not show in the chat and reuses the session's cache. Claude gives Edit-style edits (`old → new`), not whole files; the mod checks each edit against the file and builds the result. A reply that does not fit gets one more try with the file's text, then the session writes the code instead.
- **Diffs, line counts, highlighting, combining and applying** are done by the mod and the page.
- **Questions** go by default to a small context the mod builds (the task, the variants, the changes of the asked one, the lines you refer to, the last lines of the chat), answered by `sonnet` at low effort. **Ask with the whole conversation** under an answer asks a fork of the session instead.
- Only what needs the code and the tools goes through the session: another variant, your own solution, checking the seams. The answer of that turn comes back to the page's chat. While Claude is busy with a turn, these messages wait and go when it ends.

## Tests after Apply

The variant can name the tests that cover it. When a tests mod that provides `$.tests` is installed, a **Run the variant's tests** box appears next to **Apply**: the tests are started through that mod, with no model, and the page shows how they went with a link to the tests page. Without such a mod the box is hidden.

## Requirements

- [Claude Hub (webhub)](https://github.com/jabenb/claude-webhub) installed in the same scope, and Docker for its server.
- The session runs where the project's files are: the mod reads them and writes them on Apply.
- A Claude Code build with mods (plugins with a hooks module).
- A browser with internet access for the code highlighting. Without it the page works, the code is shown without colours.

## Install

The mod needs [Claude Hub (webhub)](https://github.com/jabenb/claude-webhub): install both in the same scope. The scope decides where they run:

| Scope | Runs in | Written to |
|---|---|---|
| `user` (global, the default) | every project | `~/.claude/settings.json` |
| `project` | this repository, for everyone who clones it | `<project>/.claude/settings.json` |
| `local` | this repository, only for you | `<project>/.claude/settings.local.json` |

### Globally

```bash
claude plugin install webhub --marketplace jabenb/claude-webhub
```

```bash
claude plugin install variants --marketplace jabenb/claude-variants
```

At the prompt of a Claude Code session the same works as `/plugin install variants --marketplace jabenb/claude-variants`.

### For one project

Run from the project's folder, with `--scope project` (or `--scope local` to keep it out of the files others see):

```bash
cd ~/path/to/project
```

```bash
claude plugin install webhub --marketplace jabenb/claude-webhub --scope project
```

```bash
claude plugin install variants --marketplace jabenb/claude-variants --scope project
```

### From a local copy

To run a clone, or your own changes, without GitHub, add the folder as a marketplace and install from it (any scope above):

```bash
git clone git@github.com:jabenb/claude-variants.git ~/claude-variants
```

```bash
claude plugin marketplace add ~/claude-variants
```

Globally:

```bash
claude plugin install variants@claude-variants
```

Or for one project, from its folder:

```bash
claude plugin install variants@claude-variants --scope project
```

The hub is installed the same way from its own clone (`claude plugin marketplace add ~/claude-webhub`, then `claude plugin install webhub@claude-webhub`), or from GitHub as above.

While working on the mod itself, load it straight from the folder for one session instead, next to the hub's folder; changes reload when a turn ends:

```bash
claude --plugin-dir ~/claude-webhub --plugin-dir ~/claude-variants
```

Or for every session: add the folder to `CLAUDE_CODE_PLUGIN_DIRS` (paths joined with `:`) in the `env` of `~/.claude/settings.json`. Do not keep a folder-loaded copy and an installed one at once, or the mod loads twice.

### Updating

```bash
claude plugin marketplace update claude-variants
```

Then start a new session.

## Use

1. Ask Claude: "propose implementation variants for …". Claude calls the `propose` tool only when you ask for variants, and says in one line that they are on the page, with its address.
2. `/variants` prints the page's address at any time. The hub lists the page under the session's name.
3. Open the variants, compare, ask, combine, choose and apply.

## Settings

- `VARIANTS_CHAT_MODEL`: the model for quick answers in the chat (default `sonnet`), e.g. `haiku` for even fewer tokens.

## Languages

The page follows the language chosen in the hub: English, Russian or Ukrainian. The messages the page sends to Claude are in the same language.

## How data is kept

Everything lives in `~/.claude/mods-data/variants/sessions/<session id>.json` (inside `$CLAUDE_CONFIG_DIR` when it is set): the task, the variants with their code, the chat. Nothing appears in the project's repository except the files you apply. The hub keeps its own copy of the page's state as well.

## For Claude

Three tools:

- `mcp__variants__propose`: show the task and its variants, with no code. Only when the user asks for variants.
- `mcp__variants__add_variant`: add one variant when the page asked for one; code is optional.
- `mcp__variants__variant_code`: give the code of a variant when the page could not get it on its own.

## Development

```bash
claude plugin validate .
```

```bash
claude plugin test .
```

- `hooks/model.ts`: parsing, laying edits over files, the line diff, combining, the prompts and messages (pure functions).
- `hooks/register.ts`: the engine and the hub: tools, the listening loop, the code queue, presses, files, the turns of the session.
- `hooks/page/page.ts`: the whole page; `hooks/page/theme.ts`: Islands Dark.
- `types/`: the state and the optional `$.tests` noun.
- `tests/variants.test.ts`: the model and the mod end to end, with the hub and the engine held in memory.

## Uninstall

```bash
claude plugin uninstall variants
```

## License

MIT. Islands Dark © bwya77, MIT.
