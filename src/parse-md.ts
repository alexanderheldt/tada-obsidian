import Item from './item';

export default (md: string, startAt: number): Item[] => {
  const lines = md.split('\n');

  let line = lines[startAt];
  if (!line) {
    return [];
  }

  const tadaItems: Item[] = [];

  while (line && line.startsWith('- [')) {
    let checked: boolean = false;
    if (line.includes('- [X]') || line.includes('- [x]')) {
      checked = true;
    }

    const content = line.substring(line.indexOf(']') + 1, line.length);
    tadaItems.push(new Item(content, checked));

    line = lines[++startAt];
  }

  return tadaItems;
};
