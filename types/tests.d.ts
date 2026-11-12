/** The tests mod's noun, when it is installed: the Variants mod calls it in try/catch and works without it. */
export type TestsRunArgs = { targets: string[]; label: string; origin: { mod: string; ref: string } }

export type TestsStatus = { state: string; passed: number; failed: number }

declare module 'claude-code' {
  interface EngineInterface {
    tests: {
      run: (args: TestsRunArgs) => Promise<{ runId: string; url: string }>
      status: (args: { runId: string }) => Promise<TestsStatus>
    }
  }
}
