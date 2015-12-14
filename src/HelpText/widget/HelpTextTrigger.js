define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/_base/array",
		"dojo/dom-geometry",
		"dojo/dom-class"		
		

	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, dojoArray, domGeom, domClass) {
	"use strict";


	return declare('HelpText.widget.HelpTextTrigger', [_WidgetBase], {

		txton : '',
		txtoff: '',
		domNode: null,
		imgNode: null,
		txtNode: null,
		topic : "CustomWidget/HelpText",
		state : false, //current state
		

		
		postCreate : function(){
			console.debug(this.id + ".postCreate");

			this.imgNode = dojoConstruct.create('div');
			domClass.add(this.imgNode, 'HelpTextTrigger');
			this.domNode.appendChild(this.imgNode);
			
			this.txtNode = dojoConstruct.create('label', { innerHTML: this.txton });
			domClass.add(this.txtNode,'HelpTextTriggerLabel');
			this.domNode.appendChild(this.txtNode);
			
			this.connect(this.imgNode, 'onclick', this.toggle);
			this.connect(this.txtNode, 'onclick', this.toggle);
			
			this.actLoaded();
		},

		toggle : function() {
			this.state = !this.state;
			dojo.attr(this.imgNode, 'class', this.state? 'HelpTextTriggerDown' : 'HelpTextTrigger');
			dojo.html.set(this.txtNode, this.state == true ? this.txtoff : this.txton);
			dojo.publish(this.topic, [ this.state ]);
		}
		

	});
});