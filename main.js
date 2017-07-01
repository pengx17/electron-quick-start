const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const { spawn } = require('child_process');
const Axios = require('axios');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

async function spawnDjango () {
  return new Promise(resolve => {
    const django = spawn('./runserver.sh', [], { cwd: '/Users/pengxiao/branches/rubick' });
    django.stdout.on('data', (data) => { console.log(`std: ${data}`); });
    django.stderr.on('data', (data) => { console.error(`std: ${data}`); });

    checkServerAliveAndResolve(resolve);
  })
}

function checkServerAliveAndResolve(resolve) {
  console.log('ping');
  Axios.get('http://localhost:5080/_ping')
    .then(() => resolve())
    .catch(rej => {
      console.log(rej.message);
      setTimeout(() => {
        checkServerAliveAndResolve(resolve)
      }, 100);
    });
}

async function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    vibrancy: 'ultra-dark',
    center: true,
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  await spawnDjango();

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:5080/landing')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
