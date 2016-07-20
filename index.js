'use strict';

const util = require('util');
const co = require('co');
const fs = require('co-fs');
const request = require('co-request');
const formidable = require('koa-formidable');
const cookieName = 'TGT';

// proxy middleware
const middleware = function*(next) {
    var ctx = this;
    //
    if (ctx.path.search(/^\/api\//i) === -1) { // uri not start with /api
        yield next;
    } else { // do proxy
        yield proxy(ctx);
        yield next;
    }
};

// proxy start
const proxy = function*(ctx, uri) {
    let noResponse = ctx._noResponse || false;
    // return to the url what is needed
    var url = (function() {
        // prefix
        var prefix = process.env.Server || "http://local-mall.xm.duoxue"; /// 'http://192.168.70.212:5555'; //'http://192.168.70.212:5555'; 
        var pattern = /^(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
        // check the whether the uri is exist
        var _uri = uri || ctx.url.replace(/^\/api\//i, '');
        // to check whether the uri is a complete website
        if (pattern.test(_uri)) {
            return _uri;
        } else {
            return util.format('%s/%s', prefix.replace(/\/$/i, ''), _uri.replace(/^\//i, ''));
        }
    })();
    // method
    var method = ctx.method.toUpperCase();
    // request options
    var headers = ctx.request.headers;
    delete headers['accept-encoding']; // remvoe accept-encoding
    var options = {
        url: url,
        method: method,
        headers: headers
    };

    // load headers
    yield getHeaders(ctx, options);

    // check content-type
    if (ctx.request.headers['content-type'] // file upload
        && ctx.request.headers['content-type'].search(/multipart\//i) !== -1) {
        // load file
        yield getFiles(ctx, options);

    } else {
        // load body data
        yield getParsedBody(ctx, options);
    }

    // start request
    try {
        let strOption=JSON.stringify(options);
        let copyOptions=JSON.parse(strOption);
        let response = yield request(copyOptions);
        // response
        if (!noResponse) {
            yield proxyResponse(ctx, response);
        } else {
            return tryParseJSON(response.body);
        }
    } catch (err) {
        ctx.throw(500, err);
    }

};

module.exports = exports = middleware;
// exports
exports.run = function*(ctx, uri) {
    ctx._noResponse = true;
    return yield proxy(ctx, uri);
};

// tryParseJSON
function tryParseJSON(data) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (ex) {
            return {};
        }
    } else {
        return data;
    }
}

// proxyResponse
function* proxyResponse(ctx, response, next) {
    let body = tryParseJSON(response.body);
    // 循环替换headers内容
    for (var key in response.headers) {
        ctx.response.set(key, response.headers[key]);
    }
    ctx.body = body;
    ctx.response.status = response.statusCode;
}

// getHeaders
function* getHeaders(ctx, options) {
    let ticket = ctx.cookies.get(cookieName);
    // reset host
    let pattern = /^(http|ftp|https):\/\//;
    options.headers['host'] = options.url.replace(pattern, '').replace(/\/.*/, '');
    // add ticket
    if (ticket) {
        options.headers['ticket'] = ticket;
    }
}

// getParsedBody
function* getFiles(ctx, options) {
    if (ctx.request.headers['content-type'] // file upload
        && ctx.request.headers['content-type'].search(/multipart\//i) !== -1) {
        console.log('file upload');
        // streams
        let streams = [];
        // get form
        let form = yield formidable.parse({
            encoding: 'utf-8',
            maxFieldsSize: 2 * 1024 * 1024
        }, ctx);
        // files to options
        for (let f in form.files) {
            if (form.files[f].path) {
                let stream = yield fs.createReadStream(form.files[f].path);
                streams.push(stream);
            } else {
                continue;
            }
        }
        options.headers['content-type'] = 'application/json; charset=UTF-8';
        options.files = streams;
        delete options.headers['content-length'];
    }
}

// getParsedBody
function* getParsedBody(ctx, options) {
    let _body = ctx.request.body;
    let _method = options.method;
    // load body data
    if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
        if (_body instanceof Object && !options.headers['x-requested-with']) {
            options.headers['content-type'] = 'application/json; charset=UTF-8';
            options.headers['accept'] = '*/*';
            delete options.headers['content-length'];
        }
        options.json = true;
        options.body = _body;
    }
}
