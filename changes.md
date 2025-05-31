# Version 4

## 4.0.0
### Changes
- The project was migrated to TypeScript.
- Properties and methods now start with a lowercase letter (Load -> load ...).

**Template**
- The `load` method now works with async/await instead of directly returning a promise.
- When loading objects/arrays $(name) {$key:$value}, you can now use $(name) {%key%: %value%} or $(name, customKeyName, customValueName) {%customKeyName%:%customValueName%}.

**Utilities**
- Added the functions `loadEnv`, `flattenObject`, and `sleep`.
- Modified the `flattenObject` function to retain null and undefined values and provide better typing.

**Debug**
- Can now only be used from the `getInstance` method (subject to possible changes).

**Config**
- Converted to a singleton.

**Response**
- The `send` method is now limited to receiving `string|buffer`.
- The `sendFile`, `sendFolder`, and `sendTemplate` methods now work with async/await.
- The `POST.content` object will no longer be a `Map` when appropriate, but a `Request.POST.VarList` object.
- The `POST.files` object will always have the type `Request.POST.FileList`.

**Request**
- The `GET` attribute is now `searchParams`.
- Request body processing has been delegated to `BodyParser.ts`.
- The type of search param is no longer a `Map`, but an object `{ [key: string]: string | undefined }`.

**WebSocket**
- The logic behind WebSocket reception was separated into `Chunk.ts`.
- `Chunk.ts` was optimized.

**Beta**
- `JsonWT` was converted to `JwtManager`.

(Ongoing...)

# Version 3
**Developed but not yet added and awaiting testing**
- Mail: accessible from (saml.servercore/Beta/Mail.js)
- JwtManager: accessible from (saml.servercore/Beta/JwtManager.js)

## 3.7
> [!IMPORTANT]
> **ServerCore** has been migrated to TypeScript.
> Errors that did not exist previously may arise.
> If you encounter any unfixable errors, please let us know.
> We will try to help you resolve the issue.

## 3.6

**Added**
- Server: Authentication verification can now be added when creating routing rules.
- Utilities: Added the `Relative` function to `Patch` which converts a relative path to an absolute path (relative from `ModuleDir`).
- Server: Added support for receiving [Form-urlencoded, Form-data, Text, Json].
- Config: The module can now be configured for debugging.

**Modified**
- Server: The routing rule system has been modified.
  - When creating a rule, you can use `$` to create a URL parameter.
    - Example: `Server.AddAction("/App/User/$UserID/Post/$PostID", (rq, rs) => {})` // Will save `UserID` and `PostID` in `rq.Params.UserID` and `rq.Params.PostID`.
  - When creating a rule, you can use `*` to respond to all sub-paths.
    - Example: `Server.AddAction("/App/Logo/*", (rq, rs) => {})` // Will respond to `/App/Logo` and all sub-paths.

### 3.6.1
  **Fixed**
  - The package.json did not include the new Config folder, so it was not published to npm.

### 3.6.2
  **Fixed**
  - The module did not work correctly due to incorrect import of the `Utilities.js` file in `Template.js`.

### 3.6.3
  **Fixed**
  - `UrlRules` did not work correctly when capturing `$` parameters or using `*` between `//` (e.g., `/something/*/something-else`).

### 3.6.4
  **Fixed**
  - When the request did not have a Mime-Type header, the `Request.POST` promise was never triggered.

### 3.6.5
  **Fixed**
  - Server.addWebSocket received an `ActionExec` type for Auth instead of `AuthExec`.

## 3.5

**Version 3.4.2 will be considered 3.5 as it introduced new features.**

### 3.5.3
  **Fixed**
  - Folders and their contents did not load correctly.
  - The Folder rule exposing the global saml content (`/Saml:Global`) is now working.

### 3.5.2
  **Fixed**
  - Cookie: The 'Del' function did not correctly delete cookies.

### 3.5.1
  **Fixed**
  - The previous use of `SS_UUID` is now `SessionID`. Not making this change earlier caused the `SessionID` not to appear in HTTP and WebSocket request logs.

## 3.4

### 3.4.3

### 3.4.2
**Fixed**
  - Mail: Type error for the `SendMail` function.
  - Mail: Debug import error.
  - JsonWT: Mismatch error between types and `GetContent` returns (Head and body were objects, not Maps).
**Added**
  - Mail: Added as Beta export.
  - JsonWT: Added as Beta export.
  - Utilities: Created to add useful variables or code, such as the main module path even if it changes.
**Removed**
  - Tools: The CSV-To-JSON command.
**Changes**
  - Server: The order of parameters for `AddFile`, `AddAction`, and `AddWebSocket`.
  - Session: The default `path` attribute of the `SS_UUID` cookie was changed to `/` to align with the change made in the cookie submodule.
  - Session: The `SS_UUID` cookie was renamed to `Session`.
  - Debug: The default path was changed to `.Debug/Default`.
  - Mail: `console.log` statements were removed and reported to Debug.
**Summary**
To import the added Beta features, you can use:


js import { Beta } from 'saml.servercore'; const Mail = Beta.Mail; const JsonWT = Beta.JsonWT;

### 3.4.1
**Developed but not yet added**:
  - Mail: Allows sending emails through an smtp/s server.

### 3.4.0
  **Added**
  - New options for creating cookies with `Cookie.Set`: `Domain`, `SameSite`, and `MaxAge`.
  **Changes**
  - The default state of the `Path` option in `Cookie.Set`: from (/) to (the path where the set-cookie was sent).

## 3.3 << changes.md

### 3.3.4
  **Fixed**
  - JsonWT type definition: from (ObjectToMar) to (ObjectToMap).
  - Cookie type definition: from (SetOptions.Patch) to (SetOptions.Path).

### 3.3.3
  - Fixed errors in the Cookie object.
    - When a new cookie was created in a subpath, it was set with Path in that subpath; now '/' will be used unless otherwise indicated.
  - Fixed type errors in Server.d.ts regarding the implementation of:
    - Request
    - Response
    - Cookie
    - Session
    - WebSocket

### 3.3.2
  - Fixed an error in JsonWT. This caused an exception that terminated the execution of Saml.ServerCore instead of returning false to indicate that the json was not valid.

### 3.3.1
  - Fixed the type of Request.POST.
    <br>This variable is of type Promise<Request.POST> but intellisense detected it as Request.POST due to a failure in the d.ts definitions.

### 3.3.0
**Added**
- From now on, changes made will be documented.
- Added Server.AddAction().
- Added Server.AddFile().
- Added Server.AddFolder().
- Added Server.AddWebSocket().

**Summary**
These were added as an alternative to Server.AddRules to simplify how new routing rules are added, as using these functions reduces the number of parameters to pass in an object because each specializes in adding a specific type of routing rule.

**Developed but not yet added**:

- JWT work capacity
  Create, verify, and decode Json Web Tokens with the following algorithms:
  ||256|384|512|
  |--|---|---|---|
  |**HS**|✅|✅|✅|
  |**RS**|✅|✅|✅|
  |**PS**|✅|✅|✅|
  |**ES**|✅|✅|✅|