import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';

import { VIEW_TYPE_TADA } from './constants';
import Item from './item';

export default class View extends ItemView {
  private listsContainer: HTMLDivElement;
  private selectedListsContainer: HTMLDivElement;

  private itemsForFile: { [fileName: string]: { items: Item[] } };
  private nodeForFileItems: { [fileName: string]: HTMLDivElement};

  private selectedItemsForFile: { [fileName: string]: { items: Item[] } };
  private nodeForSelectedItems: { [fileName: string]: HTMLDivElement };

  private plugin: Plugin;

  constructor(plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf);

    this.plugin = plugin;

    const container = this.containerEl.children[1].createEl('div');
    container.className = 'tada-container';

    const selectedListsContainer = container.createEl('div');
    selectedListsContainer.id = 'tada-selected-lists';
    this.selectedListsContainer = selectedListsContainer;
    this.selectedListsContainer.addEventListener('selected-item',
      ((e: CustomEvent) => this.updateSelectedItemsForfile(e.detail.fileName)).bind(this)
    );

    const listsContainer = container.createEl('div');
    listsContainer.id = 'tada-lists';
    this.listsContainer = listsContainer;

    this.nodeForFileItems = {};
    this.nodeForSelectedItems = {};
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

  async saveState() {
    const { itemsForFile, selectedItemsForFile } = this;
    await this.plugin.saveData({ itemsForFile, selectedItemsForFile });
  }

  async restoreState() {
    const data = await this.plugin.loadData();

    this.itemsForFile = data.itemsForFile || {};
    this.selectedItemsForFile = data.selectedItemsForFile || {};
  }

  async onload() {
    await this.restoreState();
  }

  async onunload() {
    await this.saveState();
  }

  updateItemsForFile(fileName: string,  items: Item[]) {
    // Ensure we've intialized `itemsForFile` for the file
    if (!this.itemsForFile[fileName]) {
      this.itemsForFile[fileName] = { items };
    } else {
      this.itemsForFile[fileName].items = items;
    }

    // Keep the selected items with current `checked` that still exists in the original file
    if (this.selectedItemsForFile[fileName]) {
      const selectedItemsToBeKept = [];
      for (const selected of this.selectedItemsForFile[fileName].items) {
        for (const item of items) {
          if (selected.content === item.content) {
            selectedItemsToBeKept.push(item);
          }
        }
      }

      this.selectedItemsForFile[fileName].items = selectedItemsToBeKept;

      // Trigger update of the selected items of this file
      this.selectedListsContainer.dispatchEvent(new CustomEvent('selected-item', { detail: { fileName } }));
    }

    if (!this.nodeForFileItems[fileName]) {
      // Ensure we got a DOM node for the list
      const list = this.listsContainer.createEl('div');
      list.className = 'tada-list';

      const listHeader = list.createEl('h3');
      listHeader.className = 'tada-list-header';
      listHeader.innerHTML = fileName;
      listHeader.onclick = () => this.app.workspace.openLinkText(fileName, fileName);

      this.nodeForFileItems[fileName] = list;
    }

    // Remove all lists for this file before drawing them again
    this.nodeForFileItems[fileName].querySelectorAll('ul').forEach(n => n.remove());
    this.drawItemsForFile(fileName);
  }

  drawItemsForFile(fileName: string) {
    if (!this.itemsForFile[fileName]) {
      console.warn(`### No items to draw for file '${fileName}'`);
      return;
    }

    const { items } = this.itemsForFile[fileName];

    const ul = this.nodeForFileItems[fileName].createEl('ul');
    for (const item of items) {
      const li = ul.createEl('li');
      li.className = 'tada-list-item';
      li.onclick = () => {
        if (!this.selectedItemsForFile[fileName]) {
          this.selectedItemsForFile[fileName] = { items: [], folded: false };
        }

        // Item is already selected
        if (this.selectedItemsForFile[fileName].items.indexOf(item) >= 0) {
          return;
        };

        this.selectedItemsForFile[fileName].items.push(item);
        this.selectedListsContainer.dispatchEvent(new CustomEvent('selected-item', { detail: { fileName } }));
      }

      const checkbox = li.createEl('input');
      checkbox.setAttr('type', 'checkbox');
      checkbox.className = 'tada-list-item-checkbox';
      checkbox.checked = item.checked;
      checkbox.disabled = true;

      const label = li.createEl('label');
      label.innerHTML = item.content;
      label.className = item.checked ? 'tada-list-item is-checked' : 'tada-list-item';
    }
  }

  updateSelectedItemsForfile(fileName: string) {
    // Clean the node for this file as there are no items for this file
    if (!this.selectedItemsForFile[fileName].items || this.selectedItemsForFile[fileName].items.length === 0) {
      this.selectedListsContainer.removeChild(this.nodeForSelectedItems[fileName]);
      this.nodeForSelectedItems[fileName] = null;
      return;
    }

    // Ensure there is a node for this file
    if (!this.nodeForSelectedItems[fileName]) {
      const list = this.selectedListsContainer.createEl('div');
      list.className = 'tada-list';

      const listHeader = list.createEl('h3');
      listHeader.className = 'tada-list-header';
      listHeader.innerHTML = fileName;
      listHeader.onclick = () => this.app.workspace.openLinkText(fileName, fileName);

      this.nodeForSelectedItems[fileName] = list;
    }

    // Remove all lists for this file before drawing them again
    this.nodeForSelectedItems[fileName].querySelectorAll('ul').forEach(n => n.remove());
    this.drawSelectedItemsForFile(fileName);
  }

  drawSelectedItemsForFile(fileName: string) {
    const { items } = this.selectedItemsForFile[fileName];

    const ul = this.nodeForSelectedItems[fileName].createEl('ul');

    for (const item of items) {
      const li = ul.createEl('li');
      li.className = 'tada-list-item';
      li.onclick = ((fileName: string, i: Item) => {
        this.selectedItemsForFile[fileName].items = this.selectedItemsForFile[fileName].items.filter(s => s !== i);
        this.selectedListsContainer.dispatchEvent(new CustomEvent('selected-item', { detail: { fileName } }));
      }).bind(this, fileName, item);

      const checkbox = li.createEl('input');
      checkbox.setAttr('type', 'checkbox');
      checkbox.className = 'tada-list-item-checkbox';
      checkbox.checked = item.checked;
      checkbox.disabled = true;

      const label = li.createEl('label');
      label.innerHTML = item.content;
      label.className = item.checked ? 'tada-list-item is-checked' : 'tada-list-item';
    }
  }
};
