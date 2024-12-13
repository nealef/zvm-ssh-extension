// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Client } from 'ssh2';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "zvm-ssh-extension" is now active!');

    let disposable = vscode.commands.registerCommand('zvm-ssh-extension.connectToZVM', () => {
        vscode.window.showInformationMessage('Connecting to z/VM SSH server...');

        // SSH connection details (adjust with your z/VM SSH server credentials)
        const sshConfig = {
            host: 'zvm.example.com',     // Replace with the z/VM server hostname/IP
            port: 22,                    // SSH port (typically 22)
            username: 'your-username',    // SSH username
            password: 'your-password'    // SSH password or use a private key
        };

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

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Extension "zvm-ssh-extension" is now deactivated!');
}
