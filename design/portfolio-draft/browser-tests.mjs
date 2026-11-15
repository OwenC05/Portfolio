import { agent } from './app.mjs';

// Background browser previews pause animation frames, but SDK state still settles on timers.
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

export async function runDraftChecks() {
  const passed = [];
  const check = (condition, label) => {
    if (!condition) throw new Error(label);
    passed.push(label);
  };
  await settle();
  const snapshot = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== 'more');
  for (const entry of snapshot) check(Boolean(entry.label?.trim()), `${entry.component} has an accessible name`);
  const tabs = snapshot.find((entry) => entry.component === 'tabs' && entry.label === 'Experiment views');
  check(Boolean(tabs), 'Experiment comparison is visible to the SDK agent');
  check(tabs.items?.length === 3, 'All three experiment views are discoverable');
  const changes = [];
  const unsubscribe = agent.subscribe((change) => changes.push(change));
  try {
    for (const label of ['Plain model', 'With retrieval', 'Compare']) {
      const item = tabs.items.find((candidate) => candidate.label === label);
      check(Boolean(item), `${label} is an exposed tab choice`);
      const result = await agent.act({ steps: [{ ref: tabs.ref, action: 'setValue', args: [item.label] }] });
      await settle();
      check(result.ok, `Agent can select ${label}`);
      const selected = document.querySelector('#experiment-tabs [role="tab"][aria-selected="true"]');
      check(selected?.textContent.trim() === label, `${label} becomes the selected accessible tab`);
      const panels = [...document.querySelectorAll('#experiment-tabs ui-tabs-panel')].filter((panel) => !panel.hidden);
      check(panels.length === 1 && panels[0].getAttribute('value') === item.value, `${label} shows exactly its matching panel`);
    }
    check(changes.some((change) => change.source === 'agent'), 'Tab changes retain agent provenance');
  } finally {
    unsubscribe();
  }
  for (const [id, title, buttonName] of [
    ['research-details', 'A reproducible RAG experiment', 'Explore the experiment'],
    ['copilot-details', 'Application Copilot', 'Inside Application Copilot'],
    ['typeforge-details', 'TypeForge', 'Inside TypeForge'],
  ]) {
    const root = document.getElementById(id);
    const trigger = root.querySelector('ui-dialog-trigger button');
    const entry = agent.snapshot().find((candidate) => candidate.component === 'dialog' && candidate.label === title);
    check(trigger.textContent.trim().replace(/[↗→]/g, '').trim() === buttonName, `${id} has the expected visible trigger name`);
    check(Boolean(entry), `${id} is discoverable by its project title`);
    trigger.focus();
    const opened = await agent.act({ steps: [{ ref: entry.ref, action: 'press' }] });
    await settle();
    const content = root.querySelector('ui-dialog-content');
    check(opened.ok && root.open && !content.hidden, `${id} opens through the SDK agent`);
    check(content.contains(document.activeElement) || content === document.activeElement, `${id} receives focus`);
    const close = root.querySelector('ui-dialog-close button');
    const closed = await agent.act({ steps: [{ ref: entry.ref, action: 'press', args: [close.textContent.trim()] }] });
    await settle();
    check(closed.ok && !root.open, `${id} closes through its visible close control`);
    check(document.activeElement === trigger, `${id} returns focus to the trigger`);
  }
  check(document.documentElement.scrollWidth <= innerWidth, 'Page has no horizontal overflow at the current viewport');
  check(document.getElementById('research-title').textContent.includes('reproducible RAG'), 'Research title retains its word spacing when the line break is hidden');
  check(!document.querySelector('a[href="#"], a[href="/projects"], a[href$=".pdf"]'), 'Draft contains no placeholder project or missing CV links');
  return { ok: true, count: passed.length, viewport: { width: innerWidth, height: innerHeight }, passed, snapshot };
}
