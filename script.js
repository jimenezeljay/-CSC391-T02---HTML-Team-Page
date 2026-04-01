let x = 0;

let masterItems = []; 
let currentSort = {
    col: localStorage.getItem('syns_sortCol') || 'name',
    dir: localStorage.getItem('syns_sortDir') || 'asc'
};
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
 
// This function builds the "Bundles" (Name + Stats)
function renderTable() {
    const tbody = document.getElementById('tbody-syns');
    if (!tbody) return;

    // 1. Sort the array based on your choice
    const sortedItems = [...masterItems].sort((a, b) => {
        let valA = String(a[currentSort.col] || "").toLowerCase();
        let valB = String(b[currentSort.col] || "").toLowerCase();
        
        if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    // 2. Build the HTML strings for each bundle
    let html = "";
    sortedItems.forEach(item => {
        const modalId = "modal-syns-" + item.name.replace(/\s+/g, '-');

        // inject a modal for this item
        document.body.insertAdjacentHTML("beforeend", `
            <div class="modal fade" id="${modalId}" role="dialog">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">${item.name}</h4>
                        </div>
                        <div class="modal-body">
                            <p class="text-black">${item.desc}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        html += `
            <tr class="table-info">
                <th colspan="2" class="text-center">
                    <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#${modalId}">
                        ${item.name}
                    </button>
                </th>
            </tr>
            <tr><td>Rarity Tier</td><td class="${item.rarity}">${item.rarity}</td></tr>
            <tr><td>Source Type</td><td>${item.source}</td></tr>
            <tr><td>Drop %</td><td>${item.droprate}%</td></tr>
            <tr><td>Item Type</td><td>${item.type}</td></tr>
        `;
    });
    tbody.innerHTML = html;
}

// This function flips the sort and tells the table to redraw
function changeSort(column) {
    if (currentSort.col === column) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.col = column;
        currentSort.dir = 'asc';
    }
    // save preference to localStorage
    localStorage.setItem('syns_sortCol', currentSort.col);
    localStorage.setItem('syns_sortDir', currentSort.dir);
    renderTable();
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


    fetch("./table1.json")
        .then(res => res.json())
        .then(data => {
            masterItems = data; // save JSON into the global variable
            renderTable();      // draws table for the first time
        })
        .catch(err => console.error("Could not load table1.json:", err));

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