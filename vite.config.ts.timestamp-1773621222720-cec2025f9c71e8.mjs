// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/Tai_lieu_dai_hoc_nam_V/tmix-center-project/English-Center-FE/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Tai_lieu_dai_hoc_nam_V/tmix-center-project/English-Center-FE/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\Tai_lieu_dai_hoc_nam_V\\tmix-center-project\\English-Center-FE";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  const proxyTarget = backendUrl.replace(/\/api\/v1$/, "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
        "@teacher": path.resolve(__vite_injected_original_dirname, "./src/components/features/teacher"),
        "@pages": path.resolve(__vite_injected_original_dirname, "./src/pages"),
        "@utils": path.resolve(__vite_injected_original_dirname, "./src/utils"),
        "@services": path.resolve(__vite_injected_original_dirname, "./src/services"),
        "@contexts": path.resolve(__vite_injected_original_dirname, "./src/contexts"),
        "@hooks": path.resolve(__vite_injected_original_dirname, "./src/hooks"),
        "@types": path.resolve(__vite_injected_original_dirname, "./src/types"),
        "@constants": path.resolve(__vite_injected_original_dirname, "./src/constants"),
        "@lib": path.resolve(__vite_injected_original_dirname, "./src/lib"),
        "@config": path.resolve(__vite_injected_original_dirname, "./src/config"),
        "@theme": path.resolve(__vite_injected_original_dirname, "./src/theme"),
        "@styles": path.resolve(__vite_injected_original_dirname, "./src/styles"),
        "@assets": path.resolve(__vite_injected_original_dirname, "./src/assets")
      }
    },
    build: {
      // Bundle splitting optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            "react-vendor": ["react", "react-dom"],
            "mui-vendor": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
            "router-vendor": ["react-router-dom"],
            "utils-vendor": ["axios", "date-fns"],
            // Feature chunks
            "admin-features": [
              "./src/pages/admin/TeacherManagement.tsx",
              "./src/pages/admin/StudentManagement.tsx",
              "./src/pages/admin/ClassManagement.tsx",
              "./src/pages/admin/ParentManagement.tsx"
            ],
            "teacher-features": [
              "./src/pages/teacher/Dashboard.tsx",
              "./src/pages/teacher/MyClasses.tsx",
              "./src/pages/teacher/Schedule.tsx",
              "./src/pages/teacher/Salary.tsx"
            ],
            "student-features": [
              "./src/pages/student/Dashboard.tsx",
              "./src/pages/student/MyClasses.tsx",
              "./src/pages/student/Schedule.tsx"
            ],
            "parent-features": [
              "./src/pages/parent/Dashboard.tsx",
              "./src/pages/parent/Children.tsx",
              "./src/pages/parent/Payments.tsx"
            ],
            // Note: temporarily remove explicit common-components chunk to avoid init-order TDZ issues
            // Hooks
            "common-hooks": [
              "./src/hooks/useDebounce.ts",
              "./src/hooks/useServiceWorker.ts"
            ],
            "feature-hooks": [
              "./src/hooks/features/useTeacherManagement.ts",
              "./src/hooks/features/useTeacherForm.ts",
              "./src/hooks/features/useStudentManagement.ts",
              "./src/hooks/features/useStudentForm.ts",
              "./src/hooks/features/useClassManagement.ts",
              "./src/hooks/features/useParentManagement.ts",
              "./src/hooks/features/useParentForm.ts"
            ]
          }
        }
      },
      // Performance optimizations
      target: "es2015",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 1e3,
      // Source maps for production debugging
      sourcemap: true,
      // Assets optimization
      assetsInlineLimit: 4096,
      // CSS optimization
      cssCodeSplit: true,
      // Report bundle size
      reportCompressedSize: true
    },
    // Development server optimization
    server: {
      port: 3e3,
      open: true,
      cors: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path2) => "/api/v1" + path2.replace(/^\/api/, ""),
          secure: false,
          // ✅ Cấu hình cookie để proxy hoạt động đúng
          cookieDomainRewrite: false,
          cookiePathRewrite: false,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              const errorCode = err.code;
              if (errorCode !== "ECONNRESET" && errorCode !== "ETIMEDOUT") {
                console.error("Proxy error:", err);
              }
            });
          }
        }
      }
    },
    // Preview server
    preview: {
      port: 4173,
      open: true
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@mui/material",
        "@mui/icons-material",
        "react-router-dom",
        "axios",
        "date-fns"
      ],
      exclude: [
        // Exclude large dependencies that should be loaded separately
      ]
    },
    // Define global constants
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
      __PROD__: JSON.stringify(process.env.NODE_ENV === "production")
    },
    // Environment variables
    envPrefix: "VITE_"
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxUYWlfbGlldV9kYWlfaG9jX25hbV9WXFxcXHRtaXgtY2VudGVyLXByb2plY3RcXFxcRW5nbGlzaC1DZW50ZXItRkVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFRhaV9saWV1X2RhaV9ob2NfbmFtX1ZcXFxcdG1peC1jZW50ZXItcHJvamVjdFxcXFxFbmdsaXNoLUNlbnRlci1GRVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVGFpX2xpZXVfZGFpX2hvY19uYW1fVi90bWl4LWNlbnRlci1wcm9qZWN0L0VuZ2xpc2gtQ2VudGVyLUZFL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIC8vIExvYWQgZW52IGZpbGUgYmFzZWQgb24gYG1vZGVgIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gIFxyXG4gIC8vIEV4dHJhY3QgYmFja2VuZCBVUkwgZnJvbSBlbnYsIGZhbGxiYWNrIHRvIGRlZmF1bHRcclxuICAvLyBjb25zdCBiYWNrZW5kVXJsID0gZW52LlZJVEVfQVBJX0JBU0VfVVJMIHx8ICdodHRwOi8vMTAzLjE5OS4xOC4xMDM6ODA4MC9hcGkvdjEnO1xyXG4gIGNvbnN0IGJhY2tlbmRVcmwgPSBlbnYuVklURV9BUElfQkFTRV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hcGkvdjEnO1xyXG4gIC8vIEdldCBiYXNlIFVSTCB3aXRob3V0IC9hcGkvdjEgZm9yIHByb3h5IHRhcmdldFxyXG4gIGNvbnN0IHByb3h5VGFyZ2V0ID0gYmFja2VuZFVybC5yZXBsYWNlKC9cXC9hcGlcXC92MSQvLCAnJyk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICdAY29tcG9uZW50cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAgICdAdGVhY2hlcic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzL2ZlYXR1cmVzL3RlYWNoZXInKSxcclxuICAgICAgJ0BwYWdlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wYWdlcycpLFxyXG4gICAgICAnQHV0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzJyksXHJcbiAgICAgICdAc2VydmljZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc2VydmljZXMnKSxcclxuICAgICAgJ0Bjb250ZXh0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb250ZXh0cycpLFxyXG4gICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hvb2tzJyksXHJcbiAgICAgICdAdHlwZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdHlwZXMnKSxcclxuICAgICAgJ0Bjb25zdGFudHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29uc3RhbnRzJyksXHJcbiAgICAgICdAbGliJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2xpYicpLFxyXG4gICAgICAnQGNvbmZpZyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb25maWcnKSxcclxuICAgICAgJ0B0aGVtZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy90aGVtZScpLFxyXG4gICAgICAnQHN0eWxlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zdHlsZXMnKSxcclxuICAgICAgJ0Bhc3NldHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvYXNzZXRzJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIEJ1bmRsZSBzcGxpdHRpbmcgb3B0aW1pemF0aW9uXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gVmVuZG9yIGNodW5rc1xyXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAnbXVpLXZlbmRvcic6IFsnQG11aS9tYXRlcmlhbCcsICdAbXVpL2ljb25zLW1hdGVyaWFsJywgJ0BlbW90aW9uL3JlYWN0JywgJ0BlbW90aW9uL3N0eWxlZCddLFxyXG4gICAgICAgICAgJ3JvdXRlci12ZW5kb3InOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICd1dGlscy12ZW5kb3InOiBbJ2F4aW9zJywgJ2RhdGUtZm5zJ10sXHJcblxyXG4gICAgICAgICAgLy8gRmVhdHVyZSBjaHVua3NcclxuICAgICAgICAgICdhZG1pbi1mZWF0dXJlcyc6IFtcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL1RlYWNoZXJNYW5hZ2VtZW50LnRzeCcsXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9TdHVkZW50TWFuYWdlbWVudC50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvYWRtaW4vQ2xhc3NNYW5hZ2VtZW50LnRzeCcsXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9QYXJlbnRNYW5hZ2VtZW50LnRzeCcsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgJ3RlYWNoZXItZmVhdHVyZXMnOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy90ZWFjaGVyL0Rhc2hib2FyZC50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvdGVhY2hlci9NeUNsYXNzZXMudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL3RlYWNoZXIvU2NoZWR1bGUudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL3RlYWNoZXIvU2FsYXJ5LnRzeCcsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgJ3N0dWRlbnQtZmVhdHVyZXMnOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9zdHVkZW50L0Rhc2hib2FyZC50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvc3R1ZGVudC9NeUNsYXNzZXMudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL3N0dWRlbnQvU2NoZWR1bGUudHN4JyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICAncGFyZW50LWZlYXR1cmVzJzogW1xyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvcGFyZW50L0Rhc2hib2FyZC50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvcGFyZW50L0NoaWxkcmVuLnRzeCcsXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9wYXJlbnQvUGF5bWVudHMudHN4JyxcclxuICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgLy8gTm90ZTogdGVtcG9yYXJpbHkgcmVtb3ZlIGV4cGxpY2l0IGNvbW1vbi1jb21wb25lbnRzIGNodW5rIHRvIGF2b2lkIGluaXQtb3JkZXIgVERaIGlzc3Vlc1xyXG5cclxuICAgICAgICAgIC8vIEhvb2tzXHJcbiAgICAgICAgICAnY29tbW9uLWhvb2tzJzogW1xyXG4gICAgICAgICAgICAnLi9zcmMvaG9va3MvdXNlRGVib3VuY2UudHMnLFxyXG4gICAgICAgICAgICAnLi9zcmMvaG9va3MvdXNlU2VydmljZVdvcmtlci50cycsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgJ2ZlYXR1cmUtaG9va3MnOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VUZWFjaGVyTWFuYWdlbWVudC50cycsXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VUZWFjaGVyRm9ybS50cycsXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VTdHVkZW50TWFuYWdlbWVudC50cycsXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VTdHVkZW50Rm9ybS50cycsXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VDbGFzc01hbmFnZW1lbnQudHMnLFxyXG4gICAgICAgICAgICAnLi9zcmMvaG9va3MvZmVhdHVyZXMvdXNlUGFyZW50TWFuYWdlbWVudC50cycsXHJcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy9mZWF0dXJlcy91c2VQYXJlbnRGb3JtLnRzJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xyXG4gICAgdGFyZ2V0OiAnZXMyMDE1JyxcclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIENodW5rIHNpemUgd2FybmluZ3NcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuXHJcbiAgICAvLyBTb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiBkZWJ1Z2dpbmdcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuXHJcbiAgICAvLyBBc3NldHMgb3B0aW1pemF0aW9uXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuXHJcbiAgICAvLyBDU1Mgb3B0aW1pemF0aW9uXHJcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcblxyXG4gICAgLy8gUmVwb3J0IGJ1bmRsZSBzaXplXHJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcclxuICB9LFxyXG5cclxuICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgb3B0aW1pemF0aW9uXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAzMDAwLFxyXG4gICAgb3BlbjogdHJ1ZSxcclxuICAgIGNvcnM6IHRydWUsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6IHByb3h5VGFyZ2V0LFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gJy9hcGkvdjEnICsgcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgLy8gXHUyNzA1IENcdTFFQTV1IGhcdTAwRUNuaCBjb29raWUgXHUwMTExXHUxRUMzIHByb3h5IGhvXHUxRUExdCBcdTAxMTFcdTFFRDluZyBcdTAxMTFcdTAwRkFuZ1xyXG4gICAgICAgIGNvb2tpZURvbWFpblJld3JpdGU6IGZhbHNlLFxyXG4gICAgICAgIGNvb2tpZVBhdGhSZXdyaXRlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgLy8gXHUyNzA1IENoXHUxRUM5IGxvZyBsXHUxRUQ3aSBuZ2hpXHUwMEVBbSB0clx1MUVDRG5nLCBraFx1MDBGNG5nIGxvZyBtXHUxRUNEaSByZXF1ZXN0XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IChlcnIgYXMgYW55KS5jb2RlO1xyXG4gICAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAnRUNPTk5SRVNFVCcgJiYgZXJyb3JDb2RlICE9PSAnRVRJTUVET1VUJykge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb3h5IGVycm9yOicsIGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgLy8gXHUyNzA1IFhcdTAwRjNhIGNcdTAwRTFjIGxvZyByZXF1ZXN0L3Jlc3BvbnNlIGtoXHUwMEY0bmcgY1x1MUVBN24gdGhpXHUxRUJGdFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIFByZXZpZXcgc2VydmVyXHJcbiAgcHJldmlldzoge1xyXG4gICAgcG9ydDogNDE3MyxcclxuICAgIG9wZW46IHRydWUsXHJcbiAgfSxcclxuXHJcbiAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICdyZWFjdCcsXHJcbiAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAnQG11aS9tYXRlcmlhbCcsXHJcbiAgICAgICdAbXVpL2ljb25zLW1hdGVyaWFsJyxcclxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxyXG4gICAgICAnYXhpb3MnLFxyXG4gICAgICAnZGF0ZS1mbnMnLFxyXG4gICAgXSxcclxuICAgIGV4Y2x1ZGU6IFtcclxuICAgICAgLy8gRXhjbHVkZSBsYXJnZSBkZXBlbmRlbmNpZXMgdGhhdCBzaG91bGQgYmUgbG9hZGVkIHNlcGFyYXRlbHlcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgLy8gRGVmaW5lIGdsb2JhbCBjb25zdGFudHNcclxuICBkZWZpbmU6IHtcclxuICAgIF9fREVWX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSxcclxuICAgIF9fUFJPRF9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSxcclxuICB9LFxyXG5cclxuICAvLyBFbnZpcm9ubWVudCB2YXJpYWJsZXNcclxuICBlbnZQcmVmaXg6ICdWSVRFXycsXHJcbn07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVYLFNBQVMsY0FBYyxlQUFlO0FBQzdaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBSTNDLFFBQU0sYUFBYSxJQUFJLHFCQUFxQjtBQUU1QyxRQUFNLGNBQWMsV0FBVyxRQUFRLGNBQWMsRUFBRTtBQUV2RCxTQUFPO0FBQUEsSUFDUCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLFFBQ3BDLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLFFBQ3pELFlBQVksS0FBSyxRQUFRLGtDQUFXLG1DQUFtQztBQUFBLFFBQ3ZFLFVBQVUsS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxRQUMvQyxVQUFVLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDL0MsYUFBYSxL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
