var   http = require('http')
	, fs = require('fs')



/*
 * Manages the verkeers feed from www.anwb.nl.
 */

exports.getFeed = function( req, res, next ) {
	req.locals = req.locals || {};
	req.locals.verkeer = {}

	fs.readFile('./model/verkeer/verkeer.json','utf8', function( err, data ) {
		if( err ) {
			next( new Error('Failed to get vekeer feed.' + err) );
		} else {
			req.locals.verkeer.feed = JSON.parse( data );
			next();
		}
	});
}


/*
 * Download the feed from www.anwb.nl.
 */

exports.downloadVerkeerFeed = function( callback ) {
	var options = {
		host: 'www.anwb.nl',
		port: 80,
		path: '/feeds/verkeer/verkeersinformatie',
		headers: {
			'Pragma': 'no-cache, no-store'
		}
	};

	var req = http.get( options, function( res ) {
		if( res.statusCode != 200 ) {
			callback('Verkeer feed response code was ' + res.statusCode);
			return;
		}

		var data = '';

		res.on('data', function( chunk ) {
			data += chunk;
		});

		res.on('end', function() {
			fs.writeFile('./model/verkeer/verkeer.json', data, 'UTF-8', function( err ) {
				if( err ) {
					callback('Writing verkeer feed: ' + err.message);
				} else {
					callback(null, 'Finished downloading verkeer feed.');
				}
			})
		});

		res.on('error', function( e ) {
			callback('Downloading verkeer feed: ' + e.message);
		});
	});
}
