"use strict";
const Controller = require("egg").Controller;

class ReportController extends Controller {
  // web用户数据上报


  async report() {
    const { ctx } = this;
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Content-Type", "application/json;charset=UTF-8");
    ctx.set("X-Response-Time", "2s");
    ctx.set("Connection", "close");
    ctx.status = 200;
    const contentType = ctx.request.headers["content-type"];
    let query = ctx.request.body;
    if (contentType.includes("text/plain")) {
      try {
        query = JSON.parse(query);
      } catch (error) {
        throw error;
      }
    }

    if (!query.apikey) throw new Error("web端上报数据操作：apikey 不能为空");
    
    query.ip = ctx.get("X-Real-IP") || ctx.get("X-Forwarded-For") || ctx.ip;
    query.app_id = query.app_id || query.apikey
    
    const countApp =  await this.ctx.model.Producer.Application.count({ app_id: query.app_id }).read("sp").exec()
    if (!countApp) {
      throw new Error(`appId：${query.app_id} 不存在`)
    }

    if (query.type === "error" || query.type == "unhandledrejection") {
      ctx.service.report.saveErrorCode(query)
      this.pushMsg(query);
    }
    if (query.type === "xhr" || query.type === "fetch") {
      ctx.service.report.saveErrorApi(query)
    }
    if (query.type === "performance") {
      ctx.service.report.savePerformance(query)
    }
    if (query.type === "recordScreen") {
      ctx.service.report.saveRecordScreen(query)
    }
    if (query.type === "resource") {
      ctx.service.report.saveErrorResource(query)
    }
  }
  // 消息推送
  async pushMsg(query) {
    const { ctx } = this;
    const url =
      "https://oapi.dingtalk.com/robot/send?access_token=e6d8bab62112a5c97070357c1d9953a5981beacb9defa6eecc078ac2829b5cdc";
    try {
      const tokenResult = await ctx.curl(url, {
        method: "POST",
        contentType: "json",
        data: {
          msgtype: "markdown",
          markdown: {
            title: "webcc-应用报错",
            text: `#### apikey: ${query.apikey}\n - type :${query.type
              }\n - pageUrl : ${query.pageUrl}\n - message:${query.message
              }\n - fileName:${query.fileName}\n - sdkVersion:${query.sdkVersion
              }\n - uuid:${query.uuid}\n - time:${this.app.format(
                new Date(query.time),
                "yyyy/MM/dd hh:mm:ss"
              )}`,
          },
          at: {
            // atMobiles: [
            //   '150XXXXXXXX',
            // ],
            // atUserIds: [
            //   'user123',
            // ],
            isAtAll: true,
          },
        },
        dataType: "json",
        timeout: 8000,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  // 上报记录查询
  async getRecords() {
    const { ctx } = this;
    const query = ctx.request.query;
    const pageNo = +query.pageNo || 1;
    const pageSize = +(query.pageSize || this.app.config.pageSize) || 20;
    const type = query.type;
    const uuid = query.uuid;
    const beginTime = +query.beginTime || Date.now() - 60 * 60 * 24 * 1000;
    const endTime = +query.endTime || Date.now();
    if (!query.appId) throw new Error("appId 不能为空");
    const countApp =  await this.ctx.model.Producer.Application.count({ app_id: query.appId }).read("sp").exec()
    if (!countApp) {
      // throw new Error(`appId：${query.appId} 不存在`)
      this.ctx.body = {
        name: 'egg',
        category: 'framework',
        language: 'Node.js',
      };
      return
    }
    const result = await ctx.service.report.getRecords({
      pageNo,
      pageSize,
      type,
      uuid,
      beginTime,
      endTime,
      appId: query.appId
    });

    ctx.body = this.app.result({
      data: result,
    });
  }
}

module.exports = ReportController;
