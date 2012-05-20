/*jshint laxbreak: true, jquery: true, undef: true */
/*global $, window, document, jQuery, console*/
;(function ($, window, document, undefined) {
  "use strict";
  var that;

  var BrighterJS = function () {
    that = this;
    this.author = "Xavier Ho";
    this.version = "0.0.5";
    this.date = "20 May 2012";

    this.selection = null; // Working selection;
    this.paragraphs = null; // Working paragraphs.
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
    },

    //
    // Selection helpers
    //

    // Return the paragraphs that are covered by one or more selections.
    getSelectedParagraphs: function (selection) {
      that.selection = selection;
      // Be sure the paragraph is valid before we add it.
      var paragraphs = [];
      var addParagraph = function (paragraph) {
        if ($.inArray(paragraph, paragraphs) === -1
            && $(paragraph).closest('[data-brighterjs]').length > 0)
          paragraphs.push(paragraph);
      };

      // Gather all the selections.  They can be broken into sections, so we
      // shall catch'em all.  Ranges can also be collapsed.  In that case, we
      // only have to look for the beginning.
      for (var i = 0; i < that.selection.rangeCount; ++i) {
        var range = that.selection.getRangeAt(i);
        // Grab the top most element that contains a paragraph, or a heading
        var paragraph = that.getParagraph(range.startContainer);
        // Special case - when the selection is just a cursor.
        if (range.collapsed) {
          addParagraph(paragraph);
          continue;
        }
        // Traverse til the end, however, there is a chance that we may not get
        // to the end.  In that case, we give up :[, and return a partial
        // selection.
        var end = that.getParagraph(range.endContainer);
        // Special case - when the start and the end paragraphs are the same
        if (paragraph === end) {
          addParagraph(paragraph);
          continue;
        }
        do {
          addParagraph(paragraph);
          paragraph = paragraph.nextElementSibling;
        } while (paragraph !== end && !!paragraph);
        if (paragraph === end)
          addParagraph(paragraph);
      }
      return paragraphs;
    },

    // Given any HTML node, this function returns the top-most element that
    // is directly child to the editable region.  If the node isn't inside
    // such a region, returns null.
    getParagraph: function (node) {
      while (!!node && !!node.parentNode) {
        if (typeof node.parentNode.hasAttribute === 'function'
            && node.parentNode.hasAttribute('data-brighterjs'))
          return node;
        node = node.parentNode;
      }
      // If we got here, it means we reached the top level document.
      return null;
    },

    // Restore last selection based on the states
    restoreSelection: function (selection) {
      var windowSelection = window.getSelection();
      windowSelection.removeAllRanges();
      for (var i = 0; i < selection.rangeCount; ++i)
        windowSelection.addRange(selection.getRangeAt(i));
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
      // Update selection because we will loose focus later.
      that.paragraphs = that.getSelectedParagraphs(window.getSelection());
      return false;
    }
  });

  // Hide menu if we clicked on anything
  $(document).on('click.hidebrightermenu', function (event) {
    if (event.which !== 3)
      $('#brighter-menu').hide(100);
  });

  // Context menu buttons
  // Headings
  $(document).on('mousedown.h1', '#brighter-menu-h1', function (event) {
    that.makeParagraphType('h1');
    return false;
  });
  $(document).on('mousedown.h2', '#brighter-menu-h2', function (event) {
    that.makeParagraphType('h2');
    return false;
  });
  $(document).on('mousedown.h3', '#brighter-menu-h3', function (event) {
    that.makeParagraphType('h3');
    return false;
  });
  $(document).on('mousedown.p', '#brighter-menu-p', function (event) {
    that.makeParagraphType('p');
    return false;
  });
  $(document).on('mousedown.blockquote', '#brighter-menu-blockquote', function (event) {
    that.makeParagraphType('blockquote');
    return false;
  });
  $(document).on('mousedown.pre', '#brighter-menu-pre', function (event) {
    that.makeParagraphType('pre');
    return false;
  });

  // Register the plugin to global scope
  window.brighterjs = brighterjs;

})( jQuery, window, document );