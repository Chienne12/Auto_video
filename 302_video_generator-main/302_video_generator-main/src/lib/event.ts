export function initializeMonitor() {
  if (!/macintosh|mac os x/i.test(navigator.userAgent)) return;
  console.log("::MONITOR::INIT");

  function isDownloadLink(url: string): boolean {
    const fileExtensions = [
      "3gp",
      "7z",
      "ai",
      "apk",
      "avi",
      "bmp",
      "csv",
      "dmg",
      "doc",
      "docx",
      "fla",
      "flv",
      "gif",
      "gz",
      "gzip",
      "ico",
      "iso",
      "indd",
      "jar",
      "jpeg",
      "jpg",
      "m3u8",
      "mov",
      "mp3",
      "mp4",
      "mpa",
      "mpg",
      "mpeg",
      "msi",
      "odt",
      "ogg",
      "ogv",
      "pdf",
      "png",
      "ppt",
      "pptx",
      "psd",
      "rar",
      "raw",
      "svg",
      "swf",
      "tar",
      "tif",
      "tiff",
      "ts",
      "txt",
      "wav",
      "webm",
      "webp",
      "wma",
      "wmv",
      "xls",
      "xlsx",
      "xml",
      "zip",
      "json",
      "yaml",
      "7zip",
      "mkv",
    ];
    const downloadLinkPattern = new RegExp(
      `\\.(${fileExtensions.join("|")})$`,
      "i"
    );
    return downloadLinkPattern.test(url);
  }

  const isSpecialDownload = (url: string): boolean =>
    ["blob", "data"].some((protocol) => url.startsWith(protocol));

  document.addEventListener(
    "click",
    (event: MouseEvent) => {
      let link = event.target as HTMLElement | null;

      for (let i = 0; i < 5 && link; i++) {
        if (link.tagName === "A") break;
        link = link.parentElement;
      }

      if (link && link.tagName === "A") {
        const anchor = link as HTMLAnchorElement;
        const url = anchor.href;
        const target = anchor.target;
        const download = anchor.download;
        const eventType =
          isDownloadLink(url) ||
          isSpecialDownload(url) ||
          anchor.hasAttribute("download")
            ? "downloadFile"
            : "openNewWindow";

        if (eventType) {
          // console.log("::Post::Message", url)
          window.parent.postMessage(
            {
              from: "monitor",
              eventType,
              target,
              url,
              download,
            },
            "*"
          );
        }
      }
    },
    true
  );
}
