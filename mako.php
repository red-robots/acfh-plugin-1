<?php
/*
 * Plugin Name: Mako
 *
 * code inspired by askimet
 */

// Make sure we don't expose any info if called directly
if ( !function_exists( 'add_action' ) ) {
	echo 'Hi there!  I\'m just a plugin, not much I can do when called directly.';
	exit;
}

define( 'MAKO_PLUGIN_DIR', dirname( __FILE__ ).'\\');

require_once(MAKO_PLUGIN_DIR."\class.mako.php");

//on init run mako
add_action( 'init', array( 'Mako', 'init' ) );

