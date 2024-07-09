document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const mergeButton = document.getElementById('merge-btn');
    const unmergeButton = document.getElementById('unmerge-btn');
   
   
    const addRowButton = document.getElementById('add-row-btn');
    const deleteRowButton = document.getElementById('delete-row-btn');
    const addColButton = document.getElementById('add-col-btn');
    const deleteColButton = document.getElementById('delete-col-btn');
    
let numRows = 5;
let numCols = 5;

// Get references to the input elements
const numRowsInput = document.getElementById('rows');
const numColsInput = document.getElementById('columns');
    
    const selectedCells = new Set();
    // const subgridStateMap = new Map();
    let cellToUnmerge = null;
  
    // Function to create grid cells
    function createGridCells(rows, cols) {
      gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      const existingCells = gridContainer.children;
      const totalCells = rows * cols;
  
      for (let i = 0; i < totalCells; i++) {
        if (i >= existingCells.length) {
          const row = Math.floor(i / cols) + 1;
          const col = (i % cols) + 1
          const cell = document.createElement('div');
          cell.id = `${row}_${col}`;
          cell.dataset.index = `${row}_${col}`;
          cell.dataset.merged = 'false';
          cell.dataset.hiddenByMerge = 'false'; // New attribute to track hidden cells
          cell.addEventListener('click', handleCellClick);
          gridContainer.appendChild(cell);
        }
      }
  
      // Remove extra cells if rows or cols are reduced
      while (gridContainer.children.length > totalCells) {
        gridContainer.removeChild(gridContainer.lastChild);
      }
    }
  
    // Handle cell click event
    function handleCellClick() {
      const cell = this;
      const index = cell.dataset.index;
      if (cell.dataset.merged === 'true') {
        if (cellToUnmerge) {
          cellToUnmerge.classList.remove('selected-to-unmerge');
        }
        cellToUnmerge = cell;
        cellToUnmerge.classList.add('selected-to-unmerge');
      } else {
        cell.classList.toggle('selected');
        if (selectedCells.has(index)) {
          selectedCells.delete(index);
        } else {
          selectedCells.add(index);
        }
      }
    }
   
  
    // Initial creation of grid
    createGridCells(numRows, numCols);
  
    // Merge cells
  mergeButton.addEventListener('click', () => {
    if (selectedCells.size >= 2) {
      const selectedArray = Array.from(selectedCells);
      console.log('Selected cells:', selectedArray);
      
      const firstIndex = selectedArray[0].split('_').map(Number);
      const firstCell = gridContainer.querySelector(`[data-index="${firstIndex[0]}_${firstIndex[1]}"]`);
  
      let minRow = firstIndex[0] - 1;
      let maxRow = minRow;
      let minCol = firstIndex[1] - 1;
      let maxCol = minCol;
  
      selectedArray.forEach(index => {
        const [row, col] = index.split('_').map(Number);
        if (row < minRow + 1) minRow = row - 1;
        if (row > maxRow + 1) maxRow = row - 1;
        if (col < minCol + 1) minCol = col - 1;
        if (col > maxCol + 1) maxCol = col - 1;
      });
  
      console.log('Min row:', minRow, 'Max row:', maxRow, 'Min col:', minCol, 'Max col:', maxCol);
  
      const rowspan = maxRow - minRow + 1;
      const colspan = maxCol - minCol + 1;
  
      // Check if any cell within the selected range is already part of a merged cell
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
          const index = `${i + 1}_${j + 1}`;
          const cell = gridContainer.querySelector(`[data-index="${index}"]`);
          if (cell) {
            console.log('Checking cell:', index, 'Merged:', cell.dataset.merged, 'HiddenByMerge:', cell.dataset.hiddenByMerge);
            if (cell.dataset.merged === 'true' || cell.dataset.hiddenByMerge === 'true') {
              alert("Cannot merge cells because one or more cells are already part of an existing merged cell.");
              return;
            }
          }
        }
      }
  
      firstCell.style.gridRowStart = minRow + 1;
      firstCell.style.gridRowEnd = minRow + 1 + rowspan;
      firstCell.style.gridColumnStart = minCol + 1;
      firstCell.style.gridColumnEnd = minCol + 1 + colspan;
      firstCell.dataset.merged = 'true';
  
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
          const index = `${i + 1}_${j + 1}`;
          const cell = gridContainer.querySelector(`[data-index="${index}"]`);
          if (`${i + 1}_${j + 1}` !== firstIndex.join('_')) {
            cell.style.display = 'none';
            cell.dataset.hiddenByMerge = 'true';
          }
        }
      }
  
      selectedCells.clear();
      firstCell.classList.remove('selected');
    }
    
    
    });
  
    // Unmerge cell
    unmergeButton.addEventListener('click', () => {
      
          unmergeMainGridCell(cellToUnmerge, gridContainer);
          cellToUnmerge.classList.remove('selected-to-unmerge');
          cellToUnmerge = null;
        
      
    });
  
    function unmergeMainGridCell(cell, container) {
      const rowStart = parseInt(cell.style.gridRowStart) - 1;
      const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
      const colStart = parseInt(cell.style.gridColumnStart) - 1;
      const colEnd = parseInt(cell.style.gridColumnEnd) - 1;
  
      for (let i = rowStart; i < rowEnd; i++) {
        for (let j = colStart; j < colEnd; j++) {
          const index = `${i + 1}_${j + 1}`;
          const unmergedCell = container.querySelector(`[data-index="${index}"]`);
          unmergedCell.style.display = '';
          unmergedCell.classList.remove('selected');
          unmergedCell.dataset.merged = 'false';
          unmergedCell.dataset.hiddenByMerge = 'false'; // Mark as unhidden
        }
      }
  
      cell.style.gridRowStart = '';
      cell.style.gridRowEnd = '';
      cell.style.gridColumnStart = '';
      cell.style.gridColumnEnd = '';
      cell.dataset.merged = 'false';
    }


// Initial setup
numRowsInput.value = numRows;
numColsInput.value = numCols;

// Listen for changes to the number of rows
numRowsInput.addEventListener('input', () => {
    
    const newNumRows = parseInt(numRowsInput.value, 10);
    if (newNumRows > numRows) {
        // Add rows
        while (numRows < newNumRows) {
            numRows++;
            addRow();
        }
    } else if (newNumRows < numRows) {
        // Delete rows
        while (numRows > newNumRows) {
            if (canDeleteRow()) {
                deleteRow();
                numRows--;
            } else {
                numRowsInput.value = numRows;
                alert("Cannot delete row because it affects a merged cell.");
                break;
            }
        }
    }
    updateGridSize();
});

// Listen for changes to the number of columns
numColsInput.addEventListener('input', () => {
    const newNumCols = parseInt(numColsInput.value, 10);
    if (newNumCols > numCols) {
        // Add columns
        while (numCols < newNumCols) {
            numCols++;
            addColumn();
        }
    } else if (newNumCols < numCols) {
        // Delete columns
        while (numCols > newNumCols) {
            if (canDeleteCol()) {
                deleteColumn();
                numCols--;
            } else {
                numColsInput.value = numCols;
                alert("Cannot delete column because it affects a merged cell.");
                break;
            }
        }
    }
    updateGridSize();
});

// Functions to add and delete rows
function addRow() {
    for (let col_i = 1; col_i <= numCols; col_i++) {
        const cell = document.createElement('div');
        cell.id = `${numRows}_${col_i}`;
        cell.dataset.index = `${numRows}_${col_i}`;
        cell.dataset.merged = 'false';
        cell.addEventListener('click', handleCellClick);

        gridContainer.appendChild(cell);
    }
}

function deleteRow() {
    for (let col_i = 1; col_i <= numCols; col_i++) {
        const cell = document.getElementById(`${numRows}_${col_i}`);
        if (cell) {
            cell.remove();
        }
    }
}

// Functions to add and delete columns
function addColumn() {
    for (let row_i = 1; row_i <= numRows; row_i++) {
        const cell = document.createElement('div');
        cell.id = `${row_i}_${numCols}`;
        cell.dataset.index = `${row_i}_${numCols}`;
        cell.dataset.merged = 'false';
        cell.addEventListener('click', handleCellClick);

        const lastCell = document.getElementById(`${row_i}_${numCols - 1}`);
        if (lastCell) {
            lastCell.insertAdjacentElement("afterend", cell);
        } else {
            gridContainer.appendChild(cell);
        }
    }
}

function deleteColumn() {
    for (let row_i = 1; row_i <= numRows; row_i++) {
        const cell = document.getElementById(`${row_i}_${numCols}`);
        if (cell) {
            cell.remove();
        }
    }
}

// Update grid size and recreate cells
function updateGridSize() {
    gridContainer.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
    createGridCells(numRows, numCols);
}

// Check if a row can be deleted
function canDeleteRow() {
    const cells = gridContainer.children;
    for (let cell of cells) {
        if (cell.dataset.merged === 'true') {
            const rowEnd = parseInt(cell.style.gridRowEnd) - 1;
            const [row, col] = cell.dataset.index.split('_').map(Number);
            if (rowEnd > numRows || (row <= numRows && rowEnd >= numRows)) {
                // The merged cell spans into the row to be deleted
                return false;
            }
        }
    }
    return true;
}

// Check if a column can be deleted
function canDeleteCol() {
    const cells = gridContainer.children;
    for (let cell of cells) {
        if (cell.dataset.merged === 'true') {
            const colEnd = parseInt(cell.style.gridColumnEnd) - 1;
            const [row, col] = cell.dataset.index.split('_').map(Number);
            if (colEnd > numCols || (col <= numCols && colEnd >= numCols)) {
                // The merged cell spans into the column to be deleted
                return false;
            }
        }
    }
    return true;
}



  });