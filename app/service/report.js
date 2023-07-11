'use strict';

const Service = require('egg').Service;

class ReportService extends Service {
  // 按类型分表-保存上报的数据， 
  basicFileds(report, query) {
    report.app_id = query.app_id;
    report.type = query.type;
    report.pageUrl = query.pageUrl;
    report.time = query.time;
    report.uuid = query.uuid;
    report.status = query.status;
    report.sdkVersion = query.sdkVersion;
    report.deviceInfo = query.deviceInfo;
    report.ip = query.ip;
    report.save();
  }
  async saveErrorCode(query) {
    const report = this.app.model.ErrorCode(query.app_id)()
    report.recordScreenId = query.recordScreenId
    report.breadcrumb = query.breadcrumb;
    report.message = query.message
    report.line = query.line
    report.column = query.column
    report.fileName = query.fileName
    this.basicFileds(report, query)
    return {};
  }
  async saveErrorApi(query) {
    const report = this.app.model.ErrorApi(query.app_id)()
    report.recordScreenId = query.recordScreenId
    report.breadcrumb = query.breadcrumb;
    report.message = query.message
    report.url = query.url
    report.requestData = query.requestData
    report.response = query.response
    this.basicFileds(report, query)
    return {};
  }

  async saveErrorResource(query) {
    const report = this.app.model.ErrorResource(query.app_id)()
    report.recordScreenId = query.recordScreenId
    report.breadcrumb = query.breadcrumb;
    report.message = query.message
    report.name = query.name
    report.url = query.url
    this.basicFileds(report, query)
    return {};
  }
  async saveRecordScreen(query) {
    const report = this.app.model.RecordScreen(query.app_id)()
    report.recordScreenId = query.recordScreenId
    report.events = query.events
    this.basicFileds(report, query)
    return {};
  }
  async savePerformance(query) {
    const report = this.app.model.Performance(query.app_id)()
    report.name = query.name
    report.value = query[query.name] || query.rating || query.value
    this.basicFileds(report, query)
    return {};
  }

  collectionNameMap = {
    "error": "ErrorCode",
    "resource": "ErrorResource",
    "api": "ErrorApi",
    "performance": "Performance",
    "recordscreen": "RecordScreen",
  }

  async getRecords({ appId, pageNo, pageSize, uuid, type, beginTime, endTime }) {
    const queryjson = {};
    // if (type) queryjson.type = type;
    if (uuid) queryjson.uuid = uuid;
    if (beginTime && endTime && !uuid) {
      queryjson.time = {
        $gte: beginTime,
        $lte: endTime,
      };
    }
    let count = 0
    let datas = []
    if (type) {
      const collectionName = this.collectionNameMap[type]
      count = Promise.resolve(
        this.app.model[collectionName](appId).count(queryjson).read("sp").exec()
      );
      datas = Promise.resolve(
        this.app.model[collectionName](appId).find(queryjson)
          .read("sp")
          .sort({ time: 1 })
          .skip((pageNo - 1) * pageSize)
          .limit(pageSize)
          .exec()
      );
    } else {
      // todo 多表分页查询
      // const resolvelist = Object.values(this.collectionNameMap).map(name => this.app.model[name](appId).count(queryjson).read("sp").exec())
    }


    const all = await Promise.all([count, datas]);
    const [totalNum, datalist] = all;

    return {
      datalist,
      totalNum,
      pageNo,
      queryjson,
    };
  }

}

module.exports = ReportService;
