import { Plugin, WorkspaceLeaf, addIcon } from 'obsidian';

import { VIEW_TYPE_TADA, TADA_TAG, listIcon } from './constants';
import View from './view';
import Item from './item';
import parseMD from './parse-md';

export default class TADA extends Plugin {
  tadaView: View;

  async onload() {
    addIcon('tada-list-icon', listIcon);
    this.addRibbonIcon('tada-list-icon', 'Open TADA list', this.initLeaf.bind(this));

    this.registerView(
      VIEW_TYPE_TADA,
      (leaf: WorkspaceLeaf) => (this.tadaView = new View(this, leaf))
    );

    if (this.app.workspace.layoutReady) {
      this.onLayoutReady();
    } else {
      this.registerEvent(
        this.app.workspace.on('layout-ready', this.onLayoutReady.bind(this))
      );
    }
  }

  initLeaf() {
    const { workspace } = this.app;

    // View is already in DOM
    if (workspace.getLeavesOfType(VIEW_TYPE_TADA).length) {
      return;
    }

    workspace.getRightLeaf(true).setViewState({
      type: VIEW_TYPE_TADA,
    });

    this.refresh();
  }

  onLayoutReady() {
    this.registerEvent(this.app.vault.on('create', this.refresh.bind(this)));
    this.registerEvent(this.app.vault.on('modify', this.refresh.bind(this)));
    this.registerEvent(this.app.vault.on('rename', this.refresh.bind(this)));
    this.registerEvent(this.app.vault.on('delete', this.refresh.bind(this)));

    this.refresh();
  }

  async refresh() {
    // View is not in DOM, no need to refresh
    if (!this.tadaView) {
      return;
    }

    const { vault, metadataCache } = this.app;

    let tadaItems: { [fileName: string]: Item[] } = {};

    for (const md of vault.getMarkdownFiles()) {
      const cached = metadataCache.getFileCache(md);
      if (!cached) {
        continue;
      }

      const tadaTag = cached.tags && cached.tags.find(t => t.tag === TADA_TAG);
      if (!tadaTag) {
        continue;
      }

      const content = await vault.adapter.read(md.path);
      let startAt = tadaTag.position.start.line + 1;

      tadaItems[md.basename] = parseMD(content, startAt);
    }

    this.tadaView.update(tadaItems);
  }

  onunload() {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_TADA)
      .forEach(l => l.detach());
  }
};
