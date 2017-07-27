
var CATEGORIES = [
                  '发型',
                  '连衣裙',
                  '外套',
                  '上衣',
                  '下装',
                  '袜子',
                  '鞋子',
                  '饰品',
                  '妆容'
                  ];

var typeInfo = function() {
    var ret = {};
    for (var i in category) {
        var name = category[i];
        ret[name] = {
        type: name,
        mainType: name.split('-')[0],
        needFilter: function() {
            return this.mainType == "连衣裙"
            || this.mainType == "外套"
            || this.mainType == "上装"
            || this.mainType == "下装";
        }
        }
    }
    return ret;
}();



//Wardrobe:[name,category,cid,star,tag,source,suit]
//          0     1         2   3   4    5      6
Clothes = function(csv, real) {
    var theType = typeInfo[csv[1]];
    if (!theType) {
        alert("not found: " + csv[1]);
    }
    return {
    own: false,
    have:0,
    name: csv[0],
    type: theType,
    id: csv[2],
    stars: csv[3],
    tags: csv[4].split(','),
    source: Source(csv[5]),
    suit: csv[6],
    deps: {},
    toCsv: function() {
        name = this.name;
        type = this.type;
        id = this.id;
        stars = this.stars;
        extra = this.tags.join(',');
        source = this.source.rawSource;
        suit = this.suit;
        return [type.type, id, stars,
                extra, source,suit];
    },
    addDep: function(sourceType, c) {
        if (!this.deps[sourceType]) {
            this.deps[sourceType] = [];
        }
        if (c == this) {
            alert("Self reference: " + this.type.type + " " + this.id + " " + this.name);
        }
        this.deps[sourceType].push(c);
    },
    getDeps: function(indent) {
        var ret = "";
        var category_main = this.type.mainType;
        for (var sourceType in this.deps) {
            for (var i in this.deps[sourceType]) {
                var c = this.deps[sourceType][i];
                ret += indent + '[' + sourceType + '][' + c.type.mainType + ']'
                + c.name + (c.own ? '' : '(缺)') +'&#xA;';
                ret += c.getDeps(indent + "    ");
            }
        }
        return ret;
    },
    calc: function(filters) {
        var s = 0;
        var self = this;
        
        if (this.type.needFilter() && currentLevel && currentLevel.filter) {
            currentLevel.filter.filter(this);
        }
    }
    };
}


function MyClothes() {
    return {
    mine: {},
    mineCnt:{},
    mineStr:{},
    size: 0,
    filter: function(clothes) {
        this.mine = {}
        this.mineCnt = {}
        this.size = 0;
        for (var i in clothes) {
            if (clothes[i].own) {
                var type = clothes[i].type.mainType;
                if (!this.mine[type])
                    this.mine[type] = [];
                
                if (!this.mineCnt[type])
                    this.mineCnt[type] = [];
                
                if (!this.mineStr[type])
                    this.mineStr[type] = [];
                
                this.mine[type].push(clothes[i].id);
                this.mineCnt[type].push(clothes[i].have);
                this.mineStr[type].push(clothes[i].id+'-'+clothes[i].have);
                this.size ++;
            }
        }
    },
    serialize: function() {
        var txt = "";
        for (var type in this.mineStr) {
            txt += type + ":" + this.mineStr[type].join(',') + "|";
        }
        return txt;
    },
    deserialize: function(raw) {
        var sections = raw.split('|');
        this.mine = {};
        this.mineCnt = {};
        this.mineStr = {};
        this.size = 0;
        for (var i in sections) {
            if (sections[i].length < 1) {
                continue;
            }
            var section = sections[i].split(':');
            var type = section[0];
            if (type == "上装") {
                type = "上衣";
            }
            this.mineStr[type] = section[1].split(',');
            if(!this.mine[type])
                this.mine[type]={};
            if(!this.mineCnt[type])
                this.mineCnt[type]={};
            
            for(var j in this.mineStr[type]){
                var tmp = this.mineStr[type][j].split('-');
                this.mine[type][j]= tmp[0];
                this.mineCnt[type][j] = tmp.length > 1 ? tmp[1]:1;
            }
            this.size += this.mineStr[type].length;
        }
    },
    update: function(clothes) {
        var x = {};
        var y = {};
        for (var type in this.mine) {
            x[type] = {};
            y[type] = {};
            for (var i in this.mine[type]) {
                var id = this.mine[type][i];
                x[type][id] = true;
                y[type][id] = this.mineCnt[type][i];
            }
        }
        for (var i in clothes) {
            clothes[i].own = false;
            clothes[i].have = 0;
            var t = clothes[i].type.mainType;
            var id = clothes[i].id
            if (x[t] && x[t][clothes[i].id]) {
                clothes[i].own = true;
                clothes[i].have = y[t][clothes[i].id];
            }
        }
    }
    };
}

function Source(source) {
    var sources = source.split("/");
    var compact = [];
    for (var i in sources) {
        compact.push(compactSource(sources[i]));
    }
    return {
    rawSource: source,
    sources: sources,
    compacts: compact,
    compact: function() {
        return this.compacts.join("/");
    }
    };
}

function compactSource(source) {
    if (source.indexOf('进') >= 0) {
        return '进';
    }
    if (source.indexOf('定') >= 0) {
        return '染';
    }
    if (source.indexOf('图') >= 0) {
        return '图';
    }
    if (source.indexOf('活动') >= 0) {
        return source.substring(3);
    }
    return source;
}

var clothes = function() {
    var reals = {};
    if (typeof wardrobe_real !== "undefined") {
        for (var i in wardrobe_real) {
            var key = wardrobe_real[i][1] + wardrobe_real[i][2];
            reals[key] = wardrobe_real[i];
        }
    }
    var ret = [];
    for (var i in wardrobe) {
        var key = wardrobe[i][1] + wardrobe[i][2];
        ret.push(Clothes(wardrobe[i], reals[key]));
    }
    return ret;
}();

var clothesSet = function() {
    var ret = {};
    for (var i in clothes) {
        var t = clothes[i].type.mainType;
        if (!ret[t]) {
            ret[t] = {};
        }
        ret[t][clothes[i].id] = clothes[i];
    }
    return ret;
}();

function parseSource(source, key) {
    var idx = source.indexOf(key);
    var ridx = source.indexOf('/', idx+1);
    if (ridx < 0) ridx = 99;
    if (idx >= 0) {
        var id = source.substring(idx + 1, Math.min(source.length, ridx));
        while (id.length < 3) id = '0' + id;
        return id;
    }
    return null;
}

function calcDependencies() {
    for (var i in clothes) {
        var c = clothes[i];
        var evol = parseSource(c.source.rawSource, '进');
        if (evol && clothesSet[c.type.mainType][evol]) {
            clothesSet[c.type.mainType][evol].addDep('进', c);
        }
        var remake = parseSource(c.source.rawSource, '定');
        if (remake && clothesSet[c.type.mainType][remake]) {
            clothesSet[c.type.mainType][remake].addDep('定', c);
        }
    }
    for (var i in pattern) {
    	//console.log(pattern[i]);
    	if(!pattern[i][3]){
    		console.log(pattern[i]);
    		alert(pattern[i]);
    	}
    		
        var target = clothesSet[pattern[i][0]][pattern[i][1]];
        var source = clothesSet[pattern[i][2]][pattern[i][3]];
        
        if (!target) continue;
        if (!source)
            console.log(i);
        source.addDep('设计图', target);
    }
}

function load(myClothes) {
    var cs = myClothes.split(",");
    for (var i in clothes) {
        clothes[i].own = false;
        if (cs.indexOf(clothes[i].name) >= 0) {
            clothes[i].own = true;
        }
    }
    var mine = MyClothes();
    mine.filter(clothes);
    return mine;
}

function loadNew(myClothes) {
    var mine = MyClothes();
    mine.deserialize(myClothes);
    mine.update(clothes);
    return mine;
}

function loadFromStorage() {
    var myClothes;
    var myClothesNew;
    if (localStorage) {
        myClothesNew = localStorage.myClothesNew;
        myClothes = localStorage.myClothes;
    } else {
        myClothesNew = getCookie("mine2");
        myClothes = getCookie("mine");
    }
    if (myClothesNew) {
        return loadNew(myClothesNew);
    } else if (myClothes) {
        return load(myClothes);
    }
    return MyClothes();
}

function getCookie(c_name) {
    if (document.cookie.length>0) {
        c_start=document.cookie.indexOf(c_name + "=")
        if (c_start!=-1) {
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) {
                c_end=document.cookie.length
            }
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return "";
}

function setCookie(c_name,value,expiredays) {
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : "; expires="+exdate.toGMTString())
}

function save() {
    var myClothes = MyClothes();
    myClothes.filter(clothes);
    var txt = myClothes.serialize();
    if (localStorage) {
        localStorage.myClothesNew = txt;
    } else {
        setCookie("mine2", txt, 3650);
    }
    return myClothes;
}

function byName(a, b) {
    return a.name.localeCompare(b.name);
}
function byString(a, b) {
    return a.localeCompare(b);
}

//0:进化，1：设计图；2：定制
rel=function(source,target,num,type){
    return {
    source:source,
    target:target,
    num:num,
    type:type
    }
};
//设定进关系表

var relInfoSet = function(){
    ret = {}
    for (var i in evolve) {
        var targetCate = evolve[i][0];
        var targetId = evolve[i][1];
        var sourceCate = evolve[i][2];
        var sourceId = evolve[i][3];
        var num = evolve[i][4];
        if (!ret[sourceCate+'-'+sourceId]) {
            ret[sourceCate+'-'+sourceId] = [];
        }
        ret[sourceCate+'-'+sourceId].push(
                                          rel(sourceCate+'-'+sourceId,targetCate+'-'+targetId,num,0));
    }
    
    for (var i in pattern) {
        var targetCate = pattern[i][0];
        var targetId = pattern[i][1];
        var sourceCate = pattern[i][2];
        var sourceId = pattern[i][3];
        var num = pattern[i][4];
        if (!ret[sourceCate+'-'+sourceId]) {
            ret[sourceCate+'-'+sourceId] = [];
        }
        ret[sourceCate+'-'+sourceId].push(
                                          rel(sourceCate+'-'+sourceId,targetCate+'-'+targetId,num,1));
    }
    
    for(var i in wardrobe){
        var ind = wardrobe[i][5].indexOf('定');
        if(ind<0)
            continue;
        var sourceCate=targetCate = wardrobe[i][1].split('-')[0];
        var targetId = wardrobe[i][2];
        var sourceId = wardrobe[i][5].replace(/[^0-9]/ig,"");;
        if (!ret[sourceCate+'-'+sourceId]) {
            ret[sourceCate+'-'+sourceId] = [];
        }
        ret[sourceCate+'-'+sourceId].push(
                                          rel(sourceCate+'-'+sourceId,targetCate+'-'+targetId,1,2));
        
    }
    
    return ret;
}();

//计算总共所需source个数
function calRel(source){
    var sourceCate = source.split('-')[0];
    var sourceId = (source.split('-')[1]).toString();
    if(!clothesSet[sourceCate])
        console.log('["%s"]',sourceCate);
    if(!clothesSet[sourceCate][sourceId])
        console.log('["%s"]["%s"]',sourceCate,sourceId);
    var flag = clothesSet[sourceCate][sourceId].own?0:1;
    var haveNum = clothesSet[sourceCate][sourceId].have;
    // if(!relInfoSet[source]) return flag;
    if(!relInfoSet[source]) return 1-haveNum;
    var res = 1;
    for(var i in relInfoSet[source]){
        var num = relInfoSet[source][i].num;
        var type =relInfoSet[source][i].type;
        
        //判断是否为定制
        var require = calRel(relInfoSet[source][i].target) > 0?calRel(relInfoSet[source][i].target):0;
        if(type==2)
            res+=require;
        else
            res += require*(num-1);
        //  console.log('%d : %s  %d',i,num,haveNum);
    }
    
    res -= haveNum;
    return res;
}
function filtering(criteria, filters) {
    var result = [];
    for (var i in clothes) {
        if (matches(clothes[i], criteria, filters)) {
            result.push(clothes[i]);
        }
    }
    if (global.isFilteringMode) {
        result.sort(byId);
    } else {
        result.sort(byCategoryAndScore);
    }
    return result;
}

function requiredLevels(type,chapter){
    var result = [];
    var ret = {};
    for(var i in clothes){
        var cloth = clothes[i];
        var num = calRel(cloth.type.mainType+'-'+cloth.id);
        if(num<=0)
            continue;
        
        var rS = cloth.source.rawSource;
        var sourceArr = [];
        
        for(var s in cloth.source.sources){
            var cs =cloth.source.sources[s];
            if(cs.indexOf('-')>0 && cs.indexOf(type)>0 && cs.split('-')[0]==chapter){
                var l = cs.split('-')[1].split(type)[0];
                if(!ret[l])
                    ret[l] = [];
                ret[l].push(clothes[i]);
            }
        }
        
        
    }
    
    for(var i in ret){
        for(var l in ret[i]){
            result.push(ret[i][l]);
        }
    }
    
    return result;
}

//获取公主级或者少女级还需要刷的关卡
function getRequiredLevels(type){
    var ret = {};
    for(var i in clothes){
        var cloth = clothes[i];
        var num = calRel(cloth.type.mainType+'-'+cloth.id);
        if(num<=0)
            continue;
        
        var rS = cloth.source.rawSource;
        var sourceArr = [];
        
        for(var s in cloth.source.sources){
            var cs =cloth.source.sources[s];
            if(cs.indexOf('-')>0 && cs.indexOf(type)>0){
                sourceArr.push(cs);
            }
        }
        
        for(var sa in sourceArr){
            var source =sourceArr[sa];
            var p = source.split('-')[0];
            var q = source.split('-')[1].split(type)[0];
            var arr = sa.split(/[type,-]/);
            if(!ret[p])
                ret[p]={};
            if(!ret[p][q])
                ret[p][q]=[];
            ret[p][q].push(cloth);
        }
    }
    return ret;
}


function getCollectList(type){
    var ret = [];
    for(var i in clothes){
        var cloth = clothes[i];
        var num = calRel(cloth.type.mainType+'-'+cloth.id);
        if(num<=0)
            continue;
        //console.log('as')
        var rS = cloth.source.rawSource;
        var sourceArr = [];
        for(var s in cloth.source.sources){
            var cs =cloth.source.sources[s];
            //console.log(cs.indexOf(type));
            
            if(cs.indexOf('·')>=0 && cs.indexOf(type)>=0){
                console.log('dasda')
                ret.push(cloth);
                continue;
            }
        }
        
    }
    return ret;
}


