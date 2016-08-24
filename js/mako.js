(function($){
	/**
	 * 
	 *
	 */
	
	
	//setup common variables
	var $makoframe = $('<div id="makoframe"></div>');
	var $makopublishbutton = $('<div id="makopublishbutton">PUBLISH</div>');
	var $makobutton = $('<div id="makobutton">MAKO</div>');
	var $original_body_contents = $("body > *").not($makoframe);
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
	function strip_p_tags($jquery){
        var $clone = $jquery.clone();
        $clone.children().each(function(){
			var $this = $(this);
            if($this.is("p")){
                var $original_children = $this.html()+"&#10;&#13;";
                var $original_parent = $this.parent();
                $this.remove();
                $original_parent.append($original_children);
            }
        });
        return $clone.html();
    }
	/*
	 * Core Functionality
	 */
	
	function pre_mako_setup_objects_and_link(){
		$original_body_contents.find('[data-mako]').each(function(){
			var $this = $(this);
			var data_mako = $this.attr("data-mako");
			//if not previously registered add to original elements object
			if($original_mako_object[data_mako]===undefined){
                if($this.is('[data-mako-image]')){
                    $original_mako_object[data_mako] = $this.attr('data-mako-image');
                }
                else {
                    $original_mako_object[data_mako] = $this;
                }
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
	function mako_remove_a_href(){
		$makoframe.find('.mako').parent().filter("a").removeAttr("href");
	}
	function mako_link_and_isolate(){
		var $els = $makoframe.find('[data-mako]').not('[data-mako-image]');
		var alreadytouched = [];
		$els.each(function(){
			var $this = $(this);
			var touched = false;
			alreadytouched.forEach(function(){
				if($(this)==$this)touched = true;
			});
			if(touched)return;
			var $same_els = $makoframe.find('[data-mako="'+$(this).attr('data-mako')+'"]');
			if($same_els.length>1){
				$same_els.not($this).each(function(){
					//realize this may push twice but performance bump not that bad
					alreadytouched.push($(this));
				});
				//on text change for same elements
				$same_els.on("keyup",function(){
					var $this = $(this);
					//update text for same elements throughout dom
					$same_els.not($this).text($this.text());
				}).not($this).removeAttr("data-mako").attr({
					"data-mako-link":"true",
				});
			}
		});
	}
	
	function mako_cleanup_dom(){
		//cleanup original dom
		$original_body_contents.find(".mako").each(function(){
			var $this = $(this);
			var $original_children = $this.html();
			var $original_parent = $this.parent();
			$this.remove();
			$original_parent.append($original_children);
		});
        $original_body_contents.find("[data-mako-embedded-image]").removeAttr("data-mako-embedded-image");
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
		//add functionality for editableness for text and images
        
        //functionality for text
		$makoframe.find("[data-mako]").not('[data-mako-iamge]').attr({
			"contenteditable":"true",
		});
		$makoframe.find("[data-mako-link]").not('[data-mako-iamge]').attr({
			"contenteditable":"true",
		});
        //functionality for images
        var $initialized = false;
        $makoframe.find("[data-mako-image] img, [data-mako-embedded-image]").on('click',function(){
            $(this).addClass("mako-active-image");
            if($initialized){
                $('#mako-image-picker').eq(0).show();
            }
            else {
                $initialized = true;
                var url = wpApiSettings.root + 'wp/v2/media';
                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: 'json',
                    //from api manual
                    beforeSend: function ( xhr ) {
                        xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
                    },
                    error: function(){
                        alert("Error in AJAX Call to retrieve images");
                    },
                    success: function(data){
                        var $image_picker = $('<div id="mako-image-picker" class="mako"></div>');
                        data.forEach(function(item,i,array){
                            $image_picker.append($('<img class="mako-image">').attr({
                                'src':item.media_details.sizes.thumbnail.source_url,
                                'data-mako-image-full':item.media_details.sizes.full.source_url,
                                'data-mako-image':item.id,
                            }));
                        });
                        $makoframe.append($image_picker);
                        $('.mako-image').on('click',function(){
                            $this = $(this);
                            $('.mako-active-image').attr({
                                'src':$this.attr('data-mako-image-full'),
                                "srcset":"",
                            });
                            if(!$('.mako-active-image').is('[data-mako-embedded-image]')){
                                $('.mako-active-image').parents('[data-mako]').eq(0).attr({
                                    'data-mako-image':$this.attr('data-mako-image'),
                                });
                            }
                            $('.mako-active-image').removeClass('mako-active-image');
                            $this.parents('#mako-image-picker').eq(0).hide();
                        });
                    },
                });
            }
        });
	}
	
	function mako_add_functionality_publish(){
		//add functionality for publishing edits
		function publish_to_db(){
			//for each mako data-mako tag
			var $mako = $makoframe.find('[data-mako]');
            var base_url = wpApiSettings.root + 'wp/v2/';//setup base url
			var publish_objs = {};//holds data to publish
            removeDuplicates($mako);
            //pre-ajax collect same objects
			$mako.each(function(){
				var $this = $(this);
                //setup variables for ajax call
				var sub_url = "";//setup sub url
				var data;
				var data_mako_array = $this.attr("data-mako").split(";").trimArray();
				if(data_mako_array.length!==2)
					return;
				var sub_url_vars = data_mako_array[0].split("-").trimArray();
				if(sub_url_vars.length<2)
					return;
				if(sub_url_vars[0]=="post"||sub_url_vars[0]=="page")
					sub_url_vars[0]+="s";
				sub_url = sub_url + sub_url_vars[0] +"/"+sub_url_vars[1];
                if($this.is('[data-mako-image]')){
                    var original_id=$original_mako_object[$this.attr("data-mako")];
                    if(original_id===$this.attr('data-mako-image'))return;
                    data = $this.attr('data-mako-image');
                }
                else {
                    //check to see if content changed do nothing on error or no change
                    var original_html=$original_mako_object[$this.attr("data-mako")].html();
                    var this_html = $this.html();
                    if(original_html!==undefined && this_html!==undefined){
                        if(original_html == this_html)
                            return;
                    } else return;
                    data = strip_p_tags($this);
                }
                //add object to publish objs if it doesn't exits add to data for sub url if it does
                var this_obj = publish_objs[sub_url];
                if(this_obj!==undefined){
                    if(this_obj[data_mako_array[1]]===undefined){
                        this_obj[data_mako_array[1]]=data;
                    }
                }else {
                    var temp_data = {};
                    temp_data[data_mako_array[1]]=data;
                    publish_objs[sub_url]=temp_data;
                }
            });
            //call ajax function to update through api
            var keys_length = Object.keys(publish_objs).length;
            var count = 0;
            for(var sub_url in publish_objs){
                $.ajax({
                    type: "POST",
                    url: base_url+sub_url,
                    data: publish_objs[sub_url],
                    dataType: "text",
                    //from api manual
                    beforeSend: function ( xhr ) {
                        xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
                        $makopublishbutton.off('click', publish_to_db);//prevent duplicates
                    },
                    error: function(){
                        console.log("Error in AJAX Call to update data ");
                    },
                    success: function(){
                        count++;
                        if(count === keys_length){
                            location.reload();
                        }
                    },
                });
            }
        }
		$makopublishbutton.on('click', publish_to_db);
	}
	
	//setup backend object catalog
	pre_mako_setup_objects_and_link();
	//then setup the front end
	mako_frontend_intialize();
	//remove a href to prevent linking on mako
	mako_remove_a_href();
	//link like objects
	mako_link_and_isolate();
	//cleanup the original dom
	mako_cleanup_dom();
	//add functionality for overlay and toggle
	mako_add_functionality_mako_button();
	//add functionality for editableness
	mako_add_functionality_editable();
	//add functionality for publishing edits
	mako_add_functionality_publish();
	
})(jQuery);
