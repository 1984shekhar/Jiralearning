import { uiModificationsApi } from '@forge/jira-bridge';

const { onInit, onChange } = uiModificationsApi;

/**
 * BUG REPLICATION: UIM rejects ADF payloads containing certain valid ADF node
 * types when set via setValue() on issue fields.
 *
 * EXACT PARTNER SCENARIO:
 * ========================
 * 1. A Jira issue template (containing problematic ADF nodes) is applied to
 *    the Global Issue Create (GIC) dialog — Jira itself pre-populates the
 *    description field with this content.
 * 2. The user opens a dynamic variables modal, fills in values, and confirms.
 * 3. The app reads the current field value via getValue() — this value already
 *    contains the problematic ADF nodes that Jira stored.
 * 4. The app appends the resolved dynamic variable text to the existing ADF.
 * 5. The app calls setValue() with the combined ADF.
 * 6. UIM throws INVALID_INPUT — even though Jira itself generated and stored
 *    the content without issues.
 *
 * PROBLEMATIC NODE TYPES (UIM rejects, Jira accepts):
 *   - expand           (collapsible/expandable sections)
 *   - decisionList     (decision list container)
 *   - decisionItem     (individual decision element)
 *   - taskList         (checkbox list container)
 *   - taskItem         (individual checkbox element)
 *   - codeBlock        (non-inline code blocks)
 *
 *
 */

// ---------------------------------------------------------------------------
// Guard against onChange infinite loop:
// When setValue() is called in onChange, it triggers another onChange event.
// This flag prevents re-entrant calls.
// ---------------------------------------------------------------------------
let isSettingValue = false;

/**
 * Builds a fallback ADF document simulating what Jira would pre-populate
 * from a template containing all the problematic node types.
 * Used as a fallback when getValue() returns null/empty on onInit.
 */
function buildTemplateAdfWithProblematicNodes() {
  return {
    version: 1,
    type: 'doc',
    content: [
      // Normal paragraph — always valid
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Issue template loaded from Jira.' }
        ]
      },
      // codeBlock — valid in Jira, but UIM rejects it
      {
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [
          { type: 'text', text: 'const x = 42;' }
        ]
      },
      // expand — valid in Jira, but UIM rejects it
      {
        type: 'expand',
        attrs: { title: 'Additional details' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Expanded section content.' }
            ]
          }
        ]
      },
      // decisionList/decisionItem — valid in Jira, but UIM rejects it
      {
        type: 'decisionList',
        attrs: { localId: 'dl-1' },
        content: [
          {
            type: 'decisionItem',
            attrs: { localId: 'di-1', state: 'DECIDED' },
            content: [
              { type: 'text', text: 'We decided to use Forge.' }
            ]
          }
        ]
      },
      // taskList/taskItem — valid in Jira, but UIM rejects it
      {
        type: 'taskList',
        attrs: { localId: 'tl-1' },
        content: [
          {
            type: 'taskItem',
            attrs: { localId: 'ti-1', state: 'TODO' },
            content: [
              { type: 'text', text: 'Review the requirements.' }
            ]
          },
          {
            type: 'taskItem',
            attrs: { localId: 'ti-2', state: 'TODO' },
            content: [
              { type: 'text', text: 'Implement the feature.' }
            ]
          }
        ]
      }
    ]
  };
}

/**
 * Simulates a user confirming dynamic variable values in a modal.
 * Returns a resolved key/value map of dynamic variables.
 */
function resolveDynamicVariables() {
  return {
    '{{reporter}}': 'John Doe',
    '{{project}}': 'My Project',
    '{{date}}': new Date().toISOString().split('T')[0]
  };
}

/**
 * Appends resolved dynamic variable values as a plain text paragraph
 * to the end of an existing ADF document.
 * This is the operation that triggers INVALID_INPUT when the existing ADF
 * contains problematic node types.
 *
 * @param {Object} existingAdf - The ADF document read from the field via getValue().
 * @param {Object} dynamicVars - Resolved key/value map of dynamic variable values.
 * @returns {Object} - New ADF document with dynamic variable content appended.
 */
function appendDynamicVariables(existingAdf, dynamicVars) {
  const dynamicVarText = Object.entries(dynamicVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');

  return {
    ...existingAdf,
    content: [
      ...(existingAdf.content || []),
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `[Dynamic Variables] ${dynamicVarText}`,
            marks: [{ type: 'em' }]
          }
        ]
      }
    ]
  };
}

/**
 * Renders a visible status panel in the Custom UI iframe to show the
 * result of the setValue() call — accepted or rejected.
 *
 * @param {string} status - 'pending' | 'accepted' | 'rejected'
 * @param {string} message - Detail message to display.
 * @param {Object[]} nodeResults - Array of {label, accepted} per node type.
 */
function renderStatusPanel(status, message, nodeResults = []) {
  const root = document.getElementById('root');
  if (!root) return;

  const colors = {
    pending:  { bg: '#f4f5f7', border: '#dfe1e6', text: '#42526e' },
    accepted: { bg: '#e3fcef', border: '#00875a', text: '#006644' },
    rejected: { bg: '#ffebe6', border: '#de350b', text: '#bf2600' }
  };
  const c = colors[status] || colors.pending;
  const icon = status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '⏳';

  let nodeHtml = '';
  if (nodeResults.length > 0) {
    nodeHtml = `
      <hr style="margin:12px 0;border:none;border-top:1px solid ${c.border}"/>
      <strong>Individual node type results:</strong>
      <ul style="margin:8px 0 0 0;padding-left:20px;">
        ${nodeResults.map(r =>
          `<li style="margin:4px 0;">${r.accepted ? '✅' : '❌'} <code>${r.label}</code> — ${r.accepted ? 'ACCEPTED' : 'REJECTED'}</li>`
        ).join('')}
      </ul>`;
  }

  root.innerHTML = `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      padding: 14px 16px;
      margin: 8px;
      border: 2px solid ${c.border};
      border-radius: 6px;
      background: ${c.bg};
      color: ${c.text};
      line-height: 1.5;
    ">
      <div style="font-size:15px;font-weight:700;margin-bottom:6px;">
        ${icon} UIM ADF Bug Repro — ${status.toUpperCase()}
      </div>
      <div>${message}</div>
      ${nodeHtml}
      <div style="margin-top:10px;font-size:11px;color:#6b778c;">
        Open browser console for full error details and ADF payloads.
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// onInit handler — fires when the Global Issue Create (GIC) dialog opens
//
// PARTNER SCENARIO STEPS:
//   Step 1: Template is applied — Jira pre-populates description with ADF
//           containing problematic nodes (expand, codeBlock, taskList, etc.)
//   Step 2: User fills dynamic variables in a modal and confirms.
//   Step 3: App reads current field value via getValue().
//           Falls back to simulated template ADF if field is empty.
//   Step 4: App appends resolved dynamic variable text to the ADF.
//   Step 5: App calls setValue() — UIM throws INVALID_INPUT here.
// ---------------------------------------------------------------------------
onInit(
  async ({ api }) => {
    console.log('[UIM BUG REPRO] onInit fired — replicating partner dynamic variable + template scenario...');
    renderStatusPanel('pending', 'onInit running — attempting setValue() with template ADF + dynamic variables...');

    const descriptionField = api.getFieldById('description');

    // STEP 3: Read the current field value (as the real app would after template is applied).
    // On GIC open, Jira may have already pre-populated the field from a template.
    // If empty, fall back to the simulated template ADF with problematic nodes.
    let existingAdf = null;
    try {
      existingAdf = descriptionField.getValue();
      console.log('[UIM BUG REPRO] Step 3 — getValue() returned:', JSON.stringify(existingAdf));
    } catch (e) {
      console.warn('[UIM BUG REPRO] Step 3 — getValue() threw:', e);
    }

    const isFieldEmpty = !existingAdf ||
      !existingAdf.content ||
      existingAdf.content.length === 0 ||
      (existingAdf.content.length === 1 &&
       existingAdf.content[0].type === 'paragraph' &&
       (!existingAdf.content[0].content || existingAdf.content[0].content.length === 0));

    if (isFieldEmpty) {
      console.log('[UIM BUG REPRO] Step 3 — Field is empty. Using simulated Jira template ADF with problematic nodes (fallback).');
      existingAdf = buildTemplateAdfWithProblematicNodes();
    } else {
      console.log('[UIM BUG REPRO] Step 3 — Field has content from Jira (template applied). Using real getValue() result.');
    }

    // STEP 4: Simulate user confirming dynamic variable values in modal.
    const dynamicVars = resolveDynamicVariables();
    console.log('[UIM BUG REPRO] Step 4 — Resolved dynamic variables (simulated modal confirm):', dynamicVars);

    // Append dynamic variable text to the existing ADF (including problematic nodes).
    const combinedAdf = appendDynamicVariables(existingAdf, dynamicVars);
    console.log('[UIM BUG REPRO] Step 4 — Combined ADF (template + dynamic vars):', JSON.stringify(combinedAdf));

    // STEP 5: Call setValue() — this is where UIM throws INVALID_INPUT.
    console.log('[UIM BUG REPRO] Step 5 — Calling setValue() with combined ADF...');
    try {
      isSettingValue = true;
      await descriptionField.setValue(combinedAdf);
      isSettingValue = false;
      console.log('[UIM BUG REPRO] ✅ setValue() ACCEPTED — bug may be fixed or not triggered in this environment.');
      renderStatusPanel('accepted', 'setValue() was ACCEPTED. The bug was not triggered — UIM accepted the ADF with problematic nodes.');
    } catch (err) {
      isSettingValue = false;
      console.error('[UIM BUG REPRO] ❌ setValue() REJECTED — BUG REPRODUCED!');
      console.error('[UIM BUG REPRO] Error message:', err && err.message);
      console.error('[UIM BUG REPRO] Error code:', err && err.code);
      console.error('[UIM BUG REPRO] Full error:', JSON.stringify(err));
      console.error('[UIM BUG REPRO] Full error (raw):', err);

      // Test each problematic node individually to identify which one(s) cause the failure.
      console.log('[UIM BUG REPRO] Testing each problematic node type individually...');
      const nodeResults = await testIndividualNodeTypes(descriptionField);

      const errMsg = (err && (err.message || err.code)) ? `${err.code || ''}: ${err.message || ''}` : JSON.stringify(err);
      renderStatusPanel(
        'rejected',
        `setValue() was REJECTED with INVALID_INPUT. UIM refused a valid ADF payload that Jira itself generated.<br/><br/><strong>Error:</strong> <code>${errMsg}</code>`,
        nodeResults
      );
    }
  },
  () => ['description']
);

// ---------------------------------------------------------------------------
// onChange handler — fires when the description field value changes
//
// PARTNER SCENARIO: After the user edits the description (which Jira has
// pre-populated from a template with problematic nodes), the app re-appends
// dynamic variable values. This triggers the same INVALID_INPUT error.
//
// INFINITE LOOP GUARD: setValue() in onChange triggers another onChange.
// The isSettingValue flag prevents re-entrant processing.
// ---------------------------------------------------------------------------
onChange(
  async ({ api, change }) => {
    const fieldId = change.current.getId();

    // Only handle description field changes.
    if (fieldId !== 'description') return;

    // Guard: skip if we triggered this change ourselves via setValue().
    if (isSettingValue) {
      console.log('[UIM BUG REPRO] onChange — skipping (triggered by our own setValue() call).');
      return;
    }

    const fieldValue = change.current.getValue();
    if (!fieldValue) return;

    console.log('[UIM BUG REPRO] onChange fired — description changed by user.');
    console.log('[UIM BUG REPRO] onChange — Current description value:', JSON.stringify(fieldValue));

    // Same scenario as onInit: append dynamic variable content to the
    // current field value (which may contain problematic nodes from the template).
    const dynamicVars = resolveDynamicVariables();
    const combinedAdf = appendDynamicVariables(fieldValue, dynamicVars);

    console.log('[UIM BUG REPRO] onChange — Calling setValue() with combined ADF (existing + dynamic vars)...');
    try {
      isSettingValue = true;
      await api.getFieldById('description').setValue(combinedAdf);
      isSettingValue = false;
      console.log('[UIM BUG REPRO] onChange — ✅ setValue() ACCEPTED');
    } catch (err) {
      isSettingValue = false;
      console.error('[UIM BUG REPRO] onChange — ❌ setValue() REJECTED — BUG REPRODUCED!');
      console.error('[UIM BUG REPRO] Error message:', err && err.message);
      console.error('[UIM BUG REPRO] Error code:', err && err.code);
      console.error('[UIM BUG REPRO] Full error:', JSON.stringify(err));
    }
  },
  () => ['description']
);

// ---------------------------------------------------------------------------
// Helper: test each problematic ADF node type individually to pinpoint
// which node type(s) cause UIM to throw INVALID_INPUT.
// Returns an array of { label, accepted } results for UI display.
// ---------------------------------------------------------------------------
async function testIndividualNodeTypes(descriptionField) {
  const problematicNodes = [
    {
      label: 'codeBlock',
      node: {
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [{ type: 'text', text: 'const x = 42;' }]
      }
    },
    {
      label: 'expand',
      node: {
        type: 'expand',
        attrs: { title: 'Click to expand' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Expanded content.' }]
          }
        ]
      }
    },
    {
      label: 'decisionList / decisionItem',
      node: {
        type: 'decisionList',
        attrs: { localId: 'dl-test' },
        content: [
          {
            type: 'decisionItem',
            attrs: { localId: 'di-test', state: 'DECIDED' },
            content: [{ type: 'text', text: 'A decision.' }]
          }
        ]
      }
    },
    {
      label: 'taskList / taskItem',
      node: {
        type: 'taskList',
        attrs: { localId: 'tl-test' },
        content: [
          {
            type: 'taskItem',
            attrs: { localId: 'ti-test', state: 'TODO' },
            content: [{ type: 'text', text: 'A task.' }]
          }
        ]
      }
    }
  ];

  const results = [];

  for (const { label, node } of problematicNodes) {
    // Each test: a simple doc with one normal paragraph + the problematic node
    // + a dynamic variable paragraph (exactly as the real app produces).
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Template content.' }] },
        node,
        { type: 'paragraph', content: [{ type: 'text', text: '[Dynamic Variables] reporter: John Doe | project: My Project' }] }
      ]
    };

    try {
      isSettingValue = true;
      await descriptionField.setValue(adf);
      isSettingValue = false;
      console.log(`[UIM BUG REPRO]   ✅ ACCEPTED: "${label}"`);
      results.push({ label, accepted: true });
    } catch (err) {
      isSettingValue = false;
      console.error(`[UIM BUG REPRO]   ❌ REJECTED: "${label}" — ${err && (err.message || JSON.stringify(err))}`);
      results.push({ label, accepted: false });
    }
  }

  return results;
}
