'use strict';

const Service = require('egg').Service;

class AppService extends Service {

  /*
     * 保存用户上报的数据
     *
     * @param {*} ctx
     * @memberof AppService
     */
  async saveAppData(ctx) {
    const query = ctx.request.body;
    const type = query.type;
    // 参数校验
    if (!query.app_domain && type === 'web') throw new Error('新增应用信息操作：应用域名不能为空');
    if (!query.app_id && type === 'wx') throw new Error('新增应用信息操作：appId不能为空');
    if (!query.app_name) throw new Error('新增应用信息操作：应用名称不能为空');

    // 检验应用是否存在
    const search = await ctx.model.Producer.Application.findOne({ app_domain: query.app_domain }).exec();
    if (search && search.app_domain) throw new Error('新增应用信息操作：应用已存在');

    // 存储数据
    const token = query.app_id ? query.app_id : this.app.randomString();

    const application = ctx.model.Producer.Application();
    application.app_domain = query.app_domain;
    application.app_name = query.app_name;
    application.type = query.type;
    application.app_id = token;
    application.user_id = [ query.user_id || '' ];
    application.create_time = new Date();
    application.is_use = query.is_use;
    application.slow_page_time = query.slow_page_time || 5;
    application.slow_js_time = query.slow_js_time || 2;
    application.slow_css_time = query.slow_css_time || 2;
    application.slow_img_time = query.slow_img_time || 2;
    application.slow_ajax_time = query.slow_ajax_time || 2;
    application.is_statisi_pages = query.is_statisi_pages;
    application.is_statisi_ajax = query.is_statisi_ajax;
    application.is_statisi_resource = query.is_statisi_resource;
    application.is_statisi_app = query.is_statisi_app;
    application.is_statisi_error = query.is_statisi_error;

    const result = await application.save();
    ctx.body = this.app.result({
      data: result,
    });
    // 存储到redis
    this.updateAppCache(token);
  }

  /*
     * 保存用户上报的数据
     *
     * @param {*} ctx
     * @memberof AppService
     */
  async updateAppData(ctx) {
    const query = ctx.request.body;
    const appId = query.appId;
    // 参数校验
    if (!appId) throw new Error('更新应用信息操作：app_id不能为空');

    const update = { $set: {
      is_use: query.is_use || 0,
      app_name: query.app_name || '',
      app_domain: query.app_domain || '',
      slow_page_time: query.slow_page_time || 5,
      slow_js_time: query.slow_js_time || 2,
      type: query.type || 'web',
      slow_css_time: query.slow_css_time || 2,
      slow_img_time: query.slow_img_time || 2,
      slow_ajax_time: query.slow_ajax_time || 2,
      is_statisi_pages: query.is_statisi_pages || 0,
      is_statisi_ajax: query.is_statisi_ajax || 0,
      is_statisi_resource: query.is_statisi_resource || 0,
      is_statisi_app: query.is_statisi_app || 0,
      is_statisi_error: query.is_statisi_error || 0,
      is_daily_use: query.is_daily_use || 0,
    } };
    const result = await this.ctx.model.Producer.Application.update(
      { app_id: appId },
      update,
      { multi: true }
    ).exec();
    ctx.body = this.app.result({ data: result });

    // 更新redis缓存
    this.updateAppCache(appId);
  }

  /*
     * 更新redis缓存
     *
     * @param {*} appId
     * @memberof AppService
     */
  async updateAppCache(appId) {
    const application = await this.getAppForDb(appId);
    await this.app.redis.set(appId, JSON.stringify(application));
  }

  /*
     * 获得某个应用信息(redis)
     *
     * @param {*} appId
     * @return
     * @memberof AppService
     */
  async getAppForAppId(appId) {
    if (!appId) throw new Error('查询某个应用信：appId不能为空');

    const result = await this.app.redis.get(appId) || '{}';
    return JSON.parse(result);
  }

  /*
     * 获得某个应用信息(数据库)
     *
     * @param {*} appId
     * @returns
     * @memberof AppService
     */
  async getAppForDb(appId) {
    if (!appId) throw new Error('查询某个应用信：appId不能为空');

    return await this.ctx.model.Producer.Application.findOne({ app_id: appId }).exec() || {};
  }

  /*
     * 根据用户id获取应用列表
     *
     * @param {*} ctx
     * @returns
     * @memberof AppService
     */
  async getAppsByUserId(ctx) {
    const userId = ctx.request.query.userId;
    if (!userId) return [];
    return await ctx.model.Producer.Application.where('user_id').elemMatch({ $eq: userId }).exec() || [];
  }

  /*
     * 获得应用列表信息
     *
     * @returns
     * @memberof AppService
     */
  async getAppList() {
    return await this.ctx.model.Producer.Application.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'token',
          as: 'userlist',
        },
      },
    ]).exec();
  }

  /*
     * 删除应用中某个用户
     *
     * @param {*} appId
     * @param {*} userId
     * @returns
     * @memberof AppService
     */
  async deleteAppUser(appId, userId) {
    return await this.ctx.model.Producer.Application.update(
      { app_id: appId },
      { $pull: { user_id: userId } },
      { multi: true }).exec();
  }

  /* 应用中新增某个用户
     * @param {*} appId
     * @param {*} userId
     * @return
     * @memberof AppService
     */
  async addAppUser(appId, userId) {
    return await this.ctx.model.Producer.Application.update(
      { app_id: appId },
      { $addToSet: { user_id: userId } },
      { multi: true }).exec();
  }

  /*
     * 删除某个应用
     *
     * @param {*} appId
     * @return
     * @memberof AppService
     */
  async deleteApp(appId) {
    const result = await this.ctx.model.Producer.Application.findOneAndRemove({ app_id: appId }).exec();
    this.app.redis.set(appId, '', 'EX', 200);
    setTimeout(async () => {
      const conn = this.app.mongooseDB.get('db2');
      try { await conn.dropCollection(`web_pages_${appId}`); } catch (err) { console.log(err); }
      try { await conn.dropCollection(`web_ajaxs_${appId}`); } catch (err) { console.log(err); }
      try { await conn.dropCollection(`web_errors_${appId}`); } catch (err) { console.log(err); }
      try { await conn.dropCollection(`web_resources_${appId}`); } catch (err) { console.log(err); }
      try { await conn.dropCollection(`web_environment_${appId}`); } catch (err) { console.log(err); }
    }, 500);
    return result;
  }

  /*
     * 新增 | 删除 日报邮件
     * item: 1:日报邮件发送  2：流量峰值邮件发送
     * @param {*} appId
     * @param {*} email
     * @param {*} type
     * @param {boolean} [handleEmali=true]
     * @param {number} [item=1]
     * @return
     * @memberof AppService
     */
  async handleDaliyEmail(appId, email, type, handleEmali = true, item = 1) {
    type = type * 1;
    item = item * 1;
    let handleData = null;
    if (item === 1) {
      handleData = type === 1 ? { $addToSet: { daliy_list: email } } : { $pull: { daliy_list: email } };
    } else if (item === 2) {
      handleData = type === 1 ? { $addToSet: { highest_list: email } } : { $pull: { highest_list: email } };
    }
    const result = await this.ctx.model.Producer.Application.update(
      { app_id: appId },
      handleData,
      { multi: true }).exec();

    // 更新redis缓存
    this.updateAppCache(appId);

    // 更新邮件相关信息
    if (handleEmali) this.updateEmailAppIds(email, appId, type, item);

    return result;
  }

  /*
     * 更新邮件信息
     *
     * @param {*} email
     * @param {*} appId
     * @param {number} [handletype=1]
     * @param {number} [handleitem=1]
     * @returns
     * @memberof AppService
     */
  async updateEmailAppIds(email, appId, handletype = 1, handleitem = 1) {
    if (!email) return;
    await this.ctx.service.emails.updateAppIds({
      email,
      appId,
      handletype,
      handleitem,
    });
  }
}

module.exports = AppService;
