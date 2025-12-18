import { defineConfig } from 'vite';

export default defineConfig({
    base: '/tanks-ts/',
    clearScreen: false,
    server: {
        port: 5173
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                viewer: 'viewer.html'
            }
        }
    }
});
