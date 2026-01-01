import { useRef, useState } from 'react';
import './App.css';
import { getPlayerUUIDByName, getPlayerStatusOnHypixel } from './utils/uuid';

export function App() {
	const [apiKey, setAPIKey] = useState<string>('');
	const [playerName, setPlayerName] = useState<string>('');
	const [alwaysNotify, setAlwaysNotify] = useState<boolean>(true);
	const [status, setStatus] = useState<'loading' | 'failed' | 'running' | 'idle'>('idle');
	const [reason, setReason] = useState<string | null>(null);
	const [uuid, setUUID] = useState<string | null>(null);
	const uuidRef = useRef<string | null>(null);
	const [thisQuery, setThisQuery] = useState<
		| ({
				time: string;
		  } & (
				| {
						success: true;
						result: { online: true; gameType: string; mode: string } | { online: false };
				  }
				| { success: false; message: string }
		  ))
		| null
	>(null);
	const lastOnline = useRef<boolean>(false);
	const intervalID = useRef<ReturnType<typeof setInterval> | null>(null);

	const active = status !== 'idle';

	async function query() {
		console.log(uuid);
		try {
			const result = await getPlayerStatusOnHypixel(apiKey, uuidRef.current!);

			setThisQuery({
				success: true,
				result,
				time: new Date().toLocaleTimeString()
			});

			if (result.online && (alwaysNotify || !lastOnline.current)) {
				new Notification(`${playerName} is online`, {
					body: [`game type: ${result.gameType}`, `mode: ${result.mode}`].join('\n')
				});
			}
			lastOnline.current = result.online;
		} catch (error) {
			setThisQuery({
				success: false,
				message: error instanceof Error ? error.message : String(error),
				time: new Date().toLocaleTimeString()
			});
		}
	}

	return (
		<div className="app">
			<div className="card">
				<h1>Hypixel Watcher</h1>
				<form className="form">
					<div className="form-item">
						<label htmlFor="api-key">Api Key</label>
						<input
							name="api-key"
							className="input"
							type="password"
							onChange={(ev) => setAPIKey(ev.target.value)}
							value={apiKey}
							disabled={active}
						></input>
					</div>
					<span>
						Visit <a href="https://developer.hypixel.net">Developer Dashboard</a> for the key.
					</span>
					<div className="form-item">
						<label htmlFor="player">Player Name</label>
						<input
							name="player"
							value={playerName}
							onChange={(ev) => setPlayerName(ev.target.value)}
							disabled={active}
						></input>
					</div>
					<div className="form-item">
						<label htmlFor="always-notify">always notify</label>
						<input
							name="always-notify"
							type="checkbox"
							onChange={(ev) => setAlwaysNotify(ev.target.checked)}
							checked={alwaysNotify}
							disabled={active}
						></input>
					</div>
					<span>
						{alwaysNotify
							? 'always notify you if the player is online.'
							: 'only notify when player comes online.'}
					</span>
					<button
						type="submit"
						className="submit"
						onClick={async (ev) => {
							ev.preventDefault();
							if (status === 'idle') {
								const result = await Notification.requestPermission();
								if (result !== 'granted') return;

								setStatus('loading');

								try {
									// 使用 PlayerDB.co API 获取 UUID
									const fetchedUUID = await getPlayerUUIDByName(playerName);
									setUUID(fetchedUUID);
									uuidRef.current = fetchedUUID;
									setStatus('running');
									intervalID.current = setInterval(() => query(), 15 * 1000);
									query();
								} catch (e) {
									setStatus('failed');
									if (e instanceof Error && e.message === 'Player not found') {
										setReason('player not found');
									} else {
										setReason(e instanceof Error ? e.message : String(e));
									}
								}
							} else {
								setStatus('idle');
								setReason(null);
								setUUID(null);
								uuidRef.current = null;
								lastOnline.current = false;
								clearInterval(intervalID.current!);
							}
						}}
					>
						{active ? 'Stop' : 'Watch'}
					</button>
				</form>
				{active && (
					<div className="output">
						{status === 'loading' && <span>loading...</span>}
						{status === 'failed' && <span>error: {reason}</span>}
						{status === 'running' && (
							<>
								<span>UUID: {uuid}</span>
								{thisQuery === null ? (
									<span>haven't queried yet</span>
								) : (
									<>
										<span>last query: {thisQuery.time}</span>
										{thisQuery.success ? (
											<>
												<span>online: {thisQuery.result.online ? 'yes' : 'no'}</span>
												{thisQuery.result.online && (
													<>
														<span>game type: {thisQuery.result.gameType}</span>
														<span>mode: {thisQuery.result.mode}</span>
													</>
												)}
											</>
										) : (
											<span>query failed: {thisQuery.message}</span>
										)}
									</>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
