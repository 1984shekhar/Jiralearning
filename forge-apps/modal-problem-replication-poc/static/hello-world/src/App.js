import React, { useEffect, useState } from 'react';
import { invoke, view, Modal } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  // State to track the current view context (issue action or modal)
  const [context, setContext] = useState(null);

  useEffect(() => {
    // Fetch initial data from the resolver
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);

    // Get the current view context to determine which module we're in
    view.getContext().then(setContext);
  }, []);

  /**
   * Opens a new modal using the Modal.open() API from @forge/bridge.
   * The 'resource' parameter must match a key in the 'resources' section
   * of the manifest.yml file.
   */
  const handleOpenModal = () => {
    console.log('Within handleOpenModal');
    const modal = new Modal({
      // This must match a 'key' in the resources section of manifest.yml
      resource: 'main',
      // Optional: Pass data to the modal via context
      context: {
        openedFrom: 'issue-action',
        timestamp: new Date().toISOString()
      },
      size: 'small',
      // Optional: Callback when modal is submitted
      onClose: (payload) => {
        console.log('Modal closed with payload:', payload);
      }
    });

    modal.open();
  };

  /**
   * Closes the current view (modal or issue action panel).
   * Optionally passes data back to the opener.
   */
  const handleClose = () => {
    // You can pass data back when closing a modal
    view.close({ result: 'closed-successfully' });
  };

  // Check if we're running inside the modal
  // When a modal is opened via Modal.open() with context, the context data
  // is available under extension.modal in the view context
  const isModal = context?.extension?.modal !== undefined;
  console.log(context, "context");

  return (
    <div style={{ padding: '16px' }}>
      {/* Display different content based on whether we're in modal or issue action */}
      {isModal ? (
        <>
          <h2>🎉 This is the Modal!</h2>
          <p>You successfully opened a new modal from the issue action.</p>
          {/* Show any context data passed to the modal */}
          {context?.extension?.modal && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f4f5f7', borderRadius: '4px' }}>
              <strong>Modal Context:</strong>
              <pre>{JSON.stringify(context.extension.modal, null, 2)}</pre>
            </div>
          )}
          <button 
            onClick={handleClose}
            style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Close Modal
          </button>
        </>
      ) : (
        <>
          <h2>Issue Action Pal</h2>
          <p>{data ? data : 'Loading...'}</p>

          {/* Button to open the new modal */}
          <button 
            onClick={handleOpenModal}
            style={{ 
              marginTop: '16px', 
              marginRight: '8px',
              padding: '8px 16px', 
              backgroundColor: '#0052CC', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Open Modal
          </button>

          {/* Existing close button */}
          <button 
            onClick={handleClose}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}

export default App;
