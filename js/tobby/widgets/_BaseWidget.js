dojo.provide("tobby.widgets._BaseWidget");

dojo.require("tobby.widgets._Widget");

dojo.declare("tobby.widgets._BaseWidget",
	tobby.widgets._Widget,
	{
		constructor: function(/*Object*/ params) {
			this.connects = [];
			this.widgets = {};
		},

		_module: "tobby.widgets",
		templatePath: dojo.moduleUrl("tobby.widgets", "templates/_BaseWidget.html"),
		panels: null,
		panelIndex: -1,

		postMixInProperties: function() {		    
		    if (this.icon === "") {
		        this.icon = "assets/images/icons/i_pushpin.png";
		    }
		},

		postCreate: function() {
		    // 如果存在多个面板，则只显示第一个
		    this.panels = dojo.query(".widgetPanel", this.domNode);
		    this.panels.forEach(function(item, idx, arr) {
		        item.buttonIcon = dojo.attr(item, "buttonIcon");
		        item.buttonText = dojo.attr(item, "buttonText");
		    });
		    this.showPanel(0);
		},

		onShowPanel: function(index) {
		    // 由小部件框架类WidgetFrame监听使用
		},

		showPanel: function(/*Number*/index) {
		    this.panelIndex = index;
		    console.log("showPanel");
		    dojo.forEach(this.panels, function(item, idx, arr) {
		        if (idx == index) {
		            dojo.style(item, "display", "block");
		        }
		        else {
		            dojo.style(item, "display", "none");
		        }
		    });
		},

		startup: function() {
		    if (this._started) {
		        return;
		    }

		    var children = this.getChildren();
		    dojo.forEach(children, function(child) {
		        child.startup();
		    });

		    // 与小部件框架类WidgetFrame交互
		    var frame = this.getParent();
		    if (frame && frame.declaredClass === "tobby.widgets.WidgetFrame") {
		        this.connects.push(dojo.connect(this, "onShowPanel", frame, "selectPanel"));
		    }

		    this.inherited(arguments);
		},

		shutdown: function() {
		    // 由子类覆盖该方法，实现关闭时清除占用资源
		},

		uninitialize: function() {
		    dojo.forEach(this.connects, function(handle) {
		        dojo.disconnect(handle);
		    });
		    this.connects = [];
		},

		getAllNamedChildDijits: function() {
		    // 获得所有的子小部件
		    var w = dojo.query("[widgetId]", this.containerNode || this.domNode);
		    var children = w.map(dijit.byNode);

		    this.widgets = {};
		    children.forEach(dojo.hitch(this, function(item, idx) {		        
		        if (item.name) {
		            this.widgets[item.name] = item;
		        }
		    }));
		}
    });