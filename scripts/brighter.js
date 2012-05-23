/*jshint laxbreak: true, jquery: true, undef: true */
/*global $, window, document, jQuery, console*/
;(function ($, window, document, undefined) {
  "use strict";
  var that;

  var BrighterJS = function () {
    that = this;
    this.author = "Xavier Ho";
    this.version = "0.0.7";
    this.date = "23 May 2012";

    this.init();
  };

  BrighterJS.prototype = {
    init: function () {
      that.setupContextMenu();
    },

    setupContextMenu: function () {
      $.ajax('templates/brighter-menu.html').success(function (data) {
        $(document.body).append(data);
      });
    },

    //
    // Element-editing functions
    //

    makeEditable: function ($element) {
      $element.attr('contenteditable', 'true');
      $element.addClass('brighterjs-editable');
    },

    // Changes the current selection to a specific type of elements.
    makeParagraphType: function (tagName) {
      document.execCommand('formatBlock', false, '<' + tagName + '>');
    }
  };

  // Prototype, I choose you!
  var brighterjs = new BrighterJS();

  // Execute BrighterJS
  $.each($('[data-brighterjs]'), function(i, element) {
    var $element = $(element);
    if ($element.data('brighterjs') === 'content')
      brighterjs.makeEditable($element);
  });

  // Disable right clicks when in edit mode and display our own.
  $(document).on('contextmenu.brighter', '[data-brighterjs][contenteditable]', function (event) {
    if (event.ctrlKey) {
      var x = event.pageX + 1;
      var y = event.pageY + 1;
      var windowWidth = $(window).outerWidth();
      // Ensure the context menu doesn't go over.
      if (x + 200 > windowWidth - 50)
        x = windowWidth - 250;
      $('#brighter-menu')
        .css('top', y)
        .css('left', x)
        .show(100, 'swing');
      return false;
    }
  });

  // Hide menu if we clicked on anything
  $(document).on('click.hidebrightermenu', function (event) {
    if (event.which !== 3)
      $('#brighter-menu').hide(100);
  });

  // Prevent selection from menu
  $(document).on('mousedown.preventselection', '#brighter-menu', function (event) {
    return false;
  });

  // Context menu buttons
  // Paragraph types
  $.each(['h1','h2','h3','h4','h5','h6','p','blockquote','pre'], function (i, x) {
    $(document).on('click.' + x, '#brighter-menu-' + x, function (event) {
      that.makeParagraphType(x);
    });
  });
  // Alignment
  $(document).on('click.leftalign', '#brighter-menu-leftalign', function (event) {
    document.execCommand('justifyLeft', false);
  });
  $(document).on('click.centrealign', '#brighter-menu-centrealign', function (event) {
    document.execCommand('justifyCenter', false);
  });
  $(document).on('click.rightalign', '#brighter-menu-rightalign', function (event) {
    document.execCommand('justifyRight', false);
  });
  $(document).on('click.ol', '#brighter-menu-ol', function (event) {
    document.execCommand('insertOrderedList', false);
  });
  $(document).on('click.ul', '#brighter-menu-ul', function (event) {
    document.execCommand('insertUnorderedList', false);
  });

  // Register the plugin to global scope
  window.brighterjs = brighterjs;

})( jQuery, window, document );