# Desktop source attribution

The installer configuration and platform packaging layout are adapted from
[Open WebUI Desktop](https://github.com/open-webui/desktop), commit
`0931b46d66e06bfb7d0b6a4aa065e6db338a1000` (v0.0.20).
Copyright Open WebUI Inc. and its contributors. The desktop derivative retains
the GNU Affero General Public License, version 3, in `desktop/LICENSE`.

Studio changes replace the desktop dashboard and upstream package installer with
a direct workspace window, a bundled Studio wheel, a checksum-verified uv
bootstrapper, isolated application data, and Studio installer branding.
The desktop package does not install or update the upstream Open WebUI package
from PyPI. Backend and frontend updates are delivered together in Studio installers.

Open WebUI application code retains the repository's Open WebUI license and
notices. Bundled Studio and framework material retains its respective notices.
Application source and license notices are included in the desktop resources and
accessible from the Help menu.

uv is developed by Astral and distributed under the MIT or Apache-2.0 license:
<https://github.com/astral-sh/uv>. Electron and third-party installer/runtime
components retain their supplied licenses.
