function removeTrailingSlash(str: string): string {
  return str.replace(/\/$/, '');
}

function removeLeadingSlash(str: string): string {
  return str.replace(/^\//, '');
}

export { removeLeadingSlash, removeTrailingSlash };
