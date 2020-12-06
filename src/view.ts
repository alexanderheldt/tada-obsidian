import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';

import { VIEW_TYPE_TADA } from './constants';
import Item from './item';

const selectedItemEvent = new Event('selected-item');

export default class View extends ItemView {
  selectedItems: { [fileName: string]: Item[] };

  private plugin: Plugin;

  private itemLists: HTMLDivElement;
  private selectedItemsList: HTMLDivElement;

  constructor(plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf);

    this.plugin = plugin;

    const container = this.containerEl.children[1].createEl('div');
    container.className = 'tada-container';

    const selectedItemsList = container.createEl('div');
    selectedItemsList.className = 'tada-selected-list';
    selectedItemsList.addEventListener('selected-item', this.updateSelectedItems.bind(this));
    this.selectedItemsList = selectedItemsList;

    const itemLists = container.createEl('div');
    itemLists.className = 'tada-lists';
    this.itemLists = itemLists;
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

  async onload() {
    this.selectedItems = await this.plugin.loadData() || {};
  }

  async onunload() {
    await this.plugin.saveData(this.selectedItems);
  }

  removeItemsFrom(parent: HTMLDivElement) {
    parent
      .querySelectorAll('.tada-list')
      .forEach(n => n.remove());
  }

  updateSelectedItems() {
    this.removeItemsFrom(this.selectedItemsList);
    this.drawSelectedItems(this.selectedItems);
  }

  update(items: { [fileName: string]: Item[] }) {
    this.removeItemsFrom(this.itemLists);
    this.drawAllItems(items);

    this.updateSelectedItems();
  }

  drawSelectedItems(selectedItems: { [fileName: string]: Item[] }) {
    for (const [fileName, selected] of Object.entries(selectedItems)) {
      if (!selected.length) {
        continue;
      }

      const list = this.selectedItemsList.createEl('div');
      list.className = 'tada-list';

      const listHeader = list.createEl('h3');
      listHeader.className = 'tada-list-header';
      listHeader.innerHTML = fileName;
      listHeader.onclick = () => this.app.workspace.openLinkText(fileName, fileName);

      const ul = list.createEl('ul');

      for (let s of selected) {
        const li = ul.createEl('li');
        li.className = 'tada-list-item';
        li.onclick = ((fileName: string, s: Item) => {
          this.selectedItems[fileName] = this.selectedItems[fileName].filter(i => i !== s);
          this.selectedItemsList.dispatchEvent(selectedItemEvent);
        }).bind(this, fileName, s);

        const checkbox = li.createEl('input');
        checkbox.setAttr('type', 'checkbox');
        checkbox.className = 'tada-list-item-checkbox';
        checkbox.checked = s.checked;
        checkbox.disabled = true;

        const label = li.createEl('label');
        label.innerHTML = s.content;
        label.className = s.checked ? 'tada-list-item is-checked' : 'tada-list-item';
      }
    }
  }

  drawAllItems(allItems: { [fileName: string]: Item[] }) {
    for (const [fileName, items] of Object.entries(allItems)) {
      const list = this.itemLists.createEl('div');
      list.className = 'tada-list';

      const listHeader = list.createEl('h3');
      listHeader.className = 'tada-list-header';
      listHeader.innerHTML = fileName;
      listHeader.onclick = () => this.app.workspace.openLinkText(fileName, fileName);

      const ul = list.createEl('ul');
      ul.className = 'tada-list';

      for (let i of items) {
        if (this.selectedItems[fileName]) {
          // Update the already selected item to keep `checked` in sync
          this.selectedItems[fileName].forEach(s => {
            if (s.content === i.content) {
              s.checked = i.checked;
            }
          });
        }

        const li = ul.createEl('li');
        li.className = 'tada-list-item';
        li.onclick = () => {
          if (!this.selectedItems[fileName]) {
            this.selectedItems[fileName] = [];
          }

          // Item is already selected
          if (this.selectedItems[fileName].indexOf(i) >= 0) {
            return;
          };

          this.selectedItems[fileName].push(i);
          this.selectedItemsList.dispatchEvent(selectedItemEvent);
        }

        const checkbox = li.createEl('input');
        checkbox.setAttr('type', 'checkbox');
        checkbox.className = 'tada-list-item-checkbox';
        checkbox.checked = i.checked;
        checkbox.disabled = true;

        const label = li.createEl('label');
        label.innerHTML = i.content;
        label.className = i.checked ? 'tada-list-item is-checked' : 'tada-list-item';
      }
    }
  }
};
