export const copyToClipBoard = (event: any) => {
  navigator.clipboard.writeText(JSON.stringify(event));
};
