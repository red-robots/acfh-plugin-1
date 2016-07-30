(function($){
	/**
	 * TODO: Link all elements with the same id string
	 *
	 */
	
	
	//setup common variables
	var $makoframe = $('<div id="makoframe"></div>');
	var $makopublishbutton = $('<div id="makopublishbutton">PUBLISH</div>');
	var $makobutton = $('<div id="makobutton">MAKO</div>');
	var $original_body_contents = $("body > *");
	var $original_mako_object = {};
	
	/*
	 * Helper functions
	 */
	
	Array.prototype.trimArray = function(){
		this.forEach(function(item,i,array){
			array[i] = item.trim();
		});
		return this;
	};
	function removeDuplicates($jquery){
		var temp = {};
		var $this = $(this);
		$jquery.each(function(){
			if(temp[$this.attr("data-mako")]===undefined){
				$jquery = $jquery.not($this);
			}
			else {
				temp[$this.attr("data-mako")] = true;
			}
		});
	}
	
	/*
	 * Core Functionality
	 */
	
	function pre_mako_dom_modification_initialize(){
		$original_body_contents.find('.mako').each(function(){
			var $this = $(this);
			//style parent with childs tag
			$this.parent().attr({
				"data-mako":$this.attr("class").replace("mako",""),
			});
			//remove the original tag
			$this.remove();
		});
	}
	
	function pre_mako_setup_objects_and_link(){
		$original_body_contents.find('[data-mako]').each(function(){
			var $this = $(this);
			var data_mako = $this.attr("data-mako");
			//if not previously registered add to original elements object
			if($original_mako_object[data_mako]===undefined)
				$original_mako_object[data_mako] = $this;
			else {//else link text for objects
				var $same_els = $('[data_mako='+data_mako+']');
				//on text change for same elements
				$same_els.on("change",function(){
					var $this = $(this);
					//update text for same elements throughout dom
					$same_els.not($this).text($this.text());
				});
			}
		});
	}
	
	function mako_frontend_intialize(){
		//setup front overlay and button for toggle
		$original_body_contents.each(function(){
			$makoframe.append($(this).clone());
		});
		//append the mako overlay and buttons
		$("body").append($makobutton).append($makoframe.append($makopublishbutton));
	}
	
	function mako_cleanup_dom(){
		//cleanup original dom
		$original_body_contents.find("[data-mako]").removeAttr("data-mako");
	}
	
	function mako_add_functionality_mako_button(){
		//add functionality for overlay and toggle
		var hidden_flag = true;
		//set attribute with original opacity for all dom elements in case set by other js functions
		$original_body_contents.each(function(){
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
				$original_body_contents.each(function(){
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
				$original_body_contents.each(function(){
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
		$makoframe.find("[data-mako]").attr({
			"contenteditable":"true",
		});
	}
	
	function mako_add_functionality_publish(){
		//add functionality for publishing edits
		var base_url = wpApiSettings.root + 'wp/v2/';//setup base url
		$makopublishbutton.on('click',function(){
			//for each mako data-mako tag
			var $mako = $makoframe.find('[data-mako]');
			removeDuplicates($mako);
			$mako.each(function(){
				var $this = $(this);
				//check to see if content changed do nothing on error or no change
				var original_text=$original_mako_object[$this.attr("data-mako")].text();
				var this_text = $this.text();
				if(original_text!==undefined && this_text!==undefined){
					original_text = original_text.toString();
					this_text = this_text.toString();
					if(original_text == this_text)
						return;
				} else return;
				//setup variables for ajax call
				var sub_url = "";//setup sub url
				var data = {};//setup object for data
				var data_mako_array = $(this).attr("data-mako").split(";").trimArray();
				if(data_mako_array.length!==2)
					return;
				var sub_url_vars = data_mako_array[0].split("-").trimArray();
				if(sub_url_vars.length<2)
					return;
				if(sub_url_vars[0]=="post"||sub_url_vars[0]=="page")
					sub_url_vars[0]+="s";
				sub_url = sub_url + sub_url_vars[0] +"/"+sub_url_vars[1];
				data[data_mako_array[1]] = this_text;
				//call ajax function to update through api 
				$.ajax({
					type: "POST",
					url: base_url+sub_url,
					data: data,
					dataType: "text",
					//from api manual
					beforeSend: function ( xhr ) {
						xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
					},
					error: function(){
						alert("Error in AJAX Call to update data");
					},
					success: function(){
						location.reload();
					},
				});
			});
		});
	}
	
	//first mark the parents
	pre_mako_dom_modification_initialize();
	//then setup backend object catalog
	pre_mako_setup_objects_and_link();
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