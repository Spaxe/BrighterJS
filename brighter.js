/*global $, window, document, jQuery*/
;(function ($, window, document, undefined) {
  "use strict";
  var pluginName = 'brighterjs',
      that,
      defaults = {};

  function BrighterJS (element, options) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this.defaults = defaults;
    this.author = "Xavier Ho";
    this.version = "0.0.0";
    this.date = "14 May 2012";

    this.init();
  }

  BrighterJS.prototype = {
    init: function () {
    }
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
        new BrighterJS( this, options ));
      }
    });
  };

})( jQuery, window, document );