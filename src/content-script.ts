type ConceptRequest = {
  type: "fetchConcept";
  text: string;
};

type ConceptResponse =
  | { success: true; definition: string }
  | { success: false; error: string };

class Tooltip {
  private container: HTMLDivElement;
  private textEl: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "conceptual-tooltip";
    this.container.setAttribute("role", "status");
    this.container.tabIndex = -1;

    this.textEl = document.createElement("div");
    this.textEl.id = "conceptual-tooltip-text";
    this.container.appendChild(this.textEl);

    document.body.appendChild(this.container);

    this.registerDismiss();
  }

  showLoading() {
    this.textEl.textContent = "Getting conceptual definition…";
    this.container.style.display = "block";
  }

  showDefinition(definition: string) {
    this.textEl.textContent = definition;
    this.container.style.display = "block";
  }

  showError(message: string) {
    this.textEl.textContent = message;
    this.container.style.display = "block";
  }

  hide() {
    this.container.style.display = "none";
  }

  private registerDismiss() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hide();
      }
    });
    document.addEventListener("click", () => this.hide());
  }
}

const tooltip = new Tooltip();
let stylesheetLoaded = false;
let isRequesting = false;

function ensureTooltipStyles() {
  if (stylesheetLoaded) return;
  const url = chrome.runtime.getURL("tooltip.css");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  stylesheetLoaded = true;
}

function getSelectionText(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const text = selection.toString().trim();
  return text.length ? text : null;
}

async function requestConcept(text: string) {
  if (isRequesting) return;
  isRequesting = true;
  ensureTooltipStyles();
  tooltip.showLoading();
  try {
    const response = (await chrome.runtime.sendMessage({
      type: "fetchConcept",
      text,
    } as ConceptRequest)) as ConceptResponse;

    if (response.success) {
      tooltip.showDefinition(response.definition);
    } else {
      tooltip.showError(response.error);
    }
  } catch (err) {
    tooltip.showError("Unable to get definition.");
    console.error(err);
  } finally {
    isRequesting = false;
  }
}

let lastSelection: string | null = null;

function handleSelection() {
  lastSelection = getSelectionText();
}

document.addEventListener("mouseup", handleSelection);

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift" && lastSelection) {
    requestConcept(lastSelection);
  }
});

