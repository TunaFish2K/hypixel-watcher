import { Elysia, t } from 'elysia';

async function getPlayerUUIDByName(playerName: string) {
	const url = `https://api.mojang.com/users/profiles/minecraft/${playerName}`;
	const req = await fetch(url);
	if (!req.ok) {
		throw req.status;
	}
	return (await req.json()).id;
}

async function getPlayerStatusOnHypixel(key: string, uuid: string) {
	const url = `https://api.hypixel.net/status?key=${key}&uuid=${uuid}`;
	const req = await fetch(url);
	if (!req.ok) throw req.status;
	return (await req.json()).session as
		| {
				online: true;
				gameType: string;
				mode: string;
		  }
		| {
				online: false;
		  };
}

const app = new Elysia()
	.get(
		`/online`,
		async ({ query: { key, uuid }, status }) => {
			try {
				return { success: true, session: await getPlayerStatusOnHypixel(key, uuid) };
			} catch (e) {
				return status(e === 403 || e === 404 ? e : 500, {
					success: false,
					message:
						{ 403: 'bad api key', 404: 'player not found' }[e as number] ?? 'internal server error'
				});
			}
		},
		{
			query: t.Object({
				key: t.String(),
				uuid: t.String()
			}),
			response: {
				200: t.Object({
					success: t.Literal(true),
					session: t.Union([
						t.Object({
							online: t.Literal(true),
							gameType: t.String(),
							mode: t.String()
						}),
						t.Object({
							online: t.Literal(false)
						})
					])
				}),
				403: t.Object({
					success: t.Literal(false),
					message: t.String()
				}),
				404: t.Object({
					success: t.Literal(false),
					message: t.String()
				}),
				500: t.Object({
					success: t.Literal(false),
					message: t.String()
				})
			}
		}
	)
	.get(
		'/uuid',
		async ({ query: { playerName }, status }) => {
			try {
				return {
					success: true,
					uuid: await getPlayerUUIDByName(playerName)
				};
			} catch (e) {
				if (e === 404) return status(404, { success: false, message: 'not found' });
				return status(500, { success: false, message: 'internal server error' });
			}
		},
		{
			query: t.Object({
				playerName: t.String()
			}),
			response: {
				200: t.Object({
					success: t.Literal(true),
					uuid: t.String()
				}),
				404: t.Object({
					success: t.Literal(false),
					message: t.String()
				}),
				500: t.Object({
					success: t.Literal(false),
					message: t.String()
				})
			}
		}
	);

export type App = typeof app;
export default app;
