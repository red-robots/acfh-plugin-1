(function($){
	function pre_mako_dom_modification_initialize(){
		$('.mako').each(function(){
			var $this = $(this);
			//style parent with childs tag
			$this.parent().attr({
				"data-mako":$this.attr("class").replace("mako",""),
			});
			//remove the original tag
			$this.remove();
		});
	}
	function mako_frontend_intialize(){
		//setup front overlay and button for toggle
		var $makoframe = $('<div id="makoframe"></div>');
		var $makopublishbutton = $('<div id="makopublishbutton">PUBLISH</div>');
		var $makobutton = $('<div id="makobutton">MAKO</div>');
		var $body_contents = $("body > *");
		$body_contents.each(function(){
			$makoframe.append($(this).clone());
		});
		//append the mako overlay and buttons
		$("body").append($makobutton).append($makoframe.append($makopublishbutton));
	}
	function mako_cleanup_dom(){
		//cleanup original dom
		$("body > *").not("#makoframe").find("[data-mako]").removeAttr("data-mako");
	}
	function mako_add_functionality_mako_button(){
		//add functionality for overlay and toggle
		var $makobutton = $('#makobutton');
		var $makoframe = $('#makoframe');
		var $body_contents = $("body > *").not("#makoframe").not("#makobutton").not("#makopublishbutton");
		var hidden_flag = true;
		//set attribute with original opacity for all dom elements in case set by other js functions
		$body_contents.each(function(){
			$(this).attr({
				"data-mako-opacity":$(this).css("opacity"),
			});
		});
		$makobutton.on("click",function(){
			if(hidden_flag===true){
				//if hidden show
				$makobutton.addClass("active");
				$makoframe.css({	
					"display":"block",
				});
				$body_contents.each(function(){
					$(this).css({
						"opacity":0,
					});
				});
				hidden_flag = false;
			} else {
				//if not hidden hide
				$makobutton.removeClass("active");
				$makoframe.css({
					"display":"",
				});
				$body_contents.each(function(){
					$(this).css({
						"opacity":$(this).attr("data-mako-opacity")!==undefined?$(this).attr("data-mako-opacity"):"",
					});
				});
				hidden_flag = true;
			}
		});
	}
	function mako_add_functionality_editable(){
		//add functionality for editableness
		$("#makoframe").find("[data-mako]").attr({
			"contenteditable":"true",
		});
	}
	function mako_add_functionality_publish(){
		//add functionality for publishing edits
		//have to read all mako properties on click and formulate ajax request for each to api to update information
		//refresh browser on publish
		//location.reload();
	}
	//first mark the parents
	pre_mako_dom_modification_initialize();
	//then setup the front end
	mako_frontend_intialize();
	//cleanup the original dom
	mako_cleanup_dom();
	//add functionality for overlay and toggle
	mako_add_functionality_mako_button();
	//add functionality for editableness
	mako_add_functionality_editable();
	//add functionality for publishing edits
	mako_add_functionality_publish();
	
})(jQuery);