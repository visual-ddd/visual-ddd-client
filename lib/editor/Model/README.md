# 模型层

这里不会包含任何 UI 层内容，只维护状态

- Model 入口，管理者，会维护 effects
- Store 核心状态
- Datasource 持久化数据源
- Event 事件总线
- Index 索引信息，只要用于加速计算。这里的信息通过事件监听生成，不会直接依赖其他对象
- CommandHandler 暴露为 View 层的命令
