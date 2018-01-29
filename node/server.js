const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer();
const options = {
    url: "localhost",
    port: 8080
};

const requestMethodAlias = {
  "POST": "create",
  "GET": "get",
  "PUT": "update",
  "DELETE": "delete"
};

server.on("request_ERR", (request, response) => {
    console.log("request headers:", request.headers);
    let path = url.parse(request.url).pathname;
    if (path == "/") {
        fs.readFile("./index.html", (err, file) => {
            if (err) {
                console.log(err);
            }
            response.writeHead(200, { "Content-Type": "text/html "});
            response.end(file, "UTF-8");
        });
    }

});

server.on("request", (request, response) => {

    // ===NOTE================================================================
    // set Accces-Control-Allow-Origin header if testing using different
    // servers (i.e. running node server on localhost:8080
    // and making XMLHttpRequests from localhost:1337)
    // response.setHeader("Access-Control-Allow-Origin", "*");
    // =======================================================================

    // ===NOTE===========================================================================================================
    // if the request is from a different origin, THE request.method is always OPTIONS if request headers are sent
    // (but if request headers are not sent then PUT/POST/GET/DELETE are available to request.method)
    // ==================================================================================================================

    console.log("request.method: =>", request.method);
    console.log("request.url =>", request.url);

    let path = url.parse(request.url).pathname;
    // =================================================
    // need to check if the path contains an id.
    // if so, we are querying ONE.
    // if not, we are querying ALL.
    // path format for project is:
    // /api/route/<optional_id><optional_querystring>
    // NOTE: route might be nested
    // =================================================
    let id = "";
    let checkPathForId = path.match(/\//g).length >= 3? true : false;
    if (path.match(/\//g).length == 3) {
      if (path.substr(path.lastIndexOf("/") + 1).match(/^\?/)) {
        checkForPathId = false;
      }
    }
    if (checkPathForId) {
        try {
          fs.statSync(`./${path}`);
      } catch (err) {
        if (path.match(/\//g).length > 3 && path.substr(path.lastIndexOf("/") + 1) == "") {
          path = path.substr(0, path.length - 1);
        }
        id = path.substr(path.lastIndexOf("/") + 1);
      }
    }

    if (id && !isNaN(id)) {
      // drop the id from the path...
      let parts = path.split("/");
      parts.pop();
      path = parts.join("/");
    }

    let apiFile = `${requestMethodAlias[request.method]}.js`
    if (!id || id == "" || isNaN(id)) {
      apiFile = `${requestMethodAlias[request.method]}.all.js`;
    }

    let urlHasParams = request.url.match(/\?.+\=/);
    let queryStringParams = {};

    if (urlHasParams) {
        const search = request.url.substr(request.url.indexOf("?") + 1).split("&");
        if (search.length > 0) {
                for (let pair of search) {
                let key = pair.split("=")[0];
                let val = pair.split("=")[1];
                queryStringParams[key] = val;
            }
        }
    }

    if (path != "/" && path.match(/^\/?api\//)) {
        try {
            if (path.lastIndexOf("/") != path.length - 1) {
                path += "/";
            }
            require.resolve(`.${path}${apiFile}`);
        } catch(e) {
            console.log(e);
            return;
        }
        const endpoint = require(`.${path}${apiFile}`);
        if (endpoint.constructor.name == "Function" && endpoint().run) {

            console.log("Calling endpoint:", `.${path}${apiFile}`);

            return new Promise( (resolve, reject) => {
                if (request.method == "POST" || request.method == "PUT") {
                    let body = [];
                    request.on("data", (chunk) => {
                        body.push(chunk);
                    }).on("end", () => {
                        body = Buffer.concat(body).toString();
                        endpoint().run({ data: body, params: queryStringParams, id: id }).then( (endpointResponse) => {
                            resolve(endpointResponse);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                    });
                }
                if (request.method == "GET" || request.method == "DELETE") {
                     endpoint().run({ data: null, params: queryStringParams, id: id }).then( (endpointResponse) => {
                        resolve(endpointResponse);
                     }, err => {
                        console.log(err);
                        reject(err);
                     });
                }
            }, err => {
                reject(err);
            }).then( (endpointResponse) => {
                response.writeHead(200, { "Content-type": "application/json" });
                response.end(endpointResponse);
            }, err => {
                console.log(err);
            });
        }
    } else if (path != "/") {
        fs.readFile(`.${path}`, (err, file) => { // very important that the path is ./ and not / as / would navigate to the machine root like C:/
            if (err) {
                console.log(err);
            }
            let contentType = "text/html";
            if (path.match(/\.css$/)) {
                contentType = "text/css";
            }
            if (path.match(/\.js$/)) {
                contentType = "application/javascript";
            }
            response.writeHead(200, { "Content-Type": contentType });
            response.end(file, "UTF-8");
        });
    } else {
        fs.readFile("./index.html", (err, file) => {
            if (err) {
                console.log(err);
            }
            response.writeHead(200, { "Content-Type": "text/html "});
            response.end(file, "UTF-8");
        });
    }
});

// listen...
server.listen(options.port, options.url);
console.log(`Serving from http://${options.url}:${options.port}`);

// register pusher...
require("./pusher.js");
