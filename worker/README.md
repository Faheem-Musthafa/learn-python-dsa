# Stepwise sync Worker

A small Cloudflare Worker that lets a learner, if they choose, save their progress off their device. Every hour it copies what changed into a private GitHub repo as one commit.

Nothing here is deployed yet. The steps below are for the owner, with the owner's own accounts.

- `docs/SYNC.md` explains what is sent, the privacy position, the limits and costs, and the contract for the browser code.
- `src/schema.js` is the one list of what may be sent. If you change it, read the warning at the top first.

## One-time setup

You need Node.js. Run every command from the `worker` folder. Nobody else needs to touch any of this, and you should never paste your token to anyone, including an AI assistant.

### 1. Cloudflare

1. Make a free account at <https://dash.cloudflare.com/sign-up>.
2. Install and log in:
   ```
   npm install
   npx wrangler login
   ```
3. Make the storage:
   ```
   npx wrangler kv namespace create PROGRESS
   ```
4. It prints an id. Open `wrangler.toml` and replace `REPLACE_WITH_KV_NAMESPACE_ID` with that id. The id is not a secret.

### 2. GitHub repo

1. Make a new repo at <https://github.com/new>, owned by `Faheem-Musthafa`, named `learn-python-dsa-progress`.
2. Choose **Private**. This matters.
3. Tick **Add a README file**. The batch cannot write to a repo with no commits at all, and will keep failing until there is one.

If you use another name, change `GITHUB_REPO` in `wrangler.toml`.

### 3. GitHub token

1. Go to <https://github.com/settings/personal-access-tokens/new> (Settings, Developer settings, Personal access tokens, Fine-grained tokens).
2. Set **Expiration** to a date you will remember. The longest fixed time GitHub offers is 366 days. When it runs out, the mirror stops until you rotate it (see below).
3. Under **Repository access**, choose **Only select repositories** and pick only `learn-python-dsa-progress`.
4. Under **Permissions**, set **Contents** to **Read and write**. GitHub adds Metadata (read) by itself. Add nothing else.
5. Generate it, and copy it once.
6. Store it in the Worker. This command asks you to type or paste it, and it is never written to any file:
   ```
   npx wrangler secret put GITHUB_TOKEN
   ```
   Never put the token in `wrangler.toml`, in the site, in a chat, or in any file you commit.

### 4. Deploy

```
npx wrangler deploy
```

It prints the address, like `https://stepwise-sync.<your-name>.workers.dev`.

### 5. Check it, once

```
npm run smoke -- https://stepwise-sync.<your-name>.workers.dev
```

This uses two made-up learners and deletes them again. **Look for `GZIP BODY ACCEPTED`.** It is the one thing that could only be tested on a machine here, not on Cloudflare itself. If that line fails, see "If gzip fails" in `docs/SYNC.md`.

The two test learners are deleted before any file is written, so they make no commit. To see a real file appear, opt in on the site once the browser side exists, and wait for the next full hour. The commit will say something like `Mirror progress: 1 updated, 0 removed`. A failed run shows as an error for the cron in your Worker's page on the Cloudflare dashboard. The dashboard's menus change, so look under its cron or metrics sections.

### 6. Connect the site

The address from step 4 is not a secret. It goes in the browser code, in one constant that the browser side will add (planned as `SYNC_URL` in `assets/js/sync.js`). While that is empty, the site makes no sync requests at all. The browser side is not built yet.

Then, before you turn it on for anyone, read the privacy section of `docs/SYNC.md` and tell learners and parents.

## Running it on your own machine

```
npm test                  # All tests, in the real Workers runtime. Needs no account and no token.
npx wrangler dev          # Runs the Worker locally, with a local copy of KV.
npm run smoke             # Checks that local Worker over real HTTP.
npm run check             # Bundles it without uploading anything.
```

`npm test` first runs `test/make-fixtures.mjs`, which plays a made-up learner through the real `assets/js/store.js` and the real course. If the app gains a new field, a test fails until the field is sorted into "sent" or "never sent" in `src/schema.js`. That is on purpose.

To try the hourly job on your machine, run `npx wrangler dev --test-scheduled` and open `http://localhost:8787/__scheduled`. If you want it to really write to GitHub, put the token in a file called `.dev.vars` (`GITHUB_TOKEN=...`), which is ignored by git. A local run needs a test repo, not the real one.

## Rotating the token

Do this before it expires, or at once if it may have been seen by anyone.

1. Make a new token as in step 3.
2. Run `npx wrangler secret put GITHUB_TOKEN` and paste the new one. It replaces the old one straight away.
3. Delete the old token on GitHub's token page.

If a token expires first, nothing is lost. Runs fail, changes wait in KV, and the first run with a good token catches up.

## When a learner asks for deletion

The learner can delete from the site. If they have lost their key, or ask you directly, they need to give you their id. Then:

```
npx wrangler kv key put "gone:<id>" "1" --binding PROGRESS --remote
npx wrangler kv key put "dirty:<id>:del" "1" --binding PROGRESS --remote
```

The next hourly run erases their record from KV and removes their file from the repo. Those removals do not touch git history. See "Deletion and git history" in `docs/SYNC.md`.

## Turning it off

**To stop new saves but keep data:** set `ALLOWED_ORIGINS = ""` in `wrangler.toml` and deploy, and empty `SYNC_URL` on the site.

**To end it completely:**

1. Empty `SYNC_URL` on the site and tell learners first. Their progress stays safe on their own devices.
2. `npx wrangler delete` removes the Worker and its cron.
3. `npx wrangler kv namespace delete --binding PROGRESS` erases all stored progress.
4. Delete the `learn-python-dsa-progress` repo on GitHub. This is the only step that also removes its history.
5. Delete the token on GitHub.

## Files

| File | What it is |
| --- | --- |
| `src/schema.js` | The whitelist, the projection from app state, the merge, and the request packer. No imports, so the browser can share it. |
| `src/api.js` | The HTTP endpoints. |
| `src/mirror.js` | The hourly batch. `runMirror()` takes KV and fetch as arguments, for tests. |
| `src/index.js` | Connects those to Cloudflare. |
| `test/` | The tests, a fake GitHub, the fixture builder and the smoke test. |
