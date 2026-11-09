import type { components } from './schema';

/**
 * Friendly aliases over the generated OpenAPI schema (`npm run gen:api`).
 * Never hand-write a backend DTO: add an alias here instead.
 */
type Schemas = components['schemas'];

export type TokenResponse = Schemas['TokenResponse'];
export type UserResponse = Schemas['UserResponse'];
export type LoginRequest = Schemas['LoginRequest'];
export type Role = UserResponse['role'];
