import React, { useState, useCallback, useEffect } from 'react';
import ForgeReconciler, { Select } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view } from '@forge/bridge';

const Edit = () => {
  const [displayValue, setDisplayValue] = useState({ label: 'Team A', value: 'team-a' });
  const [isReady, setIsReady] = useState(false);

  const options = [
    { label: 'Team A', value: 'team-a' },
    { label: 'Team B', value: 'team-b' }
  ];

  useEffect(() => {
    // Initialize with context field value if available
    view.getContext().then((context) => {
      const fieldValue = context?.extension?.fieldValue;
      if (fieldValue) {
        const matchedOption = options.find(opt => opt.value === fieldValue);
        if (matchedOption) {
          setDisplayValue(matchedOption);
        }
      }
      setIsReady(true);
    });
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      console.log('Submitting value:', displayValue.value);
      await view.submit(displayValue.value);
    } catch (e) {
      console.error('Submit error:', e);
    }
  }, [displayValue]);

  const handleOnChange = useCallback((selectedOption) => {
    console.log('Selected option:', selectedOption);
    setDisplayValue(selectedOption);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <CustomFieldEdit onSubmit={onSubmit}>
      <Select 
        onChange={handleOnChange}
        value={displayValue}
        options={options}
        placeholder="Select a team"
      />
    </CustomFieldEdit>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);