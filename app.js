'use strict';

module.exports = async app => {
  app.models = {};
  app.beforeStart(async () => {
    const _ctx = app.createAnonymousContext();
  });
};
