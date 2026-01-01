/**
 * 前端开发服务器
 * 导入后端 API 并同时 serve HTML，开发时合并但代码保持分离
 * 运行在 localhost:5173
 */
import { Elysia } from 'elysia';
import apiApp from '../server/index';
import index from '../src/index.html';

const app = new Elysia().get('/', index).use(apiApp);

app.listen(5173, () => {
	console.log('🚀 Dev server (frontend + backend) running on http://localhost:5173');
});
