let x = 0;

function enlargeImg() {
    if (x === 0) {
        document.getElementById("logo").style.transform = "scale(1.5)";
        document.getElementById("logo").style.transition = "transform 0.25s ease";
        x = 1;
    } else {
        document.getElementById("logo").style.transform = "scale(1)";
        document.getElementById("logo").style.transition = "transform 0.25s ease";
        x = 0;
    }
}


/* ============================================================
   TABLE CREATION + SORT + ROW HIGHLIGHT + DETAIL REVEAL
   Code adapted from: https://www.youtube.com/watch?v=1tYjbrmsj6A
 
   We fetch all 3 JSON files and build a single unified sortable
   table from them, replacing the old plain #table1 placeholder
   ============================================================ */
 
/*Column definitions ---
   These match the keys in JSON files
   The "label" is what shows in the column header button
   The "key" is the property name in the JSON objects*/
const columns = [
    { label: "Name",      key: "name"     },
    { label: "Rarity",    key: "rarity"   },
    { label: "Source",    key: "source"   },
    { label: "Drop %",    key: "droprate" },
    { label: "Type",      key: "type"     }
];
 
/*Sort state
   We remember which column was last sorted and which direction
   This gets saved to localStorage so it persists across page loads*/
let currentSortCol = localStorage.getItem("sortCol") || "name";
let currentSortDir = localStorage.getItem("sortDir") || "asc";
/* localStorage.getItem returns null if nothing is saved yet,
   so the || gives us a safe default value instead*/
 
/*All item data combined from all 3 JSON files
   We'll fill this array once all 3 fetches finish*/
let allItems = [];
 
/*Track how many fetches have completed
   We can't build the table until all 3 are done*/
let fetchesDone = 0;
 
/*Helper: fetch one JSON file and add its items
   tableKey is either null (array at root) or a string key
   like "table2data" for files that wrap their array*/
function fetchTable(filename, tableKey) {
    fetch(filename)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            /*some JSON files have the array directly,
               others wrap it inside an object key*/
            const items = tableKey ? data[tableKey] : data;
 
            /* add every item from this file into our master list*/
            items.forEach(function(item) {
                allItems.push(item);
            });
 
            /*count this fetch as done */
            fetchesDone++;
 
            /*once all 3 files are loaded, build the table */
            if (fetchesDone === 3) {
                buildTable();
            }
        })
        .catch(function(error) {
            console.error("Fetch error for " + filename + ":", error);
            /*still increment so we don't get stuck waiting forever */
            fetchesDone++;
            if (fetchesDone === 3) {
                buildTable();
            }
        });
}
 
/*kick off all 3 fetches */
fetchTable("table1.json", null);/*array at root level  */
fetchTable("table2.json", "table2data");/*wrapped in "table2data" key */
fetchTable("table3.json", "table3data");/*wrapped in "table3data" key */
 
 
/* buildTable()
   Called once all 3 fetches are done
   Sorts allItems and injects the full table into #table1's parent*/
function buildTable() {
    const placeholder = document.querySelector("#table1");
    if (!placeholder) return;
 
    /*get the <table> element that contains #table1 */
    const tableEl = placeholder.closest("table");
    if (!tableEl) return;
 
    /*Build the <thead> with sortable column headers
       Each header is a button. Clicking it re-sorts by that column
       An arrow (▲ or ▼) shows which column is active + direction*/
    let theadHTML = "<thead><tr>";
    columns.forEach(function(col) {
 
        /*figure out the sort arrow to show */
        let arrow = "";
        if (col.key === currentSortCol) {
            arrow = currentSortDir === "asc" ? " ▲" : " ▼";
        }
 
        /*onclick calls sortBy() with this column's key */
        theadHTML += `
            <th>
                <button class="sort-btn" onclick="sortBy('${col.key}')">
                    ${col.label}${arrow}
                </button>
            </th>`;
    });
    theadHTML += "</tr></thead>";
 
    /*Sort allItems
       .sort() takes a comparison function
       If a < b, return -1 (a comes first)
       If a > b, return  1 (b comes first)
       Multiplying by -1 flips the order for descending sort*/
    const sorted = [...allItems].sort(function(a, b) {
        const valA = String(a[currentSortCol] || "").toLowerCase();
        const valB = String(b[currentSortCol] || "").toLowerCase();
        /* String() converts numbers like droprate to text for comparison */
 
        if (valA < valB) return currentSortDir === "asc" ? -1 :  1;
        if (valA > valB) return currentSortDir === "asc" ?  1 : -1;
        return 0; /* equal — don't move them */
    });
 
    /*Build the <tbody> rows
       Each item gets a visible data row and a hidden detail row.
       The detail row is revealed when the user clicks the item row*/
    let tbodyHTML = "";
    sorted.forEach(function(item) {
 
        /*apply a CSS class based on rarity so tier colors still work*/
        const rarityClass = item.rarity || "";
 
        tbodyHTML += `
            <tr class="item-row ${rarityClass}" data-desc="${item.desc}">
                <td>${item.name}</td>
                <td>${item.rarity}</td>
                <td>${item.source}</td>
                <td>${item.droprate}%</td>
                <td>${item.type}</td>
            </tr>
            <tr class="detail-row" style="display:none;">
                <td colspan="5" class="detail-cell">${item.desc}</td>
            </tr>`;
    });
 
    /*Inject everything into the table
       We replace the entire table's innerHTML so the header
       and body are always in sync after re-sorts*/
    tableEl.innerHTML = `
        <caption class="caption">All Items (click a column to sort — click a row to see details)</caption>
        ${theadHTML}
        <tbody id="table1">
            ${tbodyHTML}
        </tbody>`;
 
    /* re-attach hover + click listeners every time the table rebuilds */
    attachRowListeners();
}
 
 
/*sortBy(colKey)
   Called when a header button is clicked.
   Flips direction if same column, resets to asc for new column
   Saves preference to localStorage, then rebuilds the table*/
function sortBy(colKey) {
    if (colKey === currentSortCol) {
        /* same column — flip the direction */
        currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
    } else {
        /* new column — start ascending */
        currentSortCol = colKey;
        currentSortDir = "asc";
    }
 
    /* STORE TABLE PREFERENCES IN LOCALSTORAGE
       Next time the page loads, buildTable() reads these values
       and the table will already be sorted the way the user left it*/
    localStorage.setItem("sortCol", currentSortCol);
    localStorage.setItem("sortDir", currentSortDir);
 
    /* rebuild the table with the new sort applied */
    buildTable();
}
 
 
/*attachRowListeners()
   Called every time the table rebuilds.
   Attaches hover highlight and click-to-reveal to every item row. */
function attachRowListeners() {
    const itemRows = document.querySelectorAll(".item-row");
 
    itemRows.forEach(function(row) {
 
        /*HOVER HIGHLIGHT — adds/removes the .row-highlight CSS class */
        row.addEventListener("mouseenter", function() {
            row.classList.add("row-highlight");
        });
        row.addEventListener("mouseleave", function() {
            row.classList.remove("row-highlight");
        });
 
        /*CLICK TO REVEAL DETAIL ROW */
        row.addEventListener("click", function() {
            const detailRow = row.nextElementSibling;
            /*nextElementSibling is the very next element in the HTML,
               which we built as the detail-row right below each item-row */
 
            if (detailRow && detailRow.classList.contains("detail-row")) {
                /* toggle between hidden and visible */
                if (detailRow.style.display === "none") {
                    detailRow.style.display = "table-row";
                } else {
                    detailRow.style.display = "none";
                }
            }
        });
    });
}

/* ============================================================
   FOR ADDING NEW ROWS
   insertFn(tbodyId, prefix) is called by each table's Add Row button.
 
   tbodyId— the id of the empty <tbody> at the bottom of that table
             e.g. 'tbody-syns', 'tbody-hornet', 'tbody-ruins'
 
   prefix— short string matching the input field id prefixes
             e.g. 'syns', 'hornet', 'ruins'
             so getElementById(prefix + '-name') finds the right input
 
   Each table has its OWN set of input fields and its OWN tbody,
   so rows only go into the table they belong to.
   ============================================================ */
 
function insertFn(tbodyId, prefix) {
 
    /*read the input fields for this specific table using the prefix */
    const nameVal   = document.getElementById(prefix + "-name")  ?.value.trim() || "New Item";
    const rarityVal = document.getElementById(prefix + "-rarity")?.value.trim() || "Bronze";
    const sourceVal = document.getElementById(prefix + "-source")?.value.trim() || "Unknown";
    const dropVal   = document.getElementById(prefix + "-drop")  ?.value.trim() || "0";
    const typeVal   = document.getElementById(prefix + "-type")  ?.value.trim() || "Unknown";
    const descVal   = document.getElementById(prefix + "-desc")  ?.value.trim() || "No description provided.";
 
    /*find the correct tbody by its id */
    const tbody = document.getElementById(tbodyId);
    if (!tbody) {
        console.error("Could not find tbody with id: " + tbodyId);
        return;
    }
 
    /*build two rows: the visible item row + the hidden detail row */
    /* generate a unique id for this modal so multiple inserts don't conflict */
    const modalId = "modal-" + Date.now();
    /* Date.now() gives the current timestamp in milliseconds —
    guaranteed unique since no two clicks happen at the exact same millisecond */

    const newRowHTML = `
        <tr class="item-row">
            <th>
                <button type="button" class="btn btn-info btn-lg" 
                    data-toggle="modal" data-target="#${modalId}">
                    ${nameVal}
                </button>
            </th>
            <th>Info:</th>
        </tr>
        <tr>
            <td>Rarity Tier</td>
            <td class="${rarityVal}">${rarityVal}</td>
        </tr>
        <tr>
            <td>Source Type</td>
            <td>${sourceVal}</td>
        </tr>
        <tr>
            <td>Drop Percentage (%)</td>
            <td>${dropVal}%</td>
        </tr>
        <tr>
            <td>Item type</td>
            <td>${typeVal}</td>
        </tr>`;

    /* inject the modal itself into the page so Bootstrap can find it */
    const modalHTML = `
        <div class="modal fade" id="${modalId}" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">${nameVal}</h4>
                    </div>
                    <div class="modal-body">
                        <p class="text-black">${descVal}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" 
                            data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;

    /* append the modal to the body so Bootstrap can find it by id */
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    /* insert the new rows into the correct tbody */
    tbody.insertAdjacentHTML("beforeend", newRowHTML);
 
    /*re-attach hover + click listeners so new rows also highlight and reveal*/
    attachRowListeners();
 
    /*clear all input fields for this form after inserting */
    [prefix+"-name", prefix+"-rarity", prefix+"-source",
     prefix+"-drop", prefix+"-type",   prefix+"-desc"].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}


/*TABLE CREATION, Code adapted from: https://www.youtube.com/watch?v=1tYjbrmsj6A*/

/*sort table with each data here?*/

/*
fetch("./table1.json")
    .then(function(response) {
        console.error('Error:ddsadasdas', error);
        
        return response.json();
    })
    .then(function(table1data) {
        let placeholder = document.querySelector("#table1");
        let out = "";
        for (let item of table1data) {
            out += `
            <tr><td>${item.name}</td><td>Info</td></tr>
            <tr><td>Rarity</td><td>${item.rarity}</td></tr>
            <tr><td>Source</td><td>${item.source}</td></tr>
            <tr><td>Drop Rate</td><td>${item.droprate}</td></tr>
            <tr><td>Type</td><td>${item.type}</td></tr>
            `;
        }

        if (placeholder) {
            placeholder.innerHTML = out;
        }
    })
    .catch(function(error) {
        console.error("Fetch error:", error);
    });
    */
    



/*FOR THE COMMENT SECTION*/

// wait for the page to stop loading
document.addEventListener('DOMContentLoaded', function() {


    //Make the elements

    const theForm = document.getElementById('commentForm');
    const inputContent = document.getElementById('userComment');
    const theList = document.getElementById('commentsList');

    //checks for already saved comments and if not there, it make a new epmty array
    //JS only allows strings to be saved so we use JSOn to turn those strings back into an array in JS
    let savedComments = JSON.parse(localStorage.getItem('KOSM_Comments')) || [];


    //this outputs each saved comment
    //it grabs each string in our array and puts them back in the html envelope
    savedComments.forEach(function(EachComment) {
        const storedComments = `
    <div class="card mb-2 p-3 shadow-sm">
         <p class="comment-style mb-0">${EachComment}</p> 
         <button class="delete-btn btn btn-sm btn-danger mt-2">Delete</button>               
    </div> `;

        theList.insertAdjacentHTML('afterbegin', storedComments) //actually prints the stuff, reverse order so it appears right

    });

    attachDeleteListeners(); /*attached delete clicks to loaded comments*/

    // if the form isn't on this page, just stop here and don't break everything
    if (!theForm) return;

    // when someone hits the post button
    theForm.addEventListener('submit', function(e) {

        // stop the page from refresh 
        e.preventDefault();

        // grab what they typed
        const Comment = inputContent.value;

        // cant be empty
        if (Comment.trim() !== "") {

            //add new comment to JS list for local storage
            savedComments.push(Comment);

            //gets the array,saved comments, turns it into strings again, and saves it as KOSM_Comements
            localStorage.setItem('KOSM_Comments', JSON.stringify(savedComments));


            // wrap text in a bootstrap card so it looks decent
            const htmlToInject = `
                <div class="card mb-2 p-3 shadow-sm">
                    <p class="comment-style mb-0">${Comment}</p> 
                    <button class="delete-btn btn btn-sm btn-danger mt-2">Delete</button>
                </div>`;
            // slap it at the top of the list
            if (theList) {
                theList.insertAdjacentHTML('afterbegin', htmlToInject);
                attachDeleteListeners(); /*attach delete clicks to new comment*/
            }

            // wipe the box so it's empty again
            inputContent.value = "";
        }
    });


            function attachDeleteListeners() {
                const deleteButtons = document.querySelectorAll(".delete-btn");
                deleteButtons.forEach(function(btn) {
                    btn.addEventListener("click", function() {
                        const card = btn.closest(".card");
                        const commentText = card.querySelector(".comment-style").textContent;
                        savedComments = savedComments.filter(function(c) {
                            return c !== commentText;
                        });
                        localStorage.setItem('KOSM_Comments', JSON.stringify(savedComments));
                        card.remove();
                    });
                });
            }

});