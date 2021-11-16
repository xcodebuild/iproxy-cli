import fs from 'fs';
import colors from 'colors';
import shell from 'shelljs';
import path from 'path';
import { exec } from 'child_process';
import exitHook from 'exit-hook';

const isRunning = (query: string) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
        default: break;
    }
	return new Promise(resolve => {
		exec(cmd, (err, stdout, stderr) => {
			resolve(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
		});
	});
}

const run = async () => {

	const IPROXY_BIN = '/Applications/iProxy.app/Contents/MacOS/iProxy';
	const DOC_URL = 'https://github.com/xcodebuild/iproxy';

	if (!fs.existsSync(IPROXY_BIN)) {
		console.error(colors.red(`iProxy is not installed! ${DOC_URL}`));
		process.exit(1);
	}

	if (!await isRunning('iProxy')) {
		console.error(colors.red(`iProxy is not running! ${DOC_URL}`));
		process.exit(1);
	}
	
	const CONFIG_FILE = path.join(process.cwd(), 'iproxy.config.js');
	
	if (!fs.existsSync(CONFIG_FILE)) {
		console.error(colors.red(`iproxy.config.js is not found! ${DOC_URL}`));
		process.exit(1);
	}
	
	const config = require(CONFIG_FILE) as {
		name: string;
		id: string;
		rule: string;
	};
	
	const command = {
		type: 'active-rule',
		rule: config,
	};
	
	const output = shell.exec(`${IPROXY_BIN} --call ${decodeURIComponent(JSON.stringify(command))}`).stdout;
	
	if (!output.includes('[call-success]')) {
		console.error(colors.red(`Your iProxy is out of date. Please update iProxy to latest version: ${DOC_URL}`));
		process.exit(2);
	}
	
	console.log(colors.green(`iProxy rule is actived! ${config.name}`));

	exitHook(() => {
		shell.exec(`${IPROXY_BIN} --call ${decodeURIComponent(JSON.stringify({
			type: 'inactive-rule',
			id: config.id,
		}))}`);
		console.log(colors.green(`iProxy rule is disabled! ${config.name}`));
	});
};

run();