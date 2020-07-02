import {Platform} from 'react-native';
import semver from 'semver';
import {
  assert,
  is,
  object,
  array,
  boolean,
  string,
  optional,
  union,
  literal,
  record,
  StructType,
} from 'superstruct';
import AsyncStorage from '@react-native-community/async-storage';

const LocalizedTextScheme = object({
  language: optional(string()),
  text: string(),
});

const ActionDismissScheme = object({
  type: literal('dismiss'),
});
const ActionPlatformLinkScheme = record(string(), string());

const ActionLinkScheme = object({
  type: literal('link'),
  value: union([string(), ActionPlatformLinkScheme]),
});

const ActionResolvedLinkScheme = object({
  type: literal('link'),
  value: string(),
});

const ActionScheme = union([ActionDismissScheme, ActionLinkScheme]);
const ActionResolvedScheme = union([
  ActionDismissScheme,
  ActionResolvedLinkScheme,
]);

const ButtonScheme = object({
  title: array(LocalizedTextScheme),
  action: optional(ActionScheme),
});

const MaydayScheme = object({
  id: string(),
  startup: optional(boolean()),
  resume: optional(boolean()),
  repeat: optional(boolean()),
  version: optional(string()),
  title: optional(array(LocalizedTextScheme)),
  message: array(LocalizedTextScheme),
  buttons: optional(array(ButtonScheme)),
});

export type MaydayData = StructType<typeof MaydayScheme>;
export type LocalizedText = StructType<typeof LocalizedTextScheme>;
export type ButtonAction = StructType<typeof ActionResolvedScheme>;

class Mayday {
  private data: MaydayData;
  constructor(data: MaydayData) {
    assert(data, MaydayScheme);
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  title(language?: string) {
    return this.findLocalized(this.data.title, language);
  }
  message(language?: string) {
    return this.findLocalized(this.data.message, language) || '';
  }
  buttons(language?: string) {
    if (!this.data.buttons || this.data.buttons.length === 0) {
      return;
    }
    return this.data.buttons.map((button) => ({
      ...button,
      title: this.findLocalized(button.title, language) || '',
      action: this.buttonAction(button.action),
    }));
  }
  localized(language?: string) {
    return {
      message: this.message(language),
      title: this.title(language),
      buttons: this.buttons(language),
    };
  }
  async validAtStartup(version: string) {
    return (
      this.data.startup !== false &&
      this.validForVersion(version) &&
      (this.data.repeat !== false || !(await this.isShown()))
    );
  }
  async validAtResume(version: string) {
    return (
      this.data.resume !== false &&
      this.validForVersion(version) &&
      (this.data.repeat !== false || !(await this.isShown()))
    );
  }
  shown() {
    return AsyncStorage.setItem(
      `Mayday-${this.data.id}`,
      new Date().toISOString(),
    );
  }

  private validForVersion(version: string) {
    return !this.data.version || semver.satisfies(version, this.data.version);
  }
  private async isShown() {
    const value = await AsyncStorage.getItem(`Mayday-${this.data.id}`);
    return !!value;
  }
  private findLocalized(data?: LocalizedText[], language?: string) {
    if (!data || data.length === 0) {
      return;
    }
    if (language) {
      const found = data.find(
        (message: LocalizedText) => message.language === language,
      );
      if (found) {
        return found.text;
      }
    }
    const found = data.find((message: LocalizedText) => !message.language);
    if (found) {
      return found.text;
    }
    return data[0].text;
  }
  private buttonAction(action?: StructType<typeof ActionScheme>) {
    if (
      action &&
      action.type === 'link' &&
      is(action.value, ActionPlatformLinkScheme)
    ) {
      return {
        ...action,
        value: action.value[Platform.OS],
      };
    }
    return action as StructType<typeof ActionResolvedLinkScheme>;
  }
}

export default Mayday;
