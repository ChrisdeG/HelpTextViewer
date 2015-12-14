// HelpText.js Version 2.0.1 developed by Roeland Salij 
// Migrated to Mendix 6.0 Chris de Gelder Dec 2015
define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/dom-geometry"		
	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, domGeom) {
		"use strict";


	return declare('HelpText.widget.HelpText', [_WidgetBase], {
		text : '',
		startvisible : false,
		showonhover : true,
		width : 300,
		height : 300,
		closeClick : false,
		position : 'popup',
		
		//IMPLEMENTATION
		domNode: null,
		topic : "CustomWidget/HelpText",
		imgNode : null,
		handle : null,
		helpNode : null,
		helpvisible: false,
		windowEvt : null,
		
		postCreate : function(){
			console.debug(this.id + ".postCreate");

			this.imgNode = dojoConstruct.create('div');
			dojo.attr(this.imgNode, {
				'class' : 'HelpTextButton'
			});
			this.domNode.appendChild(this.imgNode);
			this.connect(this.imgNode, 'onclick', dojo.hitch(this, this.toggleHelp, true));
			if (this.showonhover) {
				this.connect(this.imgNode, 'onmouseenter', dojo.hitch(this, this.showHelp, true, false));
				this.connect(this.imgNode, 'onmouseleave', dojo.hitch(this, this.showHelp, false, false));
			}
			
			this.createHelp();
			
			this.stateChange(this.startvisible);
			this.handle = dojo.subscribe(this.topic, this, this.stateChange);
			
			this.actLoaded();
		},

		stateChange : function(newstate) {
			if (newstate) {
				dojo.style(this.imgNode, "display", "block");
			} else {
				if (!this.startvisible) {
					this.helpvisible = false;
					dojo.style(this.imgNode, "display", "none");
					this.showHelp(false);
				}
			}
		},
		
		createHelp : function () {
			this.helpNode = dojoConstruct.create('div', {'class' : 'HelpTextBox'} );
			dojo.html.set(this.helpNode, this.text.replace(/\n/g, '<br/>'));
			dojo.style(this.helpNode, {
				'width' : this.width + 'px',
				'maxHeight' : this.height + 'px'
			});
			this.connect(this.helpNode, 'onclick', dojo.hitch(this, this.toggleHelp, true));
			if (this.position == 'popup') {
				dojo.body().appendChild(this.helpNode);
			} else {
				this.domNode.appendChild(this.helpNode);
				dojo.style(this.domNode, 'position', 'relative');
			}
		},

		toggleHelp : function(clicked, e) {
			this.helpvisible = !this.helpvisible;
			this.showHelp(this.helpvisible, clicked);
			if (e) {
				dojo.stopEvent(e);
			}
		},
		
		windowClick : function () {
			this.disconnect(this.windowEvt);
			this.windowEvt = null;
			this.toggleHelp(true);
		},
		
		showHelp : function(show, clicked) {
			if (show || this.helpvisible) {
				if (this.closeClick && clicked) {
					this.windowEvt = this.connect(document.body, 'onclick', this.windowClick);
				}
				if (this.position == 'popup') {
					var coords = domGeom.position(this.imgNode, true);
					dojo.style(this.helpNode, {
						'display' : 'block',
						'top' : (coords.y + 30)+'px',
						'left': (window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30)+'px'
					});
				} else {
					dojo.style(this.helpNode, {
						'display' : 'block',
						'top' : '30px',
						'left': this.position == 'right' ? '30px' : (-30 - this.width) + 'px'
					});
				}
			} else {
				dojo.style(this.helpNode, 'display', 'none');
			}
		},
		
		suspended : function() {
			if (this.windowEvt != null) {
				this.disconnect(this.windowEvt);
				this.windowEvt = null;
			}
			this.showHelp(false);
		},
		
		uninitialize : function() {
			try {
				if (this.windowEvt != null) {
					this.disconnect(this.windowEvt);
					this.windowEvt = null;
					console.debug(this.id + ".uninitialize");
				}
				if (this.helpNode != null) {
					document.body.removeChild(this.helpNode);
				}
				if (this.handle != null) {
					dojo.unsubscribe(this.handle);
				}
			}
			catch(e) {
				console.warn("error on helptextviewer unload: " + e);
			}
		}
	});
});