# 旧浏览器测试

```shell
docker build -t old-chrome .
docker run -it --rm -p 5900:5900 old-chrome
```

使用 VNC 客户端连接即可
