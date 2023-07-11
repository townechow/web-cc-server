'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { controller, middleware } = app;
  const {
    report,
    application,
  } = controller.producer;
  const {
    user,
  } = controller.customer;
  const apiV1Router = app.router.namespace('/api/v1/');

  // 校验用户是否登录中间件
  const tokenRequired = middleware.tokenRequired();

  // 上报接口
  apiV1Router.post('report', report.report);
  apiV1Router.get('records', report.getRecords);


  // -----------------用户相关------------------
  // 用户登录
  apiV1Router.post('user/login', user.login);
  // 用户注册
  apiV1Router.post('user/register', user.register);
  // 退出登录
  apiV1Router.get('user/logout', tokenRequired, user.logout);
  // 获得用户列表
  apiV1Router.post('user/getUserList', tokenRequired, user.getUserList);
  // 冻结解冻用户
  apiV1Router.post('user/setIsUse', tokenRequired, user.setIsUse);
  // 删除用户
  apiV1Router.post('user/delete', tokenRequired, user.delete);

  // ----------------app配置相关---------------
  // 新增app
  apiV1Router.post('app/add', tokenRequired, application.addNewApp);
  // 修改app
  apiV1Router.post('app/update', tokenRequired, application.updateApp);
  // 根据用户ID获得app信息
  apiV1Router.get('app/getAppByUserId', tokenRequired, application.getAppsByUserId);
  // 根据appID获得单个app信息
  apiV1Router.get('app/getAppById', tokenRequired, application.getAppById);
  // 获得app列表
  apiV1Router.get('app/list', tokenRequired, application.getAppList);
  // 删除app中某个用户
  apiV1Router.post('app/deleteUser', tokenRequired, application.deleteAppUser);
  // 新增app中某个用户
  apiV1Router.post('app/addUser', tokenRequired, application.addAppUser);
  // 删除某个app
  apiV1Router.post('app/delete', tokenRequired, application.deleteApp);
  // 日报邮件操作
  // apiV1Router.post('app/handleDailyEmail', tokenRequired, application.handleDailyEmail);
};
