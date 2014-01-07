/*global module:true, __dirname:true */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

// cache
var mapCache = {};

/**
 * construct response texts and return it.
 * if cache exists, returns the cache.
 * @param {string} dir directory that contains fake response texts
 * @param {boolean} force set true to override cache
 */
function mapResponse(dir, force) {

	// return cache
	if (!_.isEmpty(mapCache) && !force) {
		return mapCache;
	}


	var walked = walk(dir);
	var responseMap = _.reduce(walked.files, function (accum, info) {

		// name is relative path, excluded extention part
		var name = path.join(
			path.dirname(info.rpath),
			path.basename(info.rpath, path.extname(info.rpath))
		);
		var response = convertToResponse(info.path);
		accum[name] = response;
		return accum;
	}, {});

	// cache
	mapCache = responseMap;
	return responseMap;
};

// cache
var mapForSinon = {};

/**
 * high-level helper:
 * create response map and return it.
 * if cache exists, returns the cache.
 * @param {boolean} force set true to override cache
 */
function mapResponseForSinon(force) {
	if (!_.isEmpty(mapForSinon) && !force) {
		return mapForSinon;
	}

	var dir = path.resolve(__dirname, 'resources');

	var map = mapResponse(dir);
	for (var k in map) {
		var res = map[k];
		map[k] = [res.status, res.header, res.body];
	}

	mapForSinon = map;
	return map;
}

var mapForExpress = {};

/**
 * high-level helper:
 * create response map and return it.
 * if cache exists, returns the cache.
 * @param {boolean} force set true to override cache
 */
function mapResponseForExpress(force) {
	if (!_.isEmpty(mapForExpress) && !force) {
		return mapForExpress;
	}

	var dir = path.resolve(__dirname, 'resources');

	var map = mapResponse(dir);
	mapForExpress = map;
	return map;
}


/**
 * conevert specified response text file into response object
 * ({status, header, body})
 * @param {string} filepath path to response text
 * @return {object} {status, header, body}
 */
function convertToResponse(filepath) {
	var texts = fs.readFileSync(filepath, 'utf8');

	var headerAndBody = texts.split('\n\n');

	var headerLines = headerAndBody[0].split('\n');

	// get status from first line of headers
	var statusLine = headerLines.shift();
	var statusCode = statusLine.split(' ')[1];

	// convert header-lines into headers-object
	var headers = _.reduce(headerLines, function(accum, line) {
		var keyAndVal = line.split(': ');
		var k = keyAndVal[0], v = keyAndVal[1];
		accum[k] = v;
		return accum;
	}, {});

	var body = headerAndBody[1];

	return {
		status: parseInt(statusCode),
		header: headers,
		body: body
	};
}

function stat(filename) {
	try {
		return fs.statSync(filename);
	} catch (e) {
		if (e.code === 'ENOENT') {
			return null;
		} else {
			throw e;
		}
	}
}

/**
 * return if the path is dotfile
 */
function isDotfile(pathStr) {
	return (/^\./).test(pathStr);
}


/**
 * walk directory and return info of dirs and files
 * @returns {
 *	files: [fileinfo, ...],
 *	dirs: [fileinfo, ...]
 * }
 * fileinfo: {dir, filename, path, rpath, stat}
 */
function walk(root) {

	var _walk = function(dir) {
		var dirs = [];
		var files = [];
		fs.readdirSync(dir).forEach(function(filename) {
			if (isDotfile(filename)) {
				// ignore dot files
				return;
			}

			// get info of file
			var ap  = path.resolve(dir, filename),
				rp = path.relative(root, ap),
				s  = stat(ap),
				fileinfo = {dir: dir, filename: filename, path: ap, rpath: rp, stat: s}
			;

			if (!s) {
				return;
			} else if (s.isFile()) {

				// file
				files.push(fileinfo);
			} else if (s.isDirectory()) {

				// dir
				dirs.push(fileinfo);

				// recursively _walk
				var res = _walk(ap);
				dirs = dirs.concat(res.dirs);
				files = files.concat(res.files);
			}
			return;
		});

		return {
			dirs: dirs,
			files: files
		};
	};

	return _walk(root);
}

//var map = mapResponse();
//console.log(map);


module.exports = {
	mapResponse: mapResponse,
	mapResponseForExpress: mapResponseForExpress,
	mapResponseForSinon: mapResponseForSinon
};
