<?php
class Mako {
	private static $initiated = false;
	
	public static function init() {
		if ( ! self::$initiated ) {
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
			$post->post_content = $post->post_content.'<i class="mako '.$post->post_type."-".$post->ID.';content"></i>';
		endforeach;
		return $posts;
	}
}
