# 多人协作 websocket 服务器

# Build

```shell
$ docker build -t wkfe/visual-ddd-collab --platform linux/amd64 .

# 打版本
$ docker tag wkfe/visual-ddd-collab  作用域/wkfe/visual-ddd-collab:版本号或latest

# 推送
$ docker push 作用域/wkfe/visual-ddd-collab:版本号或latest
```

# Run

暴露 9090 端口

# 支持环境变量

- MAIN_SERVER 主服务器入口地址， 比如 https://ddd.wakedt.cn
