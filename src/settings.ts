import { App, PluginSettingTab, Setting } from "obsidian";

import CloudUploader from "@app/main";
import {
  CloudinarySettings,
  DEFAULT_SETTINGS as CLOUDINARY_SETTINGS,
} from "@app/providers/cloudinary";
import { capitalize } from "@app/utils";
import { IProviders } from "@app/providers/manager";

export type ICloudUploaderSettings = keyof IProviders extends infer K
  ? K extends keyof IProviders
    ? { provider: K } & { [key in K]: IProviders[K]["settings"] }
    : never
  : never;

export const DEFAULT_SETTINGS: ICloudUploaderSettings = {
  provider: "cloudinary",
  cloudinary: { ...CLOUDINARY_SETTINGS },
};

export class CloudUploaderSettings extends PluginSettingTab {
  plugin: CloudUploader;

  constructor(app: App, plugin: CloudUploader) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const $container = this.containerEl;

    $container.empty();
    $container.createEl("h1", { text: "Cloud Uploader Settings" });

    new Setting($container)
      .setName("Cloud Provider")
      .setDesc("Choose a cloud provider to upload your media")
      .addDropdown(($dropdown) => {
        for (let [provider] of Object.entries(this.plugin.settings)) {
          if (provider !== "provider") {
            $dropdown.addOption(provider, capitalize(provider));
          }
        }

        $dropdown.setValue(this.plugin.settings.provider);

        $dropdown.onChange(
          async (value: typeof this.plugin.settings.provider) => {
            this.plugin.settings.provider = value;
            await this.plugin.saveSettings();
            this.display();
          }
        );
      });

    const $div = $container.createDiv();
    $div.addClass("cloud-provider-setting-item");

    switch (this.plugin.settings.provider) {
      case "cloudinary":
        return new CloudinarySettings($div, this.plugin);
    }
  }
}
