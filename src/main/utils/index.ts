import { BrowserWindow } from 'electron'

export function log(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  console.error(`[${context}] ${message}`, error)

  BrowserWindow.getFocusedWindow()?.webContents.send('system:error', {
    context,
    message,
    stack,
  })
}

const ESM_ALLOWLIST = ['@elysiajs/node']

export function importEsm(specifier: string) {
  if (!ESM_ALLOWLIST.includes(specifier)) {
    throw new Error(`importEsm: module "${specifier}" is not in the allowlist`)
  }
  // eslint-disable-next-line no-new-func
  return new Function('s', 'return import(s)')(specifier) as Promise<any>
}
