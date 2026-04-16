import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',

  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  preset: 'ts-jest',

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  collectCoverage: true,

  coverageDirectory: "coverage",

  coveragePathIgnorePatterns: [
    "components",
    "features",
    "hooks",
    "auth",
    "lib",
    "node_modules",
  ],

  transformIgnorePatterns: [
    '/node_modules/(?!(@auth|next-auth|lucide-react|@babel|nanoid|uuid)/)',
  ],
}

export default createJestConfig(config)