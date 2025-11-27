import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const viteEnv = env.VITE_ENV || 'prod';

  const targets: Record<string, string> = {
    local: 'http://localhost:8080',
    prod: 'http://115.190.204.146:8080',
  };

  const proxyTarget = targets[viteEnv] || targets.prod;
  console.log(`🔧 [Vite Proxy] Environment: ${viteEnv}, Target: ${proxyTarget}`);

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/ai': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
