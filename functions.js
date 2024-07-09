class Grid {
    constructor(name, rows = 5, columns = 5, content = ["Something"]) {
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.content = content;
    }
}

var ListOfGrids = [];
var gridCounter = 1;
var selectedGridIndex = -1; // -1 indicates no grid is selected initially

document.getElementById('add-grid').addEventListener('click', function(event) {
    event.preventDefault();
    addGrid();
});

function addGrid() {
    let newGrid = new Grid(`Grid ${gridCounter++}`);
    ListOfGrids.push(newGrid);
    renderGridList();
}

function deleteGrid(index) {
    ListOfGrids.splice(index, 1);
    // Adjust the selected grid index if necessary
    if (selectedGridIndex === index) {
        selectedGridIndex = -1; // Deselect if the selected grid is deleted
    } else if (selectedGridIndex > index) {
        selectedGridIndex--; // Adjust the index if a preceding grid is deleted
    }
    renderGridList();
    updateGridSettings();
}

function duplicateGrid(index) {
    const gridToDuplicate = ListOfGrids[index];
    const newGrid = new Grid(
        `${gridToDuplicate.name} Copy`,
        gridToDuplicate.rows,
        gridToDuplicate.columns,
        [...gridToDuplicate.content]
    );
    ListOfGrids.splice(index + 1, 0, newGrid);
    renderGridList();
}

function selectGrid(index) {
    selectedGridIndex = index;
    renderGridList();
    updateGridSettings();
}

function startEditingName(index, event) {
    event.stopPropagation();
    const gridItem = document.querySelector(`#grid-item-${index}`);
    const span = gridItem.querySelector('span');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent;
    input.className = 'leading-none border rounded px-1 text-sm';
    input.addEventListener('blur', function() {
        finishEditingName(index, input.value);
    });
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
    span.textContent = '';
    span.appendChild(input);
    input.focus();
}

function finishEditingName(index, newName) {
    if (newName.trim() !== "") {
        ListOfGrids[index].name = newName.trim();
        renderGridList();
        updateGridSettings();
    }
}

function updateGridSettings() {
    if (selectedGridIndex !== -1) {
        const selectedGrid = ListOfGrids[selectedGridIndex];
        document.getElementById('grid_name').textContent = selectedGrid.name;
        document.getElementById('columns').value = selectedGrid.columns;
        document.getElementById('rows').value = selectedGrid.rows;
    } else {
        document.getElementById('grid_name').textContent = 'No grid selected';
        document.getElementById('columns').value = '';
        document.getElementById('rows').value = '';
    }
}

document.getElementById('columns').addEventListener('change', function() {
    if (selectedGridIndex !== -1) {
        ListOfGrids[selectedGridIndex].columns = parseInt(this.value, 10);
    }
});

document.getElementById('rows').addEventListener('change', function() {
    if (selectedGridIndex !== -1) {
        ListOfGrids[selectedGridIndex].rows = parseInt(this.value, 10);
    }
});

function renderGridList() {
    const gridList = document.getElementById('grid-list');
    gridList.innerHTML = '';

    ListOfGrids.forEach((grid, index) => {
        let gridItem = document.createElement('a');
        gridItem.id = `grid-item-${index}`;
        gridItem.className = `flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300 ${index === selectedGridIndex ? 'bg-blue-200' : ''}`;
        gridItem.href = '#';

        gridItem.addEventListener('click', function(event) {
            event.preventDefault();
            selectGrid(index);
        });

        gridItem.addEventListener('dblclick', function(event) {
            startEditingName(index, event);
        });

        gridItem.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            showContextMenu(event, index);
        });

        let gridName = document.createElement('span');
        gridName.className = 'leading-none';
        gridName.textContent = grid.name;

        gridItem.appendChild(gridName);
        gridList.appendChild(gridItem);
    });
}

function showContextMenu(event, index) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.classList.add('visible');

    const editMenuItem = document.getElementById('edit-menu-item');
    editMenuItem.onclick = function() {
        startEditingName(index, event);
        contextMenu.classList.remove('visible');
    };

    const deleteMenuItem = document.getElementById('delete-menu-item');
    deleteMenuItem.onclick = function() {
        deleteGrid(index);
        contextMenu.classList.remove('visible');
    };

    const duplicateMenuItem = document.getElementById('duplicate-menu-item');
    duplicateMenuItem.onclick = function() {
        duplicateGrid(index);
        contextMenu.classList.remove('visible');
    };

    document.addEventListener('click', function() {
        contextMenu.classList.remove('visible');
    }, { once: true });
}

// Initial rendering of the grid list
renderGridList();
