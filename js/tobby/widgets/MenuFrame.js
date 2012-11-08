dojo.provide("tobby.widgets.MenuFrame");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");

dojo.declare("tobby.widgets.MenuFrame",
    [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {

    templatePath: dojo.moduleUrl("tobby.widgets", "templates/MenuFrame.html"),
    menuItemData: null,

    postCreate: function() {
        dojo.subscribe("mapToolChangedEvent", this, "onMapToolChange");
        dojo.subscribe("statusChangedEvent", this, "onStatusChange");
    },

    startup: function() {
        if (this._started) { return; }

        // Pass to children
        var children = this.getChildren();
        dojo.forEach(children, function(child) { child.startup(); });
    },

    onMapToolChange: function(/*String*/toolName) {
        this.setToolText(toolName);
    },

    onStatusChange: function(/* String */status) {
        this.setStatus(status);
    },

    setTitle: function(/*String*/title) {
        var element = dojo.query(".controllerTitle", this.domNode)[0];
        element.innerHTML = title;
    },

    setSubtitle: function(/*String*/subtitle) {
        var element = dojo.query(".controllerSubtitle", this.domNode)[0];
        element.innerHTML = subtitle;
    },

    setStatus: function(/*String*/status) {
        var element = dojo.query(".controllerStatus", this.domNode)[0];
        element.innerHTML = status;
    },

    setToolText: function(/*String*/toolText) {
        var msg = "";
        if (toolText) {
            msg = dojo.string.substitute("µ±Ç°²Ù×÷£º ${0}", [toolText]);
        }
        this.setStatus(msg);
    },

    setFrameIcon: function(/*URL*/logoUrl) {
        var element = dojo.query(".controllerIcon", this.domNode)[0];
        dojo.style(element, "backgroundImage", "url(" + logoUrl + ")");
    }
});