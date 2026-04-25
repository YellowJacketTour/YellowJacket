# Yellow Jacket Tour

Single-file HTML build of the Yellow Jacket Tour simulator — the World Series of Golf-Poker.

## Play locally

Double-click `index.html`. It opens in your default browser and runs entirely client-side. Save state lives in your browser's localStorage; no server, no install.

## Publish on GitHub Pages

1. Open your Yellow Jacket repo on github.com.
2. Click **Add file → Upload files**.
3. Drag `index.html` into the upload area.
4. Commit message: `Initial Yellow Jacket Tour build` → **Commit changes**.
5. Go to **Settings → Pages**.
6. Under **Build and deployment → Source**, choose **Deploy from a branch**.
7. Set **Branch: main**, folder **/ (root)** → **Save**.
8. Wait ~60 seconds. The Pages URL appears at the top: `https://<your-username>.github.io/<repo-name>/`.

That URL is what you share. Each visitor gets their own browser-local save state — career runs don't sync between machines.

## Updating

When the build changes, replace `index.html` in the repo (web upload or `git push`). Pages redeploys automatically within ~60 seconds.
