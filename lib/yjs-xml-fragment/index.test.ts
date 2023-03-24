import { Doc, XmlElement, XmlText } from 'yjs';
import { xmlFragmentToJSON, buildXmlFragmentFromJSON } from './index';
import data from './index.data.json';

test('xmlFragmentToJSON', () => {
  const doc = new Doc();

  const fragment = doc.getXmlFragment('test');

  // 普通文本
  fragment.push([new XmlText('hello'), new XmlText('world')]);

  // 格式化文本
  const formatText = new XmlText();
  formatText.insert(0, 'format text');
  formatText.format(0, 5, { bold: true });

  fragment.push([formatText]);

  const element = new XmlElement('div');
  element.setAttribute('class', 'test');
  element.setAttribute('id', 'test');

  fragment.push([element]);

  expect(xmlFragmentToJSON(fragment)).toEqual([
    {
      deltas: [
        {
          insert: 'hello',
        },
      ],
      type: 'text',
    },
    {
      deltas: [
        {
          insert: 'world',
        },
      ],
      type: 'text',
    },
    {
      deltas: [
        {
          attributes: {
            bold: true,
          },
          insert: 'forma',
        },
        {
          insert: 't text',
        },
      ],
      type: 'text',
    },
    {
      attrs: {
        class: 'test',
        id: 'test',
      },
      content: undefined,
      tag: 'div',
      type: 'element',
    },
  ]);
});

test('buildXmlFragmentFromJSON', () => {
  const doc = new Doc();

  const fragment = doc.getXmlFragment('test');
  buildXmlFragmentFromJSON(fragment, data as any);

  expect(fragment).toMatchSnapshot();
});
