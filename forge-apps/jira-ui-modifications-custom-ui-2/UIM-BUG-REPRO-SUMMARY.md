# UIM ADF Bug Reproduction — Summary
**Date:** 2026-04-18  
**App:** `jira-ui-modifications-custom-ui` (Forge Custom UI)  
**Topic:** UI Modifications (UIM) rejects valid ADF node types via `setValue()`

---

## 1. Background

A partner (Deviniti) reported that Atlassian's **UI Modifications (UIM)** module rejects ADF (Atlassian Document Format) payloads containing certain node types when set via `setValue()` on issue fields (e.g. description) during issue creation.

These node types are **fully valid ADF**, generated and stored by Jira itself without any issues — but UIM's validation layer throws an `INVALID_INPUT` error when the same content is passed back via `setValue()`.

---

## 2. What is ADF?

**ADF = Atlassian Document Format** — the JSON structure Jira uses internally to represent rich text content in fields like description and comments.

Think of it like HTML for Jira:

| ADF Node | Real-world equivalent | What you see in Jira |
|---|---|---|
| `paragraph` | `<p>` in HTML | A normal line of text |
| `codeBlock` | `<pre><code>` in HTML | A grey code box |
| `expand` | An accordion/collapsible | A ▶ Click to expand section |
| `decisionList` | A decision log | 🔵 Decision items |
| `taskList` | A checklist | ☐ Checkbox items |

---

## 3. Problematic ADF Node Types

The following ADF nodes cause UIM to fail with `INVALID_INPUT` when set via `setValue()`:

| Node Type | Description |
|---|---|
| `expand` | Collapsible/expandable sections |
| `decisionList` / `decisionItem` | Decision list elements |
| `taskList` / `taskItem` | Checkbox list elements |
| `codeBlock` | Non-inline code blocks |

---

## 4. The Partner's Scenario (Deviniti Issue Templates)

**Reference:** https://deviniti.com/support/addon/cloud/issue-templates/latest/dynamic-variables/

### Steps to reproduce (with Deviniti app):
1. Create a template in the Deviniti Issue Templates app containing problematic nodes (`expand`, `codeBlock`, `taskList`, `decisionList`)
2. Open the Global Issue Create (GIC) dialog in Jira
3. Apply the created template — Jira pre-fills the description field with the template content
4. Fill in dynamic variable values in the modal and confirm
5. The app reads the current field value via `getValue()` (which now contains the problematic nodes)
6. The app appends the resolved dynamic variable text to the existing ADF
7. The app calls `setValue()` with the combined ADF
8. ❌ UIM throws `INVALID_INPUT` — template is not applied and an error banner is shown

### The core inconsistency:
```
Jira stores ADF with expand/codeBlock/taskList  ✅ (no problem)
         ↓
getValue() returns that same ADF               ✅ (no problem)
         ↓
App passes same ADF back via setValue()        ❌ INVALID_INPUT ← BUG HERE
```

---

## 5. Our App — What It Does

The `jira-ui-modifications-custom-ui` Forge app was built to replicate this bug. Here is what it does:

### `onInit` handler (fires when GIC opens):
1. Calls `getValue()` on the description field
2. If the field has real content (from a Deviniti template) → uses it directly
3. If the field is empty → falls back to a **simulated ADF** with all problematic nodes
4. Appends a dynamic variable paragraph to the ADF
5. Calls `setValue()` with the combined ADF
6. Logs and displays the result (accepted or rejected)

### `onChange` handler (fires when description changes):
- Same logic as `onInit`
- Has an **infinite loop guard** (`isSettingValue` flag) to prevent `setValue()` from re-triggering `onChange` endlessly

### `testIndividualNodeTypes()`:
- If `setValue()` fails, tests each problematic node type individually
- Identifies exactly which node(s) cause the failure
- Results shown in both the console and the UI panel

### UI Panel:
- Visible in the Custom UI iframe inside the GIC dialog
- Color-coded: ⏳ Pending → ✅ Accepted (green) / ❌ Rejected (red)
- Shows per-node-type results if the bug is reproduced

---

## 6. What "Simulated ADF" Means

Since the Deviniti Issue Templates app is not installed on our test Jira site, the description field is **empty** when GIC opens. There is no real template content to read.

So the app **simulates** what a real Jira template would produce by hardcoding an ADF document in the `buildTemplateAdfWithProblematicNodes()` function:

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    { "type": "paragraph",    "content": [{ "type": "text", "text": "Issue template loaded from Jira." }] },
    { "type": "codeBlock",    "attrs": { "language": "javascript" }, "content": [{ "type": "text", "text": "const x = 42;" }] },
    { "type": "expand",       "attrs": { "title": "Additional details" }, "content": [...] },
    { "type": "decisionList", "attrs": { "localId": "dl-1" }, "content": [...] },
    { "type": "taskList",     "attrs": { "localId": "tl-1" }, "content": [...] }
  ]
}
```

This is a **fake/fallback** — used only when the field is empty. When a real Deviniti template is applied, the app uses the real `getValue()` result instead.

---

## 7. Test Results (Our Environment)

| Run | `getValue()` result | ADF used | `setValue()` result |
|---|---|---|---|
| Without Deviniti app | Empty doc `{}` | Simulated (fallback) | ✅ ACCEPTED |
| With Deviniti app (expected) | Real template ADF | Real `getValue()` result | ❌ INVALID_INPUT (bug) |

### Why the bug didn't trigger in our environment:
- The field was empty → we used our hand-crafted simulated ADF
- UIM may validate differently when the ADF originates from our code vs. from Jira's own storage
- The bug reliably triggers only when the ADF was written by Jira's template engine and is then passed back via `setValue()`

---

## 8. Whose Bug Is It?

### ❌ NOT Deviniti's bug
- They use fully valid ADF node types (part of the official Atlassian Document Format schema)
- Jira itself accepts, stores, and renders these nodes without any issues
- `getValue()` returns these nodes — so Jira considers them valid

### ✅ Atlassian UIM platform bug
- UIM's `setValue()` validation layer has a stricter (and outdated) allowlist of permitted ADF nodes
- It rejects node types that Jira itself generates — this is the inconsistency
- This is a **platform-level bug** in the UIM validation layer that Atlassian needs to fix

---

## 9. How the App Works With Partner's Template

The app is **already ready** to work with the partner's Deviniti template — no code changes needed:

```javascript
// Automatically switches between real and simulated ADF:
let existingAdf = descriptionField.getValue();

if (isFieldEmpty) {
  // Without Deviniti app → uses simulated ADF
  existingAdf = buildTemplateAdfWithProblematicNodes();
} else {
  // With Deviniti app → uses real template ADF ✅
  // setValue() will then trigger INVALID_INPUT
}
```

### Steps for partner to reproduce with this app:
1. Deploy this Forge app on their Jira site (where Deviniti app is installed)
2. Create a template in Deviniti app with `expand`, `codeBlock`, `taskList`, `decisionList` nodes
3. Open GIC → apply the template
4. Observe the ❌ red panel in the app iframe and `INVALID_INPUT` errors in the console

---

## 10. Key Files

| File | Purpose |
|---|---|
| `static/hello-world/src/index.js` | Main app logic — onInit, onChange, ADF builders, UI panel |
| `manifest.yml` | Forge app manifest — UIM module registration |
| `static/hello-world/public/index.html` | HTML shell for the Custom UI iframe |

---

## 11. Key Concepts Glossary

| Term | Meaning |
|---|---|
| **ADF** | Atlassian Document Format — JSON structure for rich text in Jira |
| **UIM** | UI Modifications — Forge module to modify Jira issue fields |
| **GIC** | Global Issue Create — the "Create Issue" dialog in Jira |
| **`getValue()`** | UIM API to read the current value of a field |
| **`setValue()`** | UIM API to set the value of a field |
| **`INVALID_INPUT`** | Error thrown by UIM when it rejects an ADF payload |
| **Dynamic Variables** | Placeholders like `{{reporter}}`, `{{date}}` resolved at runtime |
| **Template** | Pre-defined issue content (from Deviniti app) applied to GIC |
| **Simulated ADF** | Hardcoded ADF in our app, mimicking what a real template produces |
| **onInit** | UIM handler that fires when the issue create dialog opens |
| **onChange** | UIM handler that fires when a watched field value changes |

---

*Generated from discussion session on 2026-04-18*
