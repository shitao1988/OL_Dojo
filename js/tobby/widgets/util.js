dojo.provide("tobby.widgets.util");

dojo.require("dojo.string");

tobby.widgets.util.getSmallIcon = function(/*URL*/fullSizeIconUrl) {
	// full-size icons are in assets/images/icons/
	// small icons are in assets/images/small_icons/
	return fullSizeIconUrl.replace(/assets\/images\/icons\//, "assets/images/small_icons/");
};