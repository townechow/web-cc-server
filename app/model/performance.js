'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const Mixed = Schema.Types.Mixed;
  const conn = app.mongooseDB.get('db1');
  if (!conn) return;

  const breadcrumb = new Schema({
    category: { type: String },
    status: { type: String },
    time: { type: Number },
    type: { type: String },
    data: { type: Mixed },
  });

  const deviceInfo = new Schema({
    browserVersion: { type: String }, // 版本号
    browser: { type: String }, // Chrome
    osVersion: { type: String }, // 电脑系统 10
    os: { type: String }, // 设备系统
    ua: { type: String }, // 设备详情
    device: { type: String }, // 设备种类描述
    device_type: { type: String }, // 设备种类，如pc
  });

  const ReportSchema = new Schema({
    sdkVersion: { type: String }, // 版本信息
    app_id: { type: String }, // 应用标识
    type: { type: String }, // 事件类型
    pageUrl: { type: String }, // 页面地址 
    time: { type: Number }, // 发生时间
    uuid: { type: String }, // 页面唯一标识
    status: { type: String }, // 事件状态
    breadcrumb: { type: [breadcrumb] }, // ?用户行为
    deviceInfo: { type: deviceInfo },
    ip: { type: String },
    name: { type: String },
    value: { type: Mixed },

  });
  ReportSchema.index({ create_time: 1 });

  // return conn.model('performance', ReportSchema);
  app.model.Performance = function (appId) {
    return conn.model(`performance_${appId}`, ReportSchema);
  };
};
