# 初始化配置文件

进入 deployment 目录
拷贝 variable.sample.jsonc 为 variable.jsonc
修改 variable.jsonc 中的配置
执行 node ./generate.js 生成配置文件
进入 output 目录
按需修改配置文件
使用 scp 将配置文件同步到服务器

# 第一步 Let Encrypt 证书准备

```shell
docker compose -f /path/to/docker-compose-prepare.yml up certbot
```

这个过程中要求你输入邮箱地址等信息，并对域名进行验证，最后生成证书文件。

Let's Encrypt 证书需要定期进行更新, 操作步骤如下：

开启定时任务编辑:

```shell
crontab -e
```

编辑：

```shell
0 0 1,15 * * /usr/bin/docker compose -f /path/to/docker-compose-prepare.yml up --no-deps certbot && /usr/bin/docker compose restart nginx
```

# 第一步 开发环境，不使用 Let's Encrypt 证书

创建自签名证书

```shell
docker compose -f /path/to/docker-compose-prepare-dev.yml up
```

详见：https://github.com/FiloSottile/mkcert:

# 第二步 启动

启动测试

```shell
docker compose up
```

后台启动

```shell
docker compose up -d
```

# 参考

https://www.programonaut.com/setup-ssl-with-docker-nginx-and-lets-encrypt/
Nginx and Let’s Encrypt with Docker in Less Than 5 Minutes: https://pentacent.medium.com/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71
certbot docker 证书生成 https://www.cnblogs.com/vishun/p/15746849.html
