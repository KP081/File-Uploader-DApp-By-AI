import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}, // prevents "process is not defined" error
    },
    resolve: {
        alias: {
            process: 'process/browser',
        },
    },
})
