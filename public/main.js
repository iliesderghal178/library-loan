$(document).ready(function() {
    $(".slider").change(function(){
		$(this).attr("title", $(this).val());
	});

    document.getElementById('time_period').value='7';
    document.getElementById('current_date').valueAsDate=new Date();
    
});



function myFunction1() {
    var input, filter, table, tr, td1, i, txtValue, txtValue1;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable1");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        td1 = tr[i].getElementsByTagName("td")[1];
        if (td || td1) {
            txtValue = td.textContent || td.innerText;
            txtValue1 = td1.textContent || td1.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue1.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

