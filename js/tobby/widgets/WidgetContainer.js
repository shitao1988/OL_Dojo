dojo.provide("tobby.widgets.WidgetContainer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");

dojo.require("dojo.fx");
dojo.require("dojo.NodeList-fx");

dojo.require("tobby.widgets.ContainedWidgetFrame");
dojo.require("tobby.widgets._Widget");


dojo.declare("tobby.widgets.WidgetContainer",
	[dijit._Widget, dijit._Templated, dijit._Container],
	{
	    
	    showHideButton: null,
	    contentWidth: 0,
	    _containerPadding: 0,
	    templatePath: dojo.moduleUrl("tobby.widgets", "templates/WidgetContainer.html"),

	    postCreate: function() {
	        console.log("WidgetContainer::postCreate");
	        this.showHideButton = dojo.query(".wbHide", this.domNode)[0];
	        this._scrollDiv = dojo.query(".widgetContainerControls", this.domNode)[0];
	        this._containerPadding = dojo.style(this.domNode, "paddingTop");

	        // 订阅showWidget事件
	        dojo.subscribe("showWidget", this, "onShowWidget");
	    },

	    startup: function() {
	        if (this._started) {
	            return;
	        }
	        console.log("WidgetContainer:startup");

	        var children = this.getChildren();
	        dojo.forEach(children, function(child) { child.startup(); });

	        for (var i = 0; i < children.length; i++) {
	            dojo.connect(children[i], "onResizeStart", this, "frameResizing");
	            dojo.connect(children[i], "onClose", this, "closeWidget");
	            dojo.connect(children[i], "onResizeEnd", this, "ensureFrameIsVisible");
	        }

	        try {
	            var w = parseInt(dojo.style(this.domNode, "width"));
	            var r = parseInt(dojo.style(this.domNode, "right"));

	            // 保存宽度信息
	            this.contentWidth = w;

	            dojo.style(this.domNode, "width", "0px");
	            dojo.style(this.domNode, "right", (r + w) + "px");
	            dojo.style(this._scrollDiv, "left", (w + 6) + "px");
	        }
	        catch (err) {
	            console.error(err);
	        }
	        console.log("WidgetContainer::startup finished");
	        this.inherited(arguments);
	    },

	    onShowWidget: function(widget) {
	        console.log("WidgetContainer::onShowWidget");

	        if (widget) {
	            // 查找是否已经存在该小部件
	            var bFound = false;
	            var frames = this.getChildren();
	            for (var i = 0; i < frames.length; i++) {
	                var frame = frames[i];
	                if (frame.widget === widget) {
	                    if (frame.state === "minimized") {
	                        // onResizeEnd将调用ensureFrameIsVisible
	                        frame.maximize();
	                    }
	                    else {
	                        this.ensureFrameIsVisible(frame);
	                    }
	                    bFound = true;
	                    break;
	                }
	            }

	            if (!bFound) {
	                // 没有找到小部件，那么新创建一框架，并在其中加入小部件
	                var frame = new tobby.widgets.ContainedWidgetFrame();
	                frame.setWidget(widget);
	                
	                // 在调用addChild时才调用WidgetFrame的startup
	                this.addChild(frame);
	                dojo.connect(frame, "onResizeStart", this, "frameResizing");
	                dojo.connect(frame, "onClose", this, "closeWidget");
	                dojo.connect(frame, "onResizeEnd", this, "ensureFrameIsVisible");

	                if (frames.length > 0) {
	                    // 在最后一个小部件后面显示新加入的小部件
	                    this.positionFrameAfterFrame(frame, frames[frames.length - 1]);
	                }
	                this.ensureFrameIsVisible(frame);
	            }

	            if (dojo.hasClass(this.showHideButton, "wbShow")) {
	                this.onClickShow();
	            }
	        }
	    },

	    closeWidget: function(/*String*/frameId) {
	        try {
	            var containerBox = dojo.contentBox(this.domNode);
	            var children = this.getChildren();

	            var target = null;
	            var targetTop = 0;
	            var firstFrameOffTop = null;
	            var ffOffTopTop = 0;
	            var nodesBefore = new dojo.NodeList();
	            var nodesAfter = new dojo.NodeList();
	            var upShiftDistance = 0;
	            var downShiftDistance = 0;

	            for (var i = 0; i < children.length; i++) {
	                var frame = children[i];

	                var frameBox = frame.getBoundingBox();
	                if (frame.id === frameId) {
	                    target = frame;
	                    targetTop = frameBox.t;

	                    // Odd case where a widget is closed when partly off the top
	                    if (targetTop < this._containerPadding) {
	                        targetTop = this._containerPadding;
	                    }
	                }
	                else {
	                    if (frameBox.t < this._containerPadding) {
	                        firstFrameOffTop = frame;
	                        ffOffTopTop = frameBox.t;
	                    }

	                    if (target) {
	                        // target already found, this is after
	                        nodesAfter.push(frame.domNode);

	                        if (upShiftDistance === 0) {
	                            upShiftDistance = dojo.style(frame.domNode, "top") - targetTop;
	                        }
	                    }
	                    else {
	                        // target not found yet, this is before
	                        nodesBefore.push(frame.domNode);
	                    }
	                }
	            }

	            if (target) {
	                // Calculate shifts. Nodes after the target slide up,
	                // but if there is one or more frames off the top of the 
	                // container, the nodes before slide down and they meet in the middle
	                if (firstFrameOffTop) {
	                    // calculate downShiftDistance
	                    downShiftDistance = this._containerPadding - ffOffTopTop; //pixels

	                    // adjust upShiftDistance
	                    upShiftDistance -= downShiftDistance;
	                }

	                // Fade out and remove target
	                dojo.fadeOut({
	                    node: target.domNode,
	                    onEnd: dojo.hitch(this, function() {
	                        this.removeChild(target); // remove, don't destroy Widget
	                        if (target.widget && target.widget.shutdown) {
	                            target.widget.shutdown();
	                        }
	                    })
	                }).play();

	                // Slide all nodes before down
	                // (If nothing is off the top, downShiftDistance is zero, no shift)
	                this.moveFrames(nodesBefore, downShiftDistance);

	                // Slide all nodes after up
	                this.moveFrames(nodesAfter, upShiftDistance * -1);
	            }
	        }
	        catch (err) { console.error(err); }
	    },

	    frameResizing: function(/*String*/frameId, /*Object*/deltas) {
	        // One of the frames is resizing. Make room, or snug up
	        try {
	            var children = this.getChildren();

	            var target = null;
	            var nodesAfter = new dojo.NodeList();
	            var shiftDistance = 0;

	            for (var i = 0; i < children.length; i++) {
	                var frame = children[i];

	                var frameBox = frame.getBoundingBox();
	                if (frame.id === frameId) {
	                    target = frame;
	                    targetTop = frameBox.t;
	                    // Growth will cause a shift down, shrink a shift up
	                    shiftDistance = deltas.dh;
	                }
	                else {
	                    if (target) {
	                        // target already found, this is after
	                        nodesAfter.push(frame.domNode);
	                    }
	                }
	            }

	            if (target) {
	                // Nodes after the target slide up or down
	                this.moveFrames(nodesAfter, shiftDistance);
	            }
	        }
	        catch (err) { console.error(err); }
	    },

	    ensureFrameIsVisible: function(/*ContainedWidgetFrame*/target) {	        
	        var containerBox = dojo.contentBox(this.domNode);
	        var frameBox = target.getBoundingBox();

	        // Off the top?
	        if (frameBox.t < this._containerPadding) {
	            var downShiftDistance = this._containerPadding - frameBox.t; //pixels

	            // Move all of the frames downShiftDistance
	            var nodes = dojo.query(".widgetFrame", this.domNode);
	            this.moveFrames(nodes, downShiftDistance);
	        }
	        // Off the bottom?
	        else if (frameBox.t + frameBox.h > containerBox.h - this._containerPadding) {
	            var upShiftDistance = frameBox.t - (containerBox.h - frameBox.h - this._containerPadding); //pixels

	            // Move all of the frames upShiftDistance
	            var nodes = dojo.query(".widgetFrame", this.domNode);
	            this.moveFrames(nodes, upShiftDistance * -1);
	        }
	    },

	    positionFrameAfterFrame: function(/*ContainedWidgetFrame*/frameToPlace, /*ContainedWidgetFrame*/afterFrame) {
	        var bBox = afterFrame.getBoundingBox();
	        y = bBox.t + bBox.h + 20;
	        dojo.style(frameToPlace.domNode, "top", y + "px");
	    },

	    moveFrames: function(/*NodeList*/frameDomNodes, /*Number*/distance) {
	        if (frameDomNodes && frameDomNodes.length > 0 && distance !== 0) {
	            var animations = [];
	            frameDomNodes.forEach(function(n) {
	                var t = dojo.style(n, "top");
	                var a = dojo.animateProperty({
	                    node: n,
	                    properties: {
	                        top: t + distance
	                    }
	                });
	                animations.push(a);
	            });

	            dojo.fx.combine(animations).play();
	        }
	    },

	    onClickShow: function(evt) {
	        if (dojo.hasClass(this.showHideButton, "wbHide")) {
	            dojo.addClass(this.showHideButton, "wbShow");
	            dojo.removeClass(this.showHideButton, "wbHide");
	            this.minimize();
	        }
	        else {
	            dojo.addClass(this.showHideButton, "wbHide");
	            dojo.removeClass(this.showHideButton, "wbShow");
	            this.maximize();
	        }
	    },

	    onClickUp: function(evt) {
	        try {
	            var children = this.getChildren();
	            var containerBox = dojo.contentBox(this.domNode);

	            // Are there any frames off the top of the screen?
	            // Get the last frame which is at least partly off the screen
	            if (children.length === 0) { return; }
	            var target = null;
	            for (var i = children.length - 1; i >= 0; i--) {
	                var frameBox = children[i].getBoundingBox();
	                if (frameBox.t < 0) {
	                    target = children[i];
	                    break;
	                }
	            }

	            if (target) {
	                this.ensureFrameIsVisible(target);
	            }
	        }
	        catch (err) { console.error(err); }
	    },

	    onClickDown: function(evt) {
	        try {
	            var children = this.getChildren();
	            var containerBox = dojo.contentBox(this.domNode);

	            // Are there any frames off the bottom of the screen?
	            // Get the first frame which is at least partly off the screen
	            if (children.length === 0) { return; }
	            var target = null;
	            for (var i = 0; i < children.length; i++) {
	                var frameBox = children[i].getBoundingBox();
	                if (frameBox.t + frameBox.h > containerBox.h) {
	                    target = children[i];
	                    break;
	                }
	            }

	            if (target) {
	                this.ensureFrameIsVisible(target);
	            }
	        }
	        catch (err) { console.error(err); }
	    },

	    minimize: function() {
	        var slideDistance = parseInt(dojo.style(this.domNode, "right"));
	        var allFrames = dojo.query(".widgetFrame", this.domNode);

	        allFrames.fadeOut().play();
	        allFrames.animateProperty({
	            properties: {
	                left: slideDistance
	            }
	        }).play();
	    },

	    maximize: function() {
	        var allFrames = dojo.query(".widgetFrame", this.domNode);

	        allFrames.fadeIn().play();
	        allFrames.animateProperty({
	            properties: {
	                left: 0
	            }
	        }).play();
	    }
	}
);