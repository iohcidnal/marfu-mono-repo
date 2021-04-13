module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true
};
