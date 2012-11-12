
    dojo.provide("tobby.widgets.Bookmarks");
    dojo.declare("tobby.widgets.BookmarkItem", null, {
        constructor: function(name,extent) {
            this.name = name;
            this.extent = extent;
        },
        toJson: function() {
        var jsonitem = {
            name: this.name,
            extent: this.extent
        };

        return jsonitem;
    }
    });
    dojo.declare("tobby.widgets.Bookmarks", null, {
        /**
         * 构造函数
         * @param  {object} params     参数
         * @param  {object} srcNodeRef html元素
         * @return  {void}         
         */
        constructor: function(params, srcNodeRef) {
            this.map = params.map;
            this.editable = params.editable;
            this.initBookmarks = params.bookmarks;
            this.itemdivlickHandlers = this._mouseOverHandlers = this._mouseOutHandlers = this._removeHandlers = this._editHandlers = [];
            this.bookmarkDomNode = dojo.create("div");
            dojo.addClass(this.bookmarkDomNode, "tobbyBookmarks");
            this.bookmarkTable = dojo.create("table");
            dojo.addClass(this.bookmarkTable, "tobbyBookmarkTable");
            this.bookmarkDomNode.appendChild(this.bookmarkTable);
            srcNodeRef = dojo.byId(srcNodeRef);
            srcNodeRef.appendChild(this.bookmarkDomNode);
            this.itemddInitialBookmarks();
        },
        onClick: function() {},
        onEdit: function() {},
        onRemove: function() {},
        /**
         * 添加标签
         * @param {object} bookmarkItem 标签对象
         */
        addBookmark: function(bookmarkItem) {
            var item;
            if (bookmarkItem.declaredClass == "tobby.widgets.BookmarkItem") {
                item = bookmarkItem;
                this.bookmarks.push(item);
            } else {
                item = new tobby.widgets.BookmarkItem({
                    name: bookmarkItem.name,
                    extent: bookmarkItem.extent
                });
                this.bookmarks.push(item);
            }
            var itemdiv;
            if (this.editable) {
                itemdiv = dojo.create("div", {
                    innerHTML: "<div class='tobbyBookmarkLabel'>" + bookmarkItem.name + "</div><div title='移除' class='tobbyBookmarkRemoveImage'><br/></div><div title='编辑' class='tobbyBookmarkEditImage'><br/></div>"
                });
                var editimg = dojo.query(".tobbyBookmarkEditImage", itemdiv)[0];
                var removeimg = dojo.query(".tobbyBookmarkRemoveImage", itemdiv)[0];
                this._removeHandlers.push(dojo.connect(removeimg, "onclick", this, "_removeBookmark"));
                this._editHandlers.push(dojo.connect(editimg, "onclick", this, "_editBookmarkLabel"));
            } else {
                itemdiv = dojo.create("div", {
                    innerHTML: "<div class='tobbyBookmarkLabel' style='width: 210px;'>" + bookmarkItem.name + "</div>"
                });
            }
            dojo.addClass(itemdiv, "tobbyBookmarkItem");
            var marklabel = dojo.query(".tobbyBookmarkLabel", itemdiv)[0];
            this.itemdivlickHandlers.push(dojo.connect(marklabel, "onclick", dojo.hitch(this, "_onClickHandler", bookmarkItem)));
            this._mouseOverHandlers.push(dojo.connect(itemdiv, "onmouseover",
            function() {
                dojo.addClass(this, "tobbyBookmarkHighlight");
            }));
            this._mouseOutHandlers.push(dojo.connect(itemdiv, "onmouseout",
            function() {
                dojo.removeClass(this, "tobbyBookmarkHighlight");
            }));
            var table = this.bookmarkTable;
            var length;
            if (this.editable) {
                length = table.rows.length - 1;
            } else {
                length = table.rows.length;
            }
            var table1 = table.insertRow(length);
            var table2 = table1.insertCell(0);
            table2.appendChild(itemdiv);
        },
        /**
         * 移除标签
         * @param  {string} bookmarkName 标签名称
         * @return {void}              
         */
        removeBookmark: function(bookmarkName) {
            var nodes = dojo.query(".tobbyBookmarkLabel", this.bookmarkDomNode);
            var filtered = dojo.filter(nodes,
            function(item) {
                return item.innerHTML == bookmarkName;
            });
            dojo.forEach(filtered,
            function(node) {
                node.parentNode.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode.parentNode);
            });
            for (var i = this.bookmarks.length - 1; i >= 0; i--) {
                if (this.bookmarks[i].name == bookmarkName) {
                    this.bookmarks.splice(i, 1);
                }
            }
            this.onRemove();
        },
        /**
         * 隐藏标签
         * @return {void} 
         */
        hide: function() {
            this.bookmarkDomNode.style.display = "none";
        },
        /**
         * 显示标签
         * @return {void} 
         */
        show: function() {
               this.bookmarkDomNode.style.display = "block";
        },
        /**
         * 销毁
         * @return {void} 
         */
        destroy: function() {
            this.map = null;
            dojo.forEach(this.itemdivlickHandlers,
            function(handle, idx) {
                dojo.disconnect(handle);
            });
            dojo.forEach(this._mouseOverHandlers,
            function(handle, idx) {
                dojo.disconnect(handle);
            });
            dojo.forEach(this._mouseOutHandlers,
            function(handle, idx) {
                dojo.disconnect(handle);
            });
            dojo.forEach(this._removeHandlers,
            function(handle, idx) {
                dojo.disconnect(handle);
            });
            dojo.forEach(this._editHandlers,
            function(handle, idx) {
                dojo.disconnect(handle);
            });
            dojo.destroy(this.bookmarkDomNode);
        },
        /**
         * 将标签集转换为json对象
         * @return {void} 
         */
        toJson: function() {
            var jsonitem = [];
            dojo.forEach(this.bookmarks,
            function(item, idx) {
                jsonitem.push(item.toJson());
            });
            return jsonitem;
        },
        /**
         * 初始化
         * @return {void} 
         */
        itemddInitialBookmarks: function() {
            if (this.editable) {
                var markdiv = dojo.create("div", {
                    innerHTML: "<div>添加标签</div>"
                });
                dojo.addClass(markdiv, "tobbyBookmarkItem");
                dojo.addClass(markdiv, "tobbyAddBookmark");
                this.itemdivlickHandlers.push(dojo.connect(markdiv, "onclick", this, this._newBookmark));
                this._mouseOverHandlers.push(dojo.connect(markdiv, "onmouseover",
                function() {
                    dojo.addClass(this, "tobbyBookmarkHighlight");
                }));
                this._mouseOutHandlers.push(dojo.connect(markdiv, "onmouseout",
                function() {
                    dojo.removeClass(this, "tobbyBookmarkHighlight");
                }));
                var table = this.bookmarkTable;
                var table1 = table.insertRow(0);
                var table2 = table1.insertCell(0);
                table2.appendChild(markdiv);
            }
            this.bookmarks = [];
            dojo.forEach(this.initBookmarks,
            function(item, idx) {
                this.addBookmark(item);
            },
            this);
        },
        /**
         * 移除标签  私有方法
         * @param  {object} e 
         * @return {void} 
         */
        _removeBookmark: function(e) {
            this.bookmarks.splice(e.target.parentNode.parentNode.parentNode.rowIndex, 1);
            e.target.parentNode.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode.parentNode);
            this.onRemove();
        },
        /**
         * 编辑标签  私有方法
         * @param  {object} e 
         * @return {void} 
         */
        _editBookmarkLabel: function(e) {
            var dojob = e.target.parentNode;
            var dojoc = dojo.position(dojob, true);
            var y = dojoc.y;
            var dojod = dojo.create("div", {
                innerHTML: "<input type='text' class='tobbyBookmarkEditBox' style='left:" + dojoc.x + "px; top:" + y + "px;'/>"
            });
            this._inputBox = dojo.query("input", dojod)[0];
            this._label = dojo.query(".tobbyBookmarkLabel", dojob)[0];
            
            if (this._label.innerHTML == '添加书签') {
                this._inputBox.value = "";
            } else {
                this._inputBox.value = this._label.innerHTML;
            }
            dojo.connect(this._inputBox, "onkeyup", this,
            function(key) {
                switch (key.keyCode) {
                case dojo.keys.ENTER:
                    this._finishEdit();
                    break;
                default:
                    break;
                }
            });
            dojo.connect(this._inputBox, "onblur", this, "_finishEdit");
            dojob.appendChild(dojod);
            this._inputBox.focus();
        },
        /**
         * 编辑结束  私有方法
         * @param  {object} e 
         * @return {void} 
         */
        _finishEdit: function() {
            this._inputBox.parentNode.parentNode.removeChild(this._inputBox.parentNode);
     
            if (this._inputBox.value == "") {
                this._label.innerHTML = "无标题";
            } else {
                this._label.innerHTML = this._inputBox.value;
            }
            var  nodes = dojo.query(".tobbyBookmarkLabel", this.bookmarkDomNode);
            dojo.forEach(this.bookmarks,
            function(item, idx) {
                item.name = nodes[idx].innerHTML;
            });
            this.onEdit();
        },
        /**
         * 新标签提示项，  私有方法
         * @param  {object} e 
         * @return {void} 
         */
        _newBookmark: function() {
          
            var bookmarkItem = new tobby.widgets.BookmarkItem( "添加书签", this.map.getExtent());
            this.addBookmark(bookmarkItem);
            var nodes = dojo.query(".tobbyBookmarkItem", this.bookmarkDomNode);
            var node = nodes[nodes.length - 2];
            var e = {
                "target": {
                    "parentNode": null
                }
            };
            e.target.parentNode = node;
            this._editBookmarkLabel(e);
        },
        /**
         * 标签点击事件  私有方法
         * @param  {object} e 
         * @return {void} 
         */
        _onClickHandler: function(bookmarkItem) {
            var extent = bookmarkItem.extent;
            this.map.zoomToExtent(extent);
            this.onClick();
        }
    });
