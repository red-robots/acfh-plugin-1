<?php
class Mako {
	private static $initiated = false;
	
	public static function init() {		
		$current_user = wp_get_current_user();
		//only run plugin as admin editor and not on admin page
		if ( user_can( $current_user, "edit_posts" ) && !is_admin() && ! self::$initiated ) {
			self::init_hooks();
		}
	}
	
	private static function init_hooks(){
		self::$initiated = true;
		//add all mako tags for frontend processing
		add_action("the_posts",array("Mako","tag_all_post_types"),10,2);
		//add functionality for wpautop since it won't autop tagged posts
		add_action("the_content",array("Mako","makoautop"),10);
		add_action("the_excerpt",array("Mako","makoautop"),10);
		//enqueue mako front end js
		wp_enqueue_script("makojs",plugin_dir_url( __FILE__ )."js/mako.js",array('wp-api'),null,true);
		//enque mako frontend stylesheet
		wp_enqueue_style("makocss",plugin_dir_url( __FILE__ )."css/mako.css");
	}
	
	public static function tag_all_post_types($posts,$query){
		foreach($posts as $post):
			$route = $post->post_type."-".$post->ID;
			$post->post_content = '<div class="mako" data-mako="'.$route.';content">'.$post->post_content.'</div>';
			$post->post_title = '<div class="mako" data-mako="'.$route.';title">'.$post->post_title.'</div>';
		endforeach;
		return $posts;
	}
	
	//wrapper for auto p that allows the mako block elements contents to be autopd
	public static function makoautop($content){
		$matches = array();
		if(preg_match("/^(<[^>]*?mako[^>]*?>)(.*?)(<\s*?\/\s*?div\s*?>)$/i",$content,$matches)===1){
			$content = $matches[1].wpautop($matches[2]).$matches[3];
		}	
		return $content;
	}
}
