export default class Item {
  content: string;
  checked: boolean;

  constructor(content: string, checked: boolean) {
    this.content = content;
    this.checked = checked;
  }
};
