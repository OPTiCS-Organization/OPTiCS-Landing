import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 콘솔과 같은 이유로 Host 허용 목록을 둔다.
 * Vite는 DNS 리바인딩 방어로 목록에 없는 Host를 거부하며, dev(server)와
 * preview 양쪽 다 검사하므로 같은 목록을 공유한다.
 */
const allowedHosts = ['optics.run', '.devtunnels.ms']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { allowedHosts },
  preview: { allowedHosts },

  /*
   * MPA 모드. 기본값인 'spa' 로 두면 /pricing 요청이 index.html 로 폴백돼
   * 개발 서버에서는 랜딩이 뜨고, 배포한 nginx 에서는 pricing.html 이 떠서
   * 두 환경이 서로 다르게 동작한다. nginx 의 try_files $uri.html 규칙과 맞춘다.
   */
  appType: 'mpa',

  /*
   * MPA. 라우터를 쓰지 않고 페이지마다 HTML 엔트리를 둔다.
   * 페이지별로 title·description·OG 를 소스에 직접 박을 수 있고,
   * 라우터 런타임이 번들에 실리지 않는다.
   */
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pricing: resolve(__dirname, 'pricing.html'),
      },
    },
  },
})
