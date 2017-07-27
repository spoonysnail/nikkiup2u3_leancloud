var page;	
function updateDesc(rid){
	var desc = document.getElementById(rid).value;
	//alert('update');
	$.post("/adminwardrobe",{rid:rid,desc:desc},function(data){
	    //do something
		//document.getElementById(rid).value=data;
	})
}

function jumpToPage(){
	if (window.event.keyCode == 13){
		page = parseInt($('#page')[0].value);
		getClothesList(page);
		window.location.href='/adminwardrobe/'+page;

	}	
}

function prePage(){
	page = parseInt($('#page')[0].value);
	if(page > 1){
		page -= 1;
		getClothesList(page);
		window.location.href='/adminwardrobe/'+page;
	}
}

function nextPage(){
	page = parseInt($('#page')[0].value);
	page += 1;
	window.location.href='/adminwardrobe/'+page;
//	getClothesList(page);

}

function getClothesList(page){
	$.get('/adminwardrobe/'+page);
}






