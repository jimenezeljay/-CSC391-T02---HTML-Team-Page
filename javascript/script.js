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

/*TABLE CREATION, Code adapted from: https://www.youtube.com/watch?v=1tYjbrmsj6A*/

fetch("./javascript/table1.json")
    .then(function(response) {
        console.error('Error:ddsadasdas', error);
        return response.json();
    })
    .then(function(table1data) {
        let placeholder = document.querySelector("#table1");
        let out = "";
        for (let item of table1data) {
            out += `
            <tr> 
                <td>${item.name}</td>
                <td>Info</td>
            </tr>
            `;
        }

        placeholder.innerHTML = out;
    })


$(document).ready(function() {


    // comment Section Function

    $('#commentForm').on('submit', function(event) {

        event.preventDefault(); //so it dosnt refresh

        const text = $('#userComment').val(); //const, takes text

        if (text.trim() !== "") { //if not empty


            //list of comments 

            $('#commentsList').prepend(`

            <div class="card mb-2 p-3 shadow-sm">
                ${text}
            </div>

        `); //each will be in its own little div
            $('#userComment').val(''); //then clears the text after submit
        }
    });
});