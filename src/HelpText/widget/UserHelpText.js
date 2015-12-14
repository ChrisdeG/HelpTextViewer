define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/_base/array",
		"dojo/dom-geometry",		
		"widgets/HelpText/widget/HelpText",
		"mxui/dom",		
		"dijit/Menu",
		"dijit/Dialog",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/ValidationTextBox"

	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, dojoArray, domGeom, helpText, mxuidom, _menu, _dialog, _form, _button, _validationTextBox) {
	"use strict";

	return declare('HelpText.widget.UserHelpText',  [_WidgetBase], {


		

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
		dialog: null,
		textbox: null,
		key: '',
		helpobject: null,
		submitbtn: null,
		resetbtn: null,
		lang: '',
		widgets: [],
		
		postCreate : function(){
			console.debug(this.id + ".postCreate");
			
			var id = this.id + '_help';
			this.imgNode = dojoConstruct.create('div', {
				'class' : 'HelpTextButton',
				'id': id
			});
			this.domNode.appendChild(this.imgNode);
			this.connect(this.imgNode, 'onclick', dojo.hitch(this, this.toggleHelp, true));
			if (this.showonhover) {
				this.connect(this.imgNode, 'onmouseenter', dojo.hitch(this, this.showHelp, true, false));
				this.connect(this.imgNode, 'onmouseleave', dojo.hitch(this, this.showHelp, false, false));
			}
			console.log('session', mx.session);
			if (mx.session.hasSomeRole(this.editorrole)) {
				this.connect(this.imgNode, 'oncontextmenu', dojo.hitch(this, this.editText));
				this.startvisible = true;
			}
			this.key = this.itemkey;
			this.lang = mx.session.getConfig().uiconfig.locale;
			this.createHelp();
			this.getData(); 
			this.stateChange(this.startvisible);
			this.handle = dojo.subscribe(this.topic, this, this.stateChange);
			
			this.actLoaded();
		},

		stateChange : function(newstate) {
			if (newstate) {
				dojo.style(this.imgNode, "display", "block");
			}
			else if (!this.startvisible) {
				this.helpvisible = false;
				dojo.style(this.imgNode, "display", "none");
				this.showHelp(false);
			}
		},
		
		editText: function (e) {
			if (mx.session.hasSomeRole(this.editorrole)) {
				dojo.stopEvent(e);
				if (this.helpobject) {
					this.createDialog(); 
				} else {
					this.createHelpObject();
				}	
			}
		},
		
		createHelp : function () {
			this.helpNode = mxui.dom.div({'class' : 'HelpTextBox'});
			this.setHelpText(this.text);
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
		
		setHelpText : function (text ) {
			console.log('setHelpText', text);
			if (this.helpNode) {
				var input = text.replace(/\n/g, '<br />');
				dojo.html.set(this.helpNode, input);	
			}
		},
		
		showHelp : function(show, clicked) {
			if (show || this.helpvisible) {
				if (this.closeClick && clicked) {
					this.windowEvt = this.connect(document.body, 'onclick', this.windowClick);
				}
				if (this.position == 'popup') {
					var coords = dojo.coords(this.imgNode, true);
					dojo.style(this.helpNode, {
						'display' : 'block',
						'top' : (coords.y + 30)+'px',
						'left': (window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30)+'px'
					});
				}
				else {
					dojo.style(this.helpNode, {
						'display' : 'block',
						'top' : '30px',
						'left': this.position == 'right' ? '30px' : (-30 - this.width) + 'px'
					});
				}
			}
			else {
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
		
		getData: function(createIfNotFound) {
			var xpathString = "//" + this.helptextentity + "[" + this.keyattr + "='" + this.key + "'][" + this.langattr + "='" + this.lang + "']";
			var schema = [];
			schema.push(this.textattr);
			//console.log(xpathString);
			mx.data.get({
				xpath : xpathString,
				filter : {
					attributes : schema
				},
				callback : dojo.hitch(this, function(objs) {
					console.log('found obj', objs);
					if (objs.length!=0) {
						this.helpobject = objs[0];
						this.text = objs[0].get(this.textattr);
						this.setHelpText(this.text);
						// display only if text
						if (this.text) {
							this.stateChange(true);
						}
						//console.log('helpt text set to', this.text);	
					}
				}),

				error: dojo.hitch(this, function(err) {
					console.error("Unable to retrieve data for xpath '" + xpathString + "': " + err, err);
				})
			});
		},
		
		createHelpObject: function () {
			//console.log('create help object');
			mx.data.create({
				entity : this.helptextentity,
				callback : function (newhelptext) {
					newhelptext.set(this.keyattr, this.key);
					newhelptext.set(this.langattr, this.lang);
					mx.data.commit({
						mxobj : newhelptext,
						callback : dojo.hitch(this, function (newhelptext) {
							//console.log('new helpobject', newhelptext);
							this.helpobject = newhelptext;
							this.createDialog();
						}, newhelptext)
					});
				}
			}, this);
		},

		saveHelpObject : function () {
			//console.log('save', this.helpobject);
			mx.data.commit({
				mxobj : this.helpobject,
				callback : function () {
					//console.log('saved');
				},
				error : function (e) {console.error(e);}
			}, this);	
		},

		/* create a primitive ed/itor dialog when edit is selected.*/
		createDialog: function () {

			//console.log('create dialog', this);
			this.showHelp(false, false);
			this.dialog = dojoConstruct.create ('div', { 'class': 'modal-dialog mx-window mx-window-active mx-window-view'});
			dojo.style(this.dialog, { 'opacity' : 1, 'heigth': '400px', 'width': '300px', 'background': 'white', 'zIndex': '10' } );
			this.textbox = dojoConstruct.create ('textarea', {
				name: "myarea",
				value: this.text,
				style: "width: 300px; rows: 20; height: 200px;"
			});
			this.submitbtn = new mxui.widget._Button({
				"caption": "save",
				"style": "margin: 5px;",
				"onClick": dojo.hitch(this, this.saveHelpText)
			});
			this.resetbtn = new mxui.widget._Button({
				"caption": "cancel",
				"style": "margin: 5px;",
				"onClick": dojo.hitch(this, this.closeHelpText)
			});
			this.widgets.push(this.textbox, this.submitbtn, this.resetbtn);
			this.dialog.appendChild(this.textbox);
			this.dialog.appendChild(this.submitbtn.domNode);
			this.dialog.appendChild(this.resetbtn.domNode);
			this.domNode.appendChild(this.dialog);
		},
		
		saveHelpText: function() {
			this.text = this.textbox.value;
			//console.log('save help text', this.text);
			this.helpobject.set(this.textattr, this.text);
			this.setHelpText(this.text);
			this.saveHelpObject();
			this.closeHelpText();
		}, 
		closeHelpText: function() {
			if (this.dialog) {
				dojo.style(this.dialog, 'display', 'none');
				console.log('dialog', this.dialog);
				dojoConstruct.destroy(this.dialog);
				this.dialog=null;
			}
		},  

		
		uninitialize : function() {
			try {
				dojo.forEach(this.widgets, function(item) { 
					try {
						//console.log("destroy", item);
						item.uninitialize();
						item.destroy();
					}
					catch(e) {
						console.log('e', e);
						//stupid destructors of dialog always throw...
					}
				});
				//this.destroyDialog();
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
