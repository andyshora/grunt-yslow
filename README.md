# grunt-yslow

Grunt task for testing page performance using PhantomJS, a headless WebKit browser.


## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile] with:
`npm install grunt-yslow --save-dev`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-yslow');
```

Also make sure that `phantomjs` is in the `$PATH`.  You can add
`./node_modules/grunt-yslow/node_modules/grunt-lib-phantomjs/node_modules/phantomjs` or
do a `$ npm install --global phantomjs`

---

## Config
All config must be specified in your Gruntfile.js under the task name yslow.

### Options
- **thresholds** (object) - An object specifying the global thresholds to test against. These can be overridden by higher specificity against inside the files section below.
    - **weight** (number) - The maximum page weight allowed (kb).
    - **speed** (number) - The maximum load time of the page allowed (ms).
    - **score** (number) - The minimum [YSlow performance score] (http://yslow.org/ruleset-matrix/) (out of 100) required.
    - **requests** - The maximum number of requests the page is allowed to send on load.
- **yslowOptions** (object) - An object specifying any additional parameters for Yslow to use when running the test. This can be overridden below, like thresholds.
    - **userAgent** (string) - The User-Agent to present to the server
    - **cdns** (array of strings) - A list of additional hostnames for Yslow to accept as a Content Delivery Network
    - **viewport** (string) - the size of the viewport in the form *WxH*, where W is the width and H is the height
    - **headers** (object) - an object where keys are the header names and values are the values of additional headers to add to the request
- **files** (object) - An array of objects, specifying a seperate page to test. Generally this is wrapped inside a named sub-task, such as the 'pages' task in the example below.
    - **src** (string) - The absolute url to test.
    - **thresholds** (object) - Any overrides to the global thresholds for this page.
    - **yslowOptions** (object) - Any overrides to the global Yslow Options for this page.

---

## Example Grunt Task

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
