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

/*FOR ADDING NEW ROWS*/

function insertFn() {
    const newRow =
        `<tr>
            <td>GFG 3</td>
            <td>34</td>
        </tr>`;
    document.getElementById('tab').
    getElementsByTagName('tbody')[0].
    insertAdjacentHTML('beforeend', newRow);
}


/*TABLE CREATION, Code adapted from: https://www.youtube.com/watch?v=1tYjbrmsj6A*/

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
    </div> `;

        theList.insertAdjacentHTML('afterbegin', storedComments) //actually prints the stuff, reverse order so it appears right

    });



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
<p class="comment-style mb-0">${Comment}</p>                </div>
            `;
            // slap it at the top of the list
            if (theList) {
                theList.insertAdjacentHTML('afterbegin', htmlToInject);
            }

            // wipe the box so it's empty again
            inputContent.value = "";
        }
    });
});