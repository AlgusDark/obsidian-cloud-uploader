export class CustomClipboardEvent extends ClipboardEvent {
  constructor(type: string, eventInitDict: ClipboardEventInit) {
    super(type, eventInitDict);
  }
}

export class CustomDragEvent extends DragEvent {
  constructor(type: string, eventInitDict: DragEventInit) {
    super(type, eventInitDict);
  }
}
