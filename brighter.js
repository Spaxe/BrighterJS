/*jshint laxbreak: true, jquery: true, undef: true */
/*global $, window, document, jQuery, console*/
;(function ($, window, document, undefined) {
  "use strict";
  var that;

  var BrighterJS = function () {
    that = this;
    this.author = "Xavier Ho";
    this.version = "0.0.1";
    this.date = "15 May 2012";

    this.init();
  };

  BrighterJS.prototype = {
    init: function () {

    },

    //
    // Element-editing functions
    //

    makeEditable: function ($element) {
      $element.attr('contenteditable', 'true');
      $element.addClass('brighterjs-editable');
    },

    // Changes the current selection to a specific type of elements.
    makeHeading: function (headingType) {
      $.each(that.getSelectedParagraphs(), function (i, paragraph) {
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

  //
  // Hotkeys
  //

  // Heading 1-6
  $('[data-brighterjs]').on('keyup.alt_1', function (event) {
    that.makeHeading('h1');
    return false;
  });

  // Execute BrighterJS
  $.each($('[data-brighterjs]'), function(i, element) {
    var $element = $(element);
    if ($element.data('brighterjs') === 'content')
      brighterjs.makeEditable($element);
  });

  // Register the plugin to global scope
  window.brighterjs = brighterjs;

})( jQuery, window, document );