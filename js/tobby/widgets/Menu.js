dojo.provide("tobby.widgets.Menu");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.fx");

dojo.require("tobby.widgets.MenuItem");

dojo.declare("tobby.widgets.Menu",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
	{
	    constructor: function(/*Object*/params) {

	    },

	    templatePath: dojo.moduleUrl("tobby.widgets", "templates/Menu.html"),

	    positionAsPct: 0,
	    icon: "",
	    label: "",
	    visible: "",

	    dropDownNode: null,

	    _expandedPadding: 0,

	    _timeout: null,
	    _menuIsVisible: false,
	    _mouseIsOverIcon: false,
	    _mouseIsOverDropDown: false,

	    postMixInProperties: function() {
	        //console.log("ControllerMenu postMixInProperties");
	        if (this.icon === "") {
	            this.icon = "assets/images/icons/i_icp.png";
	        }
	        if (this.label === "") {
	            this.label = "无标签";
	        }
	    },

	    postCreate: function() {
	        //console.log("ControllerMenu postCreate");
	        this.setIcon(dojo.moduleUrl("tobby.widgets", this.icon));
	        this.setLabel(this.label);
	    },

	    startup: function() {
	        //console.log("ControllerMenu startup");
	        this.layout();

	        // Pass to children
	        var children = this.getChildren();
	        dojo.forEach(children, function(child) { child.startup(); });
	    },

	    layout: function() {
	        // set position of icon in percent
	        var iconNode = dojo.query(".menuIcon", this.domNode)[0];
	        dojo.style(iconNode, "left", this.positionAsPct + "%");

	        // get location, width of icon in px
	        var iconCoords = dojo.coords(iconNode);
	        var iconLeft = iconCoords.l;
	        var iconWidth = iconCoords.w;
	        var iconLMargin = dojo.style(iconNode, "marginLeft");

	        // calculate the centerline for the menu
	        var menuCenter = iconLeft + ((iconWidth + iconLMargin) / 2);

	        // position the menu dropdown
	        this.dropDownNode = dojo.query(".menuDropDown", this.domNode)[0];
	        var ddWidth = dojo.style(this.dropDownNode, "width");
	        dojo.style(this.dropDownNode, "left", (menuCenter - (ddWidth / 2)) + "px");

	        // size the menu box's width
	        var contentBox = dojo.contentBox(this.dropDownNode);
	        var boxNode = dojo.query(".menuBox", this.domNode)[0];
	        var lPad = dojo.style(boxNode, "paddingLeft");
	        var rPad = dojo.style(boxNode, "paddingRight");
	        var boxWidth = contentBox.w - (lPad + rPad + 2);
	        dojo.style(boxNode, "width", boxWidth + "px");

	        // Make note of any extra padding at the top
	        this._expandedPadding = dojo.style(this.dropDownNode, "paddingTop");

	        // Remove the border-bottom from the last menu item
	        var itemList = dojo.query(".menuItem", this.domNode);
	        dojo.style(itemList[itemList.length - 1], "borderBottom", 0);

	        // Shrink, show menu
	        dojo.style(this.dropDownNode, "height", 0 + "px");
	        dojo.style(this.dropDownNode, "visibility", "visible");
	        dojo.style(this.dropDownNode, "paddingTop", "0px");
	    },

	    addMenuItem: function(/*Object*/params) {
	        var menuItem = new tobby.widgets.MenuItem(params);
	        dojo.connect(menuItem, "onMenuItemClick", this, "onMenuItemClick");

	        this.addChild(menuItem);
	    },

	    setIcon: function(/*URL*/iconUrl) {
	        var element = dojo.query(".menuIcon", this.domNode)[0];
	        dojo.style(element, "backgroundImage", "url(" + iconUrl + ")");
	    },

	    setLabel: function(/*String*/label) {
	        var element = dojo.query(".menuLabel", this.domNode)[0];
	        element.innerHTML = label;
	    },	    

	    onMenuItemClick: function(info) {
	        // stub for event propagation
	        this.hideMenu();
	    },

	    onMouseOverIcon: function(evt) {
	        this._mouseIsOverIcon = true;
	        this.delayedCheckMenuState(200);
	    },

	    onMouseOutIcon: function(evt) {
	        this._mouseIsOverIcon = false;
	        this.delayedCheckMenuState(50);
	    },

	    onMouseOverDD: function(evt) {
	        this._mouseIsOverDropDown = true;
	        this.delayedCheckMenuState(200);
	    },

	    onMouseOutDD: function(evt) {
	        this._mouseIsOverDropDown = false;
	        this.delayedCheckMenuState(50);
	    },

	    delayedCheckMenuState: function(/*Number*/delay) {
	        if (this.timeout) {
	            clearTimeout(this.timeout);
	            this.timeout = null;
	        }
	        this.timeout = setTimeout(dojo.hitch(this, function() {
	            this.checkMenuState();
	        }), delay);
	    },

	    checkMenuState: function() {
	        if (this._menuIsVisible === false) {
	            if (this._mouseIsOverIcon === true || this._mouseIsOverDropDown === true) {
	                this.showMenu();
	            }
	        }
	        else {
	            if (this._mouseIsOverIcon === false && this._mouseIsOverDropDown === false) {
	                this.hideMenu();
	            }
	        }
	    },

	    showMenu: function() {
	        dojo.style(this.dropDownNode, "paddingTop", this._expandedPadding + "px");
	        dojo.fx.wipeIn({
	            node: this.dropDownNode,
	            duration: 250
	        }).play();
	        this._menuIsVisible = true;
	    },

	    hideMenu: function() {
	        dojo.animateProperty({
	            node: this.dropDownNode,
	            duration: 150,
	            properties: {
	                height: 0
	            },
	            onEnd: dojo.hitch(this, function() {
	                dojo.style(this.dropDownNode, "paddingTop", "0px");
	            })
	        }).play();
	        this._menuIsVisible = false;
	    }
	}
);
