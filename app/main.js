const { app, BrowserWindow, Menu } = require('electron');
const path = require("path");
const DataPath = path.resolve(path.join(__dirname, '..'));
app.setPath('userData', path.join(DataPath, 'userData')); // 设置缓存路径

app.whenReady().then(() => {
    const mainWin = new BrowserWindow({
        width: 1024,
        height: 600,
        minWidth: 1024,
        minHeight: 600,
        webPreferences: {
            devTools: true
        }
    });
    mainWin.loadFile(path.join(__dirname, 'index.html'));
    mainWin.on('closed', () => app.quit());

    const Menuobj = Menu.buildFromTemplate([{
        label: '忽略缓存刷新(shift+F5)',
        accelerator: 'shift+F5',
        role: 'forceReload'
    }, {
        label: '开发者工具(F12)',
        accelerator: 'F12',
        role: 'toggleDevTools'
    }]);
    
    Menu.setApplicationMenu(Menuobj);
});

// 关闭所有窗口时退出
app.on('window-all-closed', () => app.quit());