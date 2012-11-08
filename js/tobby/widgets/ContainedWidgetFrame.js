dojo.provide("tobby.widgets.ContainedWidgetFrame");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dojo.fx");
dojo.require("dojo.dnd.move");

dojo.declare("tobby.widgets.ContainedWidgetFrame",
    [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {


        // 包含的控件
        widget: null,
        icon: "",
        title: "",
        state: "maximized", // 其他选项有"minimized", "minimizing", "maximizing"

        // 框架DOM节点
        boxNode: null,
        badgeNode: null,
        contentNode: null,
        titleNode: null,

        // 调用postCreate创建框架后自动计算
        widgetWidth: 100,
        boxMaximized: null, // 在构造函数中初始化

        templatePath: dojo.moduleUrl("tobby.widgets", "templates/ContainedWidgetFrame.html"),

        constructor: function() {
            this.boxMaximized = {
                w: 100,
                h: [],
                paddingTop: 100,
                paddingBottom: 100,
                paddingLeft: 100,
                paddingRight: 100,
                marginLeft: 100
            };
        },

        postCreate: function() {
            try {
                // Find Frmae DOM nodes
                this.boxNode = dojo.query(".widgetBadgedPane", this.domNode)[0];
                this.badgeNode = dojo.query(".widgetBadge", this.domNode)[0];
                this.contentNode = dojo.query(".widgetHolder", this.domNode)[0];
                this.titleNode = dojo.query("#.widgetTitle", this.domNode)[0];
            }
            catch (err) {
                console.error(err);
            }
        },

        startup: function() {
            if (this._started) {
                return;
            }

            console.log("WidgetFrame::startup");
            var children = this.getChildren();
            dojo.forEach(children, function(child) { child.startup(); });

            // 查找类型为_Widget的子控件
            for (var i = 0; i < children.length; i++) {
                var c = children[i];
                if (c.setMap && c.setId && c.setAlarm && c.setTitle && c.setIcon && c.setState && c.setConfig) {
                    this.setWidget(c, true);
                    break;
                }
            }

            // Set width to that of parent node
            var p = this.getParent();
            var pw = dojo.style(p.containerNode, "width");
            if (p.contentWidth) {
                pw = p.contentWidth; //WidgetContainer defines this
            }
            dojo.style(this.domNode, "width", pw + "px");

            // Measure the box as laid out in the default (maximized) position
            this.widgetWidth = dojo.style(this.domNode, "width");

            this.boxMaximized.paddingTop = dojo.style(this.boxNode, "paddingTop");
            this.boxMaximized.paddingBottom = dojo.style(this.boxNode, "paddingBottom");
            this.boxMaximized.paddingLeft = dojo.style(this.boxNode, "paddingLeft");
            this.boxMaximized.paddingRight = dojo.style(this.boxNode, "paddingRight");
            this.boxMaximized.marginLeft = dojo.style(this.boxNode, "marginLeft");
            this.boxMaximized.w = this.widgetWidth - (this.boxMaximized.marginLeft + this.boxMaximized.paddingLeft + this.boxMaximized.paddingRight);

            // One height for each panel
            for (var i = 0; i < this.widget.panels.length; i++) {
                this.widget.showPanel(i);
                var h = dojo.style(this.boxNode, "height");
                this.boxMaximized.h.push(h);
            }
            this.widget.showPanel(0);

            if (this.state === "minimized") {
                // Minimize the widget, in zero elapsed time
                this.minimize(0);
            }
            else {
                // Maximize the widget, in zero elapsed time
                this.maximize(0);
            }

            // Fade in
            dojo.fadeIn({
                node: this.domNode
            }).play();

            console.log("WidgetFrame::startup ended");
        },

        setIcon: function(/* String */icon) {
            try {
                this.icon = icon;
                dojo.style(this.badgeNode, "backgroundImage",
					"url(" + dojo.moduleUrl("tobby.widgets", icon) + ")");
            }
            catch (err) { console.error(err); }
        },

        setWidget: function(/*tobby.widgets._Widget*/widget, /*boolean*/childAlreadyAdded) {
            // Only can set once
            if (this.widget) {
                return;
            }

            if (!childAlreadyAdded) {
                this.addChild(widget);
            }

            //console.log("WF::setWidget");
            this.widget = widget;

            try {
                // Set the frame title
                this.title = widget.title;
                this.titleNode.innerHTML = this.title;

                // Set the frame icon
                this.setIcon(widget.icon);

                // Add the button icons
                var minBtn = dojo.query(".wbMinimize", this.domNode)[0];
                minBtnTd = minBtn.parentNode;
                if (widget.panels.length > 1) {
                    dojo.forEach(widget.panels, dojo.hitch(this, function(item, idx, arr) {
                        var td = document.createElement("TD");
                        var btn = document.createElement("DIV");
                        dojo.addClass(btn, "widgetButton");
                        dojo.style(btn, "backgroundImage",
							"url(" + dojo.moduleUrl("tobby.widgets", item.buttonIcon) + ")");
                        dojo.attr(btn, "title", item.buttonText);
                        if (this.state === "minimized") {
                            dojo.style(btn, "display", "none");
                        }

                        td.appendChild(btn);
                        minBtnTd.parentNode.insertBefore(td, minBtnTd);
                        dojo.connect(btn, "onclick", dojo.hitch(this, function() {
                            this.selectPanel(idx);
                        }));
                    }));
                }
            }
            catch (err) { console.error(err); }
        },

        onMinClick: function(evt) {
            this.minimize();
        },

        onCloseClick: function(evt) {
            this.onClose(this.id);
        },

        onBadgeClick: function(evt) {
            console.log("onBadgeClick " + evt.target);
            if (this.state === "maximized") {
                // Start minimizing
                this.minimize();
            }
            else if (this.state === "minimized") {
                // Start maximizing
                this.maximize();
            }
            // otherwise: we're animating, ignore the click
        },

        minimize: function(duration) {
            //console.log("minimizing!");
            var boxEndProperties = {
                height: 20,
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 20,
                marginLeft: this.widgetWidth - 200,
                width: 150,
                paddingLeft: this.boxMaximized.paddingRight,
                paddingRight: this.boxMaximized.paddingLeft
            };
            var badgeEndProperties = {
                left: this.widgetWidth - 40
            };

            // Broadcast the change in height
            var startHeight = dojo.style(this.boxNode, "height") + dojo.style(this.boxNode, "paddingTop") + dojo.style(this.boxNode, "paddingBottom") + dojo.style(this.boxNode, "marginTop");
            var endHeight = boxEndProperties.height + boxEndProperties.paddingTop + boxEndProperties.paddingBottom + boxEndProperties.marginTop;
            this.onResizeStart(this.id, { dh: (endHeight) - (startHeight) });

            if (duration !== 0 && !duration) {
                duration = 350;
            }
            if (duration <= 0) {
                // Short-circuit, no animation
                for (var key in boxEndProperties) {
                    boxEndProperties[key] = boxEndProperties[key] + "px";
                }
                for (var key in badgeEndProperties) {
                    badgeEndProperties[key] = badgeEndProperties[key] + "px";
                }
                dojo.style(this.badgeNode, badgeEndProperties);
                dojo.style(this.boxNode, boxEndProperties);
                dojo.style(this.contentNode, "overflow", "hidden");
                dojo.query(".widgetButton", this.domNode).style("display", "none");
                this.state = "minimized";
            }
            else {
                try {
                    var vShrink = dojo.animateProperty({
                        node: this.boxNode,
                        duration: duration,
                        beforeBegin: dojo.hitch(this, function() {
                            dojo.style(this.contentNode, "overflow", "hidden");
                            dojo.query(".widgetButton", this.domNode).style("display", "none");
                        }),
                        properties: {
                            height: boxEndProperties.height,
                            paddingTop: boxEndProperties.paddingTop,
                            paddingBottom: boxEndProperties.paddingBottom,
                            marginTop: boxEndProperties.marginTop
                        },
                        onEnd: dojo.hitch(this, function() {
                            this.onResizeEnd(this);
                        })
                    });

                    var hShrink = dojo.animateProperty({
                        node: this.boxNode,
                        duration: duration,
                        beforeBegin: dojo.hitch(this, function() {
                            dojo.style(this.contentNode, "display", "none");
                        }),
                        properties: {
                            width: "10",
                            paddingLeft: "0",
                            paddingRight: "0"
                        },
                        onEnd: dojo.hitch(this, function() {
                            var badgeSlide = dojo.animateProperty({
                                node: this.badgeNode,
                                duration: duration,
                                properties: badgeEndProperties
                            });

                            var hGrow = dojo.animateProperty({
                                node: this.boxNode,
                                duration: duration,
                                properties: {
                                    marginLeft: boxEndProperties.marginLeft,
                                    width: boxEndProperties.width,
                                    paddingLeft: boxEndProperties.paddingLeft,
                                    paddingRight: boxEndProperties.paddingRight
                                },
                                onEnd: dojo.hitch(this, function() {
                                    //console.log("minimized!");
                                    this.state = "minimized";
                                })
                            });
                            dojo.fx.combine([badgeSlide, hGrow]).play();
                        })
                    });

                    dojo.fx.chain([vShrink, hShrink]).play();
                    this.state = "minimizing";
                }
                catch (err) { console.error(err); }
            }
        },

        selectPanel: function(index) {
            if (index !== this.widget.panelIndex) {
                try {
                    this.onResizeStart(this.id, { dh: this.boxMaximized.h[index] - this.boxMaximized.h[this.widget.panelIndex] });
                    
                    var firstHalf = dojo.fadeOut({
                        node: this.contentNode,
                        duration: 150,
                        onEnd: dojo.hitch(this, function() {
                            this.widget.showPanel(index);
                        })
                    });

                    var secondHalf = dojo.fadeIn({
                        node: this.contentNode,
                        duration: 150
                    });

                    var resize = dojo.animateProperty({
                        node: this.boxNode,
                        duration: 150,
                        properties: {
                            height: this.boxMaximized.h[index]
                        },
                        onEnd: dojo.hitch(this, function() {
                            this.onResizeEnd(this);
                        })
                    });

                    dojo.fx.chain([firstHalf, resize, secondHalf]).play();
                }
                catch (err) {
                    console.error(err);
                }
            }
        },

        maximize: function(duration) {
            //console.log("maximizing!");
            var boxEndProperties = {
                height: this.boxMaximized.h[this.widget.panelIndex],
                paddingTop: this.boxMaximized.paddingTop,
                paddingBottom: this.boxMaximized.paddingBottom,
                marginTop: 0,
                marginLeft: this.boxMaximized.marginLeft,
                width: this.boxMaximized.w,
                paddingLeft: this.boxMaximized.paddingLeft,
                paddingRight: this.boxMaximized.paddingRight
            };
            var badgeEndProperties = {
                left: 0
            };


            // Broadcast the change in height
            var startHeight = dojo.style(this.boxNode, "height") + dojo.style(this.boxNode, "paddingTop") + dojo.style(this.boxNode, "paddingBottom") + dojo.style(this.boxNode, "marginTop");
            var endHeight = boxEndProperties.height + boxEndProperties.paddingTop + boxEndProperties.paddingBottom + boxEndProperties.marginTop;
            this.onResizeStart(this.id, { dh: (endHeight) - (startHeight) });

            if (duration !== 0 && !duration) {
                duration = 350;
            }
            if (duration <= 0) {
                // Short-circuit, no animation
                for (var key in boxEndProperties) {
                    boxEndProperties[key] = boxEndProperties[key] + "px";
                }
                for (var key in badgeEndProperties) {
                    badgeEndProperties[key] = badgeEndProperties[key] + "px";
                }
                dojo.style(this.badgeNode, badgeEndProperties);
                dojo.style(this.boxNode, boxEndProperties);
                dojo.style(this.contentNode, "overflow", "auto");
                dojo.query(".widgetButton", this.domNode).style("display", "block");
                this.state = "maximized";
            }
            else {
                try {

                    var badgeSlide = dojo.animateProperty({
                        node: this.badgeNode,
                        properties: badgeEndProperties
                    });

                    var hShrink = dojo.animateProperty({
                        node: this.boxNode,
                        properties: {
                            marginLeft: 0,
                            width: 10,
                            paddingLeft: 0,
                            paddingRight: 0
                        },
                        onEnd: dojo.hitch(this, function() {
                            var hGrow = dojo.animateProperty({
                                node: this.boxNode,
                                properties: {
                                    width: boxEndProperties.width,
                                    paddingLeft: boxEndProperties.paddingLeft,
                                    paddingRight: boxEndProperties.paddingRight,
                                    marginLeft: boxEndProperties.marginLeft
                                }
                            });

                            var vGrow = dojo.animateProperty({
                                node: this.boxNode,
                                beforeBegin: dojo.hitch(this, function() {
                                    dojo.style(this.contentNode, "display", "block");
                                }),
                                onEnd: dojo.hitch(this, function() {
                                    //console.log("maximized!");
                                    this.state = "maximized";
                                    dojo.style(this.contentNode, "overflow", "auto");
                                    dojo.query(".widgetButton", this.domNode).style("display", "block");
                                    this.onResizeEnd(this);
                                }),
                                properties: {
                                    height: boxEndProperties.height,
                                    paddingTop: boxEndProperties.paddingTop,
                                    paddingBottom: boxEndProperties.paddingBottom,
                                    marginTop: boxEndProperties.marginTop
                                }
                            });
                            dojo.fx.chain([hGrow, vGrow]).play();
                        })
                    });

                    dojo.fx.combine([badgeSlide, hShrink]).play();
                    this.state = "maximizing";
                }
                catch (err) {
                    console.error(err);
                }
            }
        },

        getBoundingBox: function() {
            var domBox = dojo.marginBox(this.domNode);
            var boxBox = dojo.marginBox(this.boxNode);
            var bb = {
                w: domBox.w, h: boxBox.h, t: domBox.t, l: domBox.l
            };
            //console.dir(bb);
            return bb;
        },

        onResizeStart: function(/*String*/frameId, /*Object*/endBounds) {
        },

        onResizeEnd: function(/*ontainedWidgetFrame*/frame) {
        },

        onClose: function(/*String*/frameId) {
        }
    });