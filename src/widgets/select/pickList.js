(function ($) {

  $.widget('rf.pickList', {

    options: {
      disabled: false,
      header: undefined,
      styleClass: undefined,
      columnClasses: undefined,
      sourceHeader: undefined,
      targetHeader: undefined,
      switchByClick: undefined,
      switchByDblClick: undefined,
      orderButtonsText: undefined, // {first: ..., up: ..., down: ..., last: ...}
      pickButtonsText: undefined, // {addAll: ..., add: ..., remove: ..., removeAll: ...}
    },

    _create: function () {
      this.widgetEventPrefix = "picklist_";
      this.sourceList = this.element.find(".source");
      this.targetList = this.element.find(".target");
      this._addDomElements();
      this.sourceList.orderingList({
        showButtons: false,
        contained: false,
        columnClasses: this.options.columnClasses,
        disabled: this.options.disabled,
        header: this.options.sourceHeader,
        widgetEventPrefix: 'sourcelist_'
      });
      this.targetList.orderingList({
        contained: false,
        columnClasses: this.options.columnClasses,
        buttonsText: this.options.orderButtonsText,
        disabled: this.options.disabled,
        header: this.options.targetHeader,
        widgetEventPrefix: 'targetlist_'
      });
      this.sourceList.orderingList("connectWith", this.targetList);
      this.targetList.orderingList("connectWith", this.sourceList);

      this._registerListeners();
      if (this.options.switchByClick) {
        this._addClickListeners();
      }

      if (this.options.switchByDblClick) {
        this._addDoubleClickListeners();
      }

      if (this.options.disabled === true) {
        this._disable();
      }
    },

    destroy: function () {
      $.Widget.prototype.destroy.call(this);
      this.sourceList.orderingList("destroy");
      this.targetList.orderingList("destroy");

      this._removeDomElements();

      this.element.removeClass('inner').removeClass("row");
      if (!this.element.attr('class')) {
        this.element.removeAttr("class");
      }
      return this;
    },

    /** Public API methods **/

    removeItems: function (items, event) {
      if (this.options.disabled) return;
      this.targetList.orderingList("remove", items);
      this.sourceList.orderingList("add", items);
      var ui = this._dumpState();
      ui.change = 'remove';
      this._trigger("change", event, ui);
    },

    addItems: function (items, event) {
      if (this.options.disabled) return;
      this.sourceList.orderingList("remove", items);
      this.targetList.orderingList("add", items);
      var ui = this._dumpState();
      ui.change = 'add';
      this._trigger("change", event, ui);
    },


    /** Initialisation methods **/

    _setOption: function (key, value) {
      var that = this;
      if (this.options.key === value) {
        return;
      }
      switch (key) {
        case "disabled":
          if (value === true) {
            that._disable();
          } else {
            that._enable();
          }
          break;
        case "header":
          if (!that.options.header) {
            that._addHeader(value);
          }
          that.outer.find('.header-row .header').text(value);
          break;
        case "sourceHeader":
          if (!that.options.sourceHeader) {
            that._addSubHeader(value, this.options.targetHeader);
          }
          that.outer.find('.sub-header-row .source').text(value);
          break;
        case "targetHeader":
          if (!that.options.targetHeader) {
            that._addSubHeader(value, this.options.targetHeader);
          }
          that.outer.find('.sub-header-row .target').text(value);
          break;
        case "styleClass":
          if (that.options.styleClass) {
            that.outer.removeClass(that.options.styleClass);
          }
          that.outer.addClass(value);
          break;
        case "columnClasses":
          that.sourceList.orderingList('option', 'columnClasses', value);
          that.targetList.orderingList('option', 'columnClasses', value);
          break;
        case "orderButtonsText":
          that.targetList.orderingList('option', 'buttonsText', value);
          break;
        case "buttonsText":
          this._applyButtonsText(this.outer.find('.middle .btn-group-vertical'), value);
          break;
        case "switchByClick":
          if (value === true) {
            that._addClickListeners();
          } else {
            that._removeClickListeners();
          }
          break;
        case "switchByDblClick":
          if (value === true) {
            that._addDoubleClickListeners();
          } else {
            that._removeDoubleClickListeners();
          }
          break;
      }
      $.Widget.prototype._setOption.apply(that, arguments);
    },


    _addDomElements: function () {
      this._addParents();
      var buttonColumn = $('<div />').addClass('middle button-column col-sm-1');
      buttonColumn.append(this._buttonStack());
      this.sourceList.parent().after(buttonColumn);
    },

    _buttonStack: function () {
      var button = $('<button type="button" class="btn btn-default"/>');
      var buttonStack = $("<div/>")
        .addClass("btn-group-picklist");
      buttonStack
        .append(
          button.clone()
            .addClass('btn-remove-all col-sm-12 col-xs-3')
            .html('<i class="icon icon-left-all" />')
            .on('click.pickList', $.proxy(this._removeAllHandler, this))
        )
        .append(
          button.clone()
            .addClass('btn-remove col-sm-12 col-xs-3')
            .html('<i class="icon icon-left" />')
            .on('click.pickList', $.proxy(this._removeHandler, this))
        )
        .append(
          button.clone()
            .addClass('btn-add col-sm-12 col-xs-3')
            .html('<i class="icon icon-right" />')
            .on('click.pickList', $.proxy(this._addHandler, this))
        )
        .append(
          button
            .clone()
            .addClass('btn-add-all col-sm-12 col-xs-3')
            .html('<i class="icon icon-right-all" />')
            .on('click.pickList', $.proxy(this._addAllHandler, this))
        );
      if (this.options.pickButtonsText) {
        this._applyButtonsText(buttonStack, this.options.pickButtonsText);
      }
      return buttonStack;
    },

    _applyButtonsText: function(buttonStack, buttonsText) {
      this._applyButtonText(buttonStack.find('.btn-add-all'), buttonsText.addAll);
      this._applyButtonText(buttonStack.find('.btn-add'), buttonsText.add);
      this._applyButtonText(buttonStack.find('.btn-remove'), buttonsText.remove);
      this._applyButtonText(buttonStack.find('.btn-remove-all'), buttonsText.removeAll);
    },

    _applyButtonText: function(button, text) {
      if (!text) {
        if (button.hasClass('labeled')) {
          button.removeClass('labeled');
          button.find('span').remove();
        }
        return;
      }
      if (button.hasClass('labeled')) {
        button.find('span').text(text);
      } else {
        button.addClass("labeled").append($("<span />").text(text));
      }
    },

    _addParents: function () {
      this.element.addClass("row inner").wrap(
        $("<div />").addClass('container pick-list outer')
      );
      this.outer = this.element.parents(".outer").first();
      if (this.options.styleClass) {
        this.outer.addClass(this.options.styleClass);
      }
      if (this.options.header) {
        this._addHeader(this.options.header);
      }
      if (this.options.sourceHeader || this.options.targetHeader) {
        this._addSubHeader(this.options.sourceHeader, this.options.targetHeader);
      }
      this.sourceList.wrap(
        $("<div />").addClass('source-wrapper col-sm-5')
      )
      this.targetList.wrap(
        $("<div />").addClass('target-wrapper col-sm-6')
      )
      this.content = this.element;
    },

    _addSubHeader: function (sourceHeader, targetHeader) {
      if (sourceHeader || targetHeader) {
        var subHeaderRow = $("<div />").addClass("row sub-header-row");
        var sourceHeader = $("<div />").addClass('col-sm-5 source header').html(sourceHeader);
        var targetHeader = $("<div />").addClass('col-sm-6 col-sm-offset-1 target header').html(targetHeader);
        subHeaderRow.append(sourceHeader).append(targetHeader);
        this.outer.prepend(subHeaderRow);
      }
    },

    _addHeader: function (header) {
      this.header = headerRow;
      if (header) {
        var headerRow = $("<div />").addClass("row header-row");
        var header = $("<div />").addClass('col-xs-12 header').html(header);
        headerRow.append(header);
        this.outer.prepend(headerRow);
      }
    },

    _registerListeners: function () {
      var that = this;
      // the widget factory converts all events to lower case
      this.sourceList.on('sourcelist_receive', function (event, ui) {
        var new_ui = that._dumpState();
        new_ui.change = 'remove';
        new_ui.originalEvent = event;
        that._trigger("change", event, new_ui);
      });
      this.targetList.on('targetlist_receive', function (event, ui) {
        var new_ui = that._dumpState();
        new_ui.change = 'add';
        new_ui.originalEvent = event;
        that._trigger("change", event, new_ui);
      });
      this.targetList.on('targetlist_change', function (event, ui) {
        var new_ui = that._dumpState();
        new_ui.change = 'sort';
        new_ui.originalEvent = event;
        that._trigger("change", event, new_ui);
      });
    },

    _addClickListeners: function () {
      var widget = this;
      this.sourceList.on('click.pickList', '.ui-selectee', function(event) {
        widget.addItems($(this), event);
      });
      this.targetList.on('click.pickList', '.ui-selectee', function(event) {
        widget.removeItems($(this), event);
      });
    },

    _removeClickListeners: function () {
      this.sourceList.off('click.picklist', '.ui-selectee');
      this.targetList.off('click.picklist', '.ui-selectee');
    },

    _addDoubleClickListeners: function () {
      var widget = this;
      this.sourceList.on('dblclick.pickList', '.ui-selectee', function(event) {
        widget.addItems($(this), event);
      });
      this.targetList.on('dblclick.pickList', '.ui-selectee', function(event) {
        widget.removeItems($(this), event);
      });
    },

    _removeDoubleClickListeners: function () {
      this.sourceList.off('dblclick.picklist', '.ui-selectee');
      this.targetList.off('dblclick.picklist', '.ui-selectee');
    },

    _disable: function () {
      this.sourceList.orderingList("option", "disabled", true);
      this.targetList.orderingList("option", "disabled", true);
      this.element.addClass("disabled")
      this.outer.find('.button-column button').attr("disabled", true);
    },

    _enable: function () {
      this.sourceList.orderingList("option", "disabled", false);
      this.targetList.orderingList("option", "disabled", false);
      this.element.removeClass("disabled");
      this.outer.find('.button-column button').attr("disabled", false);
      this._registerListeners();
    },


    _dumpState: function () {
      var ui = {};
      ui.pickedElements = this.targetList.orderingList("getOrderedElements");
      ui.pickedKeys = this.targetList.orderingList("getOrderedKeys");
      return ui;
    },

    /** Cleanup methods **/

    _removeDomElements: function () {
      this.sourceList.parents('.source-wrapper').first().replaceWith(this.sourceList.detach());
      this.targetList.parents('.target-wrapper').first().replaceWith(this.targetList.detach());
      this.element.find('.middle').remove();
      var list = this.element.detach();
      this.outer.replaceWith(list);
    },

    /** Event Handlers **/

    _removeAllHandler: function (event) {
      var items = $('.ui-selectee', this.targetList);
      this.removeItems(items, event);
      this.sourceList.orderingList('selectItem', items);
    },

    _removeHandler: function (event) {
      this.removeItems($('.ui-selected', this.targetList), event);
    },

    _addHandler: function (event) {
      this.addItems($('.ui-selected', this.sourceList), event);
    },

    _addAllHandler: function (event) {
      var items = $('.ui-selectee', this.sourceList);
      this.addItems(items, event);
      this.targetList.orderingList('selectItem', items);
    }

  });

}(jQuery));