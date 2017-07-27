// Ivan's Workshop

var CATEGORY_HIERARCHY = function() {
	var ret = {};
	for ( var i in category) {
		var type = category[i].split('-')[0];
		if (!ret[type]) {
			ret[type] = [];
		}
		row
		ret[type].push(category[i]);
	}
	return ret;
}();

var global = {
	float : null,
	floating : true,
	isFilteringMode : true,
	boostType : 1,
};

var isPassMode = false;
var isCollectMode = false;
// for table use
function thead() {
	var ret = "<tr>";

	ret += "<th class='name'>名称</th>\
  <th class='category'>类别</th>\
  <th>编号</th>\
  <th>心级</th>\
  <th>特殊属性</th>\
  <th>来源</th>\
  <th>所属套装</th>\
  <th>已拥有</th>\
  <th>还需要</th>\
  <th>可分解</th>";
	ret += "<th><span class='paging'></span></th><th class='top'></th>";

	return ret + "</tr>\n";
}

function tr(tds) {
	return "<tr>" + tds + "</tr>\n";
}

function td(data, cls) {
	return "<td class='" + cls + "'>" + data + "</td>";
}

function inventoryCheckbox(type, id, own) {
	var ret = "<input type = 'checkbox' name = 'inventory' id = '"
			+ (type + id) + "' onClick='toggleInventory(\"" + type + "\",\""
			+ id + "\")'";
	if (own) {
		ret += "checked";
	}
	ret += "/>";
	return ret;
}

function toggleInventory(type, id) {
	var checked = !clothesSet[type][id].own;
	clothesSet[type][id].own = checked;
	clothesSet[type][id].have = checked ? 1 : 0;
	$('#clickable-' + type + id).toggleClass('own');

	saveAndUpdate();
	refreshTable(criteria);

}

function updateRel(type, id) {
	var inputNum = document.getElementById('have-' + type + id).value;
	clothesSet[type][id].have = parseInt(inputNum);

	clothesSet[type][id].own = parseInt(inputNum)>0;
	$('#clickable-' + type + id).toggleClass('own');

	saveAndUpdate();
	refreshTable(criteria);
	// alert(type+id+'-'+inputNum);
}

function clickableTd(piece) {
	var name = piece.name;
	var type = piece.type.mainType;
	var id = piece.id;
	var own = piece.own;
	var deps = piece.getDeps('');
	var tooltip = '';
	var cls = 'name';
	if (deps && deps.length > 0) {
		tooltip = "tooltip='" + deps + "'";
		if (deps.indexOf('(缺)') > 0) {
			cls += ' deps';
		}
	}
	cls += own ? ' own' : '';
	return "<td id='clickable-" + (type + id) + "' class='" + cls
			+ "'><a href='#dummy' class='button' " + tooltip
			+ "onClick='toggleInventory(\"" + type + "\",\"" + id + "\")'>"
			+ name + "</a></td>";
}

function row(piece) {
	var ret = "";
	if (!global.isFilteringMode) {
		ret += td(/*piece.tmpScore*/piece.totalScore);
	}

	ret += clickableTd(piece);
	var csv = piece.toCsv();
	for ( var i in csv) {
		ret += td(csv[i], '');
	}
	//ret+= "<input type='textbox' size=4 value='" + clothesSet[csv[0]][csv[1]].own?1:0 + "'/>";
	var cate = csv[0].split('-')[0];
	var haveNum = clothesSet[cate][csv[1]].have;
	ret += "<td class='haveInput'><input id='have-" + (cate + csv[1])
			+ "' type='textbox' size=6 onChange=updateRel(\"" + cate + "\",\""
			+ csv[1] + "\") value=' " + haveNum + "'\></td>";

	var res = calRel(cate + '-' + csv[1]);
	var require = res >= 0 ? res : 0;
	var consume = res < 0 ? -res : 0;
	ret += td(require, 'requireNum');
	ret += td(consume, 'consumeNum');
	return tr(ret);

}

function render(rating) {
	if (rating.charAt(0) == '-') {
		return rating.substring(1);
	}
	return rating;
}

function getStyle(rating) {
	if (rating.charAt(0) == '-') {
		return 'negative';
	}
	switch (rating) {
	case "SS":
		return 'S';
	case "S":
		return 'S';
	case "A":
		return 'A';
	case "B":
		return 'B';
	case "C":
		return 'C';
	default:
		return "";
	}
}

function list(rows) {
	ret = "";
	for ( var i in rows) {
		ret += row(rows[i]);
	}

	return ret;
}

function drawTable(data, div) {
	if ($('#' + div + ' table').length == 0) {
		$('#' + div)
				.html(
						"<table class='mainTable'><thead></thead><tbody></tbody></table>");
	}
	$('#' + div + ' table thead').html(thead());
	$('#' + div + ' table tbody').html(list(data));

	$('span.paging').html("<button class='destoryFloat'></button>");
	redrawThead();
	$('button.destoryFloat').click(function() {
		if (global.floating) {
			global.float.floatThead('destroy');
			global.floating = false;
		} else {
			global.floating = true;
			global.float.floatThead({
				useAbsolutePositioning : false
			});
		}
		redrawThead();
	});

}

function redrawThead() {
	$('button.destoryFloat').text(global.floating ? '关闭浮动' : '打开浮动');
	$('th.top').html(global.floating ? "<a href='#filtersTop'>回到顶部</a>" : "");
}

function byFirst(a, b) {
	return b[0] - a[0];
}
var criteria = {};
var uiFilter = {};
var starFilter = {};
var decomposeFilter = {};
var isDecomposable = false;
var isStarfiltering = false;

function onChangeUiFilter() {
	uiFilter = {};
	$('input[name=inventory]:checked').each(function() {
		uiFilter[$(this).val()] = true;
	});

	if (currentCategory) {
		if (CATEGORY_HIERARCHY[currentCategory].length > 1) {
			$('input[name=category-' + currentCategory + ']:checked').each(
					function() {
						uiFilter[$(this).val()] = true;
					});
		} else {
			uiFilter[currentCategory] = true;
		}
	}
	refreshTable(criteria);
}

function onChangeDecomposeStar() {
	starFilter = {};
	isStarfiltering = false;
	$('input[name=decomposable_star]:checked').each(function() {
		starFilter[$(this).val()] = true;
		isStarfiltering = true;
	});

	refreshTable(criteria);
}

function onChangeDecompose() {
	decomposeFilter = {};
	isDecomposable = false;
	$('input[name=decomposable]:checked').each(function() {
		decomposeFilter[$(this).val()] = true;
		isDecomposable = true;
	});
	refreshTable(criteria);
}

var STAR = [ "oneS", "twoS", "threeS", "fourS", "fiveS", "sixS" ];
var starLevel = [ '1', '2', '3', '4', '5', '6' ];
function refreshTable(criteria) {
	if (!isCollectMode)
		drawTable(filtering(criteria, uiFilter, decomposeFilter, starFilter),
				"clothes");
	else if (isPassMode)
		changeChapterOrLevelType();
	else
		changeCollectType();
}

function filtering(criteria, uifilters, decomposefilters, starfilters) {
	var result = [];
	for ( var i in clothes) {
		if (matches(clothes[i], criteria, uifilters, decomposefilters,
				starfilters)) {
			result.push(clothes[i]);
		}
	}
	// if (global.isFilteringMode) {
	result.sort(byId);
	//  } 
	return result;
}

function matches(c, criteria, uifilters, decomposefilters, starfilters) {
	var flag = false;
	if (!uifilters[c.type.type])
		return false;

	if (isStarfiltering) {
		for ( var i in STAR) {
			var s = starLevel[i];
			if (starfilters[STAR[i]] && c.stars == s) {
				flag = true;
				break;
			}
		}
	}
	var starFlag = ((flag && isStarfiltering) || (!flag && !isStarfiltering));
	if (isDecomposable) {
		var decomposeFlag = !(!decomposefilters["can"]);
		var ind = c.getDeps('').indexOf('(缺)');
		flag = starFlag
				&& (decomposeFlag ? (ind < 0 || calRel(c.type.mainType + '-'
						+ c.id) <= 0) : ind > 0) && c.own;
		return flag;
	}

	// if(isDecomposable){
	//   if(!(c.own&& uifilters[c.type.type]))
	//     return false;

	//   if((c.getDeps('').indexOf('(缺)') < 0 || calRel(c.type.mainType+'-'+c.id) <= 0)){
	//     for (var i in STAR){
	//       var s = starLevel[i];
	//       if(starfilters[STAR[i]] && c.stars == s)
	//         return true;
	//     }
	//   }
	//不可分解
	//   if(starfilters['NO'] &&c.getDeps('').indexOf('(缺)') >0 )
	//     return true;
	//   return false;
	// }

	return ((c.own && uifilters.own) || (!c.own && uifilters.missing))
			&& starFlag;
}

function changeFilter() {
	$("#theme")[0].options[0].selected = true;
	currentLevel = null;
	onChangeCriteria();
}

function onChangeCriteria() {
	criteria = {};
	for ( var i in FEATURES) {
		var f = FEATURES[i];
		var weight = parseFloat($('#' + f + "Weight").val());
		if (!weight) {
			weight = 1;
		}
		var checked = $('input[name=' + f + ']:radio:checked');
		if (checked.length) {
			criteria[f] = parseInt(checked.val()) * weight;
		}
	}
	tagToBonus(criteria, 'tag1');
	tagToBonus(criteria, 'tag2');
	if (global.additionalBonus && global.additionalBonus.length > 0) {
		criteria.bonus = global.additionalBonus;
	}
	if (!global.isFilteringMode) {
		refreshBoost(criteria);
		setBoost(criteria, global.boostType);
	}
	calculateScore(criteria);
}

function byId(a, b) {
	var aid = parseInt(a.id);
	var bid = parseInt(b.id);
	return aid < bid ? -1 : (aid > bid ? 1 : 0);
}

function loadCustomInventory() {
	var myClothes = $("#myClothes").val();
	if (myClothes.indexOf('|') > 0) {
		loadNew(myClothes);
	} else {
		load(myClothes);
	}
	saveAndUpdate();
	refreshTable(criteria);
}

function toggleAll(c) {
	var all = $('#all-' + c)[0].checked;
	var x = $('input[name=category-' + c + ']:checkbox');
	x.each(function() {
		this.checked = all;
	});
	onChangeUiFilter();
}

function drawFilter() {
	out = "<ul class='tabs' id='categoryTab'>";
	for ( var c in CATEGORY_HIERARCHY) {
		out += '<li id="' + c + '"><a href="#dummy" onClick="switchCate(\'' + c
				+ '\')">' + c + '</a></li>';
	}
	out += "</ul>";
	for ( var c in CATEGORY_HIERARCHY) {
		out += '<div id="category-' + c + '">';
		if (CATEGORY_HIERARCHY[c].length > 1) {
			// draw a select all checkbox...
			out += "<input type='checkbox' id='all-" + c
					+ "' onClick='toggleAll(\"" + c + "\")' checked>"
					+ "<label for='all-" + c + "'>全选</label><br/>";
			// draw sub categories
			for ( var i in CATEGORY_HIERARCHY[c]) {
				out += "<input type='checkbox' name='category-"
						+ c
						+ "' value='"
						+ CATEGORY_HIERARCHY[c][i]
						+ "'' id='"
						+ CATEGORY_HIERARCHY[c][i]
						+ "' onClick='onChangeUiFilter()' checked /><label for='"
						+ CATEGORY_HIERARCHY[c][i] + "'>"
						+ CATEGORY_HIERARCHY[c][i] + "</label>\n";
			}
		}
		out += '</div>';
	}
	$('#category_container').html(out);
}

var currentCategory;
function switchCate(c) {
	currentCategory = c;
	$("ul.tabs li").removeClass("active");
	$("#category_container div").removeClass("active");
	$("#" + c).addClass("active");
	$("#category-" + c).addClass("active");
	onChangeUiFilter();
}

function drawImport() {
	var dropdown = $("#importCate")[0];
	var def = document.createElement('option');
	def.text = '请选择类别';
	def.value = '';
	dropdown.add(def);
	// for (var cate in scoring) {
	//   var option = document.createElement('option');
	//   option.text = cate;
	//   option.value = cate;
	//   dropdown.add(option);
	// }
}

function clearImport() {
	$("#importData").val("");
}

function saveAndUpdate() {
	var mine = save();
	updateSize(mine);
}

function updateSize(mine) {
	$("#inventoryCount").text('(' + mine.size + ')');
	$("#myClothes").val(mine.serialize());
	var subcount = {};
	for (c in mine.mineStr) {
		var type = c.split('-')[0];
		if (!subcount[type]) {
			subcount[type] = 0;
		}
		subcount[type] += mine.mineStr[type].length;
	}
	for (c in subcount) {
		$("#" + c + ">a").text(c + "(" + subcount[c] + ")");
	}
}

function doImport() {
	var dropdown = $("#importCate")[0];
	var type = dropdown.options[dropdown.selectedIndex].value;
	var raw = $("#importData").val();
	var data = raw.match(/\d+/g);
	var mapping = {}
	for ( var i in data) {
		while (data[i].length < 3) {
			data[i] = "0" + data[i];
		}
		mapping[data[i]] = true;
	}
	var updating = [];
	for ( var i in clothes) {

		if (clothes[i].type.mainType == type && mapping[clothes[i].id]
				&& i < 10) {
			updating.push(clothes[i].name);
		}
		if (i > 10) {
			updating.push("等");
			break;
		}
	}
	var names = updating.join(",");
	if (confirm("你将要在>>" + type + "<<中导入：\n" + names)) {
		var myClothes = MyClothes();
		myClothes.filter(clothes);
		if (myClothes.mine[type]) {
			myClothes.mine[type] = myClothes.mine[type].concat(data);
		} else {
			myClothes.mine[type] = data;
		}
		myClothes.update(clothes);
		saveAndUpdate();
		refreshTable(criteria);
		clearImport();
	}
}

function moreLink(cate) {
	var link = $("<span class='more'>&nbsp;| More...</a>");
	link.attr("num", 5);
	link.click(function() {
		var num = parseInt($(this).attr("num"));
		for (var i = 0; i < 5; i++) {
			var x = renderRanking(cate, num + i);
			if (x) {
				x.insertBefore($(this));
			} else {
				break;
			}
		}
		if (clothesRanking[cate].length > num + 5) {
			link.attr("num", num + 5);
		} else {
			$(this).remove();
		}
	});
	return link;
}

function changeView() {
	var filtersDiv = $("#filtersTop")[0];
	var passDiv = $("#chapterSelector")[0];
	var categoryDiv = $("#category_container")[0];
	var collectDiv = $("#collectTypeSelector")[0];

	filtersDiv.hidden = isCollectMode;
	categoryDiv.hidden = isCollectMode;
	passDiv.hidden = !isPassMode;
	collectDiv.hidden = !(isCollectMode && !isPassMode);

	if (!isCollectMode)
		switchCate(currentCategory);
	else if (isPassMode)
		changeChapterOrLevelType();
	else
		changeCollectType();
}

function passMode(flag) {
	isPassMode = flag;
	isCollectMode = true;
	changeView();
}

function collectMode(flag) {
	isCollectMode = flag;
	isPassMode = false;
	changeView();

}

function changeCollectType() {
	drawTable(getCollectList($("select[id='collectType']").val()), "clothes");
}

function changeChapterOrLevelType() {
	drawTable(requiredLevels($("input[name='levelType']:checked").val(), $(
			"select[id='chapter']").val()), "clothes");
}

function drawChapter() {
	var dropdown = $("#chapter")[0];
	var def = document.createElement('option');
	var chapterArr = new Array("一", "二", "三", "四", "五", "六", "七", "八", "九",
			"十", "十一", "十二", "十三", "十四", "十五","十六","十七","十八");
	for ( var i in chapterArr) {
		var option = document.createElement('option');
		option.text = "第" + chapterArr[i] + "章";
		option.value = parseInt(i) + 1;
		dropdown.add(option);
	}
}

function drawCollectType() {
	var dropdown = $("#collectType")[0];
	var def = document.createElement('option');
	var typeArr = new Array('店·金币', '店·钻石', '浪·迷', '浪·幻', '浪·缥缈','浪·昼夜','浪·云禅','浪·流光','兑·花园','兑·卧云','兑·时光',
			'兑·琉璃','兑·仙履', '设·重构','联盟·小铺','联盟·梦幻');
	for ( var i in typeArr) {
		var option = document.createElement('option');
		option.text = typeArr[i];
		option.value = typeArr[i];
		dropdown.add(option);
	}
}

function init() {
	var mine = loadFromStorage();
	calcDependencies();
	drawFilter();
	//drawImport();
	switchCate(category[0]);
	updateSize(mine);
	drawChapter();
	drawCollectType();
	var passDiv = $("#chapterSelector")[0];
	passDiv.hidden = true;

	var collectDiv = $("#collectTypeSelector")[0];
	collectDiv.hidden = true;

	global.float = $('table.mainTable');
	global.float.floatThead({
		useAbsolutePositioning : false
	});

}
$(document).ready(function() {
	init()
});
