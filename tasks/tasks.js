/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // node api
  var fs   = require('fs'),
    path = require('path'),
    resultsArr = [];

  // npm lib
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  var childProcess = require('child_process');

  var _ = grunt.util._;



  grunt.registerMultiTask('yslow', 'Run jasmine specs headlessly through PhantomJS.', function() {

    var urls = this.data.files;
    var testCount = urls.length;
    var logBufferArr = [], thresholdArr = [];
    var options = this.options({});

    var temp = testCount;

    while(temp--) {
      logBufferArr.push('');
      thresholdArr.push({
        thresholdWeight: null,
        thresholdRequests: null,
        thresholdScore: null,
        thresholdSpeed: null
      });
    }

    logWrite('Testing ' + testCount + ' URLs, this might take a few moments...\n\n');


    // This task is asynchronous.
    var done = this.async();

    var createPhantomRunner = function(i) {
      // console.log('createPhantomRunner', i);

      var url = urls[i].src[0];
      var data = urls[i];

      // setup thresholds
      var customThresholds = Object.prototype.hasOwnProperty.call(data, 'thresholds');
      thresholdArr[i].thresholdWeight = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'weight') ? data.thresholds.weight : options.thresholds.weight;
      thresholdArr[i].thresholdRequests = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'requests') ? data.thresholds.requests : options.thresholds.requests;
      thresholdArr[i].thresholdScore = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'score') ? data.thresholds.score : options.thresholds.score;
      thresholdArr[i].thresholdSpeed = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'speed') ? data.thresholds.speed : options.thresholds.speed;


      // creates a seperate scope for child variable
      var cmd = 'phantomjs node_modules/grunt-yslow/tasks/lib/yslow.js --info basic ' + url;
      var child = childProcess.exec(cmd, [], function (err, stdout, stderr) {
          // console.log('inside, cmd', cmd, url);

          var results = JSON.parse(stdout);

          var str = '';

          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdRequests >= results.r, thresholdArr[i].thresholdRequests + 'requests', 'Requests: ' + results.r));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdScore <= results.o, thresholdArr[i].thresholdScore, 'YSlow score: ' + results.o + '/100'));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdSpeed >= results.lt, thresholdArr[i].thresholdSpeed + 'ms', 'Page load time: ' + results.lt + 'ms'));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdWeight >= (results.w/1000), thresholdArr[i].thresholdWeight + 'kb', 'Page weight: ' + (results.w/1000) + 'kb'));

          grunt.log.ok('\n');

          if (str.match(/\[FAIL\]/g)) {

            grunt.log.error('\n\n-----------------------------------------------' +
              '\nTest ' + (i+1) + ': ' + urls[i].src + ' \t  FAILED' +
            '\n-----------------------------------------------\n\n');

            grunt.log.error(str);

          } else {
            grunt.log.ok('\n\n-----------------------------------------------' +
              '\nTest ' + (i+1) + ': ' + urls[i].src +
            '\n-----------------------------------------------\n\n');

            grunt.log.ok(str);
          }

      });
    };

    for (var i=0; i<urls.length; i++) {
      createPhantomRunner(i);
    }

  });

  var _checkResult = function(res, threshold, msg) {
    if (res) {
      return msg + ' [PASS]';
    } else {
      return msg + ' [FAIL] threshold is ' + threshold;
    }
  };

  function logWrite(text, isInline) {

    text += (isInline ? '' : '\n');
    grunt.log.ok(text);
  }

  function logBuffer(str, text, isInline) {
    text += (isInline ? '' : '\n');
    return str + text;
  }



};
