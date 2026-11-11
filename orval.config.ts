import { defineConfig } from 'orval';

export default defineConfig({
  eventsWorld: {
    input: './src/app/core/api/openapi.json',
    output: {
      mode: 'split',
      target: './src/app/core/api/generated/endpoints.ts',
      schemas: './src/app/core/api/generated/models',
      client: 'angular',
      clean: true,
    },
  },
});
