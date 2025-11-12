import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
	return new Response(JSON.stringify({ user: locals.user }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
