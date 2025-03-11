require.config({
  paths: {
    'postal': 'messagebus/postal',
    'postal.federation': 'messagebus/postal.federation',
    'xframe': 'messagebus/postal.xframe',
    'request-response': 'messagebus/postal.request-response',
    'riveter': 'messagebus/riveter',
    'underscore': 'messagebus/underscore',
    'lodash': 'messagebus/lodash',
    'promise': 'messagebus/q',
    'TweenLite': 'com/gsap/TweenLite',
    'TweenMax': 'com/gsap/TweenMax'
  },
  map: {
    "*": {
      "TweenLite": "com/gsap/TweenLite",
      "TweenMax": "com/gsap/TweenMax"
    }
  },
  shim: {
    'com/pixijs/pixi-particles': {
      deps: ['com/pixijs/pixi']
    }
  },
  waitSeconds: 25
});