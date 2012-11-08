dojo.provide("tobby.widgets._Widget");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");

dojo.declare("tobby.widgets._Widget",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
	{
	    constructor: function(/*Object*/params) {
	    },

	    mapId: "",
	    map: null,
	    title: "",
	    icon: "",
	    state: "maximized",

	    setId: function(/*Number*/id) {
	        this.id = id;
	    },
	    setTitle: function(/*String*/title) {
	        this.title = title;
	    },
	    setIcon: function(/*String*/icon) {
	        this.icon = icon;
	    },
	    setState: function(/*String*/state) {
	        this.state = state;
	    },
	    setMap: function(/*esri.Map*/map) {
	        this.map = map;
	    }
	}
);