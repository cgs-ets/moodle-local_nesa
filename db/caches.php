<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Plugin capabilities for the local_nesa plugin.
 *
 * @package   local_nesa
 * @copyright 2025, Veronica Bermegui <>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

 defined('MOODLE_INTERNAL') || die();

 $definitions = array(
	 'students_nesa_numbers' => array(
		 'mode' => cache_store::MODE_SESSION, // You can use session or permanent cache
		 'simplekeys' => true,                // Simple keys for caching (you’ll use courseid as the cache key)
		//  'ttl' => 3600,                       // Set cache expiration time (in seconds)
	 ),
 );