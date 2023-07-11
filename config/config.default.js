/* eslint valid-jsdoc: "off" */
'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // // use for cookie sign key, should change to your own and keep security
  // config.keys = appInfo.name + '_1681442328338_1463';
  config.name = 'web-cc-server';

  config.description = 'web 监控服务';

  config.keys = 'web_cc_server';

  config.debug = true;

  config.session_secret = 'web_cc_server_secret';

  // 用于安全校验和回调域名根路径 开发路径域名
  config.host = '127.0.0.1';

  config.port = 7001;

  config.origin = `http://${config.host}:${config.port}`;
  // config.origin = 'https://example.com';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 用户密码加盐随机值
  config.user_pwd_salt_addition = 'WEBCC';

  // 用户登录态持续时间 1 天
  config.user_login_timeout = 86400;

  // web浏览器端定时任务是否执行
  config.is_web_task_run = true;

  // wx小程序端定时任务是否执行
  config.is_wx_task_run = true;

  // 执行pvuvip定时任务的时间间隔 每2分钟定时执行一次 (可更改)
  config.pvuvip_task_minute_time = '0 */2 * * * *';

  // 执行pvuvip定时任务的时间间隔 每天定时执行一次
  config.pvuvip_task_day_time = '0 0 0 */1 * *';

  // 执行ip地理位置转换的定时任务 每分钟定时执行一次
  config.ip_task_time = '0 */1 * * * *';

  // 更新用户上报IP对应的城市信息线程数
  config.ip_thread = 5;

  // 上报原始数据使用redis存储、kafka储存、还是使用mongodb存储
  config.report_data_type = 'mongodb'; // redis kafka mongodb

  // 使用redis储存原始数据时，相关配置 （report_data_type=redis生效）
  config.redis_consumption = {
    // 定时任务执行时间
    task_time: '*/20 * * * * *',
    // 每次定时任务消费线程数(web端)
    thread_web: 100,
    // 每次定时任务消费线程数(wx端)
    thread_wx: 100,
    // 消息队列池限制数, 0：不限制 number: 限制条数，高并发时服务优雅降级方案
    total_limit_web: 10000,
    total_limit_wx: 10000,
  };
  // redis配置
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 0,
    },
  };

  // mongodb 服务
  const dbclients = {
    db2: {
      // 解析后的数据
      url: 'mongodb://127.0.0.1:27017/consumer',
      options: {
        autoReconnect: true,
        poolSize: 20,
        useUnifiedTopology: true,
      },
    },
  };
  if (config.report_data_type === 'mongodb') {
    // 上报的原始数据
    dbclients.db1 = {
      url: 'mongodb://127.0.0.1:27017/producer',
      options: {
        autoReconnect: true,
        poolSize: 20,
        useUnifiedTopology: true,
      },
    };
  }

  // mongoose配置
  config.mongoose = {
    clients: dbclients,
  };

  config.security = {
    domainWhiteList: [ 'http://127.0.0.1:7002' ],
    csrf: {
      enable: false,
      ignore: '/api/v1/report/**',
    },
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,PUT,POST,DELETE',
  };
  config.bodyParser = {
    enableTypes: [ 'json', 'form', 'text' ],
    extendTypes: {
      text: [ 'text/xml', 'application/xml' ],
    },
  };

  config.onerror = {
    all(err, ctx) {
      // 统一错误处理
      ctx.body = {
        code: 1001,
        desc: err.toString().replace('Error: ', ''),
      };
      ctx.status = 200;
      // 统一错误日志记录
      ctx.logger.info(`统一错误日志：发现了错误${err}`);
    },
  };

  // ldap
  config.ldap = {
    isuse: false, // 是否采用ldap;
    server: 'ldap://xxx', // ldap服务器地址
    ou: 'xx', // ou
    dc: 'xx', // dc, 非com的另外一层的dc，例如 dc=foobar,dc=com, 这里填 foobar
  };

  return {
    ...config,
    ...userConfig,
  };
};
