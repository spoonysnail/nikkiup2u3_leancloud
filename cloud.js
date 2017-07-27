var AV = require('leanengine');
/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

var Clothes = AV.Object.extend('Clothes');
var STRING = require('string');

AV.Cloud.beforeSave('Clothes', function(request, response) {
                    console.log('before save');
                    var category = request.object.get('category');
                    var cid = request.object.get('cid');
                    
                    var category_query = new AV.Query('Clothes');
                    category_query.equalTo('category',category);
                    
                    var cid_query = new AV.Query('Clothes');
                    cid_query.equalTo('cid',cid);
                    
                    var query = AV.Query.and(category_query,cid_query);
                    
                    
                    query.count().then(function (count) {
                                       console.log(count);
                                       if (count == 0){
                                       response.success();
                                       }else{
                                       response.error('重复数据！');
                                       }}, function (error) {
                                       response.error('Unknow Error！')
                                       });
                    });


AV.Cloud.beforeSave('EvolveTmp', function(request, response) {
                    console.log('before save evolveTmp');
                    var category = request.object.get('source');
                    var tcid = request.object.get('tcid');
                    var scid = request.object.get('scid');

                    var category_query = new AV.Query('EvolveTmp');
                    category_query.equalTo('source',category);
                    
                    var tcid_query = new AV.Query('EvolveTmp');
                    tcid_query.equalTo('tcid',tcid);
                    
                    var scid_query = new AV.Query('EvolveTmp');
                    scid_query.equalTo('scid',scid);
                    
                    var query = AV.Query.and(category_query,tcid_query,scid_query);
                    
                    
                    query.count().then(function (count) {
                                       console.log(count);
                                       if (count == 0){
                                       response.success('提交成功! ');
                                       }else{
                                       response.error('重复数据！');
                                       }}, function (error) {
                                       response.error('Unknow Error！')
                                       });
                    });

AV.Cloud.define('save_clothes', function(request, response) {
                var clothes = new Clothes();
                
                clothes.set('cid',STRING(request.params.cid).toInt());
                clothes.set('category',STRING(request.params.category).trim().s);
                clothes.set('star',STRING(request.params.star).toInt());
                clothes.set('source',STRING(request.params.source).trim().s);
                clothes.set('tag',STRING(request.params.tag).trim().s);
                clothes.set('suit',STRING(request.params.suit).trim().s);
                clothes.set('name',STRING(request.params.name).trim().s);
                console.log(request.params);
                clothes.save().
                then(function (clothes) {
                     // 成功保存之后，执行其他逻辑
                     // 获取 objectId
                     var objectId = clothes.id;
                     console.log(objectId);
                     }, function (error) {
                     // 失败之后执行其他逻辑
                     console.log('error');
                     });
                });






AV.Cloud.define('averageStars', function(request, response) {
                var query = new AV.Query('Review');
                query.equalTo('movie', request.params.movie);
                query.find({
                           success: function(results) {
                           var sum = 0;
                           for (var i = 0; i < results.length; ++i) {
                           sum += results[i].get('stars');
                           }
                           response.success(sum / results.length);
                           },
                           error: function() {
                           response.error('movie lookup failed');
                           }
                           });
                });

module.exports = AV.Cloud;




