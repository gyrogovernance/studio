# AI Inspector Studio desktop

The desktop package runs the Studio frontend and Python backend locally in an
Electron window. Windows NSIS and macOS DMG/ZIP configurations are adapted from
Open WebUI Desktop. Application data is kept separately from the installer.

## Build

Build requirements: Node.js 22, Python 3.12, and `uv`. From the repository root:

```sh
npm ci
npm run desktop:win
```

On macOS:

```sh
npm ci
npm run desktop:mac
```

The build script installs desktop build dependencies, builds the Studio frontend,
packages the backend with the locked dependency list, generates icons from the
Studio SVG, and downloads a checksum-verified uv bootstrapper for the target.
Installers appear in `desktop/dist/`. Build on the target operating system.
The macOS product targets Apple Silicon (`arm64`), including when built on an
Intel Mac. The current backend ML dependency lock does not support an Intel
macOS runtime. The macOS product requires macOS 14 or later. Windows builds target x64;
use `-- --x64` on a Windows ARM machine to build the x64 installer.

The Mac used for building needs a macOS version supported by Node.js 22. If an
older Mac cannot run these tools, the included macOS GitHub Actions runner can
produce the same installer.

`npm run desktop:build` builds for the current operating system.
`npm run desktop:dev` runs the desktop workspace without an installer.
`npm run desktop:build -- --dir` produces an unpacked app for local verification.
`--skip-frontend` reuses an existing frontend build for desktop-only iteration.

## First launch and storage

The installer includes Studio's frontend, backend wheel, uv executable, source
bundle, and license notices. First launch automatically downloads managed Python
3.12 and installs dependencies from the hashed lock export. Internet access and
several gigabytes of free disk space are needed for this initial setup. The local
embedding model may also download when Knowledge indexing first runs.

After setup, the runtime is reused. Chats, documents, provider settings, runtime,
and logs live in:

- Windows: `%APPDATA%/AI Inspector Studio/`
- macOS: `~/Library/Application Support/AI Inspector Studio/`

The backend binds to `127.0.0.1` on an available port, opens without account
registration, and stops when the desktop app quits. Existing browser-server data
is not imported automatically. Model credentials and model weights are not
included; configure a provider or Ollama through the existing Studio interface.

`dev/`, repository `.env` files, existing databases, and local development runtimes
are excluded from installers and the included source bundle.

## Distribution

The `Desktop installers` workflow builds Windows x64 and macOS Apple Silicon
packages. On a version tag (`v*`), or when started manually with
**Publish release** enabled, it creates or updates a GitHub Release and attaches
the installers. Pull requests and ordinary pushes keep the packages as workflow
artifacts for verification.

For public distribution, configure the platform signing credentials supported by
electron-builder. macOS notarization uses `APPLE_ID`,
`APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` with a Developer ID
certificate provided through `CSC_LINK` and `CSC_KEY_PASSWORD`. Windows signing
can use `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`. Credentials are build
environment settings and are not stored in source or application resources.

Automatic updates are disabled until a Studio release feed is configured.
Installing a newer Studio version preserves application data and updates the
bundled backend on the next launch. Updates do not replace Studio with upstream
Open WebUI. See `UPSTREAM.md` and `LICENSE` for desktop attribution and licensing.
