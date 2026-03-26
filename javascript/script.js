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

function createTable1() {

    fetch("table1.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(items) {
            let placeholder = document.querySelector("#table1");
            let out = "";
            for (let item of items) {
                out += '<tr> <td>${item}.name</td> <td>Info</td> </tr>';
                out += '<tr> <td>Rarity</td> <td>${item}.rarity</td> </tr>';
                out += '<tr> <td>Source</td> <td>${item}.source</td> </tr>';
                out += '<tr> <td>Drop Rate</td> <td>${item}.droprate</td> </tr>';
                out += '<tr> <td>Type</td> <td>${item}.type</td> </tr>';
            }
        })

    placeholder.innerHTML = out;
}

createTable1();