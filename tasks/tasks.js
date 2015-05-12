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

  function fetchOption(namespace, option, options, defaults) {
    if (Object.prototype.hasOwnProperty.call(options, namespace) && Object.prototype.hasOwnProperty.call(options[namespace], option)) {
      return options[namespace][option]
    } else if (Object.prototype.hasOwnProperty.call(defaults, namespace) && Object.prototype.hasOwnProperty.call(defaults[namespace], option)) {
      return defaults[namespace][option];
    } else {
      return undefined;
    }
  }

  grunt.registerMultiTask('yslow', 'Run Yslow headlessly through PhantomJS.', function() {

    var urls = this.data.files;
    var testCount = urls.length;
    var testsRun = 0;
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
      thresholdArr[i].thresholdWeight = fetchOption('thresholds', 'weight', data, options);
      thresholdArr[i].thresholdRequests = fetchOption('thresholds', 'requests', data, options);
      thresholdArr[i].thresholdScore = fetchOption('thresholds', 'score', data, options);
      thresholdArr[i].thresholdSpeed = fetchOption('thresholds', 'speed', data, options);

      // get phantomjs binary, or depend on a global(/path) install if it can't be found
      var phantom, cmd;

      try {
        // Look up first
        phantom = require('phantomjs');
        cmd = phantom.path;
      } catch (e) {
        try {
          // Look down if that fails
          phantom = require(path.join(__dirname, '..', 'node_modules', 'grunt-lib-phantomjs', 'node_modules', 'phantomjs'));
          cmd = phantom.path;
        } catch (e) {
          // This should never happen since 'grunt-lib-phantomjs' would have enforced one of the above
          cmd = 'phantomjs';
        }
      }
      
      // creates a seperate scope for child variable
      cmd += ' node_modules/grunt-yslow/tasks/lib/yslow.js --info basic';

      // Add any custom parameters
      var userAgent = fetchOption('yslowOptions', 'userAgent', data, options);
      var cdns = fetchOption('yslowOptions', 'cdns', data, options);
      var viewport = fetchOption('yslowOptions', 'viewport', data, options);
      var headers = fetchOption('yslowOptions', 'headers', data, options);

      if (userAgent) {
        cmd += ' --ua "' + userAgent +'"';
      }
      if (cdns) {
        cmd += ' --cdns "' + cdns.join(',') +'"';
      }
      if (viewport) {
        cmd += ' --viewport "' + viewport + '"';
      }
      if (headers) {
        cmd += " --headers '" + JSON.stringify(headers) + "'";
      }
      cmd += ' ' + url;

      var child = childProcess.exec(cmd, [], function (err, stdout, stderr) {

          var results = JSON.parse(stdout);

          var str = '';

          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdRequests >= results.r, thresholdArr[i].thresholdRequests + ' requests', 'Requests: ' + results.r));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdScore <= results.o, thresholdArr[i].thresholdScore, 'YSlow score: ' + results.o + '/100'));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdSpeed >= results.lt, thresholdArr[i].thresholdSpeed + 'ms', 'Page load time: ' + results.lt + 'ms'));
          str = logBuffer(str, _checkResult(thresholdArr[i].thresholdWeight >= (results.w/1000), thresholdArr[i].thresholdWeight + 'kb', 'Page weight: ' + (results.w/1000) + 'kb'));

          grunt.log.ok('\n');

          if (str.match(/\[FAIL\]/g)) {

            grunt.log.error('\n\n-----------------------------------------------' +
              '\nTest ' + (i+1) + ': ' + urls[i].src + ' \t  FAILED' +
            '\n-----------------------------------------------\n\n');

            grunt.log.error(str);

            done(false);

          } else {
            grunt.log.ok('\n\n-----------------------------------------------' +
              '\nTest ' + (i+1) + ': ' + urls[i].src +
            '\n-----------------------------------------------\n\n');

            grunt.log.ok(str);
          }
          testsRun++;
          if (testsRun >= testCount) {
            done();
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
