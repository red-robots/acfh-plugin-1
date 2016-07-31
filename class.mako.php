<?php
class Mako {
	private static $initiated = false;
	
	public static function init() {		
		global $current_user;
		get_currentuserinfo();
		//only run plugin as admin editor and not on admin page
		if ( user_can( $current_user, "edit_posts" ) && !is_admin() && ! self::$initiated ) {
			self::init_hooks();
		}
	}
	
	private static function init_hooks(){
		self::$initiated = true;
		//add all mako tags for frontend processing
		add_filter("the_posts",array("Mako","tag_posts"));
		//enqueue mako front end js
		wp_enqueue_script("makojs",plugin_dir_url( __FILE__ )."js/mako.js",array('wp-api'),null,true);
		//enque mako frontend stylesheet
		wp_enqueue_style("makocss",plugin_dir_url( __FILE__ )."css/mako.css");
	}
	
	public static function tag_posts($posts){
		foreach($posts as $post):
			//add tag at the end of post_content
			$post->post_content = '<div class="mako-wrapper">'.$post->post_content.'<i class="mako '.$post->post_type."-".$post->ID.';content"></i></div>';
			$post->post_title = '<div class="mako-wrapper">'.$post->post_title.'<i class="mako '.$post->post_type."-".$post->ID.';title"></i></div>';
		endforeach;
		return $posts;
	}
}
