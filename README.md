# web-cc-server



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### 启动docker服务
1. 安装并保证有 docker-compose 的环境
2. 修改 start-docker-compose.sh 里的 hostIP 为外网 IP
⚠️ 不能是 `127.0.0.1` 或 `localhost`

3. docker-compose 启动方式
> 方式一：
```sh
# 项目所在目录
./start-docker-compose.sh
```

> 方式二
```sh
export hostIP='自己的外网IP' && docker-compose up -d --build
```

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org