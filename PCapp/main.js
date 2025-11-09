const { app, ipcMain, BrowserWindow, Menu } = require('electron');
const path = require("path");
const fs = require('fs');
const DataPath = process.env.AIREYES_DATA_PATH || path.resolve(path.join(__dirname, '..', 'userData'));
const isDebug = process.env.AIREYES_DEBUG ?? false;
let isDataDirOK = true;

// 设置缓存路径
app.setPath('userData', DataPath);

// 测试缓存目录读写权限
try { fs.accessSync(DataPath, fs.constants.W_OK) } catch (_) { isDataDirOK = false }
try { fs.accessSync(DataPath, fs.constants.R_OK) } catch (_) { isDataDirOK = false }

app.whenReady().then(() => {
    const mainWin = new BrowserWindow({ width: 1024, height: 600 });
    mainWin.loadFile(path.join(__dirname, 'index.html'));
    mainWin.on('closed', app.quit);

    // 调试状态标题栏
    const Menuobj = isDebug ? Menu.buildFromTemplate([{
        label: '忽略缓存刷新(shift+F5)',
        accelerator: 'shift+F5',
        role: 'forceReload'
    }, {
        label: '开发者工具(F12)',
        accelerator: 'F12',
        role: 'toggleDevTools'
    }]) : null;

    Menu.setApplicationMenu(Menuobj);
});

app.on('window-all-closed', app.quit);