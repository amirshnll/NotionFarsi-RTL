const ROOT_LEVEL_CLASS_NAMES = [
  "notion-page-content",
  "notion-table-view",
  "notion-board-view",
  "notion-gallery-view",
  "notion-page-block",
  "notion-topbar",
  "notion-body",
  "notion-selectable",
  "notion-collection_view-block",
  "notion-frame",
  "notion-collection-item",
];
const MUTATIONS_QUEUE = [];
const CUSTOM_FONT_PATH = "assets/font/vazirmatn.";
const WOFF2_FONT_PATH = chrome.runtime.getURL(CUSTOM_FONT_PATH + "woff2");
const TTF_FONT_PATH = chrome.runtime.getURL(CUSTOM_FONT_PATH + "ttf");

function injectCustomFontStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
        font-family: 'vazirmatn';
        src: url('${TTF_FONT_PATH}') format('truetype'),
        url('${WOFF2_FONT_PATH}') format('woff2');
        font-weight: normal;
        font-style: normal;
    }
    .notion-page-content, .notion-table-view, .notion-board-view,
    .notion-gallery-view, .notion-page-block, .notion-topbar, .notion-body,
    .notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6,
    .notion-body p, .notion-body span{
        font-family: 'vazirmatn', sans-serif !important;
    }
    .notion-collection_view-block div[data-content-editable-void="true"] > div:nth-child(2){
        direction:rtl!important;
    }
    .notion-view-settings-sidebar {
        direction:ltr !important;
    }
    .notion-board-view{
        float:none !important;
    }
    `;
  document.head.appendChild(style);
}

function applyCustomFontToElements() {
  const selector = ROOT_LEVEL_CLASS_NAMES.map(
    (className) => `.${className}`
  ).join(", ");
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    element.style.setProperty(
      "font-family",
      "vazirmatn, sans-serif",
      "important"
    );
  });
}

function applyRTLToBlocks() {
  const bulletedListBlocks = document.querySelectorAll(
    ".notion-selectable.notion-bulleted_list-block"
  );
  bulletedListBlocks.forEach((block) => {
    block.setAttribute("dir", "rtl");
  });

  const tableBlocks = document.querySelectorAll(".notion-table-block");
  tableBlocks.forEach((block) => {
    const rtlTextFound = Array.from(block.querySelectorAll("*")).some((el) =>
      /[\u0600-\u06FF]/.test(el.textContent)
    );

    if (rtlTextFound) {
      block.setAttribute("dir", "rtl");
    }
  });

  const todoBlocks = document.querySelectorAll(".notion-to_do-block");
  todoBlocks.forEach((block) => {
    const rtlTextFound = Array.from(block.querySelectorAll("*")).some((el) =>
      /[\u0600-\u06FF]/.test(el.textContent)
    );

    if (rtlTextFound) {
      block.setAttribute("dir", "rtl");
    }
  });
}

function initObservers() {
  const targetNode = document.body;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const newNodes = [...mutation.addedNodes].filter(
        (n) => n.nodeType === Node.TEXT_NODE
      );

      if (newNodes.length) {
        for (let node of newNodes) {
          const textContent = node.textContent;
          const arabic = /[\u0600-\u06FF]/;

          if (textContent && arabic.test(textContent)) {
            node.parentNode.setAttribute("dir", "rtl");
          }
        }
      }
    });

    applyRTLToBlocks();
  });

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });
}

function init() {
  initObservers();
  injectCustomFontStyles();
  applyCustomFontToElements();
}

init();
