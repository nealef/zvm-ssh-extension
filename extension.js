// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Client } = require('ssh2');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "zvm-ssh-extension" is now active!');

    let connectToZVM = vscode.commands.registerCommand('zvm-ssh-extension.connectToZVM', () => {
        vscode.window.showInformationMessage('Connecting to z/VM SSH server...');

        const config = vscode.workspace.getConfiguration('zvm-ssh');

        const port = config.get('port');
        const host = config.get('host');
        const user = config.get('user');
        const useKey = config.get('useKey');
        const key = config.get('key');
        const password = config.get('password');

        // SSH connection details (adjust with your z/VM SSH server credentials)
        const sshConfig = {
            host: host,                  // Replace with the z/VM server hostname/IP
            port: port,                  // SSH port (typically 22)
            username: user,              // SSH username
        };

        if (useKey) {
            sshConfig['privateKey'] = key;
        } else {
            sshConfig['password'] = password;
        }

        console.log(sshConfig)

        // Create the SSH client
        const client = new Client();

        // Establish the SSH connection
        client.on('ready', () => {
            vscode.window.showInformationMessage('SSH Connection Established!');
            client.exec('uptime', (err, stream) => { // Example command (replace with z/VM command)
                if (err) {
                    vscode.window.showErrorMessage(`SSH Command failed: ${err.message}`);
                    return;
                }

                // Handle the command output
                stream.on('close', (code, signal) => {
                    console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
                }).on('data', (data) => {
                    vscode.window.showInformationMessage(`Output: ${data.toString()}`);
                }).stderr.on('data', (data) => {
                    vscode.window.showErrorMessage(`Error: ${data.toString()}`);
                });
            });
        }).on('error', (err) => {
            vscode.window.showErrorMessage(`SSH Connection Error: ${err.message}`);
        }).connect(sshConfig);
    });

    context.subscriptions.push(connectToZVM);
}

function deactivate() {
    console.log('Extension "zvm-ssh-extension" is now deactivated!');
}

module.exports = {
    activate,
    deactivate
}
