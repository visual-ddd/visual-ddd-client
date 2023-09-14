# Visual DDD 客户端

## 本地开发

当前项目基于 Next.js 13(非 app router)

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

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# 本地开发

```
# 需要指定后端服务器地址，注意不能是 nextjs 服务地址
BACKEND=http://172.26.57.49:8080 pnpm dev
```

# 内存使用

目前服务器端有以下内容使用了内存缓存：

- 画布数据缓存, 基于 lru。后面如果服务器需要弹性伸缩需要放到 redis
- dall-e 限制
- ip 限制
- 模型限额

# TODO

- [x] 移除 Dall-E
- [x] 移除 PINECONE 集成
- [ ] 缓存优化，支持 Redis
- [ ] Chat 根据环境变量开关动态开启
- [ ] 所有相关镜像修改名称并推送到公共仓库
- [ ] Github Actions 集成
- [x] 移除 LEMON 集成
- [ ] README 优化

低优先级

- [ ] DSL 获取性能优化
- [ ] 升级到 app router

<br>

# 部署配置

运行时环境变量

| 名称                 | 说明                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| BACKEND              | 后端服务地址, 例如 http://172.26.57.49:8080                                         |
| SESSION_SECRET       | 会话加密密钥                                                                        |
| PASS_THROUGH_SESSION | 登录时是否透传后端的会话信息， 默认 false                                           |
| AI_CONFIGURATION     | OPENAI 配置，配置项见 ./modules/ai/platform/index.ts                                |
| REQUIRE_INVITATION   | 是否需要邀请码注册, 默认 false                                                      |
| REDIS                | Redis 链接协议, 例如 `redis[s]://[[username][:password]@][host][:port][/db-number]` |

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

<br>
<br>

# OPENAI nginx 代理服务器配置示例

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
