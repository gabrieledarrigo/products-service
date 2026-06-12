import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      moduleFileExtensions: ['ts', 'js', 'json'],
      rootDir: 'src',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      collectCoverage: false,
      testEnvironment: 'node',
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true,
    },
    {
      displayName: 'e2e',
      moduleFileExtensions: ['ts', 'js', 'json'],
      rootDir: 'e2e',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.e2e.json' }],
      },
      testEnvironment: 'node',
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true,
    },
  ],
};

export default config;
