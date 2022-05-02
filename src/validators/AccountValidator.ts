import { patternBody, patternHeader, patternParam } from './patterns';

export const login = [patternBody.email, patternBody.password];
export const register = [patternBody.email, patternHeader.authorizationToken];
export const recoverPassword = [patternBody.email];
export const me = [patternHeader.authorizationToken];
export const active = [patternBody.password, patternParam.activeToken];
export const deactivatePasswordRecoveryLink = [
  patternHeader.authorizationToken,
];
export const refreshToken = [patternHeader.authorizationToken];
export const remove = [patternHeader.authorizationToken];
