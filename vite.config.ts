import { defineConfig } from 'vite';

export default defineConfig({
    base: '/tanks-ts/',
    clearScreen: false,
    server: {
        port: 5174
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                viewer: 'viewer.html'
            }
        }
    },
    test: {
        exclude: ['**/node_modules/**', '**/dist/**', 'tests/app.spec.ts']
    }
});
