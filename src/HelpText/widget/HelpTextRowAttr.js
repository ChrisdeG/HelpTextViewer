define([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/dom-construct",
		"dojo/html",
		"dojo/_base/array",
		"dojo/dom-geometry",		
		"widgets/HelpText/widget/HelpTextRow",
		"mxui/dom"
		

	], function (declare, _WidgetBase, dojoConstruct, dojoHtml, dojoArray, domGeom, helpTextRow, mxuidom) {
	"use strict";


	return declare('HelpText.widget.HelpTextRowAttr', [helpTextRow, _WidgetBase], {

		name : '',
		startvisible : false,
		text : '',
		height : 300,
		hideonclick : false,

		_setValueAttr : function(value) {
			this.text = mxuidom.escapeString(value).replace(/\n/g,"<br/>");
			dojo.html.set(this.domNode, this.text);
		}
	});
    
});