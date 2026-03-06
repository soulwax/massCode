import { app, ipcMain, shell } from 'electron'

export function registerSystemHandlers() {
  ipcMain.handle('system:reload', () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle('system:open-external', (_, url: string) => {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error(`Blocked opening URL with disallowed protocol: ${parsed.protocol}`)
      }
      shell.openExternal(url)
    }
    catch (error) {
      console.error('Blocked unsafe openExternal call:', url, error)
    }
  })
}
