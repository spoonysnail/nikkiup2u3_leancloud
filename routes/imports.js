'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var inspect = require('util').inspect;

// 详见： https://leancloud.cn/docs/js_guide.html#对象
var EvolveTmp = AV.Object.extend('EvolveTmp');
var Todo = AV.Object.extend('Todo');
var UploadFileInfo = AV.Object.extend('UploadFileInfo');
var categoryList = ['发型','连衣裙','外套','上衣','下装','袜子','鞋子','饰品','妆容','荧光之灵'];
var tip = null;
//
//router.get('/', function(req, res, next) {
//
//  var query = new AV.Query(Todo);
//  query.descending('createdAt');
//  query.find().then(function(results) {
//    res.render('imports', {
//      title: '服装数据更新',
//      categories:categoryList,
//      flag:tip
//    });
//                    tip = null;
//  }, function(err) {
//    if (err.code === 101) {
//      res.render('import', {
//        title: '服装数据更新',
//        categories: [],
//        flag:null
//      });
//    } else {
//      next(err);
//    }
//  }).catch(next);
//});

//
//
//// 新增 Evolve 项目
//router.post('/evolve',function(req, res, next) {
//    console.log('try saving...' );
//
//	tip = null;
//    console.log(req.body);
//    addEvolve(req.body);
//    tip = '===进化数据成功提交！===';
//
//    res.redirect('/imports');
//
//    });

// 新增 Pic 项目
router.post('/pic',function(req, res, next) {
    console.log('try saving pic...' );

	tip = null;
    uploadFile(req,res);

    //res.redirect('/imports');
    });
//
//function addEvolve(object){
//    var category = object.category;
//    var tcid = object.tcid;
//    var scid = object.scid;
//    var count = object.count;
//    var evolveTmp = new EvolveTmp();
//    evolveTmp.set('source', category);
//    evolveTmp.set('target', category);
//    evolveTmp.set('tcid', tcid);
//    evolveTmp.set('scid', scid);
//    evolveTmp.set('count', count);
//    
//    evolveTmp.save();
//}
//
//function addCloth(object){
//    var clothes = new Clothes();
//    
//    clothes.set('cid',STRING(object.cid).trim().s);
//    clothes.set('category',STRING(object.category).trim().s);
//    clothes.set('star',STRING(object.star).toInt());
//    clothes.set('source',STRING(object.source).trim().s);
//    clothes.set('tag',STRING(object.tag).trim().s);
//    clothes.set('suit',STRING(object.suit).trim().s);
//    clothes.set('name',STRING(object.name).trim().s);
//   // console.log(object);
//    clothes.save()
//    
//}

function uploadFile (req, res) {
	console.log('uploadFile');
	//console.dir(req.body);
	if (req.busboy) {
		var ip = 'unknown';
		var device = 'unknown';
		if(req.headers['x-real-ip'] ){
		ip = req.headers['x-real-ip'];
		}
		if(req.headers['user-agent']){
			device=parseUserAgent(req.headers['user-agent']);
		}
		
	    var base64data = [];
	    var pubFileName = '';
	    var pubMimeType = '';
	    var finger = null;
	    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
	       // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
	        finger = inspect(val).split('\'').length>1 ? inspect(val).split('\'')[1] : inspect(val);
	      });
	    

		if(finger == '449139314'){
			console.log('黑名单图片上传：finger_sign=' + finger +' &ip='+ip +' &device=' +device+'  &searchkey=' + search_hist);
			res.send('黑名单');
		}	
		  
	    
	    req.busboy.on('file', (fieldname, file, fileName, encoding, mimeType) => {
	      var buffer = '';
	      pubFileName = fileName;
	      pubMimeType = mimeType;
	      file.setEncoding('base64');
	      file.on('data', function(data) {
	        buffer += data;
	      }).on('end', function() {
	        base64data.push(buffer);
	      });
	    }).on('finish', function() {
	      var f = new AV.File(pubFileName, {
	        // 仅上传第一个文件（多个文件循环创建）
	        base64: base64data[0]
	      });

	     // try {
	        f.save().then(function(fileObj) {
	        	var uploadFileInfo = new UploadFileInfo();
	        	uploadFileInfo.set("ip",ip);
	        	uploadFileInfo.set("device",device);
	        	uploadFileInfo.set("pic",fileObj);
	        	uploadFileInfo.set("finger",finger);
	        	uploadFileInfo.save();
	        	
	          // 向客户端返回数据
	          res.send({
	            fileId: fileObj.id,
	            fileName: fileObj.name(),
	            mimeType: fileObj.metaData().mime_type,
	            fileUrl: fileObj.url()
	          });
	        });
	    //  } catch (error) {
//	    	console.log('uploadFileerror: ip='+ip+' &device=' +device+' error:'+error);
//
//	        res.status(502);
//	      }
	    })
	    req.pipe(req.busboy);
	  } else {
	    console.log('uploadFile error- busboy undefined: ip='+ip+' &device=' +device);
	    res.status(502);
	  }
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




