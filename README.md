# 🚀 ServerCore

This project began as a **personal journey** to deeply understand how web servers work in **Node.js**.
Throughout its development, I’ve gained **tons of new skills and insights** that I’m excited to share.

🛠️ **Continuous Improvement:**
I constantly refactor the code whenever I spot areas that can be polished or optimized.

🌟 **Real-World Usage:**
I actively use this module in my own web projects, which means I’m always finding new ideas, enhancements, and opportunities to fix bugs based on feedback.

💡 **Vision:**
My goal is to make **ServerCore** a tool that helps developers build **APIs**, **PWAs**, **websites**, and—thanks to the [WebApp module](https://github.com/diegofmo0802/WebApp)—**SPAs** with ease and confidence.

Stay tuned for more updates and features! 🚀
That’s all for now, [diegofmo0802](https://diegofmo0802.github.io) out.

---

# Installation

You can use **npm** to install ServerCore:

* **Stable version**

  ```console
  mpm install saml.servercore
  ```
* **Development version**

  ```console
  mpm install saml.servercore@dev
  ```

> [!IMPORTANT]
> You need to set `"type": "module"` in your `package.json` to use **ServerCore**.
> This requirement will be removed in a future version, but for now please configure it like this:
>
> ```json
> {
>   "name": "my-project",
>   "main": "index.js",
>   "type": "module"
> }
> ```

---

# Documentation

## Static Pages

You can use **ServerCore** to serve static pages:

```js
// Importing ServerCore
import ServerCore from 'saml.servercore';

// Creating the server
const server = new ServerCore();

// Adding rules
server.router.addFolder('/source', 'source');
server.router.addFile('/', 'source/index.html');

// Starting the server
server.start();
```

---

## APIs and Websites

You can use **actions** to execute code and send responses to the client:

```js
import ServerCore from 'saml.servercore';

const server = new ServerCore();

// Action with a static response
server.router.addAction('GET', '/api/test', (request, response) => {
  response.sendJson({
    message: 'Hello World',
    route: `[${request.method}] -> ${request.url}`
  });
});

// Route params and query params
// Example route param: `/api/params/$id`
// Example request: `http://localhost/api/params/123`
server.router.addAction('GET', '/api/params/$id', (request, response) => {
  response.sendJson({
    message: 'Hello World',
    route: `[${request.method}] -> ${request.url}`,
    params: request.ruleParams,
    query: request.searchParams
  });
});

// Serving files
server.router.addAction('GET', '/api/file', (request, response) => {
  response.sendFile('source/index.html');
});

// Sending simple text
server.router.addAction('GET', '/api/string', (request, response) => {
  response.send('Hello World');
});

// Starting the server
server.start();
```

---

## SPAs

You can serve a single file for multiple URLs, including recursive routes:

```js
import ServerCore from 'saml.servercore';

const server = new ServerCore();

server.router.addFile('/', 'main.html');
server.router.addFile('/app/*', 'main.html');
server.router.addFolder('/public', 'public');

/*
You can also add other features like actions, files, folders, etc.
Use addWebSocket for real-time connections.
*/

server.start();
```

---

## Server Configuration

You can configure the server using the `server.config` object:

```js
import ServerCore from 'saml.servercore';
const server = new ServerCore();

server.config.port = 3000;
server.config.host = 'localhost';
server.config.https = {
  key: 'path/to/key.pem',
  cert: 'path/to/cert.pem'
};
server.config.templates.error = 'error.html';
server.config.templates.folder = 'folder.html';
```

You can also create the server with a configuration object passed to the constructor:

* **Using options:**

```js
const server = new ServerCore({
  port: 3000,
  host: 'localhost',
  ssl: null
});
```

* **Using the Config instance:**

```js
const config = new ServerCore.Config();
config.port = 3000;
config.host = 'localhost';
config.ssl = null;

const server = new ServerCore(config);
```

---

## URL Rules

URL rules are strings used to define routes handled by the router.

The main separator is `/` which indicates a new sub-route:

* **`*`**: A wildcard that captures all sub-routes.
* **`$<name>`**: A dynamic parameter you can access via `request.ruleParams`.
* **`<string>`**: A literal segment that must match exactly.

**Examples**:

* `/api/*` — Matches `/api/users`, `/api/posts/comments`, etc.
* `/user/$id` — Matches `/user/123`, capturing `123` as `id`.
* `/blog/$category/$postId` — Matches `/blog/tech/42`, capturing `tech` as `category` and `42` as `postId`.

---

## Rules

In **ServerCore**, there are four types of routers:

| Type                    | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| [Folder](#folder)       | Serves a folder and its sub-folders                    |
| [File](#file)           | Serves a single file                                   |
| [Action](#action)       | Lets you handle requests programmatically              |
| [WebSocket](#websocket) | Allows managing WebSocket connections on a given route |

### Folder

Serves a folder and its sub-folders:

> [!WARNING]
> Do not share the root of your project, as this would expose **ALL** its contents:
>
> * Private certificate keys
> * Database passwords in server-side `.js` files
> * Security tokens
> * And any other sensitive data
>
> Also:
>
> * The entire assigned path will be exposed.
>
>   * **Example:** assigning `/src` would include all sub-routes like `/src/styles`.

```js
server.router.addFolder('/my-folder', 'path/to/folder');
server.router.addFolder('/my-folder-2', '/path/to/folder/absolute');
```

### File

Serves a single file:

```js
server.router.addFile('/my-file', 'path/to/file');
server.router.addFile('/my-file-2', '/path/to/file/absolute');
```

### Action

Lets you handle requests programmatically:

```js
server.router.addAction('GET', '/my-action', (request, response) => {
  response.sendJson({
    message: 'Hello World',
    route: `[${request.method}] -> ${request.url}`
  });
});
```

### WebSocket

Allows managing WebSocket connections on a given route:

> [!NOTE]
> WebSocket URLs use a separate namespace from Files, Folders, and Actions,
> so they won’t conflict even if they share the same route patterns.

```js
const connections = new Set();

server.addWebSocket('/Test/WS-Chat', (request, socket) => {
  console.log('[WS] New connection');
  connections.forEach(user => user.Send('A user has connected.'));
  connections.add(socket);

  socket.on('finish', () => connections.delete(socket));
  socket.on('error', error => console.log('[WS-Error]:', error));

  socket.on('message', (data, info) => {
    if (info.opCode === 1) {
      console.log('[WS] Message:', data.toString());
      connections.forEach(user => {
        if (user !== socket) user.Send(data.toString());
      });
    } else if (info.opCode === 8) {
      connections.forEach(user => user.Send('A user has disconnected.'));
    }
  });
});
```

---

# Development Version

## Currently in Development

The following features are under active development:

* **\[JsonWT]**: JSON Web Token (JWT) support.
* **\[Mail]**: Email sending functionality.
* **\[Server]**: Dynamic authentication system for routing.

## Installation

To install the development version:

```console
mpm install saml.servercore@dev
```

> [!WARNING]
> This version may contain bugs.
> It includes the latest features that may not yet be fully tested.

To access development features not yet listed in `changes.md`:

```js
import { Beta } from 'saml.servercore';
const { Mail, JwtManager } = Beta;
```