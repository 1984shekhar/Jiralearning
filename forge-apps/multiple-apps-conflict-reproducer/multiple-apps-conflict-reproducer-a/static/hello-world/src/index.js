import { uiModificationsApi } from '@forge/jira-bridge';

const { onInit, onError, onChange } = uiModificationsApi;
const PREFIX = '[MULTIPLE-APPS-CONFLICT]';
const TARGET_FIELD = 'summary';
const APP_INSTANCE_LABEL = 'APP_A';
const FIELD_VALUE = `Set by ${APP_INSTANCE_LABEL}`;

function logConflictErrors(errors = []) {
  if (!errors.length) {
    console.log(`${PREFIX} onError fired with no errors.`);
    return;
  }

  errors.forEach((error, index) => {
    console.log(`${PREFIX} onError[${index}] type=${error.type}`, error);
    if (error.type === 'MULTIPLE_APPS_CONFLICT') {
      console.warn(`${PREFIX} MULTIPLE_APPS_CONFLICT detected`, error);
    }
  });
}

onError(({ errors }) => {
  console.log(`${PREFIX} onError callback fired for ${APP_INSTANCE_LABEL}.`);
  logConflictErrors(errors);
});

onInit(({ api, uiModifications }) => {
  console.log(`${PREFIX} onInit fired for ${APP_INSTANCE_LABEL}.`);
  console.log(`${PREFIX} uiModifications visible to this app:`, uiModifications);

  const field = api.getFieldById(TARGET_FIELD);
  if (!field) {
    console.warn(`${PREFIX} Field ${TARGET_FIELD} not found.`);
    return;
  }

  try {
    console.log(`${PREFIX} Setting ${TARGET_FIELD} to: ${FIELD_VALUE}`);
    field.setValue(FIELD_VALUE);
    console.log(`${PREFIX} setValue completed for ${APP_INSTANCE_LABEL}.`);
  } catch (error) {
    console.error(`${PREFIX} setValue threw for ${APP_INSTANCE_LABEL}:`, error);
  }
}, () => [TARGET_FIELD]);

onChange(({ api }) => {
  const changedFields = api.getChangedFields ? api.getChangedFields() : [];
  const summaryChanged = changedFields.some((field) => field.fieldId === TARGET_FIELD);
  if (!summaryChanged) {
    return;
  }

  const field = api.getFieldById(TARGET_FIELD);
  if (field) {
    console.log(`${PREFIX} ${TARGET_FIELD} changed for ${APP_INSTANCE_LABEL}:`, field.getValue());
  }
}, () => [TARGET_FIELD]);
