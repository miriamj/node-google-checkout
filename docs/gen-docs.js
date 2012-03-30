var dox = require('dox'),
	path = require('path'),
	fs = require('fs')
	map = require('../lib/utils').map;

var libPath = path.join(__dirname, '../lib');
var files = fs.readdirSync(libPath);
var outstream = fs.createWriteStream(path.join(__dirname, '../test.md'), { flags :'w', encoding : 'utf8' } );

outstream.on('open', function () {
	files.forEach(function (file) {
		if (!/shopping-cart\.js/.test(file)) return;
				  
		if (/\.js$/.test(file)) {
			docifyFile(path.join(libPath, file));
		}
	});
	
	outstream.end();
});

function docifyFile(file) {
	var data = fs.readFileSync(file, 'utf8');
	
	try {
		obj = dox.parseComments(data, { raw:true});
		
		obj.forEach(function (block) {
			if (block.ignore) {
				return;
			}
			
			if (block.ctx.type == 'property') {
				return;
			}
			
			if (!block.ctx.hasOwnProperty('constructor')) {
				write('#' + block.ctx.name);
			}
			else {
				write('###' + block.ctx['constructor'] + '.' + block.ctx.name);
			}
			
			var params = getParams(block.tags);
			var ret = getReturn(block.tags);
			var api = getApi(block.tags);
			
			if (params.length) {
				write('(');
				
				params.forEach(function (param, ix) {
					if (ix) {
						write(', ');
					}
					
					write(param.name);
				});
				
				write(')');
			}
			
			writeln('');
			writeln('');
			
			writeln(block.description.full);
			
			
			
			
		});
	}
	catch (e) {}
}

function writeln(str) {
	outstream.write(str + '\n');
}

function write(str) {
	outstream.write(str);
}

function getParams(tags) {
	return map(tags, function(_, tag) {
		if (tag.type == 'param') {
			return tag;
		}
	}, true);
}

function getReturn(tags) {
	return map(tags, function(_, tag) {
		if (tag.type == 'return') {
			return tag;
		}
	}, true);
}
function getApi(tags) {
	return map(tags, function(_, tag) {
		if (tag.type == 'api') {
			return tag;
		}
	}, true);
}