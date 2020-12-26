import { Plugin, WorkspaceLeaf, addIcon, TFile } from 'obsidian';

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

    this.parseAllFiles();
  }

  onLayoutReady() {
    this.registerEvent(this.app.vault.on('create', ((e: TFile) => this.parseFile(e.path)).bind(this)));
    this.registerEvent(this.app.vault.on('modify', ((e: TFile) => this.parseFile(e.path)).bind(this)));
    this.registerEvent(this.app.vault.on('rename', ((e: TFile) => this.parseFile(e.path)).bind(this)));
    this.registerEvent(this.app.vault.on('delete', ((e: TFile) => this.parseFile(e.path)).bind(this)));

    this.parseAllFiles();
  }

  async parseAllFiles() {
    // View is not in DOM, no need to refresh
    if (!this.tadaView) {
      return;
    }

    for (const md of this.app.vault.getMarkdownFiles()) {
      this.parseFile(md.path);
    }
  }

  async parseFile(filePath: string) {
    const { vault, metadataCache } = this.app;

    const cached = metadataCache.getCache(filePath);
    if (!cached) {
      return;
    }

    const tadaTag = cached.tags && cached.tags.find(t => t.tag === TADA_TAG);
    if (!tadaTag) {
      return;
    }

    const content = await vault.adapter.read(filePath);
    let startAt = tadaTag.position.start.line + 1;

    this.tadaView.updateItemsForFile(filePath, parseMD(content, startAt));
  }

  async onunload() {
   await this.tadaView.saveState();

    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_TADA)
      .forEach(l => l.detach());
  }
};
