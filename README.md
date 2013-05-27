# grunt-yslow

Grunt task for testing page performance using PhantomJS, a headless WebKit browser.


## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile] with:
`npm install grunt-yslow`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-yslow');
```

## Config
- jasmine
  - pages
  	- src : The path to test
  	- thresholds : optional overrides, same format as global thresholds in options
  - options
  	- thresholds : The global test thresholds which cause the task to pass/fail.
	    - weight : The maximum page weight allowed.
		- speed : The maximum load time of the page allowed.
		- score : The minimum [YSlow performance score] (http://yslow.org/ruleset-matrix/) (out of 100) required.
		- requests : The maximum number of requests the page is allowed to send on load.


## Example grunt config

```javascript
yslow: {
		options: {
			thresholds: {
				weight: 180,
				speed: 1000,
				score: 80,
				requests: 15
			}
		},
		pages: {
			files: [
				{
					src: 'http://andyshora.com'
				},
				{
					src: 'http://www.google.co.uk',
					thresholds: {
						weight: 100
					}
				}
			]
		}
}
```