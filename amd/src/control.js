// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

// You can use this JS to modify the table after the page loads

/**
 * Javascript controller for the "Actions" panel at the bottom of the page.
 *
 * @module     local_nesa
 * @copyright  2025 Veronica Bermegui
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery'], function ($) {
  return {
    init: function (nesanumbers) {
      $(document).ready(function () {
        // Ensure the table with ID "user-grades" exists
        var table = $('#user-grades');
        nesanumbers = JSON.parse(nesanumbers);

        if (table.length) {
          // Find the heading row (tr class="heading")
          var headingRow = table.find('tr.heading');

          var useremailColumn = headingRow.find('th.userfield.useremail');

          // Get their column indexes
          var emailIndex = useremailColumn.index();

          // Create NESA column header (without bold)
          var nesaHeader = $('<th>')
            .append(
              $('<span>').attr('data-collapse', 'content').text('NESA number'),
            )
            .append(
              $('<button>')
                .addClass(
                  'nesa-number btn btn-link btn-icon icon-size-3 cellmenubtn', //btn btn-link btn-icon icon-size-3 cellmenubtn
                )
                .attr({
                  type: 'button',
                  'data-toggle': 'dropdown',
                  'aria-haspopup': 'true',
                  'aria-expanded': 'false',
                  'data-type': 'studiescode',
                  'data-id': 'studiescode',
                }),
              // .css('color', '#F8F9FA') // Set the button's color to #F8F9FA
              // .append(
              //   $('<i>')
              //     .addClass('icon fa fa-ellipsis-h fa-fw m-0')
              //     .attr('title', 'Cell actions')
              //     .attr('aria-hidden', 'true'),
              // )
              // .append($('<span>').addClass('sr-only').text('Cell actions')),
            )
            .addClass('userfield studiescode cell c' + emailIndex)
            .attr({
              'data-col': 'studiescode',
              scope: 'col',
            });

          // Insert the NESA column header in the correct position (before useremail)
          useremailColumn.before(nesaHeader);

          // Add the NESA column to each row in the tbody
          table.find('tbody tr').each(function () {
            // Generate a random number between 0 and 100 for the NESA column
            var userid = $(this).attr('data-uid');
            var studiescode =
              nesanumbers[userid]?.studies_code == undefined
                ? 'N/A'
                : nesanumbers[userid]?.studies_code; // the ? makes sure it doesnt
            // Create the new NESA cell with a div inside
            var nesaCell = $('<td>')
              .addClass('userfield studiescode cell c' + emailIndex)
              .attr('data-col', 'studiescode') // Set the data-col attribute
              .append(
                $('<div>')
                  .attr('data-collapse', 'content') // Add the collapse attribute to the div
                  .text(studiescode), // Set the random NESA number inside the div
              );

            // Find the userusername cell and insert the NESA cell before the useremail cell
            var useremailCell = $(this).find('td.userfield.useremail').first();

            // Insert the NESA cell before the useremail cell
            useremailCell.before(nesaCell);
          }, nesanumbers);

          // Adjust the class of the useremail column in the header (shift to next column)
          headingRow.find('th.userfield.useremail').each(function () {
            var newClassNumber = emailIndex + 1;
            $(this)
              .removeClass('c' + emailIndex)
              .addClass('c' + newClassNumber);
          });

          // Adjust the class for the useremail column cells (body rows)
          table.find('tbody td.userfield.useremail').each(function () {
            var newClassNumber = emailIndex + 1;
            $(this)
              .removeClass('c' + emailIndex)
              .addClass('c' + newClassNumber);
          });

          // Shift classes for all columns after useremail in the heading
          headingRow.find('th').each(function (index) {
            if (index > emailIndex) {
              var newClassNumber = index + 1;
              $(this)
                .removeClass('c' + (index + 1))
                .addClass('c' + newClassNumber);
            }
          });

          // Shift classes for all columns after useremail in the body rows
          table.find('tbody td').each(function () {
            var currentColumnIndex = $(this).index();
            if (currentColumnIndex > emailIndex) {
              var newClassNumber = currentColumnIndex + 1;
              $(this)
                .removeClass('c' + (currentColumnIndex + 1))
                .addClass('c' + newClassNumber);
            }
          });

          // Change the colspan to adapt to the number of userfield colums.
          var firstTr = table.find('tr').first();
          var topLeftCell = firstTr.find('th.cell.topleft.cell.c0');

          var userfieldCount = headingRow.find('th.userfield').length;

          topLeftCell.attr('colspan', userfieldCount + 1); // +1 because the firstname/lastname doesnt have theusefield class

          // Update the colspan for rows after the last userrow
          var lastUserRow = table.find('tr.userrow').last();
          var rowsAfterUserRow = lastUserRow.nextAll(); // Get all rows after the last userrow

          // Loop through each of those rows and update the colspan of the th elements
          rowsAfterUserRow.each(function () {
            var thElement = $(this).find('th');
            thElement.attr('colspan', userfieldCount + 1);
          });
        }
      });
    },
  };
});
