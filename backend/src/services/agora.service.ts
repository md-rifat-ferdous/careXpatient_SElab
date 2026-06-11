import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

const TOKEN_EXPIRATION_SEC = 86400;
const PRIVILEGE_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

export function generateRtcToken(
  channelName: string,
  uid: string,
  role: 'publisher' | 'subscriber' = 'publisher'
): { token: string; expirationTime: Date } {
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expirationTs = Math.floor(Date.now() / 1000) + PRIVILEGE_EXPIRATION_SEC;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    0,
    agoraRole,
    expirationTs
  );

  return {
    token,
    expirationTime: new Date(expirationTs * 1000),
  };
}

export function generateRtmToken(
  account: string
): { token: string; expirationTime: Date } {
  const { RtmTokenBuilder, RtmRole } = require('agora-access-token');
  const expirationTs = Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_SEC;

  const token = RtmTokenBuilder.buildTokenWithAccount(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    account,
    RtmRole.Rtm_User,
    expirationTs
  );

  return {
    token,
    expirationTime: new Date(expirationTs * 1000),
  };
}

export function generateChannelName(appointmentId: string): string {
  return `appointment_${appointmentId}`;
}

export function getAgoraAppId(): string {
  if (!AGORA_APP_ID) {
    throw new Error('AGORA_APP_ID is not configured');
  }
  return AGORA_APP_ID;
}
