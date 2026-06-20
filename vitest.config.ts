import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), {
    test: {
      server: {
        deps: {
          inline: [/element-plus/]
        }
      }
    }
  })
);
