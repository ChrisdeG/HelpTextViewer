define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/_base/array"		
		

	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, dojoArray) {
	"use strict";


	return declare('HelpText.widget.HelpTextRow', [_WidgetBase], {

		text : '',
		startvisible : false,
		height : 300,
		hideonclick : false,
		onclickmf : '',

		//IMPLEMENTATION
		domNode: null,
		topic : "CustomWidget/HelpText",
		handle : null,
		rowNode : null,
		targetHeight : 0,
		anim : null,
		contextobj : null,
		
		postCreate : function(){
			console.debug(this.id + ".postCreate");

			dojo.addClass(this.domNode, 'HelpTextRow');
			this.createHelp();
			this.rowNode = this.findRowNode(this.domNode);
			dojo.style(this.domNode, 'maxHeight', this.height + 'px');
			dojo.style(this.rowNode, 'height', 'auto'); //follow the animation
			this.actRendered();
			this.addOnLoad(dojo.hitch(this, this.poststartup));
		},

		update : function (obj, callback) {
			this.contextobj = obj;
			if (callback) {
				callback();
			}
		},
		
		poststartup : function() {
			if (!this.startvisible) {
				dojo.style(this.rowNode, 'display','none');
			}
				
			this.stateChange(this.startvisible);
			this.handle = dojo.subscribe(this.topic, this, this.stateChange);
				
		},
		
		findRowNode : function(parent) {
			console.log('parent', parent);
			var tag = null;
			var result = null;
			if (parent && parent.tagName) {
				tag = parent.tagName.toLowerCase();
			}
			if (tag == 'tr' || tag == 'th') {
				result = parent;
			}
			else if (parent.parentNode != null) {
				result = this.findRowNode(parent.parentNode);
			}
			if (result == null) {
				throw new Exception(this.id + " Did not found a parent row to show or hide");
			} else {
				return result;
			}
		},

		updateHeight : function(height) {
			if (this.anim != null) {
				this.anim.stop();
			}
			this.anim = dojo.animateProperty({
				node : this.domNode,
				duration : 500,
				properties : { height : height },
				onEnd : dojo.hitch(this, function() {
					if (height == 0) {
						dojo.style(this.rowNode, 'display', 'none');
					}
				})
			});
			this.anim.play();
		},

		stateChange : function(newstate) {
			if (newstate) {
				var boxorig = dojo.marginBox(this.domNode);
				dojo.style(this.rowNode, {'display' : '' });
				dojo.style(this.domNode, {'height' : 'auto'});
				var box = dojo.marginBox(this.domNode);
				
				if (boxorig.h == 0) { 
					dojo.style(this.domNode,  { 'height' : '0px'});
				}
				if (box.h > 0) {
					this.updateHeight(Math.min(this.height, box.h));
				} else {
					dojo.style(this.domNode,  'height', 'auto');
				}
			}
			else { 
				this.updateHeight(0);
			}
		},
		
		createHelp : function () {
			dojo.html.set(this.domNode, this.text);
			if (this.hideonclick) {
				this.connect(this.domNode, 'onclick', this.hideHelp);
			} else if (this.onclickmf != '') {
				this.connect(this.domNode, 'onclick', this.executeMF);
			}
		},

		executeMF : function () {
			var params = {
				params: {
					actionname : this.onclickmf,
					applyto : 'selection',
					guids : [this.contextobj.getGUID()]
				},
				callback : function () {},
				error : function () {}
			};
			mx.data.action(params);			
		},

		hideHelp : function() {
			this.startvisible = false;
			this.stateChange(false);
		},
		
		uninitialize : function() {
			dojo.unsubscribe(this.handle);
		}
	});
});