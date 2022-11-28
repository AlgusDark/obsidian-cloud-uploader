# Cloud uploader

This plugins is under development. Cloudinary is the only provider at the moment

## TODO / Ideas

- [ ] Multiple Providers
  - Maybe activate several providers and have rules per provider, e.g use a specific provider per folder (maybe private notes on paid provider and public ones in free server).
- [ ] Offline first
  - Save images localy and upload them.
    - `Plugin#.app.vault.configDir` has the .obsidian folder
    - `Plugin#.app.vault.writeBinary` for writing a binary file
    - `Plugin#.app.vault.config.attachmentFolderPath` has the attachment folder path
    - [More info](https://github.com/aleksey-rezvov/obsidian-local-images/blob/master/src/contentProcessor.ts)
  - Parse offline images to be previewed if exists, download if not
    - There should be a render-hook for all images 🤔
    - [Maybe this?](https://github.com/bicarlsen/obsidian_image_caption/blob/main/src/view_observer.ts)
