import { app, Menu, shell } from "electron"
import MenuItemOptions = GitHubElectron.MenuItemOptions

export default function setMenu() {
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

    windowsMenu.submenu.push({
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function openExternalHandler(url: string) {
  return shell.openExternal.bind(shell, url)
}