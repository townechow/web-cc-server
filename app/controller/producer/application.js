'use strict';

const Controller = require('egg').Controller;

class SystemController extends Controller {

  // 新增应用
  async addNewApp() {
    const { ctx } = this;
    return await ctx.service.producer.application.saveAppData(ctx);
  }

  // 修改app信息
  async updateApp() {
    const { ctx } = this;
    return await ctx.service.producer.application.updateAppData(ctx);
  }

  // 根据用户id获取app列表
  async getAppsByUserId() {
    const { ctx } = this;
    const result = await ctx.service.producer.application.getAppsByUserId(ctx);
    ctx.body = this.app.result({
      data: result,
    });
  }

  // 根据appID获得单个app信息
  async getAppById() {
    const { ctx } = this;
    const query = ctx.request.query;
    const appId = query.appId;

    const result = await ctx.service.producer.application.getAppForDb(appId);
    ctx.body = this.app.result({
      data: result,
    });
  }

  // app列表
  async getAppList() {
    const { ctx } = this;

    const result = await ctx.service.producer.application.getAppList();
    ctx.body = this.app.result({
      data: result,
    });
  }

  // 删除app中某个用户
  async deleteAppUser() {
    const { ctx } = this;
    const query = ctx.request.body;
    const appId = query.appId;
    const userId = query.userId;

    if (!appId) throw new Error('删除app中某个用户：appId不能为空');
    if (!userId) throw new Error('删除app中某个用户：userId不能为空');

    const result = await ctx.service.producer.application.deleteAppUser(appId, userId);

    ctx.body = this.app.result({
      data: result,
    });
  }

  // app中新增某个用户
  async addAppUser() {
    const { ctx } = this;
    const query = ctx.request.body;
    const appId = query.appId;
    const userId = query.userId;

    if (!appId) throw new Error('app中新增某个用户：appId不能为空');
    if (!userId) throw new Error('app中新增某个用户：userId不能为空');

    const result = await ctx.service.producer.application.addAppUser(appId, userId);

    ctx.body = this.app.result({
      data: result,
    });
  }

  // 删除某个app
  async deleteApp() {
    const { ctx } = this;
    const query = ctx.request.body;
    const appId = query.appId;

    if (!appId) throw new Error('删除某个app：appId不能为空');

    const result = await ctx.service.producer.application.deleteApp(appId);

    ctx.body = this.app.result({
      data: result,
    });
  }

  // 新增 | 删除 日报邮件
  async handleDailyEmail() {
    const { ctx } = this;
    const query = ctx.request.body;
    const appId = query.appId;
    const email = query.email;
    const type = query.type || 1;
    const item = query.item || 1;

    if (!appId) throw new Error('appId不能为空');

    const result = await ctx.service.producer.application.handleDaliyEmail(appId, email, type, true, item);

    ctx.body = this.app.result({
      data: result,
    });
  }
}

module.exports = SystemController;
