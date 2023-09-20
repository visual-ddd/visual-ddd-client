## 本地开发

当前项目基于 Next.js 13(非 app router)

First, run the development server:

```
# 需要指定后端服务器地址，注意不能是 nextjs 服务地址
BACKEND=http://172.26.57.49:8080 pnpm dev
```

<br>
<br>
<br>

# 内存使用

目前服务器端有以下内容使用了进程内存缓存, 后续需要进行重构：

- 画布数据缓存, 基于 lru。后面如果服务器需要弹性伸缩需要放到 redis
- dall-e 限制
- ip 限制
- 模型限额

<br>
<br>
<br>

# [部署配置](./deployment/README.md)

## 运行时环境变量

| 名称                 | 说明                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| BACKEND              | 后端服务地址, 例如 http://172.26.57.49:8080                                         |
| SESSION_SECRET       | 会话加密密钥                                                                        |
| PASS_THROUGH_SESSION | 登录时是否透传后端的会话信息， 默认 false                                           |
| AI_CONFIGURATION     | OPENAI 配置，配置项见 ./modules/ai/platform/index.ts                                |
| REQUIRE_INVITATION   | 是否需要邀请码注册, 默认 false                                                      |
| REDIS                | Redis 链接协议, 例如 `redis[s]://[[username][:password]@][host][:port][/db-number]` |

<br>
<br>
<br>

## 构建时环境变量

| 名称                  | 说明                                                          |
| --------------------- | ------------------------------------------------------------- |
| PRODUCTION_SOURCE_MAP | 是否开启生产环境 sourcemap, 默认 false                        |
| SENTRY_DSN            | The DSN to use to connect to sentry                           |
| SENTRY_AUTH_TOKEN     | Sentry 鉴权 Token 用于上传 sourceMap                          |
| SENTRY_ORG            | Sentry 组织名称                                               |
| SENTRY_PROJECT        | Sentry 项目名称                                               |
| BD_ANALYZE_KEY        | 百度统计 key (为什么这个是构建时，因为有部分页面是完全静态的) |

<br>
<br>
<br>

# rancher 配置注意事项

- 详见 k8s-deployment-zadig 文件
- 负载均衡中建议配置证书，可以自动拒绝 http 的请求

<br>
<br>
<br>

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
