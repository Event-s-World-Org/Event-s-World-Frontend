// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

const FEATURES = ['public', 'participant', 'auth', 'organizer', 'admin', 'dev'];

const featureBoundaryConfigs = FEATURES.map((feature) => {
  const otherFeatures = FEATURES.filter((f) => f !== feature);
  const restrictedPatterns = otherFeatures.flatMap((other) => [
    `**/features/${other}`,
    `**/features/${other}/**`,
    `../${other}`,
    `../${other}/**`,
    `../../${other}/**`,
  ]);

  return {
    files: [
      `src/app/features/${feature}/**/*.ts`,
      `**/src/app/features/${feature}/**/*.ts`,
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: restrictedPatterns,
              message: `Feature "${feature}" cannot import from another feature. Move shared code to shared/ or core/.`,
            },
          ],
        },
      ],
    },
  };
});

export default tseslint.config(
  {
    ignores: ['src/app/core/api/generated/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          // Attribute selectors keep native semantics, e.g. <button app-button>.
          type: ['element', 'attribute'],
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  ...featureBoundaryConfigs,
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
