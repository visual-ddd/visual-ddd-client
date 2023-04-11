# 旧浏览器测试
# 基于 sitespeed.io 提供的浏览器镜像进行测试
FROM docker.io/sitespeedio/webbrowsers:chrome-70-firefox-62

WORKDIR /root

COPY ./entry.sh ./

EXPOSE 5900

CMD bash /root/entry.sh
