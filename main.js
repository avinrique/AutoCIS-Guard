const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
    setTimeout(() => {        
        mainWindow.loadFile('app.html');
    }, 2000);
    
    

}

ipcMain.on('os-detected', (event) => {
    const platform = os.platform();

    if (platform === 'win32') {
        getWindowsInfo(event)
      
    } else if (platform === 'linux') {
        getLinuxInfo(event);
    } else {
        event.reply('os-detected', 'Unsupported OS');
    }

});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('run-cis-benchmark', (event) => {
    const platform = os.platform();
    if (platform === 'win32') {
        runWindowsBenchmark()
    } else if (platform === 'linux') {
        runLinuxBenchmark()
    } else {
//
    }
});




function getWindowsInfo(event) {
    exec('systeminfo', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        const lines = stdout.split('\n');
        let osVersion = '';
        let edition = '';

        lines.forEach(line => {
            if (line.includes('OS Name:')) {
                osVersion = line.split(':')[1].trim();
            }
            if (line.includes('OS Architecture:')) {
                edition = line.split(':')[1].trim();
            }
        });
        event.reply('os-detected',osVersion);
        

    });
}

function getLinuxInfo(event) {
    exec('cat /etc/os-release | grep PRETTY_NAME', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running CIS benchmark: ${error}`);
            return;
        }
        cas = stdout.replace("PRETTY_NAME" , "")
        cas = cas.replace('"' , "")
        console.log(stdout)
        event.reply('os-detected',cas);
       
    });

    // fs.readFile('/etc/os-release', 'utf8', (err, data) => {
    //     if (err) {
    //         console.error(`Error reading os-release file: ${err.message}`);
    //         return;
    //     }

    //     const lines = data.split('\n');
    //     let version = '';
    //     let name = '';

    //     lines.forEach(line => {
    //         if (line.startsWith('VERSION_ID=')) {
    //             version = line.split('=')[1].replace(/"/g, '').trim();
    //         }
    //         if (line.startsWith('NAME=')) {
    //             name = line.split('=')[1].replace(/"/g, '').trim();
    //         }
    //     });
    //     console.log(name)
    //     event.reply('os-detected',name);
       
    // });
}

function runWindowsBenchmark() {
    exec('node windows11standalone.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running CIS benchmark: ${error}`);
            return;
        }
        console.log(`CIS Benchmark Result: ${stdout}`);
        setTimeout(() => {
            mainWindow.loadFile('results.html');
        }, 2000); 
    });
}


function runLinuxBenchmark() {
    exec('node ubuntu2204.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running CIS benchmark: ${error}`);
            return;
        }
        console.log(`CIS Benchmark Result: ${stdout}`);
        setTimeout(() => {
            mainWindow.loadFile('results.html');
        }, 2000); 
    });
}
