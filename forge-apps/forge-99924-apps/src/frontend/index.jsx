// import React, { useEffect, useState } from 'react';
// import ForgeReconciler, { Text ,Button, ButtonGroup } from '@forge/react';
// import { invoke } from '@forge/bridge';

// const App = () => {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     invoke('getText', { example: 'my-invoke-variable' }).then(setData);
//   }, []);
//   return (
//     <>
//       <Text>Work Log Approval</Text>
//       <Text>{data ? data : 'Loading...'}</Text>
//       <ButtonGroup appearance="primary" label="Button group with appearance">
//       <Button>Submit Worklog</Button>
//       <Button>Manager's Approval</Button>
//       <Button>Customer Approval</Button>
//     </ButtonGroup>
//     </>
//   );
// };

// ForgeReconciler.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
import ForgeUI, {
  render, Fragment, Text, Button, Table, Head, Row, Cell, ModalDialog, useState, useProductContext, Form, TextField
} from '@forge/ui';
import { useAction } from '@forge/ui';

const App = () => {
  const [view, setView] = useState('mine');
  const [selectedId, setSelectedId] = useState(null);
  const [submissions, setSubmissions] = useState(async () => {
    try {
      return await useAction('listMySubmissions', {});
    } catch (error) {
      console.error('Error loading submissions:', error);
      return [];
    }
  });
  const [queue, setQueue] = useState(async () => {
    try {
      return await useAction('listApprovalsQueue', {});
    } catch (error) {
      console.error('Error loading queue:', error);
      return [];
    }
  });

  const handleSubmit = async (formData) => {
    try {
      await useAction('submit', formData);
      // Reload submissions after submit
      const updated = await useAction('listMySubmissions', {});
      setSubmissions(updated);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <Fragment>
      <Button text="My Submissions" onClick={() => setView('mine')} />
      <Button text="Approvals Queue" onClick={() => setView('queue')} />
      {view === 'mine' && (
        <Fragment>
          <Text>Your submissions:</Text>
          <Table>
            <Head>
              <Cell>ID</Cell><Cell>Status</Cell><Cell>Action</Cell>
            </Head>
            {submissions && submissions.length > 0 ? (
              submissions.map(s => (
                <Row key={s.submissionId}>
                  <Cell>{s.submissionId}</Cell>
                  <Cell>{s.state}</Cell>
                  <Cell><Button text="View" onClick={() => setSelectedId(s.submissionId)} /></Cell>
                </Row>
              ))
            ) : (
              <Row><Cell colSpan={3}>No submissions found</Cell></Row>
            )}
          </Table>
          <Form onSubmit={handleSubmit}>
            <TextField name="periodStart" label="Period Start (YYYY-MM-DD)" isRequired={true} />
            <TextField name="periodEnd" label="Period End (YYYY-MM-DD)" isRequired={true} />
            <TextField name="l1ApproverIds" label="L1 Approver IDs (comma-separated)" />
            <TextField name="l2ApproverIds" label="L2 Approver IDs (comma-separated)" />
            <TextField name="initialComment" label="Comment (optional)" />
          </Form>
        </Fragment>
      )}
      {view === 'queue' && (
        <Fragment>
          <Text>Submissions awaiting your approval:</Text>
          <Table>
            <Head>
              <Cell>ID</Cell><Cell>Status</Cell><Cell>Action</Cell>
            </Head>
            {queue && queue.length > 0 ? (
              queue.map(s => (
                <Row key={s.submissionId}>
                  <Cell>{s.submissionId}</Cell>
                  <Cell>{s.state}</Cell>
                  <Cell><Button text="Review" onClick={() => setSelectedId(s.submissionId)} /></Cell>
                </Row>
              ))
            ) : (
              <Row><Cell colSpan={3}>No approvals pending</Cell></Row>
            )}
          </Table>
        </Fragment>
      )}
      {selectedId && (
        <ModalDialog header="Submission Details" onClose={() => setSelectedId(null)}>
          <Text>ID: {selectedId}</Text>
          {/* Add more details/actions here as needed */}
        </ModalDialog>
      )}
    </Fragment>
  );
};

export const run = render(<App />);