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

    var jsonData = parse('./table1.json');
    let col = [];

    for (let i = 0; i < jsonData.length; i++) {
        for (let key in jsonData[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }

    }


    const table = document.createElement("table");
    const thead = table.createTHead();
    const tbody = table.createTBody();

    table.setAttribute("id", "table");

    let tr = thead.insertRow(-1);

    for (let index = 0; index < col.length; index++) {
        let th = document.createElement("th");
        th.innerHTML = col[index];
        tr.appendChild(th);
    }


    for (let i = 0; i < jsonData.length; i++) {
        tr = tbody.insertRow(-1);

        for (let j = 0; j < col.length; j++) {
            let tabCell = tr.insertCell(-1);
            tabCell.innerHTML = jsonData[i][col[j]] /* jsonData[0]["userId"]*/
        }

    }

    document.querySelector(".table1").appendChild(table);

}

createTable1();