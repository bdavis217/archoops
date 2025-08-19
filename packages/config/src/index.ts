type BooleanFlag = boolean;

function getEnv(name: string, fallback?: string): string {
	const value = process.env[name];
	return value === undefined ? (fallback ?? '') : value;
}

function getBooleanEnv(name: string, fallback: boolean): boolean {
	const raw = process.env[name];
	if (raw === undefined) return fallback;
	return /^(1|true|yes)$/i.test(raw);
}

export const config = {
	apiBaseUrl: () => getEnv('API_BASE_URL', 'http://localhost:3001'),
	jwtSecret: () => getEnv('JWT_SECRET', 'dev-secret'),
	databaseUrl: () => getEnv('DATABASE_URL', 'file:./dev.db'),
	auth: {
		enableEmailVerification: (): BooleanFlag => getBooleanEnv('ENABLE_EMAIL_VERIFICATION', false),
		dataRetentionDays: () => parseInt(getEnv('DATA_RETENTION_DAYS', '365'), 10),
		jwtExpiryDays: () => parseInt(getEnv('JWT_EXPIRY_DAYS', '7'), 10),
	},
	features: {
		// Examples of feature flags aligned with .cursorrules and contexts
		practiceModeEnabled: (): BooleanFlag => getBooleanEnv('FEATURE_PRACTICE_MODE', true),
		leaderboardEnabled: (): BooleanFlag => getBooleanEnv('FEATURE_LEADERBOARD', true),
		lessonsEnabled: (): BooleanFlag => getBooleanEnv('FEATURE_LESSONS', true),
	},
};

export type AppConfig = typeof config;
