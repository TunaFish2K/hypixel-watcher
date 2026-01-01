/**
 * 使用 PlayerDB.co API 从玩家名获取 UUID
 * 支持 CORS，可在前端直接调用
 */
export async function getPlayerUUIDByName(playerName: string): Promise<string> {
	const url = `https://playerdb.co/api/player/minecraft/${playerName}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch UUID: ${response.status}`);
	}

	const data = await response.json();

	// 检查是否找到玩家
	if (!data.success || data.code !== 'player.found') {
		throw new Error('Player not found');
	}

	// 返回无破折号的 UUID（raw_id）
	return data.data.player.raw_id;
}

/**
 * 使用 Hypixel API 获取玩家状态
 * 支持 CORS，可在前端直接调用
 */
export async function getPlayerStatusOnHypixel(
	key: string,
	uuid: string
): Promise<
	| {
			online: true;
			gameType: string;
			mode: string;
	  }
	| {
			online: false;
	  }
> {
	const url = `https://api.hypixel.net/status?key=${key}&uuid=${uuid}`;

	const response = await fetch(url);

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error('bad api key');
		}
		if (response.status === 404) {
			throw new Error('player not found or invalid uuid');
		}
		throw new Error(`HTTP ${response.status}`);
	}

	const data = await response.json();
	return data.session;
}
