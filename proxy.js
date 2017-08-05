const proxy = require('express-http-proxy');

const app = require('express')();

const UNEDDIT_HOST = 'uneddit.com';
const HOSTNAME = 'uneddit.pantas.net';
const SCRIPTS = [
	'phase1',
	'phase2'
];

const scriptHandler = proxy(UNEDDIT_HOST, {
	userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
		const script = proxyResData.toString('utf8');
		const replaced = script.replace(/uneddit.com/gm, HOSTNAME);
		return JSON.stringify(data);
	}
});

SCRIPTS.forEach(script => {
	app.use('/' + script, scriptHandler);
});

app.use('/', proxy(UNEDDIT_HOST));