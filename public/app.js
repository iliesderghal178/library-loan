$(document).ready(function() {
    function myFunction() {
        var input, filter, table, tr, td1, i, txtValue, date1;
        input = document.getElementById("myInput");
        filter = new Date();
        table = document.getElementById("myTable");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td ) {
                txtValue = td.textContent || td.innerText;
                date1 = new Date(txtValue);
                console.log(date1 > filter);
                if (Number(date1) > Number(filter) ) {
                    tr[i].style.backgroundColor = "white";
                } else {
                    tr[i].style.backgroundColor = "red";
                }
            }       
        }
    }
    
    myFunction();
});