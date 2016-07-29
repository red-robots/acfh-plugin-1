<?php
/*
 * Plugin Name: Mako
 */

function tag_posts($posts){
	foreach($posts as $post):
		$post->post_content = $post->post_content.'<i class="mako content-'.$post->ID.'"></i>';
	endforeach;
	return $posts;
}
add_filter("the_posts","tag_posts");
