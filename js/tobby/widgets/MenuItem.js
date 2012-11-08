dojo.provide("tobby.widgets.MenuItem");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");

dojo.require("tobby.widgets.util");

dojo.declare("tobby.widgets.MenuItem",
	[dijit._Widget, dijit._Templated, dijit._Contained],
	{
		constructor: function(/*Object*/ params) {			
		},

		templatePath: dojo.moduleUrl("tobby.widgets", "templates/MenuItem.html"),		
		label: "",
		icon: "",
		value: "",
		menuCode: "",
		title: "", // tooltip text
		url: "",
		
		postMixInProperties: function() {
			//console.log("ControllerMenuItem postMixInProperties");
			if (this.icon === "") {
				this.icon = "assets/images/icons/i_icp.png";
			}
			if (this.label === "") {
				this.label = "No Label";
			}
			if (!this.value) {
				this.value = this.label;
			}
			if (!this.title) {
				if (this.url) {
					this.title = this.url;
				}
				else {
					this.title = this.label;
				}
			} 
		},
		
		postCreate: function() {
			//console.log("ControllerMenuItem postCreate");
		    var iconUrl = dojo.moduleUrl("tobby.widgets", this.icon);
			this.setIcon(iconUrl.path);
			dojo.setSelectable(this.domNode, false);
		},
		
		onClick: function(evt) {
			this.onMenuItemClick({
				value: this.value,
				label: this.label,
				menuCode: this.menuCode
			});
		},
		
		onMenuItemClick: function(data) {
			// 回调函数
		},
		
		setIcon: function(/*URL*/ iconUrl) {
		    var smallIconUrl = tobby.widgets.util.getSmallIcon(iconUrl);			
			dojo.style(this.domNode, "backgroundImage", "url(" + smallIconUrl + ")");
		}
	}
);
