import Mayday, {MaydayData, ButtonAction} from './mayday';

export {Mayday};
export type MayDayButtonAction = ButtonAction;

class Store {
  protected loading = false;
  readonly version: string;
  readonly url: string;
  protected messages: Mayday[] = [];

  constructor(url: string, version: string) {
    this.url = url;
    this.version = version;
  }

  get isLoaded() {
    return !this.loading;
  }

  async startupMayday() {
    const index = (
      await Promise.all(
        this.messages.map((message: Mayday) =>
          message.validAtStartup(this.version),
        ),
      )
    ).findIndex((valid: boolean) => valid);
    if (index >= 0) {
      return this.messages[index];
    }
  }

  async resumeMayday() {
    const index = (
      await Promise.all(
        this.messages.map((message: Mayday) =>
          message.validAtResume(this.version),
        ),
      )
    ).findIndex((valid: boolean) => valid);
    if (index >= 0) {
      return this.messages[index];
    }
  }

  async load() {
    this.loading = true;
    const response = await fetch(this.url);
    try {
      this.messages = (await response.json()).map(
        (data: MaydayData) => new Mayday(data),
      );
    } catch (error) {
      this.loading = false;
      throw error;
    }
    this.loading = false;
    return this.messages;
  }
}

export default Store;
