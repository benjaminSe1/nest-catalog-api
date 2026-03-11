import type { Request } from 'express';

import type { TokenPayload } from './auth-token';

export type AuthenticatedRequest = Request & {
  user?: TokenPayload;
};
