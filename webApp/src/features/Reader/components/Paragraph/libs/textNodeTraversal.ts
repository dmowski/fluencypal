export const findFirstTextNode = (node: Node): Text | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node as Text;
  }

  for (const child of Array.from(node.childNodes)) {
    const found = findFirstTextNode(child);
    if (found) return found;
  }

  return null;
};

export const findLastTextNode = (node: Node): Text | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node as Text;
  }

  const children = Array.from(node.childNodes);
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const found = findLastTextNode(children[i]);
    if (found) return found;
  }

  return null;
};
