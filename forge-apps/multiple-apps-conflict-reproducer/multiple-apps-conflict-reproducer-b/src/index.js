import api, { route } from '@forge/api';

const UIM_NAME = 'multiple-apps-conflict-reproducer';
const SUBTASK_IDS = new Set(['10003', '10070', '10071']);
const TARGET_PROJECT_KEY = 'KAN7';
const VIEW_TYPES = ['GIC'];
const REGISTRATION_REVISION = 'gic-stable-app-b';

async function fetchProjectByKey(projectKey) {
  const res = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`);
  if (!res.ok) {
    console.error(`[MULTIPLE-APPS-CONFLICT] Failed to fetch project ${projectKey}:`, await res.text());
    return null;
  }

  const data = await res.json();
  console.log(`[MULTIPLE-APPS-CONFLICT] Loaded target project ${data.key} (${data.id})`);
  return data;
}

async function fetchIssueTypes(projectId) {
  const res = await api.asApp().requestJira(route`/rest/api/3/project/${projectId}`);
  if (!res.ok) {
    console.error(`[MULTIPLE-APPS-CONFLICT] Failed to fetch issue types for project ${projectId}:`, await res.text());
    return [];
  }

  const data = await res.json();
  return (data.issueTypes || [])
    .filter((issueType) => !issueType.subtask && !SUBTASK_IDS.has(issueType.id))
    .map((issueType) => issueType.id);
}

async function createUiModification(projectId, issueTypeId, viewType) {
  const payload = {
    name: `${UIM_NAME}-${projectId}-${issueTypeId}-${viewType}`,
    contexts: [
      {
        projectId: String(projectId),
        issueTypeId: String(issueTypeId),
        viewType
      }
    ]
  };

  const res = await api.asApp().requestJira(route`/rest/api/3/uiModifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error(
      `[MULTIPLE-APPS-CONFLICT] Failed to register UIM for project=${projectId} issueType=${issueTypeId} viewType=${viewType}:`,
      await res.text()
    );
    return;
  }

  const result = await res.json();
  console.log(
    `[MULTIPLE-APPS-CONFLICT] Registered UIM ${result.id} for project=${projectId} issueType=${issueTypeId} viewType=${viewType}`
  );
}

async function deleteExistingModifications() {
  const res = await api.asApp().requestJira(route`/rest/api/3/uiModifications`);
  if (!res.ok) {
    console.error('[MULTIPLE-APPS-CONFLICT] Failed to list existing UI modifications:', await res.text());
    return;
  }

  const data = await res.json();
  const mods = (data.values || []).filter((mod) =>
    typeof mod.name === 'string' && mod.name.startsWith(`${UIM_NAME}-`)
  );

  console.log(`[MULTIPLE-APPS-CONFLICT] Deleting ${mods.length} existing reproducer UI modification(s)...`);

  for (const mod of mods) {
    const deleteRes = await api.asApp().requestJira(route`/rest/api/3/uiModifications/${mod.id}`, {
      method: 'DELETE'
    });

    if (!deleteRes.ok) {
      console.error(
        `[MULTIPLE-APPS-CONFLICT] Failed to delete UIM ${mod.id} (${mod.name}):`,
        await deleteRes.text()
      );
    } else {
      console.log(`[MULTIPLE-APPS-CONFLICT] Deleted UIM ${mod.id} (${mod.name})`);
    }
  }
}

export async function run() {
  try {
    console.log(`[MULTIPLE-APPS-CONFLICT] Install/update trigger fired. Registering contexts for project ${TARGET_PROJECT_KEY}...`);
    console.log(`[MULTIPLE-APPS-CONFLICT] Registration revision: ${REGISTRATION_REVISION}`);
    await deleteExistingModifications();
    const project = await fetchProjectByKey(TARGET_PROJECT_KEY);
    if (!project) {
      console.error(`[MULTIPLE-APPS-CONFLICT] Aborting registration because project ${TARGET_PROJECT_KEY} was not found.`);
      return;
    }

    const issueTypeIds = await fetchIssueTypes(project.id);
    console.log(
      `[MULTIPLE-APPS-CONFLICT] Registering ${issueTypeIds.length} issue type context(s) for ${project.key}: ${issueTypeIds.join(', ')}`
    );

    for (const issueTypeId of issueTypeIds) {
      for (const viewType of VIEW_TYPES) {
        await createUiModification(project.id, issueTypeId, viewType);
      }
    }

    console.log(`[MULTIPLE-APPS-CONFLICT] Context registration complete for project ${project.key}.`);
  } catch (error) {
    console.error('[MULTIPLE-APPS-CONFLICT] Fatal error:', error?.message ?? String(error));
  }
}
