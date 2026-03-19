import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Form, { Field, ErrorMessage } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';

import { view, events } from '@forge/bridge';

const Content = styled.div`
    margin-bottom: 24px;
    padding: 8px;
`;

const fieldRequiredValidator = (value) => {
  if (!value) {
    return 'Field is required';
  }

  return;
}

function App() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    view.getContext().then(({ extension }) => {
      setFormData(extension.data.inputs);
    });

    const subscription = events.on('AUTOMATION_ACTION_SUBMIT', () => {
      formRef.current?.onSubmit();
    });

    return () => {
      subscription.then((sub) => sub.unsubscribe());
    };
  }, []);

  useEffect(() => {
    const handleValidateRuleEvent = ({ isValidating }) => {
      setIsValidating(isValidating);
    };
    const subscription = events.on('AUTOMATION_ACTION_VALIDATE_RULE_EVENT', handleValidateRuleEvent);
    return () => subscription.then(sub => sub.unsubscribe());
  }, []);

  const handleOnChange = (value) => {
    const updatedFormData = { ...formData, ...value };
    view.submit(updatedFormData);
    setFormData(updatedFormData);
  };

  const onSubmit = (data) => {
    view.submit(data);
  };

  return (
    <Content>
      {!!formData ? (
        <Form onSubmit={onSubmit} isDisabled={isValidating}>
          {({ formProps }) => {
            formRef.current = formProps;

            return (
              <form {...formProps}>
                <Field
                  name="issueKey"
                  label="Issue key"
                  defaultValue={formData.issueKey}
                  isRequired
                  validate={fieldRequiredValidator}
                >
                  {({ fieldProps, error }) => (
                    <>
                      <Textfield
                        {...fieldProps}
                        onChange={e => {
                          handleOnChange({ [fieldProps.name]: e.target.value });
                          fieldProps.onChange(e);
                        }}
                      />
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </>
                  )}
                </Field>
                <Field
                  name="comment"
                  label="Comment"
                  defaultValue={formData.comment}
                  isRequired
                  validate={fieldRequiredValidator}>
                  {({ fieldProps, error }) => (
                    <>
                      <Textfield
                        {...fieldProps}
                        onChange={e => {
                          handleOnChange({ [fieldProps.name]: e.target.value });
                          fieldProps.onChange(e);
                        }}
                      />
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </>
                  )}
                </Field>
              </form>
            );
          }}
        </Form>
      ) : null}
    </Content>
  );
}

export default App;
