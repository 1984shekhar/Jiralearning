module.exports.run = async (event) => {
  const now = new Date().toISOString();
  console.log(`[forge-log-app] heartbeat at ${now}`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': ['application/json']
    },
    body: JSON.stringify({
      ok: true,
      message: 'heartbeat logged',
      timestamp: now,
      event
    })
  };
};
