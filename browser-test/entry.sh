#!/usr/bin/env bash

set -ex

# 启动 xvfb
Xvfb :99 -screen 0 1980x1024x24 &

export DISPLAY=:99

# 运行 chrome
google-chrome --no-sandbox &

# 无密码运行 x11vnc
x11vnc -forever

# 运行 vnc://0.0.0.0:5900
