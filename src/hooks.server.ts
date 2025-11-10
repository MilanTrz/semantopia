import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mon_super_secret_pour_jwt';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (token) {
		try {
			const decoded = jwt.verify(token, SECRET) as { id: number; email: string };
			event.locals.user = { id: decoded.id, email: decoded.email };
		} catch {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
