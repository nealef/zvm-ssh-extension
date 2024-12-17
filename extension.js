// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Client } = require('ssh2');
const { readFileSync } = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "zvm-ssh-extension" is now active!');

    let connectToZVM = vscode.commands.registerCommand('zvm-ssh-extension.connectToZVM', () => {
        vscode.window.showInformationMessage('Connecting to z/VM SSH server...');

        const config = vscode.workspace.getConfiguration();
        vscode.window.showInformationMessage('Got configuration');

        // SSH connection details (adjust with your z/VM SSH server credentials)
        var sshConfig = {};

        sshConfig['port'] = config.get('port');
        sshConfig['host'] = config.get('host');
        sshConfig['username'] = config.get('user');
        if (config.get('useKey')) {
            sshConfig['privateKey'] = readFileSync(config.get('key'));
        } else {
            sshConfig['password'] = config.get('password');
        }

        vscode.window.showInformationMessage(JSON.stringify(sshConfig));

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
