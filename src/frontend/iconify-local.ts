import { LocalIconData, SOLAR_ICONS } from "./solar-icons.js";

const ICON_ALIASES: Record<string, string> = {
  "solar:add-bold": "solar:add-circle-bold",
  "solar:add-linear": "solar:add-circle-linear",
  "solar:minus-bold": "solar:minus-circle-bold",
  "solar:spinner-linear": "solar:refresh-linear",
};

const DEFAULT_ICON = "solar:danger-circle-linear";

function resolveIconName(iconName: string | null): string {
  if (!iconName) return DEFAULT_ICON;
  if (SOLAR_ICONS[iconName]) return iconName;

  const alias = ICON_ALIASES[iconName];
  if (alias && SOLAR_ICONS[alias]) return alias;

  return DEFAULT_ICON;
}

function buildTransform(icon: LocalIconData): string {
  const transforms: string[] = [];
  const left = icon.left ?? 0;
  const top = icon.top ?? 0;
  const width = icon.width ?? 24;
  const height = icon.height ?? 24;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  if (icon.hFlip) transforms.push(`translate(${left + width * 2} 0) scale(-1 1)`);
  if (icon.vFlip) transforms.push(`translate(0 ${top + height * 2}) scale(1 -1)`);
  if (icon.rotate) transforms.push(`rotate(${icon.rotate * 90} ${centerX} ${centerY})`);

  return transforms.join(" ");
}

class LocalIconifyElement extends HTMLElement {
  static get observedAttributes() {
    return ["icon"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const iconKey = resolveIconName(this.getAttribute("icon"));
    const icon = SOLAR_ICONS[iconKey] ?? SOLAR_ICONS[DEFAULT_ICON];
    const left = icon.left ?? 0;
    const top = icon.top ?? 0;
    const width = icon.width ?? 24;
    const height = icon.height ?? 24;
    const transform = buildTransform(icon);
    const body = transform ? `<g transform="${transform}">${icon.body}</g>` : icon.body;

    this.style.display = "inline-flex";
    this.style.alignItems = "center";
    this.style.justifyContent = "center";
    this.style.lineHeight = "1";

    this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}" width="1em" height="1em" aria-hidden="true" focusable="false">
        ${body}
      </svg>
    `;
  }
}

if (!customElements.get("iconify-icon")) {
  customElements.define("iconify-icon", LocalIconifyElement);
}
