import { config } from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

config({ path: '.env' });

export default defineConfig({
	server: {
		host: true,
		https: {
			key: fs.readFileSync(path.join(__dirname, 'cert/localhost.key')),
			cert: fs.readFileSync(path.join(__dirname, 'cert/localhost.crt')),
		},
	},
	plugins: [
		svgr(),
		react(),
		tsconfigPaths({
			root: '../',
		}),
	],
});
