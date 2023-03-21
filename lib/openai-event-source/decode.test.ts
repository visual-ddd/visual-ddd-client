// 引入 looseJSONParse 函数
import { looseJSONParse } from './decode';

describe('looseJSONParse函数测试', () => {
  it('解析普通的JSON字符串', () => {
    const jsonString = '{"name": "小明", "age": 18}';
    const jsonObj = looseJSONParse(jsonString);
    expect(jsonObj.name).toEqual('小明');
    expect(jsonObj.age).toEqual(18);
  });

  it('解析含有注释的JSON字符串', () => {
    const jsonString = `
		// 这是一个包含注释的JSON字符串
		{
      "name": "小明",
      "age": 18
    }`;

    const jsonObj = looseJSONParse(jsonString);
    expect(jsonObj.name).toEqual('小明');
    expect(jsonObj.age).toEqual(18);
  });

  it('解析含有多余字符的JSON字符串', () => {
    const jsonString = '{  "name": "小明",  "age": 18  }// 这也是注释\n';
    const jsonObj = looseJSONParse(jsonString);
    expect(jsonObj.name).toEqual('小明');
    expect(jsonObj.age).toEqual(18);
  });
});
