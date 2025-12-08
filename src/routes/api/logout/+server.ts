import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.set('session', '', {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		path: '/',
		maxAge: 0
	});

	return new Response('Logged out', { status: 200 });
};