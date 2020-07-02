import AsyncStorage from '@react-native-community/async-storage';
import Store from '../../src/store';

beforeEach(() => {
  fetch.resetMocks();
});

test('Valid data is loaded correctly', async () => {
  const store = new Store('localhost', '1.0.0');
  const maydays = [
    {
      id: '1',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '2',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(maydays));
  await expect(store.load()).resolves.not.toThrow();
});

test('Invalid data throws an error', async () => {
  const store = new Store('localhost', '1.0.0');
  const maydays = [
    {
      id: 1,
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(maydays));
  await expect(store.load).rejects.toThrow();
  fetch.mockResponseOnce('invalid');
  await expect(store.load).rejects.toThrow();
});

test('Return loading property correctly for valid data', async () => {
  const store = new Store('localhost', '1.0.0');
  fetch.mockResponseOnce('[]');
  expect(store.loading).toBe(false);
  const loading = store.load();
  expect(store.loading).toBe(true);
  try {
    await loading;
  } catch (error) {}
  expect(store.loading).toBe(false);
});

test('Return loading property correctly for invalid data', async () => {
  const store = new Store('localhost', '1.0.0');
  fetch.mockResponseOnce('invalid');
  expect(store.loading).toBe(false);
  const loading = store.load();
  expect(store.loading).toBe(true);
  await expect(loading).rejects.toThrow();
  expect(store.loading).toBe(false);
});

test('Returns first valid message on startup', async () => {
  const store = new Store('localhost', '1.0.0');
  const maydays = [
    {
      id: '1',
      startup: false,
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '2',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '3',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(maydays));
  await store.load();
  expect(await store.startupMayday()).toHaveProperty('id', '2');
});

test('Returns first valid message on resume', async () => {
  const store = new Store('localhost', '1.0.0');
  const maydays = [
    {
      id: '1',
      resume: false,
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '2',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '3',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(maydays));
  await store.load();
  expect(await store.resumeMayday()).toHaveProperty('id', '2');
});

test('Returns no message if none are valid', async () => {
  const store = new Store('localhost', '1.0.0');
  const maydays = [
    {
      id: '1',
      startup: false,
      resume: false,
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '2',
      version: '2.0.1',
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
    {
      id: '3',
      repeat: false,
      message: [
        {
          text: 'Hello world',
        },
      ],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(maydays));
  AsyncStorage.getItem.mockResolvedValue('1');
  await store.load();
  expect(await store.startupMayday()).toBe();
  expect(await store.resumeMayday()).toBe();
});
