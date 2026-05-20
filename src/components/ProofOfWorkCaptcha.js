'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

async function hashString(input) {
  const buffer = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function solveProofOfWork(challenge, difficulty) {
  const prefix = '0'.repeat(difficulty);
  for (let nonce = 0; nonce < 2_000_000; nonce += 1) {
    const digest = await hashString(`${challenge}:${nonce}`);
    if (digest.startsWith(prefix)) {
      return { nonce, digest };
    }

    if (nonce % 250 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  throw new Error('Unable to solve proof-of-work challenge');
}

export default function ProofOfWorkCaptcha({ purpose = 'auth', onSolved, onStatusChange }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setStatus('requesting');
        onStatusChange?.('requesting');
        const response = await fetch(`/api/security/captcha?purpose=${encodeURIComponent(purpose)}`);
        const challenge = await response.json();

        if (cancelled) return;

        setStatus('solving');
        onStatusChange?.('solving');
        const proof = await solveProofOfWork(challenge.challenge, challenge.difficulty);

        if (cancelled) return;

        const solved = {
          challengeId: challenge.challengeId,
          nonce: proof.nonce,
          digest: proof.digest,
          purpose
        };
        setStatus('ready');
        onStatusChange?.('ready');
        onSolved?.(solved);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'CAPTCHA challenge failed');
        setStatus('error');
        onStatusChange?.('error');
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [purpose, onSolved, onStatusChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 40, py: 1 }}>
      {status === 'ready' ? (
        <Typography variant="body2" color="success.main">
          Human CAPTCHA verified
        </Typography>
      ) : (
        <>
          <CircularProgress size={18} thickness={5} />
          <Typography variant="body2" color="text.secondary">
            {status === 'solving' ? 'Solving privacy-preserving challenge...' : 'Preparing challenge...'}
          </Typography>
        </>
      )}
      {error ? <Alert severity="error" sx={{ ml: 1 }}>{error}</Alert> : null}
    </Box>
  );
}