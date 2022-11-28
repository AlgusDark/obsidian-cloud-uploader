import { Editor, Notice } from "obsidian";
import { CustomClipboardEvent, CustomDragEvent } from "@app/events";

import type { IProvider } from "@app/providers/manager";

export function replaceText(
  editor: Editor,
  line: number,
  target: string,
  replacement: string
): void {
  function replaceRange(line: number, ch: number) {
    const from = { line, ch };
    const to = { line, ch: ch + target.length };

    editor.replaceRange(replacement, from, to);
  }

  let ch = editor.getLine(line).indexOf(target);

  // Direct replacement
  if (ch !== -1) {
    return replaceRange(line, ch);
  } else {
    // lookup replacement
    // TODO: How about creating an observer for the line?
    for (let i = 0; i < editor.lineCount(); i++) {
      const ch = editor.getLine(i).indexOf(target);
      if (ch !== -1) {
        return replaceRange(i, ch);
      }
    }
  }

  // TODO: If not found; let's add the image at the bottom of the page
}

interface UploadEventParams {
  event: ClipboardEvent | DragEvent;
  editor: Editor;
  provider: IProvider;
  eventAllowDefault: (dataTransfer: DataTransfer) => void;
}

export function handleUploadEvent({
  event,
  editor,
  provider,
  eventAllowDefault,
}: UploadEventParams) {
  if (event instanceof CustomClipboardEvent || event instanceof CustomDragEvent)
    return;

  let data;

  if (event instanceof ClipboardEvent) {
    data = event.clipboardData;
  } else {
    data = event.dataTransfer;
  }

  if (data?.files.length) {
    event.preventDefault();

    const { files } = data;
    let dataTransfer;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image")) {
        if (!dataTransfer) {
          dataTransfer = new DataTransfer();
        }

        dataTransfer.items.add(file);
        continue;
      }

      const uuid: string = self.crypto.randomUUID();
      const placeholder = `![uploading...](${uuid})`;

      if (editor.getLine(editor.getCursor().line).length != 0) {
        editor.setCursor(editor.lineCount(), 0);
        editor.replaceSelection("\n");
      }

      editor.replaceSelection(placeholder);
      const line = editor.getCursor().line;

      // TODO: Limit batch uploads
      console.log("sup");
      provider
        .upload({ file, uuid })
        .then((url) => {
          replaceText(editor, line, placeholder.trim(), `![](${url})`);
        })
        .catch((error) => new Notice(error, 5000));
    }

    if (dataTransfer?.files.length) {
      if (editor.getLine(editor.getCursor().line).length != 0) {
        editor.setCursor(editor.lineCount(), 0);
        editor.replaceSelection("\n");
      }

      eventAllowDefault(dataTransfer);
    }
  }
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
