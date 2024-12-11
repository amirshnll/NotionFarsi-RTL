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
const WOFF2_FONT_PATH = browser.runtime.getURL(CUSTOM_FONT_PATH + "woff2");
const TTF_FONT_PATH = browser.runtime.getURL(CUSTOM_FONT_PATH + "ttf");

const SELECTORS = {
  listItems: `div[placeholder="List"], div[placeholder="To-do"], div[placeholder="Toggle"], div[role="button"], div[dir="auto"], div[placeholder="Untitled"], div[data-content-editable-void="true"], a[role="link"]`,
  topLevelBlocks: `.notion-page-content > div[data-block-id],
          [placeholder="Untitled"],
          [placeholder="Heading 1"],
          [placeholder="Heading 2"],
          [placeholder="Heading 3"],
          [placeholder="Heading 4"],
          [placeholder="Heading 5"],
          [placeholder="Heading 6"],
          .notion-column-block > div[data-block-id],
          .notion-selectable > div[data-block-id],
          .notion-collection_view-block,
          .notion-table-view:not([dir]),
          .notion-board-view:not([dir]),
          .notion-gallery-view:not([dir]),
          .notion-page-block:not([dir]),
          .notion-topbare:not([dir]),
          .notion-page-block:not([dir]),
          .notion-topbar:not([dir]),
          .notion-body:not([dir]),
          .notion-collection-item`,
};
const RTL_SELECTORS = `
  .notion-collection-item
`;

const NOTION_DOCUMENT_MUTATION = new MutationObserver(onNotionDocumentLoaded);
const NOTION_PAGE_CONTENT_MUTATION = new MutationObserver(() =>
  alignPageContentToRight()
);

function init() {
  initObservers();
  injectCustomFontStyles();
  applyCustomFontToElements();

  document.addEventListener("keydown", handleEnterKeyPress);
}

function handleEnterKeyPress(event) {
  if (event.key === "Enter" || event.key === " ") {
    alignPageContentToRight();
  }
}

function initObservers() {
  NOTION_DOCUMENT_MUTATION.observe(document, {
    childList: true,
    subtree: true,
  });
}

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
    .notion-frame div[style]:has(h1),.notion-frame div[placeholder="Untitled"],
    .notion-collection_view-block div[data-content-editable-void="true"] > div:nth-child(2){
        direction:rtl!important;
    }
    .notion-view-settings-sidebar {
        direction:ltr !important;
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

function getElements(selector) {
  return document.querySelectorAll(selector);
}

function setStyle(element, property, value) {
  element.style[property] = value;
}

function setAttribute(element, attribute, value) {
  element.setAttribute(attribute, value);
}

function alignListItemsToRight() {
  const items = getElements(SELECTORS.listItems);
  items.forEach((item) => setStyle(item, "text-align", "start"));
}

function setBlocksDirectionToAuto() {
  const blocks = getElements(SELECTORS.topLevelBlocks);
  blocks.forEach((block) => setAttribute(block, "dir", "auto"));
}

function isRTL(text) {
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return rtlRegex.test(text);
}

function setRTLForSpecificElements() {
  const elements = getElements(RTL_SELECTORS);
  elements.forEach((element) => {
    const textContent = element.textContent.trim();
    if (isRTL(textContent)) {
      setAttribute(element, "dir", "rtl");
      setStyle(element, "text-align", "right");
    } else {
      setAttribute(element, "dir", "ltr");
      setStyle(element, "text-align", "left");
    }
  });
}

function alignPageContentToRight() {
  setBlocksDirectionToAuto();
  setRTLForSpecificElements();
  alignListItemsToRight();
  applyCustomFontToElements();
}

function onNotionDocumentLoaded(mutationsList) {
  if (isMutationQueueEmpty()) {
    requestIdleCallback(idleAlignItemsToRight);
  }
  MUTATIONS_QUEUE.push(mutationsList);
}

function idleAlignItemsToRight() {
  for (const mutation of MUTATIONS_QUEUE) {
    for (const { addedNodes } of mutation) {
      if (addedNodes[0]) {
        const notionPageElem = getNotionPageElem(addedNodes[0]);
        if (notionPageElem) {
          alignPageContentToRight();
          NOTION_PAGE_CONTENT_MUTATION.disconnect();
          NOTION_PAGE_CONTENT_MUTATION.observe(notionPageElem, {
            childList: true,
            subtree: false,
          });
        }
      }
    }
  }
  MUTATIONS_QUEUE.splice(0, MUTATIONS_QUEUE.length);
}

function isMutationQueueEmpty() {
  return MUTATIONS_QUEUE.length === 0;
}

function getNotionPageElem(node) {
  if (!(node instanceof HTMLElement)) return null;

  for (const className of ROOT_LEVEL_CLASS_NAMES) {
    const elements = node.getElementsByClassName(className);
    if (elements.length > 0) return elements[0];
  }

  return null;
}

init();
