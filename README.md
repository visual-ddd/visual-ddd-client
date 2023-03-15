This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## TODO

- NodeYMap 单元测试
- rule 包含 label, 更好的信息提示
- 引用关系支持可见性控制
- layout 支持折叠
- edge/node selected 状态高亮
- 组件树换行优化
- 被其他成员选中的不能修改
- 持久化 viewState
- 验证性能优化
- 边拖入
- 无连接桩连接交互
- updateProperty debounce 发布 yjs 事件, 使用合并事件形式
- 多节点框选显示优化
- 拷贝控制
- node edit
- label edit

# 本地开发

```
# 需要指定后端服务器地址，注意不能是 nextjs 服务地址
BACKEND=http://172.26.57.49:8080 pnpm dev
```

# 部署配置

环境变量

| 名称                 | 说明                                        |
| -------------------- | ------------------------------------------- |
| BACKEND              | 后端服务地址, 例如 http://172.26.57.49:8080 |
| SESSION_SECRET       | 会话加密密钥                                |
| PASS_THROUGH_SESSION | 登录时是否透传后端的会话信息， 默认 false   |
| OPENAI_API_KEY       | OPENAI 开发密钥                             |
| OPENAI_BASE_PATH     | OPENAI 代理地址                             |

# 资源

SWAGGER https://ddd.wakedt.cn/wd/visual/doc.html
