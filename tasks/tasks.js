/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// node api
	var fs	 = require('fs'),
		path = require('path'),
		status = null,
		resultsArr = [];

	// npm lib
	var phantomjs = require('grunt-lib-phantomjs').init(grunt);
	var webpage = 'http://andyshora.com';

	var exec = require('child_process').exec;
	var _ = grunt.util._;



	grunt.registerMultiTask('yslow', 'Run jasmine specs headlessly through PhantomJS.', function() {

			// Merge task-specific options with these defaults.
		var options = this.options({
			version : '0.0.1',
			timeout : 5000,
			styles	: [],
			specs	 : [],
			helpers : [],
			vendor	: [],
			host		: '',
			template : __dirname + '/jasmine/templates/DefaultRunner.tmpl',
			templateOptions : {},
			phantomjs : {},
			junit: {}
		});

		//setup(options);

		var urls = this.data.files;
		var testCount = urls.length;
		var logBufferArr = [], thresholdArr = [];

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

		logWrite('Testing ' + testCount + ' URLs...\n\n');

		// This task is asynchronous.
		var done = this.async();

		// Reset status.
		status = {failed: 0, passed: 0, total: 0, duration: 0};

		var i = 0, cb = 0;
		// Process each filepath in-order, this should be recursive
		for (var key in urls) {



			var data = urls[key];

			var url = data.src;



			//var thresholdWeight =

			var customThresholds = Object.prototype.hasOwnProperty.call(data, 'thresholds');

			thresholdArr[i].thresholdWeight = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'weight') ? data.thresholds.weight : options.thresholds.weight;

			thresholdArr[i].thresholdRequests = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'requests') ? data.thresholds.requests : options.thresholds.requests;

			thresholdArr[i].thresholdScore = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'score') ? data.thresholds.score : options.thresholds.score;

			thresholdArr[i].thresholdSpeed = customThresholds && Object.prototype.hasOwnProperty.call(data.thresholds, 'speed') ? data.thresholds.speed : options.thresholds.speed;



			var cmd = 'phantomjs node_modules/grunt-yslow/tasks/lib/yslow.js --info basic ' + url;
			var cp = exec(cmd, [], function (err, stdout, stderr) {


				var results = JSON.parse(stdout);


				logBufferArr[cb] = logBuffer(logBufferArr[cb], _checkResult(thresholdArr[cb].thresholdRequests >= results.r, thresholdArr[cb].thresholdRequests+ 'requests', 'Requests: ' + results.r));

				logBufferArr[cb] = logBuffer(logBufferArr[cb], _checkResult(thresholdArr[cb].thresholdScore <= results.o, thresholdArr[cb].thresholdScore, 'YSlow score: ' + results.o + '/100'));

				logBufferArr[cb] = logBuffer(logBufferArr[cb], _checkResult(thresholdArr[cb].thresholdSpeed >= results.lt, thresholdArr[cb].thresholdSpeed+'ms', 'Page load time: ' + results.lt + 'ms'));

				logBufferArr[cb] = logBuffer(logBufferArr[cb], _checkResult(thresholdArr[cb].thresholdWeight >= (results.w/1000), thresholdArr[cb].thresholdWeight+'kb', 'Page weight: ' + (results.w/1000) + 'kb'));


					if (cb===testCount-1) {
						for (var j in logBufferArr) {

							grunt.log.ok('\n');

							if (logBufferArr[j].match(/\[FAIL\]/g)) {

								grunt.log.error('\n\n-----------------------------------------------' +
									'\nTest ' + (cb+1) + ': ' + urls[cb].src + ' \t  FAILED' +
								'\n-----------------------------------------------\n\n');

								grunt.log.error(logBufferArr[j]);

							} else {
								grunt.log.ok('\n\n-----------------------------------------------' +
									'\nTest ' + (cb+1) + ': ' + urls[cb].src +
								'\n-----------------------------------------------\n\n');

								grunt.log.ok(logBufferArr[j]);
							}

							// write results buffer

						}
					}

					cb++;



			});

			i++;

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
		//status.log += text;
		grunt.log.ok(text);
	}

	function logBuffer(str, text, isInline) {
		text += (isInline ? '' : '\n');
		return str + text;
	}



};
