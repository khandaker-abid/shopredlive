const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  setupFilesAfterFramework: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathPattern: ['<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx}',
    'src/lib/**/*.{js,jsx}',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customConfig);
