import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
} from "@forge/react";
import { view } from '@forge/bridge';

const View = () => {
  const [fieldValue, setFieldValue] = useState(null);

  const options = [
    { label: 'Team A', value: 'team-a' },
    { label: 'Team B', value: 'team-b' }
  ];

  useEffect(() => {
    view.getContext().then((context) => { setFieldValue(context.extension.fieldValue) });
  }, []);

  const getDisplayLabel = (value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <>
      <Text>{getDisplayLabel(fieldValue) || ''}</Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
);