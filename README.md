koa-proxy
=========

koa-proxy proxy middleware. support all feature of [proxy](https://github.com/mde/ejs).

## Usage


### middleware

```js
var app = require('koa')();
var proxy = require('koa-proxy');

app.use(proxy); // proxy '/api' request to sever

```

### Example

you can use it at kao server.

```js
function *(next) {
    yield proxy.run(this, `/api/{}`);
};
```
or use it with ajax

```js
$.ajax({
    url: '/api' + url
})
```

### settings

* uri: you can use the full website such as (http|ftp|https)://www.xxx.com or use the localhost such as /xxx/xxx to proxy.


### State

Support [`ctx.state` in koa](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxstate).

## Licences

(The MIT License)

Copyright (c) 2016 movooc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
