#!/usr/bin/env bash
apt-get update && \
apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  build-essential \
  g++ && \
npm install
