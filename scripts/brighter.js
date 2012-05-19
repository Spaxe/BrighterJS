/*jshint laxbreak: true, jquery: true, undef: true */
/*global $, window, document, jQuery, console*/
;(function ($, window, document, undefined) {
  "use strict";
  var that;

  var BrighterJS = function () {
    that = this;
    this.author = "Xavier Ho";
    this.version = "0.0.2";
    this.date = "19 May 2012";

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
    makeHeading: function (paragraphs, headingType) {
      $.each(paragraphs, function (i, paragraph) {
        console.log('Mrraa');
        var $paragraph = $(paragraph);
        var content = $paragraph.html();
        $paragraph.replaceWith($('<' + headingType + '>').html(content));
      });
    },

    //
    // Selection helpers
    //

    // Return the paragraphs that are covered by one or more selections.
    getSelectedParagraphs: function () {
      var selection = window.getSelection();
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
      for (var i = 0; i < selection.rangeCount; ++i) {
        var range = selection.getRangeAt(i);
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
      $('#brighter-menu')
        .css('top', event.pageY + 1)
        .css('left', event.pageX + 1)
        .show(100, 'swing');
      that.paragraphs = that.getSelectedParagraphs();
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
  $(document).on('click.h1', '#brighter-menu-h1', function (event) {
    that.makeHeading(that.paragraphs, 'h1');
  });
  $(document).on('click.h2', '#brighter-menu-h2', function (event) {
    that.makeHeading(that.paragraphs, 'h2');
  });
  $(document).on('click.h3', '#brighter-menu-h3', function (event) {
    that.makeHeading(that.paragraphs, 'h3');
  });

  // Register the plugin to global scope
  window.brighterjs = brighterjs;

})( jQuery, window, document );