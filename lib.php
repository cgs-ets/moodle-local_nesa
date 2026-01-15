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
 * Plugin functions for the local_nesa plugin.
 * This plugin initially added NESA codes (HSC) to the grader report
 * 
 *
 * @package   local_nesa
 * @copyright 2025, Veronica Bermegui <>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();



function local_nesa_extend_navigation() {
    global $PAGE, $COURSE;
    
    // Check if we're on the Grader Report page
    if ($PAGE->pagetype === 'grade-report-grader-index' || $PAGE->pagetype === 'mod-assign-grading') {
        $coursetype = local_nesa_course_type($COURSE->id);
        $showcolumn = ($coursetype === 'IB' || $coursetype === 'HSC');
        if (!$showcolumn) {
            return;
        }
        if ($coursetype === 'IB') {
            $nesanumbers =  local_nesa_get_students_ibdp_numbers($COURSE->id);
        } elseif ($coursetype === 'HSC') {
            $nesanumbers =  local_nesa_get_students_nesa_numbers($COURSE->id);
        } else {

        }
        
        $PAGE->requires->js_call_amd('local_nesa/control', 'init',[json_encode($nesanumbers), $coursetype]);
    }

    
}

// Function to retrieve students' NESA numbers, with caching
function local_nesa_get_students_nesa_numbers($courseid) {
    global $DB, $CACHE;

    // Get the cache instance for the 'students_nesa_numbers' cache
    $cache = cache::make('local_nesa', 'students_nesa_numbers');

    // Check if data is already cached for the given course
    $cached_data = $cache->get($courseid);
    if ($cached_data !== false) {
        return $cached_data;  // Return the cached data if it exists
    }

    // If no cached data, fetch the data from the database
    $sql = "SELECT u.id, u.username,
            COALESCE(uid.data, 'N/A') AS studies_code
            FROM {user} u
            JOIN {user_enrolments} ue ON ue.userid = u.id
            JOIN {enrol} e ON e.id = ue.enrolid
            LEFT JOIN {user_info_data} uid ON uid.userid = u.id
                AND uid.fieldid = (SELECT id FROM {user_info_field} WHERE shortname = 'StudiesCode')
            WHERE e.courseid = :courseid";


    // Fetch students' StudiesCode for the course
    $students = $DB->get_records_sql($sql, array('courseid' => $courseid));

    // Save the fetched data to cache for later use
    $cache->set($courseid, $students);

    return $students;
}
// Function to retrieve students' IB numbers, with caching
function local_nesa_get_students_ibdp_numbers($courseid) {
    global $DB, $CACHE;

    // Get the cache instance for the 'students_nesa_numbers' cache
    $cache = cache::make('local_nesa', 'students_nesa_numbers');

    // Check if data is already cached for the given course
    $cached_data = $cache->get($courseid);
    if ($cached_data !== false) {
        return $cached_data;  // Return the cached data if it exists
    }

    // If no cached data, fetch the data from the database
    $sql = "SELECT u.id, u.username,
            COALESCE(uid.data, 'N/A') AS ib_code
            FROM {user} u
            JOIN {user_enrolments} ue ON ue.userid = u.id
            JOIN {enrol} e ON e.id = ue.enrolid
            LEFT JOIN {user_info_data} uid ON uid.userid = u.id
                AND uid.fieldid = (SELECT id FROM {user_info_field} WHERE shortname = 'IBCode')
            WHERE e.courseid = :courseid";


    // Fetch students' StudiesCode for the course
    $students = $DB->get_records_sql($sql, array('courseid' => $courseid));

    // Save the fetched data to cache for later use
    $cache->set($courseid, $students);

    return $students;
}

function local_nesa_course_type($courseid) {
    global $DB;

    $coursename = $DB->get_field('course', 'shortname', array('id' => $courseid));

    if (strpos($coursename, 'IB') !== false) {
        $course_type = 'IB';
    } elseif (strpos($coursename, 'HSC') !== false) {
        $course_type = 'HSC';
    } else {
        $course_type = null;
    }

    

    return $course_type ? $course_type : 'N/A';
}   


// Clear the cache for a specific course
function local_nesa_clear_cache($courseid) {
    $cache = cache::make('local_nesa', 'students_nesa_numbers');
    $cache->delete($courseid);
}
