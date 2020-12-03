import { ItemView, WorkspaceLeaf } from 'obsidian';

import { VIEW_TYPE_TADA } from './constants';
import Item from './item';

export default class View extends ItemView {
  private domNodes: HTMLDivElement[];

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.domNodes = [];
  }

  getViewType(): string {
   return VIEW_TYPE_TADA;
  }

  getDisplayText(): string {
    return 'TADA list';
  }

  getIcon() {
    return 'tada-list-icon';
  }

  update(items: { [fileName: string]: Item[] }) {
    this.removeItems();
    this.drawItems(items);
  }

  removeItems() {
    Array
      .from(this.domNodes)
      .forEach(n => this.containerEl.children[1].removeChild(n));

    this.domNodes = [];
  }

  drawItems(itemsByFile: { [fileName: string]: Item[] }) {
    // <div class='tada-list-container'>
    //  <h3>{fileName}</h3>
    //   <ul class='tada-list'>
    //     <li class='tada-list-item'>
    //       <input type='checkbox' class='tada-list-item-checkbox' checked={item.checked} />
    //       <label class='tada-list-item [is-checked]'>{i.content}</label>
    //     </li>
    //     ...
    //   </ul>
    // </div>
    // <div>
    //   ...
    // </div>
    for (const [fileName, items] of Object.entries(itemsByFile)) {
      const div = this.containerEl.children[1].createEl('div');
      div.className = 'tada-list-container';

      const header = this.containerEl.children[1].createEl('h4');
      header.className = 'tada-list-header';
      header.innerHTML = fileName;
      div.appendChild(header);

      const ul = this.containerEl.children[1].createEl('ul');
      ul.className = 'tada-list';

      for (let i of items) {
        const li = this.containerEl.children[1].createEl('li');
        li.className = 'tada-list-item';

        const checkbox = this.containerEl.createEl('input');
        checkbox.setAttr('type', 'checkbox');
        checkbox.className = 'tada-list-item-checkbox';
        checkbox.checked = i.checked;
        checkbox.disabled = true;
        li.appendChild(checkbox);

        const label = this.containerEl.createEl('label');
        label.innerHTML = i.content;
        label.className = i.checked ? 'tada-list-item is-checked' : 'tada-list-item';
        li.appendChild(label);
        ul.appendChild(li);
      }

      div.appendChild(ul);
      this.domNodes.push(div);
    }
  }
};
