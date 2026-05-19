import express from 'express';

const app = express();
app.use(express.json());

function decodeJwtWithoutVerification(token) {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return { error: 'Invalid JWT format' };
  }

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');

  try {
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (error) {
    return { error: error.message };
  }
}

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Forge Remote License Repro remote is running.' });
});

app.post('/inspect-license', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const fit = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  const fitPayload = decodeJwtWithoutVerification(fit);
  const remoteLicense = fitPayload?.app?.license ?? null;

  res.json({
    ok: true,
    observedAt: new Date().toISOString(),
    localRequestBody: req.body ?? null,
    remoteAuthHeaderPresent: Boolean(authHeader),
    remoteFitPayload: fitPayload,
    remoteLicense,
    licenseFieldTypes: remoteLicense
      ? {
          isActive: typeof remoteLicense.isActive,
          billingPeriod: typeof remoteLicense.billingPeriod,
          capabilitySet: typeof remoteLicense.capabilitySet,
          ccpEntitlementId: typeof remoteLicense.ccpEntitlementId,
          ccpEntitlementSlug: typeof remoteLicense.ccpEntitlementSlug,
          isEvaluation: typeof remoteLicense.isEvaluation,
          subscriptionEndDate: typeof remoteLicense.subscriptionEndDate,
          supportEntitlementNumber: typeof remoteLicense.supportEntitlementNumber,
          trialEndDate: typeof remoteLicense.trialEndDate,
          type: typeof remoteLicense.type,
        }
      : null,
  });
});

const port = Number(process.env.PORT || 4310);
app.listen(port, () => {
  console.log(`Forge Remote License Repro listening on http://localhost:${port}`);
});
