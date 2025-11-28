import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 手动解析 .env 文件，不受系统环境变量影响
function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8')
    content.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
  return result
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 显式加载 .env 文件，优先使用文件中的值而不是系统环境变量
  const envFile = mode === 'production' ? '.env.production' : '.env.development'
  const envVars = parseEnvFile(path.resolve(__dirname, envFile))

  console.log(`[Vite Config] Mode: ${mode}`)
  console.log(`[Vite Config] VITE_API_BASE_URL from ${envFile}: ${envVars.VITE_API_BASE_URL}`)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      strictPort: true, // 禁止端口被占用时自动使用其他端口
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
    },
    // 强制使用 .env 文件中的值
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(envVars.VITE_API_BASE_URL || '/api/v1'),
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(envVars.VITE_APP_TITLE || 'AIOps Platform'),
    },
  }
})
