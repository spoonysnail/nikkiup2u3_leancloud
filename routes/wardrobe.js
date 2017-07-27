/**
 * 
 */

'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var URL = require('url');
var http = require('http');
var util = require('util');
var resSize = 10;
var picSize = 300;
var pt=new RegExp("[^a-zA-Z0-9\_\u4e00-\u9fa5\-\·]","i"); 
// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Clothes = AV.Object.extend('Clothes');
var SearchKey =  AV.Object.extend('SearchKey');
var SearchDetail =  AV.Object.extend('SearchDetail');

var hitList = ['449139314','3823592695','3471182975','3404505251'];

router.get('/', function(req, res, next) {

	res.render('wardrobe', {
		title : '奇迹暖暖图鉴查询',
		searchkey : '',
		clothes : [],
		feedbacks:[],
		url : null,
		icon_url:null
	});
});

// 查询 Clothes 列表
router.post('/', function(req, res, next) {
	var clothesList = [];
	//console.dir(req.body);
	var search_hist = req.body.clothname.trim();
	var finger = req.body.finger_sign;
	var pic_url = null;
	var ip = "unknown";
	var device = "unknown";
	if(req.headers['x-real-ip'] ){
		ip = req.headers['x-real-ip'];
	}
	if(req.headers['user-agent']){
		device=parseUserAgent(req.headers['user-agent']);
	}	

	if(hitList.indexOf(finger)>-1 ){
		console.log('黑名单访问：finger_sign=' + finger +' &ip='+ip +' &device=' +device+'  &searchkey=' + search_hist);
		res.render('wardrobe', {
			title : '您已被加入黑名单',
			searchkey : '',
			clothes : [],
			feedbacks:[],
			url : null,
			icon_url:null
		});
	} else if (search_hist == null || search_hist=='' || pt.test(search_hist)) {
		if( pt.test(search_hist))
			console.log('非法字符攻击：finger_sign=' + finger +' &ip='+ip +' &device=' +device+'  &searchkey=' + search_hist);
		res.render('wardrobe', {
			title : '奇迹暖暖图鉴查询',
			searchkey : search_hist,
			clothes : clothesList,
			feedbacks:[],
			url : null,
			icon_url:null
			
		});
	}else {
		var searchObj = new SearchKey();
		searchObj.set('ip',ip);
		searchObj.set('info',search_hist);
		searchObj.set('device',device);
		searchObj.set('finger',finger);

		searchObj.save();		 
		var cql = 'select * from Clothes where (name like \'%'+search_hist+'%\' and pic is exists) order by +nameLength,+rid limit 10';
		//console.log(cql);
		var pvalues = [search_hist];
//		var nameQuery = new AV.Query('Clothes');
//		nameQuery.contains('name', search_hist);
//
//		var picQuery = new AV.Query('Clothes');
//		picQuery.exists('pic');
//
//		var query = AV.Query.and(nameQuery, picQuery);
		//query.limit(10);
		//query.ascending('name');
		
		AV.Query.doCloudQuery(cql, pvalues).then(function (data) {
		    var results = data.results;
		  	if (results.length == 0) {
				clothesList = [];
				pic_url = null;

				res.render('wardrobe', {
					title : '奇迹暖暖图鉴查询',
					searchkey : search_hist,
					clothes : clothesList,
					feedbacks:[],
					url : null,
					icon_url:null
				});
			} else {
				clothesList = results;
				var cloth = results[0];
				var name = cloth.get('name');

				var pic_object = cloth.get('pic');

				var pic_id = pic_object.id;
				var pic = AV.File.createWithoutData(pic_id);
				var icon_url = cloth.get('iconUrl');
				//console.log('icon_url:'+icon_url);
				pic.fetch().then(function() {
					pic_url = pic.thumbnailURL(picSize, picSize);
					
					res.render('wardrobe', {
						title : '奇迹暖暖图鉴查询',
						searchkey : search_hist,
						clothes : clothesList,
						feedbacks:[],
						url : pic_url,
						icon_url:icon_url
					});

				}, function(error) {
					console.log('info search error:finger_sign='+finger + ' &ip='+ip+' &device=' +device+' & seachkey='+search_hist + '  error='+error);

					res.render('wardrobe', {
						title : '奇迹暖暖图鉴查询',
						searchkey : '',
						clothes : [],
						feedbacks:[],
						url : null,
						icon_url:null
					});

				});
			}

		  }, function (error) {
			  console.log('info search error: finger_sign=' + finger +' &ip='+ip+' &device=' +device+' & seachkey='+search_hist + '  error='+error);
				res.render('wardrobe', {
					title : '奇迹暖暖图鉴查询',
					searchkey : '',
					clothes : [],
					feedbacks:[],
					url : null,
					icon_url:null
				});

		  });
		
//		query.find().then(function(results) {
//			//console.log(results.length);
//			if (results.length == 0) {
//				clothesList = [];
//				pic_url = null;
//
//				res.render('wardrobe', {
//					title : '奇迹暖暖图鉴查询',
//					searchkey : search_hist,
//					clothes : clothesList,
//					feedbacks:[],
//					url : pic_url
//				});
//			} else {
//				clothesList = results;
//				var cloth = results[0];
//				var name = cloth.get('name');
//
//				var pic_object = cloth.get('pic');
//
//				var pic_id = pic_object.id;
//				var pic = AV.File.createWithoutData(pic_id);
//
//				pic.fetch().then(function() {
//					pic_url = pic.thumbnailURL(picSize, picSize);
//
//					res.render('wardrobe', {
//						title : '奇迹暖暖图鉴查询',
//						searchkey : search_hist,
//						clothes : clothesList,
//						feedbacks:[],
//						url : pic_url
//					});
//
//				}, function(error) {
//					console.log('info search error:finger_sign='+finger + ' &ip='+ip+' &device=' +device+' & seachkey='+search_hist + '  error='+error);
//
//					res.render('wardrobe', {
//						title : '奇迹暖暖图鉴查询',
//						searchkey : '',
//						clothes : [],
//						url : null
//					});
//
//				});
//			}
//
//		}, function(error) {
//			console.log('info search error: finger_sign=' + finger +' &ip='+ip+' &device=' +device+' & seachkey='+search_hist + '  error='+error);
//			res.render('wardrobe', {
//				title : '奇迹暖暖图鉴查询',
//				searchkey : '',
//				clothes : [],
//				url : null
//			});
//
//		});
	}

});



router.get("/:cc_name/:finger", function(req, res) {
	//console.dir(req.params);
	var ip = 'unknown';
	var device = 'unknown';
	var searchcloth = req.params.cc_name.trim();
	var finger = req.params.finger;
	if(req.headers['x-real-ip'] ){
		ip = req.headers['x-real-ip'];
	}
	if(req.headers['user-agent']){
		device=parseUserAgent(req.headers['user-agent']);
	}
	
	if(searchcloth == '' || pt.test(searchcloth)){
		if( pt.test(searchcloth))
			console.log('非法字符攻击： ip='+ip +' &device=' +device +'  &searchkey=' + searchcloth);
		res.send('error');
	}
		
	if(hitList.indexOf(finger)>-1 ){
		console.log('黑名单访问cc_name：finger_sign=' + finger +' &ip='+ip +' &device=' +device+'  &searchkey=' + search_hist);
		res.send('error');
	}
	
	var searchDtObj = new SearchDetail();
	searchDtObj.set('ip',ip);
	searchDtObj.set('clothname',searchcloth);
	searchDtObj.set('device',device);
	searchDtObj.set('finger',finger);

	searchDtObj.save();
	
	
	var ridQuery = new AV.Query('Clothes');
	ridQuery.equalTo('rid', searchcloth);
	ridQuery.first().then(function(cloth) {
		//var rid = cloth.get('rid');
		//console.log(name);

		var pic_object = cloth.get('pic');
		var pic_id = pic_object.id;
		var pic = AV.File.createWithoutData(pic_id);
		var icon_url = cloth.get('iconUrl');
		pic.fetch().then(function() {
			var pic_url = pic.thumbnailURL(picSize, picSize);
			//console.log('icon_url:'+icon_url);
			res.send({'pic_url':pic_url,'icon_url':icon_url});
		}, function(error) {
			console.log('cloth search error: ip='+ip+' & seachcloth='+searchcloth + '  error='+error);
			res.send('error');
		});
	});

});

var getIpInfo = function(ip, cb) {
	  var sina_server = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
	  var url = sina_server + ip;
	  http.get(url, function(res) {
	    var code = res.statusCode;
	    if (code == 200) {
	      res.on('data', function(data) {
	        try {
	          cb(null, JSON.parse(data));
	        } catch (err) {
	          cb(err);
	        }
	      });
	    } else {
	      cb({ code: code });
	    }
	  }).on('error', function(e) { cb(e); });
	};

function parseUserAgent(info){
	if(info){
		var tmp1 = info.split('AppleWebKit')[0];
		if(tmp1 && tmp1.split('(').length > 1){
			var tmp2 = tmp1.split('(')[1];
			if(tmp2)
				return tmp2.split(')')[0];
		}		
	}
	return info;	
}

module.exports = router;
