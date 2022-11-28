import { Plugin } from "obsidian";

import { CustomClipboardEvent, CustomDragEvent } from "@app/events";
import { CloudUploaderSettings, DEFAULT_SETTINGS } from "@app/settings";
import { handleUploadEvent } from "@app/utils";
import { CloudinaryProvider } from "@app/providers/cloudinary";

import type { IProvider } from "@app/providers/manager";

declare module "obsidian" {
  interface MarkdownSubView {
    clipboardManager: {
      handlePaste(e: ClipboardEvent): void;
      handleDrop(e: DragEvent): void;
    };
  }
}

export default class CloudUploader extends Plugin {
  settings: typeof DEFAULT_SETTINGS;
  provider: IProvider;

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on("editor-paste", (event, editor, markdownView) => {
        handleUploadEvent({
          event,
          editor,
          provider: this.provider,
          eventAllowDefault: (dataTransfer) => {
            markdownView.currentMode.clipboardManager.handlePaste(
              new CustomClipboardEvent(event.type, {
                clipboardData: dataTransfer,
              })
            );
          },
        });
      })
    );

    this.registerEvent(
      this.app.workspace.on("editor-drop", (event, editor, markdownView) => {
        handleUploadEvent({
          event,
          editor,
          provider: this.provider,
          eventAllowDefault: (dataTransfer) => {
            markdownView.currentMode.clipboardManager.handleDrop(
              new CustomDragEvent(event.type, {
                clientX: event.clientX,
                clientY: event.clientY,
                dataTransfer,
              })
            );
          },
        });
      })
    );

    this.addSettingTab(new CloudUploaderSettings(this.app, this));
  }

  private setProvider() {
    switch (this.settings.provider) {
      case "cloudinary":
        this.provider = new CloudinaryProvider(this.settings.cloudinary);
    }
  }

  private async loadSettings() {
    this.settings = await Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );

    this.setProvider();
  }

  async saveSettings() {
    await this.saveData(this.settings);

    this.setProvider();
  }

  onunload() {}
}
