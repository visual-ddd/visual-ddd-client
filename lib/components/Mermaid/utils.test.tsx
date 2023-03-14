import { mindMapNodeToMermaidCode } from './utils';

test('mindMapNodeToMermaidCode', () => {
  expect(
    mindMapNodeToMermaidCode({
      name: 'A',
      children: [
        {
          name: 'B',
          children: [
            {
              name: 'C',
              children: [
                {
                  name: 'D',
                },
              ],
            },
          ],
        },
      ],
    })
  ).toBe(
    `
mindmap
  A
    B
      C
        D
  `.trim()
  );

  expect(
    mindMapNodeToMermaidCode({
      name: 'Root',
      children: [
        {
          name: 'A',
          shape: 'square',
        },
        {
          name: 'B',
          shape: 'rounded-square',
        },
        {
          name: 'C',
          shape: 'circle',
        },
      ],
    })
  ).toBe(
    `
mindmap
  Root
    A["A"]
    B("B")
    C(("C"))
  `.trim()
  );

  // 转义字符串
  expect(mindMapNodeToMermaidCode({ name: 'Root(A)', children: [{ name: 'hello[12]' }] })).toBe(
    'mindmap\n  1("Root(A)")\n    2("hello[12]")'
  );
});
