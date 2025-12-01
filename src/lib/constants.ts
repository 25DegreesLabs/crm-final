/**
 * Current User ID
 *
 * For single-user deployment, this is a fixed UUID representing the default user.
 * When multi-user authentication is added (Google Sign-In), this will be replaced
 * with dynamic user.id from auth context.
 *
 * All leads, campaigns, and settings are associated with this user_id.
 */
export const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Legacy user_id value (deprecated)
 * Only kept for reference. DO NOT USE in new code.
 */
export const LEGACY_USER_ID = 'default_user';
