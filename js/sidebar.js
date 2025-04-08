// sidebar.js
function openSidebar() {
    document.getElementById("columnSidebar").classList.add("show");
}

function closeSidebar() {
    document.getElementById("columnSidebar").classList.remove("show");
}

function previewColumn(column) {
    var columns = document.querySelectorAll('.' + column);
    columns.forEach(function(col) {
        col.style.display = col.style.display === 'none' ? '' : 'none';
    });
}

function applyChanges() {
    closeSidebar();
}

function resetToDefault() {
    closeSidebar();
}
