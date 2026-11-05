/* Stepwise progress sync. See docs/SYNC.md. */
import { handleRequest } from './api.js';
import { mirrorConfig, runMirror } from './mirror.js';

export { handleRequest, runMirror };

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },

  async scheduled(controller, env) {
    const report = await runMirror({
      kv: env.PROGRESS,
      fetchFn: (url, init) => fetch(url, init),
      token: env.GITHUB_TOKEN,
      config: mirrorConfig(env),
    });
    // Counts only. A log line must never carry an id, a key or a token.
    const { status, updated, removed, carried, cleared, clearFailed, stage, httpStatus } = report;
    console.log(JSON.stringify({ mirror: status, updated, removed, carried, cleared, clearFailed, stage, httpStatus }));
    // Throwing marks this run as failed in the Cloudflare dashboard, so the owner can see it.
    if (status === 'failed') throw new Error(`Mirror failed at ${stage} (${httpStatus})`);
  },
};
