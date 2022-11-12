import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.base');

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	modulePaths: ['<rootDir>'],
	roots: ['<rootDir>'],
};
