export const copyToClipBoard = function (event: any) {
  navigator.clipboard.writeText(JSON.stringify(event));
};
