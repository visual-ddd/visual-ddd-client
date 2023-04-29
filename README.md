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

运行时环境变量

| 名称                 | 说明                                                 |
| -------------------- | ---------------------------------------------------- |
| BACKEND              | 后端服务地址, 例如 http://172.26.57.49:8080          |
| SESSION_SECRET       | 会话加密密钥                                         |
| PASS_THROUGH_SESSION | 登录时是否透传后端的会话信息， 默认 false            |
| AI_CONFIGURATION     | OPENAI 配置，配置项见 ./modules/ai/platform/index.ts |
| PINECONE_API_KEY     |                                                      |
| PINECONE_ENVIRONMENT |                                                      |
| PINECONE_INDEX       |                                                      |
| REQUIRE_INVITATION   | 是否需要邀请码注册                                   |

# 构建时环境变量

| 名称                  | 说明                                                          |
| --------------------- | ------------------------------------------------------------- |
| PRODUCTION_SOURCE_MAP | 是否开启生产环境 sourcemap, 默认 false                        |
| SENTRY_DSN            | The DSN to use to connect to sentry                           |
| SENTRY_AUTH_TOKEN     | Sentry 鉴权 Token 用于上传 sourceMap                          |
| SENTRY_ORG            | Sentry 组织名称                                               |
| SENTRY_PROJECT        | Sentry 项目名称                                               |
| BD_ANALYZE_KEY        | 百度统计 key (为什么这个是构建时，因为有部分页面是完全静态的) |

# rancher 配置注意事项

- 详见 k8s-deployment-zadig 文件
- 负载均衡中建议配置证书，可以自动拒绝 http 的请求

# 资源

SWAGGER https://ddd.wakedt.cn/wd/visual/doc.html

# OPENAI nginx 代理服务器配置

```
       location ~* /(v1|dashboard) {
             proxy_pass https://api.openai.com;
             proxy_ssl_server_name on;
             proxy_buffering off;
             proxy_send_timeout 5m;
	       proxy_read_timeout 5m;
        }
```

证书可以使用 certbot 创建，详见：https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal
