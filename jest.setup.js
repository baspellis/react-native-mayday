/* global jest */
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

// jest.mock('react-native', () => jest.fn());

global.fetch = require('jest-fetch-mock');
