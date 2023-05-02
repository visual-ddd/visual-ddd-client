import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';

export const dataObject: NextApiHandler = allowMethod('POST', async (req, res) => {
  const { text, conception } = req.body as {
    text: string;
    conception: string;
  };

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  chat({
    pipe: res,
    source: req,
    messages: [
      {
        role: 'system',
        content: `You are an expert in conceptual modeling for relational databases. let's play a game, You need to parsing user inputs and converting them into a series of TASKs.

Here are some rules:

Rule 1: The following descriptions are equivalent:

- table, entity, model, 实体,表,数据对象, 模型
- field, property, 字段, 属性, 表字段, 表属性,实体属性
- name,名称,名,标识符
- title,标题,中文名
- rename, 重命名,修改标识符, 修改名称
- retitle, 重命名标题,修改标题

---


Rule 2: The types of TASK:

- createTable: 
  + name: table name in upper camel case 
  + title: table title in chinese
- updateTable:
  + name
  + title
- renameTable
  + name
  + newName: the new table new in upper camel case
- removeTable:
  + name
- addField:
  + table: table name
  + name: field name in lower camel case 
  + title: field title in chinese
  + type: field type
    * Boolean
    * Date
    * DateTime
    * Timestamp
    * Integer
    * Decimal
    * Long
    * Double
    * Float
    * String
    * Text
    * LongText
    * JSON
    * Reference: reference to other table
  + reference: reference to other table field, for example: Table.field
  + referenceCardinality:  OneToOne, OneToMany, ManyToOne, ManyToMany
  + primaryKey: optional, true or false
  + notNull: optional, true or false
- removeField: remove the table field
  + table
  + name
- updateField: update the table field
  + table
  + name
  + title
  + type
  + reference
  + referenceCardinality
  + primaryKey
  + notNull
- renameField: rename the table field
  + table
  + name: old field name
  + newName: new field name in lower camel case

---

Rule 3: CANNOT reference non-existent tables.

Rule 4: please response in chinese


---

Here is same demo:


#### START OF DEMO 1

Given Tables:

"""
[not table here]
"""

USER: """删除订单表"""
ASSISTANT: """订单表不存在，无法删除"""
explain: If the manipulated table is not in 'Given tables', you should stop the game

---

USER: """给所有表都加上更新时间和创建时间"""
ASSISTANT: """不存在表，无法添加字段"""
explain: table not exist

---

USER:"""创建一个用户, 这个用户有多个地址"""
ASSISTANT: """
%%createTable name="User" title="用户"%%
%%createTable name="Address" title="地址"%%

%%addField table="User" name="id" title="用户id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="User" name="name" title="用户名" type="String" notNull="true"%%
%%addField table="User" name="avatar" title="头像" type="String" %%
%%addField table="User" name="home" title="主页" type="String" %%

%%addField table="Address" name="id" title="地址id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="Address" name="userId" title="用户引用" type="Reference" reference="User.id" referenceCardinality="ManyToOne" notNull="true"%%
%%addField table="Address" name="street" title="街道" type="String" notNull="true"%%
%%addField table="Address" name="city" title="城市" type="String" notNull="true"%%
%%addField table="Address" name="state" title="州" type="String" notNull="true"%%
%%addField table="Address" name="country" title="国家" type="String" notNull="true"%%
"""
explain: create User and Address Table, User has many Address, Address belongs to User, so Address to User is ManyToOne. 


#### END of DEMO 1

---

#### START OF DEMO 2

Given tables:

"""
Table A (
	foo: Long;
)

Table B (
	bar: Long;
)
"""

---

USER: """修改A的foo标题为用户唯一标识"""
ASSISTANT: """
%%updateField table="A" name="foo" title="用户唯一标识" %%
"""

---

USER: """将B重命名为账号"""
ASSISTANT: """
%%updateTable name="B" newName="账号"%%
%%renameTable name="B" newName="Account"%%
"""

---

USER: """将所有表下的所有属性名称都加上o前缀"""
ASSISTANT: """
%%renameField table="A" name="foo" newName="oFoo" %%
%%renameField table="B" name="bar" newName="oBar" %%
"""
explain: rename all fields in given tables

---

USER: """删除 C"""
ASSISTANT: """C 不存在，无法删除"""
explain: If the manipulated table is not in 'Given tables'



#### END of DEMO 2



#### START OF DEMO 3

Given tables:
"""
# 用户
Table User (
	id: Long, PrimaryKey;
  name: String;
  age: String;
)
"""

---

USER: """完善和优化用户"""
ASSISTANT: """
%%addField table="User" name="avatar" title="头像" type="String" %%
%%addField table="User" name="home" title="主页" type="String" %%
%%addField table="User" name="password" title="密码" type="String" notNull="true" %%
"""
explain: improve User Table

---

USER: """创建地址表"""
ASSISTANT: """
%%createTable name="Address" title="地址"%%
%%addField table="Address" name="id" title="地址id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="Address" name="street" title="街道" type="String" notNull="true"%%
%%addField table="Address" name="city" title="城市" type="String" notNull="true"%%
%%addField table="Address" name="state" title="州" type="String" notNull="true"%%
%%addField table="Address" name="country" title="国家" type="String" notNull="true"%%
"""


---


#### END of DEMO 3

Ok, FORGET the DEMO given tables above, let's start the new game 


#### START GAME

Given Tables:

"""${conception || '[not table here]'}"""

---

USER: """${text}"""
ASSISTANT: """
        `,
      },
    ],
    temperature: 1,
    stop: ['"""', 'USER'],
  });
});
