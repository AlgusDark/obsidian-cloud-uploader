import { Setting } from "obsidian";

import CloudUploader from "@app/main";
import { ProviderBase } from "@app/providers/manager";

interface ICloudinarySettings {
  cloud_name: string;
  upload_preset: string;
  folder: string;
  use_formatter: boolean;
  formatter: string;
}

export const DEFAULT_SETTINGS: ICloudinarySettings = {
  cloud_name: "",
  upload_preset: "",
  folder: "",
  use_formatter: false,
  formatter:
    "https://{host}/{cloud_name}/{resource_type}/{type}/v{version}/{public_id}.{format}#{width}x{height},{colors|3}",
};

export class CloudinarySettings<T extends CloudUploader> {
  $container: HTMLElement;
  plugin: T;
  settings: ICloudinarySettings;

  constructor(container: HTMLElement, plugin: T) {
    this.$container = container;
    this.plugin = plugin;

    this.settings = {
      ...DEFAULT_SETTINGS,
      ...this.plugin.settings.cloudinary,
    };

    this.display();
  }

  display() {
    this.$container.empty();
    const settings = this.settings;

    new Setting(this.$container)
      .setName("Cloud Name")
      .setDesc("The name of your Cloudinary Cloud Account")
      .addText((text) => {
        text
          .setPlaceholder("")
          .setValue(settings.cloud_name)
          .onChange(async (value) => {
            settings.cloud_name = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(this.$container)
      .setName("Cloudinary Upload Template")
      .setDesc("Cloudinary Upload Preference string")
      .addText((text) => {
        text
          .setPlaceholder("")
          .setValue(settings.upload_preset)
          .onChange(async (value) => {
            try {
              settings.upload_preset = value;
              await this.plugin.saveSettings();
            } catch (e) {
              console.log(e);
            }
          });
      });

    new Setting(this.$container)
      .setName("Cloudinary Upload Folder")
      .setDesc(
        "Folder name to use in Cloudinary.  Note, this will be ignored if you have a folder set in your Cloudinary Upload Preset"
      )
      .addText((text) => {
        text
          .setPlaceholder("")
          .setValue(settings.folder)
          .onChange(async (value) => {
            try {
              settings.folder = value;
              await this.plugin.saveSettings();
            } catch (e) {
              console.log(e);
            }
          });
      });

    new Setting(this.$container)
      .setName("Use formatter")
      .setDesc(
        "A formatter defines the final url of your image. By default it returns the URL without any special changes."
      )
      .addToggle((toggle) => {
        toggle
          .setValue(settings.use_formatter)
          .onChange(async (enable_formatter) => {
            settings.use_formatter = enable_formatter;
            await this.plugin.saveSettings();
            this.display();
          });
      });

    const formatterSettings = new Setting(this.$container).addText((text) => {
      text
        .setPlaceholder("")
        .setValue(settings.formatter)
        .onChange(async (value) => {
          try {
            settings.formatter = value;
            await this.plugin.saveSettings();
          } catch (e) {
            console.log(e);
          }
        })
        .inputEl.addClass("cloud-flex-full");
    });

    formatterSettings.settingEl.toggle(settings.use_formatter);
    formatterSettings.controlEl.addClass("cloud-full-width");
    formatterSettings.infoEl.remove();

    return this.$container;
  }
}

interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: Array<string>;
  pages: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  access_mode: string;
  existing: boolean;
  colors: [string, number][];
  [futureKey: string]: any;
}

export class CloudinaryProvider extends ProviderBase<ICloudinarySettings> {
  settings: ICloudinarySettings;

  constructor(settings: ICloudinarySettings) {
    super(settings);
  }

  upload({ file, uuid }: { file: File; uuid: string }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.settings.upload_preset);
    formData.append("public_id", uuid);
    formData.append("folder", this.settings.folder);

    const API_URL = `https://api.cloudinary.com/v1_1/${this.settings.cloud_name}/auto/upload`;

    return fetch(API_URL, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((json: CloudinaryUploadResponse) => {
        if (!this.settings.formatter || !this.settings.use_formatter)
          return json.secure_url;

        const regex = /{({*[^{}]*}*)}/g;

        return this.settings.formatter.replace(regex, (_, $1) => {
          if ($1.includes("colors")) {
            return json.colors
              .reduce<[string?]>((prev, current) => {
                prev.push(current[0].substring(1));
                return prev;
              }, [])
              .slice(0, $1.split("|")[1])
              .join(",");
          }

          switch ($1) {
            case "host":
              return new URL(json.secure_url).host;
            case "cloud_name":
              return this.settings.cloud_name;
            default:
              return json[$1];
          }
        });
      });
  }
}
