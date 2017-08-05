const libUrl = require('url');

const proxy = require('express-http-proxy');
const morgan = require('morgan');

const app = require('express')();

const UNEDDIT_HOST = 'uneddit.com';
const HOSTNAME = 'uneddit.pantas.net';
const SCRIPTS = [
	'phase_one',
	'phase_two'
];
const PORT = process.env.PORT || 15080;

const PROXY_OPTS = {
https: false,
	proxyReqPathResolver: function(req) {
		return libUrl.parse(req.url).path;
	},
};

app.use(morgan('tiny'));

app.get('/', (req, res, next) => {
	return res.send(`
		Proxy for uneddit.com
		Until they fix their HTTPS stuff.
	`);
});

SCRIPTS.forEach(script => {
	const opts = Object.assign({
			userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
				
				// Replace url-s
				let script = proxyResData.toString('utf8');
				script = script.replace(new RegExp(UNEDDIT_HOST, 'gm'), HOSTNAME);

				// Fix trailing / in URL concatenation
				script = script.replace(/(var newurl = [^;]+;)/gm, match => {
					return match + ' newurl = newurl.replace(/\\/^/gm, "");';
				});

				console.log(`Modified`, userReq.url);
				return script;
			},
		},
		PROXY_OPTS
	);
	app.get('/' + script, proxy(UNEDDIT_HOST, opts));
	console.log(`Special proxy handler for /${script}`);
});

app.use('/', proxy(UNEDDIT_HOST, PROXY_OPTS));

app.listen(PORT, () => {
	console.log('Listening on port ' + PORT);
});