import {
  CloudinaryProvider,
  DEFAULT_SETTINGS as CLOUDINARY_SETTINGS,
} from "@app/providers/cloudinary";

export interface IProviders {
  cloudinary: {
    settings: typeof CLOUDINARY_SETTINGS;
    provider: CloudinaryProvider;
  };
}

type GetProvider<T extends keyof IProviders[keyof IProviders]> =
  keyof IProviders extends infer K
    ? K extends keyof IProviders
      ? IProviders[K][T]
      : never
    : never;

export type IProvider = GetProvider<"provider">;

interface UploadParams {
  file: File;
  uuid: string;
}

export abstract class ProviderBase<T extends GetProvider<"settings">> {
  protected settings: T;

  constructor(settings: T) {
    this.settings = settings;
  }

  abstract upload(uploadParams: UploadParams): Promise<string>;
}
