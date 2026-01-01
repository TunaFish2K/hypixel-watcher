/**
 * Cloudflare Workers 入口文件
 * 适配 Cloudflare Workers 运行时
 */
import app from './index';

export default {
	async fetch(request: Request) {
		return app.fetch(request);
	}
};
