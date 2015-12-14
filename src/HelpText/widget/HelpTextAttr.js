define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/_base/array",
		"dojo/dom-geometry",		
		"widgets/HelpText/widget/HelpText",
		"mxui/dom"		
		

	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, dojoArray, domGeom, helpText, mxuidom) {
	"use strict";

	return declare('HelpText.widget.HelpTextAttr',  [helpText, _WidgetBase], {
	
		name : '',
		startvisible : false,
		showonhover : true,
		width : 300,
		height : 300,
		closeClick : false,
        position : 'popup',
		text : '',
		

		_setValueAttr : function(value) {
			console.log('set', value);
			this.text = mxuidom.escapeString(value).replace(/\n/g,"<br />");
			if (this.helpNode) {
				dojo.html.set(this.helpNode, this.text);
			}
		}
	});
});

