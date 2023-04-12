import type { Rectangle } from '@antv/x6';
import { Disposer } from '@wakeapp/utils';
import { Base64 } from 'js-base64';
const ignoredStyleProperties = [
  'all', // #2476
  'd', // #2483
  'content', // Safari shows pseudoelements if content is set
];

const copyCSSStyles = <T extends HTMLElement | SVGElement>(style: CSSStyleDeclaration, target: T): T => {
  // Edge does not provide value for cssText
  for (let i = style.length - 1; i >= 0; i--) {
    const property = style.item(i);
    if (ignoredStyleProperties.indexOf(property) === -1) {
      target.style.setProperty(property, style.getPropertyValue(property));
    }
  }
  return target;
};

function appendStyle(element: Element) {
  if (element.nodeType === Node.ELEMENT_NODE && (element instanceof HTMLElement || element instanceof SVGElement)) {
    const style = window.getComputedStyle(element);
    copyCSSStyles(style, element);
    element.removeAttribute('class');
  }

  if (element.childElementCount) {
    for (const child of element.children) {
      appendStyle(child);
    }
  }
}

function toDataUri(svg: SVGSVGElement) {
  const svgData = new XMLSerializer().serializeToString(svg).replace(/&nbsp;/g, '\u00a0');
  const encodedData = Base64.encode(svgData);
  return 'data:image/svg+xml;base64,' + encodedData;
}

function download(canvas: HTMLCanvasElement) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error(`导出失败，Blob 为空`));
          return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'export.png';
        link.click();
        resolve();
      },
      'image/png',
      1
    );
  });
}

function toPng(dataUri: string, width: number, height: number) {
  width = width * 2;
  height = height * 2;

  return new Promise<void>((resolve, reject) => {
    const img = new Image(width, height);
    img.src = dataUri;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d')!;
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);

      try {
        context.drawImage(img, 0, 0, width, height);
        await download(canvas);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = err => {
      reject(`图片加载失败: ${err}`);
    };
  });
}

/**
 * 导出为图片
 */
export async function exportAsImage(element: HTMLElement, size: Rectangle) {
  const svgElement = element.querySelector('svg') as SVGSVGElement | undefined;

  if (svgElement == null) {
    return;
  }

  const disposer = new Disposer();

  try {
    // 克隆 SVG 不影响旧画布
    const clone = svgElement.cloneNode(true) as typeof svgElement;

    // 删除 viewport transform
    const viewport = clone.querySelector('.x6-graph-svg-viewport');
    viewport?.removeAttribute('transform');

    // 设置 viewport
    clone.setAttribute('viewBox', `${size.x} ${size.y} ${size.width} ${size.height}`);

    // 删除 port 和一些不重要的修饰
    clone.querySelectorAll('.x6-port, .vd-form-status-decorator').forEach(i => {
      i.remove();
    });

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '10000px';
    container.appendChild(clone);

    // 放到文档流中，这是为了继承样式
    document.body.appendChild(container);

    disposer.push(() => {
      container.remove();
    });

    // 拷贝 foreign object 样式
    const foreignObjects = clone.querySelectorAll('foreignObject');

    // 遍历并拷贝样式
    for (const obj of foreignObjects) {
      appendStyle(obj);
    }

    // 转换为图片
    const url = toDataUri(clone);
    await toPng(url, size.width, size.height);
  } finally {
    disposer.release();
  }
}
