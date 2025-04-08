/**
 * columnManager.js
 * Purpose: Manages column visibility and arrangement for NCM tables
 * Written: 2024-11-14
 */

class ColumnLayoutManager {
    constructor() {
        // Don't do anything in constructor
        console.log('ColumnLayoutManager created');
    }

    activateHeaderControls() {
        console.log('Activating header controls');
        if (!$('#thisNet').length) {
            console.log('No net table found');
            return;
        }

        // Show all columns initially
        const columns = window.columnDefinitions || {};
        const defaultCols = new Set(['c0', ...Object.keys(columns.default)]);

        const actionButtons = $(`
            <div class="column-actions" style="position: fixed; top: 10px; right: 10px; z-index: 1001;">
                <button class="apply-changes">Apply Changes</button>
                <button class="cancel-changes">Cancel</button>
            </div>
        `).appendTo('body');

        $('#thisNet th').each((i, header) => {
            const $header = $(header);
            const columnClass = $header.attr('class').match(/c\d+/)?.[0];
            
            if (columnClass && !defaultCols.has(columnClass)) {
                $('<input type="checkbox">')
                    .css({
                        'position': 'absolute',
                        'right': '5px',
                        'top': '50%',
                        'transform': 'translateY(-50%)'
                    })
                    .appendTo($header)
                    .on('change', (e) => {
                        $(`.${columnClass}`).toggleClass('column-hidden');
                    });
            }
        });

        $('.apply-changes').on('click', () => {
            $('.column-hidden').hide();
            this.cleanup();
        });
        
        $('.cancel-changes').on('click', () => this.cleanup());
    }

    cleanup() {
        $('th input[type="checkbox"], .column-actions').remove();
    }
}

// Only attach event handler after document is fully loaded
$(window).on('load', function() {
    console.log('Window loaded');
    const manager = new ColumnLayoutManager();
    
    $('#columnPicker').on('click', function() {
        manager.activateHeaderControls();
    });
});