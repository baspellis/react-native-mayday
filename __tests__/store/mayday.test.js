import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import Mayday from '../../src/store/mayday';

test('Mayday with invalid data throws an error ', () => {
  expect(() => new Mayday('invalid')).toThrow();
  expect(() => new Mayday({})).toThrow();
  expect(
    () =>
      new Mayday({
        id: 1,
        message: [
          {
            text: 'Hello world',
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        message: 'Hello world',
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        repeat: 1,
        message: [
          {
            text: 'Hello world',
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        version: 1,
        message: [
          {
            text: 'Hello world',
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        invalid: true,
        message: [
          {
            text: 'Hello world',
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        message: [
          {
            text: 'Hello world',
          },
        ],
        buttons: [
          {
            action: {
              type: 'dismiss',
            },
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        message: [
          {
            text: 'Hello world',
          },
        ],
        buttons: [
          {
            title: [
              {
                text: 'Hellow world',
              },
            ],
            action: {
              type: 'invalid',
            },
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        message: [
          {
            text: 'Hello world',
          },
        ],
        buttons: [
          {
            title: [
              {
                text: 'Hellow world',
              },
            ],
            action: {
              type: 'link',
            },
          },
        ],
      }),
  ).toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        message: [
          {
            text: 'Hello world',
          },
        ],
      }),
  ).not.toThrow();
  expect(
    () =>
      new Mayday({
        id: '1',
        startup: true,
        resume: false,
        repeat: true,
        version: '1.0',
        title: [
          {
            language: 'en',
            text: 'Hello world',
          },
        ],
        message: [
          {
            text: 'Hello world',
          },
        ],
        buttons: [
          {
            title: [
              {
                text: 'Hellow world',
              },
            ],
            action: {
              type: 'link',
              value: 'localhost',
            },
          },
        ],
      }),
  ).not.toThrow();
});

test('Mayday missing configuration is shown at startup and resume', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(await mayday.validAtStartup()).toBe(true);
  expect(await mayday.validAtResume()).toBe(true);
});

test('Startup mayday is only shown at startup', async () => {
  const mayday = new Mayday({
    id: '1',
    resume: false,
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(await mayday.validAtStartup()).toBe(true);
  expect(await mayday.validAtResume()).toBe(false);
});

test('Resume mayday is only shown at resume', async () => {
  const mayday = new Mayday({
    id: '1',
    startup: false,
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(await mayday.validAtStartup()).toBe(false);
  expect(await mayday.validAtResume()).toBe(true);
});

test('Mayday missing configuration is shown at all versions', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(await mayday.validAtStartup('1.0.1')).toBe(true);
  expect(await mayday.validAtStartup('2.1')).toBe(true);
  expect(await mayday.validAtResume('1.0.1')).toBe(true);
  expect(await mayday.validAtResume('2.1')).toBe(true);
});

test('Mayday with version is shown for correct versions', async () => {
  const mayday = new Mayday({
    id: '1',
    version: '>1.x',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(await mayday.validAtStartup('1.0.1')).toBe(false);
  expect(await mayday.validAtStartup('2.1.0')).toBe(true);
  expect(await mayday.validAtResume('1.0.1')).toBe(false);
  expect(await mayday.validAtResume('2.1.0')).toBe(true);
});

test('Mayday missing configuration is shown repeatedly', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  jest.mock('@react-native-community/async-storage');
  AsyncStorage.getItem.mockResolvedValue();
  expect(await mayday.validAtStartup()).toBe(true);
  AsyncStorage.getItem.mockResolvedValue('1');
  expect(await mayday.validAtStartup()).toBe(true);
});

test('Mayday without repeat is shown once at startup', async () => {
  const mayday = new Mayday({
    id: '1',
    repeat: false,
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  AsyncStorage.getItem.mockResolvedValue();
  expect(await mayday.validAtStartup()).toBe(true);
  AsyncStorage.getItem.mockResolvedValue('1');
  expect(await mayday.validAtStartup()).toBe(false);
});

test('Mayday without repeat is shown once at resume', async () => {
  const mayday = new Mayday({
    id: '1',
    repeat: false,
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  AsyncStorage.getItem.mockResolvedValue();
  expect(await mayday.validAtResume()).toBe(true);
  AsyncStorage.getItem.mockResolvedValue('1');
  expect(await mayday.validAtResume()).toBe(false);
});

test('Mayday returns default localization when no language is specified', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        language: 'nl',
        text: 'Hallo wereld',
      },
      {
        text: 'Hello world',
      },
    ],
  });
  expect(mayday.localized()).toHaveProperty('message', 'Hello world');
});

test('Mayday returns first localization when no language is specified', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        language: 'nl',
        text: 'Hallo wereld',
      },
      {
        language: 'en',
        text: 'Hello world',
      },
    ],
  });
  expect(mayday.localized()).toHaveProperty('message', 'Hallo wereld');
});

test('Mayday returns specified localization when language is specified', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
      {
        language: 'nl',
        text: 'Hallo wereld',
      },
    ],
  });
  expect(mayday.localized('nl')).toHaveProperty('message', 'Hallo wereld');
});

test('Mayday returns first localization when language is specified but not found', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        language: 'en',
        text: 'Hello world',
      },
      {
        language: 'nl',
        text: 'Hallo wereld',
      },
    ],
  });
  expect(mayday.localized('fr')).toHaveProperty('message', 'Hello world');
});

test('Mayday returns title correctly', async () => {
  const mayday1 = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(mayday1.title()).toBe();
  expect(mayday1.localized()).toHaveProperty('title');
  const mayday2 = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
    title: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(mayday2.title()).toBe('Hello world', undefined);
  expect(mayday2.localized()).toHaveProperty('title', 'Hello world');
});

test('Mayday returns no buttons if none specified', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  expect(mayday.buttons()).toEqual(undefined);
  expect(mayday.localized()).toHaveProperty('buttons', undefined);
});

test('Mayday returns localized button', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
    buttons: [
      {
        title: [
          {
            text: 'Hello world',
          },
          {
            language: 'nl',
            text: 'Hallo wereld',
          },
        ],
      },
    ],
  });
  expect(mayday.buttons('nl')).toEqual([
    {
      title: 'Hallo wereld',
    },
  ]);
  expect(mayday.localized()).toHaveProperty('buttons');
});

test('Mayday returns platform spcific button link', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
    buttons: [
      {
        title: [
          {
            text: 'Hello world',
          },
        ],
        action: {
          type: 'link',
          value: {
            ios: 'ioslink',
            android: 'androidlink',
          },
        },
      },
    ],
  });
  Platform.OS = 'android';
  expect(mayday.buttons('nl')).toEqual([
    {
      title: 'Hello world',
      action: {
        type: 'link',
        value: 'androidlink',
      },
    },
  ]);
  Platform.OS = 'ios';
  expect(mayday.buttons('nl')).toEqual([
    {
      title: 'Hello world',
      action: {
        type: 'link',
        value: 'ioslink',
      },
    },
  ]);
});

test('Mayday marks as shown correctly', async () => {
  const mayday = new Mayday({
    id: '1',
    message: [
      {
        text: 'Hello world',
      },
    ],
  });
  await mayday.shown();
  expect(AsyncStorage.setItem).toBeCalled();
});
