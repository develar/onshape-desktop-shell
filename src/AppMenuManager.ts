import { app, Menu, shell, BrowserWindow, ipcMain } from "electron"
import MenuItemOptions = GitHubElectron.MenuItemOptions
import WebContents = GitHubElectron.WebContents
import IBrowserWindow = GitHubElectron.BrowserWindow
import { WINDOW_NAVIGATED } from "./WindowManager"
import { AppSignal } from "./electronEventSignals"

export default function setMenu(homeUrl: string) {
  const windowsMenu: MenuItemOptions = {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  }

  const name = app.getName()
  const template: MenuItemOptions[] = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item: any, focusedWindow: any) => {
            if (focusedWindow != null)
              focusedWindow.reload()
          }
        },
        {
          label: 'Enter Full Screen',
          accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: (item: any, focusedWindow: any) => {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      ]
    },
    {
      label: 'History',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          enabled: false,
          click: function () {
            historyGo(true)
          }
        },
        {
          label: 'Forward',
          enabled: false,
          accelerator: 'CmdOrCtrl+]',
          click: function () {
            historyGo(false)
          }
        },
        {
          label: 'Home',
          enabled: false,
          accelerator: 'Shift+CmdOrCtrl+H',
          click: function () {
            const webContents = getFocusedWebContents()
            if (webContents != null) {
              webContents.loadURL(homeUrl)
            }
          }
        },
      ]
    },
    windowsMenu,
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: name + ' Help',
          click: openExternalHandler('https://cad.onshape.com/help/')
        },
        {
          label: name + ' Support',
          click: openExternalHandler('https://www.onshape.com/support/')
        },
        {
          label: name + ' Forums',
          click: openExternalHandler('https://forum.onshape.com/')
        },
        {
          label: name + ' Blog',
          click: openExternalHandler('https://www.onshape.com/cad-blog/')
        },
        {
          type: 'separator'
        },
        {
          label: name + ' Status',
          click: openExternalHandler('http://status.onshape.com/')
        },
      ]
    },
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: ()=> {
            app.quit()
          }
        }
      ]
    })

    windowsMenu.submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      })
  }

  const appMenu = Menu.buildFromTemplate(template)
  const items: any[] = appMenu.items
  for (const item of items) {
    if (item.label === "History") {
      const submenu = item.submenu
      updateHistoryMenuItems(submenu.items, homeUrl)
      break
    }
  }
  Menu.setApplicationMenu(appMenu)
}

function updateHistoryMenuItems(items: MenuItemOptions[], homeUrl: string) {
  function updateEnabled(webContents: WebContents) {
    items[0].enabled = webContents.canGoBack()
    items[1].enabled = webContents.canGoForward()
  }

  ipcMain.on(WINDOW_NAVIGATED, (webContents: WebContents, url: string) => {
    updateEnabled(webContents)
    items[2].enabled = url.replace(/(\?.*)|(#.*)/g, "") != homeUrl
  })

  new AppSignal()
    .windowBlurred(() => {
      items[0].enabled = false
      items[1].enabled = false
    })
    .windowFocused((event, window) => {
      updateEnabled(window.webContents)
    })
}

function openExternalHandler(url: string) {
  return shell.openExternal.bind(shell, url)
}

function getFocusedWebContents(): WebContents {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  return focusedWindow == null ? null : focusedWindow.webContents
}

function historyGo(back: boolean) {
  const webContents = getFocusedWebContents()
  if (webContents != null) {
    if (back) {
      webContents.goBack()
    }
    else {
      webContents.goForward()
    }
  }
}