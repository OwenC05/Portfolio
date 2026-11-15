import { createAgent } from '@ui-sdk/web/agent';

export const agent = createAgent();

await Promise.all([import('@ui-sdk/web/tabs'), import('@ui-sdk/web/dialog')]);
await Promise.all(['ui-tabs', 'ui-dialog'].map((tag) => customElements.whenDefined(tag)));
document.documentElement.dataset.ready = 'true';
