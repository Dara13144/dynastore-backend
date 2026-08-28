require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '553118090288-apdp0s1uu11is8su2itjo7qjiot13qk1.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Cryptographically verifies a Google ID Token (JWT) using Google's public certificates.
 * Checks iss, aud, exp, sub, email, and email_verified.
 * 
 * @param {string} token - The raw ID token received from Google Identity Services
 * @returns {Promise<Object>} Verified token payload
 */
async function verifyGoogleIdToken(token) {
  if (!token) {
    const err = new Error('Google credential token is missing');
    err.statusCode = 400;
    err.code = 'MISSING_CREDENTIAL';
    throw err;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      const err = new Error('Invalid Google credential payload');
      err.statusCode = 401;
      err.code = 'INVALID_PAYLOAD';
      throw err;
    }

    // Verify Issuer (Must be Google)
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      const err = new Error(`Invalid token issuer: ${payload.iss}`);
      err.statusCode = 401;
      err.code = 'INVALID_ISSUER';
      throw err;
    }

    // Verify Audience matches our Google Client ID
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      const err = new Error('Google Client ID mismatch');
      err.statusCode = 401;
      err.code = 'AUDIENCE_MISMATCH';
      throw err;
    }

    // Verify Expiration
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      const err = new Error('Google authentication token has expired');
      err.statusCode = 401;
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }

    // Verify Email exists and is verified by Google
    if (!payload.email) {
      const err = new Error('Google account has no associated email');
      err.statusCode = 400;
      err.code = 'NO_EMAIL';
      throw err;
    }

    if (!payload.email_verified) {
      const err = new Error('Google account email is not verified');
      err.statusCode = 403;
      err.code = 'EMAIL_NOT_VERIFIED';
      throw err;
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.given_name || 'Google User',
      avatar: payload.picture || null,
      emailVerified: Boolean(payload.email_verified),
      locale: payload.locale || 'en'
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const authErr = new Error(`Google token verification failed: ${err.message}`);
    authErr.statusCode = 401;
    authErr.code = 'VERIFICATION_FAILED';
    throw authErr;
  }
}

module.exports = {
  verifyGoogleIdToken,
  GOOGLE_CLIENT_ID
};
