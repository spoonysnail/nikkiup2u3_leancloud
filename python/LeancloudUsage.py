#!/usr/bin/python
# -*- coding: UTF-8 -*-

import sys
import leancloud
import xlrd
import os
import io
import shutil
import PicProcessing
from PIL import Image
from urllib2 import urlopen
reload(sys)
sys.setdefaultencoding('utf8')
leancloud.init("your-lean-app-id", "your-lean-app-key")

Clothes = leancloud.Object.extend('Clothes')
category_prefix_list={'发型':'1','连衣裙':'2','外套':'3','上衣':'4','下装':'5',
                     '袜子':'6','鞋子':'7','饰品':'8','妆容':'9','萤光之灵':'88'}

#category_prefix_list={u'发型':'1',u'连衣裙':'2',u'外套':'3',u'上衣':'4',u'下装':'5',
                   #   u'袜子':'6',u'鞋子':'7',u'饰品':'8',u'妆容':'9',u'萤光之灵':'88'}

def checkWradrobe(xls_path):
    workbook = xlrd.open_workbook(xls_path,encoding_override='utf-8')
    booksheet = workbook.sheet_by_name('sheet1')
    print 'check begin', booksheet.nrows
    for row in range(1, booksheet.nrows):
        name = getCellVal(booksheet.cell(row,0))
        try:
            query = leancloud.Query(Clothes)
            query.equal_to('name', name)
            if query.count() == 0:
                print name,'does not exist'
        except:
            print name,'check failed'
    print 'check end'


#类别	名称	编号	心级	特殊属性	来源	所属套装
def import_xlsx_wardrobe(xls_path):
    workbook = xlrd.open_workbook(xls_path,encoding_override='utf-8')
    booksheet = workbook.sheet_by_name('sheet1')
    print 'import begin'
    p = list()
    for row in range(1,booksheet.nrows):
        cloth = Clothes()
        category = getCellVal(booksheet.cell(row,0))
        name = getCellVal(booksheet.cell(row,1))
        cid = getCellVal(booksheet.cell(row,2))
        category = category.encode('utf8')
        rid =  getRid(category,cid)
        star = getCellVal(booksheet.cell(row,3))
        tag = getCellVal(booksheet.cell(row,4))
        source = getCellVal(booksheet.cell(row,5))
        suit = getCellVal(booksheet.cell(row,6))

        cloth.set('category',category)
        cloth.set('name',name)
        cloth.set('cid',cid)
        cloth.set('star',star)
        cloth.set('tag',tag)
        cloth.set('source',source)
        cloth.set('suit',suit)
        cloth.set('rid',rid)
        cloth.set('nameLength',len(name.strip()))

        try:
            query = leancloud.Query(Clothes)
            query.equal_to('rid',getRid(category,cid))
            if query.count() == 0:
                cloth.save()
                print name,'saved'
            else:
                print name,'already exists'
        except:
            print name,'saveing failed'
    print 'import end'
    return p


#evolve : target	tcid	source	scid	count
def import_xlsx(xls_path, classname):
    Obj = leancloud.Object.extend(classname)

    workbook = xlrd.open_workbook(xls_path,encoding_override='utf-8')
    booksheet = workbook.sheet_by_name(workbook.sheet_names()[0])
    print 'import begin'
    p = list()
    for row in range(1,booksheet.nrows):
        obj = Obj()
        if classname is 'Evolve' or classname is 'Pattern':
            target = getCellVal(booksheet.cell(row, 0))
            tcid = getCellVal(booksheet.cell(row, 1))
            source = getCellVal(booksheet.cell(row, 2))
            scid = getCellVal(booksheet.cell(row, 3))
            count = getCellVal(booksheet.cell(row, 4))
            obj.set('target', target)
            obj.set('tcid', tcid)
            obj.set('source', source)
            obj.set('scid', scid)
            obj.set('count', count)
        else:
            category = str(getCellVal(booksheet.cell(row,0))).split('-')[0]
            name = getCellVal(booksheet.cell(row,1))
            cid = getCellVal(booksheet.cell(row,2))
            category = category.encode('utf8')
            rid =  getRid(category,cid)
            star = getCellVal(booksheet.cell(row,3))
            tag = getCellVal(booksheet.cell(row,4))
            source = getCellVal(booksheet.cell(row,5))
            suit = getCellVal(booksheet.cell(row,6))
            obj.set('category',category)
            obj.set('name',name)
            obj.set('cid',cid)
            obj.set('star',star)
            obj.set('tag',tag)
            obj.set('source',source)
            obj.set('suit',suit)
            obj.set('rid',rid)
            obj.set('nameLength',len(name.strip().decode('utf8')))

        if classname is 'Clothes':
            try:
                query = leancloud.Query(Clothes)
                query.equal_to('rid',getRid(category,cid))
                if query.count() == 0:
                    obj.save()
                    print name,'saved'
                else:
                    print name,'already exists'
            except:
                print name,'saveing failed'
        else:
            try:
                obj.save()
            except Exception,e:
                print classname, booksheet.row_values(row,0,5),e

    print 'import end'
    return p


def import_ep(xls_path):
    Pattern = leancloud.Object.extend('Pattern')
    Evolve = leancloud.Object.extend('Evolve')
    workbook = xlrd.open_workbook(xls_path, encoding_override='utf-8')
    booksheet = workbook.sheet_by_name(workbook.sheet_names()[0])
    print 'import begin'
    for row in range(1, booksheet.nrows):
        type = getCellVal(booksheet.cell(row, 5))
        print type
        Obj = Pattern if type == u'设' else Evolve
        if type == u'设' or type == u'进' :
            target = getCellVal(booksheet.cell(row, 0))
            tcid = cid_format(getCellVal(booksheet.cell(row, 1)))
            source = getCellVal(booksheet.cell(row, 2))
            scid = cid_format(getCellVal(booksheet.cell(row, 3)))
            count = getCellVal(booksheet.cell(row, 4))

            obj = Obj()
            obj.set('target', target)
            obj.set('tcid', tcid)
            obj.set('source', source)
            obj.set('scid', scid)
            obj.set('count', count)

            query1 = Obj.query
            query2 = Obj.query
            query3 = Obj.query
            query4 = Obj.query

            query1.equal_to('tcid', tcid)
            query2.equal_to('scid', scid)
            query3.equal_to('target', target)
            query4.equal_to('source', source)

            query = leancloud.Query.and_(query1,query2,query3,query4)

            if query.count() == 0:
                obj.save()
                print target, tcid, source, scid, count, type
            elif query.count() == 1:
                o = query.first()
                if o.get('count') != count:
                    print target, tcid, source, scid, count,'/', o.get('count'), type
            else:
                print target, tcid, source, scid, 'several results'

    print 'import end'


def cid_format(cid):
    length = len(cid)
    if length == 1:
        return '00'+cid
    elif length == 2:
        return '0'+cid
    else:
        return cid


def export(file_path, classname):
    f = file(file_path, "w+")
    if classname is 'Clothes':
        starttxt='//Wardrobe:[name,category,cid,star,tag,source,suit] \n var wardrobe = [ \n'
    elif classname is 'Evolve':
        starttxt ='// Evolve:[target, tcid, source, scid, count] \n var evolve = ['
    elif classname is 'Pattern':
        starttxt ='// Pattern:[target, tcid, source, scid, count] \n var pattern = ['

    Obj = leancloud.Object.extend(classname)
    f.writelines(starttxt)
    query = leancloud.Query(Obj)
    if classname is 'Clothes':
        query.ascending('rid')
    else:
        query.ascending('target')
        query.ascending('tcid')

    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while(cnt>0):
        #do writelines
       # query_list = query.find()
      #  print len(query_list)
#['馨朵·白','上衣','001','2','','店·金币/浪·迷',''],
        for obj in query_list:
            if classname is 'Clothes':
                name = getAttr(obj, 'name')
                category = getAttr(obj, 'category')
                cid = getAttr(obj, 'cid')
                star = getAttr(obj, 'star')
                tag = getAttr(obj, 'tag')
                source = getAttr(obj, 'source')
                suit = getAttr(obj, 'suit')
                data = '[\''+name+'\',\''+category+'\',\''+cid+'\',\''\
                   +star+'\',\''+tag+'\',\''+source\
                   +'\',\'' + suit+'\'],\n'
            else:
                target = getAttr(obj, 'target')
                tcid = getAttr(obj, 'tcid')
                source = getAttr(obj, 'source')
                scid = getAttr(obj, 'scid')
                count = getAttr(obj, 'count')
                data = '[\'' + target + '\',\'' + tcid + '\',\'' + source + '\',\'' \
                       + scid + '\',\'' + count + '\'],\n'

            f.write(data)
        query = leancloud.Query(Obj)
        if classname is 'Clothes':
            query.ascending('rid')
        else:
            query.ascending('target')
            query.ascending('tcid')
        query.skip(size)
        size+=1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)

    if classname is 'Clothes':
        endtxt= ']; \n var category = [\'发型\', \'连衣裙\', \'外套\', \'上衣\', \'下装\', \'袜子\', \'鞋子\', \'饰品\',\'妆容\', \'萤光之灵\'];\n'
    else:
        endtxt ='];'
    f.writelines(endtxt)
    f.close()


def export_clothes(file_path):
    f = file(file_path, "w+")
    starttxt='//Wardrobe:[name,category,cid,star,tag,source,suit] \n var wardrobe = [ \n'
    f.writelines(starttxt)
    query = leancloud.Query(Clothes)
    query.ascending('rid')
    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while(cnt>0):
        #do writelines
       # query_list = query.find()
      #  print len(query_list)
#['馨朵·白','上衣','001','2','','店·金币/浪·迷',''],
        for cloth in query_list:
            name = getAttr(cloth, 'name')
            category = getAttr(cloth, 'category')
            cid = getAttr(cloth, 'cid')
            star = getAttr(cloth, 'star')
            tag = getAttr(cloth, 'tag')
            source = getAttr(cloth, 'source')
            suit = getAttr(cloth, 'suit')


            data = '[\''+name+'\',\''+category+'\',\''+cid+'\',\''\
                   +star+'\',\''+tag+'\',\''+source\
                   +'\',\'' + suit+'\'],\n'
            f.write(data)
        query = leancloud.Query(Clothes)
        query.ascending('rid')
        query.skip(size)
        size+=1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)

    endtxt= ']; \n var category = [\'发型\', \'连衣裙\', \'外套\', \'上衣\', \'下装\', \'袜子\', \'鞋子\', \'饰品\',\'妆容\', \'萤光之灵\'];\n'
    f.writelines(endtxt)
    f.close()


def getAttr(Object, attr_name):
    if Object.get(attr_name) == None:
        return ''
    return Object.get(attr_name)


def getCellVal(cell):
    val = cell.value
    val.encode('utf8')
    return str(val).strip()


def getRid(category,cid):
    if(len(cid) == 4):
        rid = str(category_prefix_list[category])+str(cid)
    else:
        rid = str(category_prefix_list[category])+'0'+str(cid)
    return rid


def updatePic(rootdir):
    query = leancloud.Query(Clothes)
    cnt = 0
    for parent,dirnames,filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG')>0 or filename.find('png')>0:
                im = Image.open(rootdir+filename)
                clothname = str(filename).split('.PNG')[0]
                query.equal_to('name',clothname)
                res = query.find()
                if len(res) == 1:
                    cloth = query.first()
                    cloth.get('pic')
                    old_pic = str(cloth.get('picUrl')).strip()
                    # noinspection PyBroadException
                    if old_pic is not None or old_pic is not '':
                        try:
                            desc = PicProcessing.getDesc(os.path.join(parent, filename))

                            with open(os.path.join(parent,filename)) as f:
                                avatar = leancloud.File('fileFromLocalFile', f)
                                avatar.save()
                               # avatar_id = avatar.id
                                picUrl = avatar.url
                                cloth.set('pic',avatar)
                                cloth.set('picUrl',picUrl)
                                cloth.set('description', resFormat(desc))

                                cloth.save()
                                cnt+=1

                        except:
                            print filename,'failed to update'
                            im.save('/users/gejiali/Documents/Game/nikkic/pic/en/'+filename)
                    else:
                        print filename, 'already has pic'
                else:
                    print filename,'failed to find'
                    im.save('/users/gejiali/Documents/Game/nikkic/pic/en/'+filename)
    print cnt,'updated'


#黑白配、涎玉沫珠
def updateDesc(rootdir):
    query = leancloud.Query(Clothes)
    cnt = 0
    for parent,dirnames,filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG') > 0 or filename.find('jpg') > 0 or filename.find('png') > 0 or filename.find('JPG') > 0:
                clothname = filename.split('.')[0]
                if clothname != '黑白配' and clothname != '涎玉沫珠':
                    query.equal_to('name', clothname)
                    res = query.find()
                    if len(res) == 1:
                        cloth = query.first()
                        old_desc = cloth.get('description')
                        # noinspection PyBroadException
                        if old_desc == None or old_desc == '' or len(str(old_desc).strip()) < 5 :
                            desc = PicProcessing.getDesc(os.path.join(parent, filename))

                            try:
                                cloth.set('description',desc)
                                cloth.save()
                                cnt += 1
                            except:
                                print clothname,'failed to update'

                    else:
                        print clothname,'failed to find'
    print cnt


def updatePicFile():
    query = leancloud.Query(Clothes)
    query.ascending('rid')
    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while (cnt > 0):
        for cloth in query_list:
            try:
                pic = cloth.get('pic')
                pic.fetch()
                pic_url = pic.get('url')
                cloth.set('picUrl',pic_url)
                cloth.save()
            except:
                print cloth.get('name'),'failed'

        query = leancloud.Query(Clothes)
        query.ascending('rid')
        query.skip(size)
        size += 1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)


def collectPic(category,rootdir):
    # type: (object, object) -> object
    query = leancloud.Query(Clothes)
    query.ascending('rid')
    query.equal_to('category',category)
#    query.equal_to('rid','81090')
    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while (cnt > 0):
        for cloth in query_list:
            pic_url = cloth.get('picUrl')
            name = cloth.get('name')
            if pic_url != None and pic_url != '':
                try:
                    image_bytes = urlopen(pic_url).read()
                    # internal data file
                    data_stream = io.BytesIO(image_bytes)
                    # open as a PIL image object
                    pil_image = Image.open(data_stream)
                    pil_image.save(rootdir+category+'/'+name+'.PNG')
                except:
                    print name,'pic error'
            else:
                print name,'no pic'

        query = leancloud.Query(Clothes)
        query.ascending('rid')
        query.skip(size)
        query.equal_to('category', category)
     #   query.greater_than('rid', '60358')
        size += 1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)


def resFormat(data):
    return data.replace('_', '一').replace('-', '一').replace(',', '，').replace('】', '，').replace('`', '') \
        .replace('y', '，').replace('!', '！').replace(') ', '，').replace('′', '') \
        .replace('瞄', '喵').replace('荫','萌') \
        .replace('\'', '，').replace('“','"').replace('”','"') \
        .replace('?', '？').replace(' ', '')


def formatDesc():
    # type: (object, object) -> object
    query = leancloud.Query(Clothes)
    query.ascending('rid')
    query.greater_than('rid', '10038')
    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while (cnt > 0):
        for cloth in query_list:
            old_desc = cloth.get('description')
            if old_desc != None and old_desc != '':
                cloth.set('description', resFormat(old_desc))
                cloth.save()
        query = leancloud.Query(Clothes)
        query.ascending('rid')
        query.greater_than('rid', '10038')
        query.skip(size)
        size += 1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)


def setNameLength():
    query = leancloud.Query(Clothes)
    query.ascending('rid')
    query.limit(1000)

    query_list = query.find()
    print len(query_list)
    cnt = len(query_list)
    size = 1000
    while (cnt > 0):
        for cloth in query_list:
            try:
                name = cloth.get('name')
                cloth.set('nameLength',len(name))
                cloth.save()
            except:
                print cloth.get('name'),'failed'

        query = leancloud.Query(Clothes)
        query.ascending('rid')
        query.skip(size)
        size += 1000
        query.limit(1000)
        query_list = query.find()
        print len(query_list)
        cnt = len(query_list)


def addIcon(rootdir, extradir):
    query = leancloud.Query(Clothes)
    cnt = 0
    for parent,dirnames,filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG')>0 or filename.find('png')>0:
                rid = str(filename).split('.')[0].split('icon')[1]
                print (rid)
                query.equal_to('rid',rid)
                res = query.find()
                if len(res) == 1:
                    cloth = query.first()
                    try:
                        with open(os.path.join(parent,filename)) as f:
                            avatar = leancloud.File('fileFromLocalFile', f)
                            avatar.save()
                           # avatar_id = avatar.id
                            iconUrl = avatar.url
                            cloth.set('iconUrl',iconUrl)
                            cloth.save()
                            cnt+=1

                    except:
                        shutil.copy(os.path.join(parent, filename), os.path.join(extradir, filename))
                        print filename,'failed to update'

                else:
                    shutil.copy(os.path.join(parent, filename), os.path.join(extradir, filename))
                    print filename,'failed to find'
    print cnt,'updated'


def update(className, attr):
    Obj = leancloud.Object.extend(className)
    query = leancloud.Query(Obj)
    query.equal_to(attr, u'上装')
    queryList = query.find()
    print len(queryList)
    for obj in queryList:
        obj.set(attr, u'上衣')
        obj.save()

    #leancloud.Object.save_all()



#update('Evolve', 'target')
#collectPic('妆容','/users/gejiali/Documents/Game/nikkic/PicByCategory/')
#formatDesc()
#import_xlsx('/users/gejiali/Documents/Game/nikkic/data/pattern_170410.xlsx','Pattern')
#import_ep('/users/gejiali/Documents/Game/nikkic/data/pattern_aojiao_170103.xlsx')
#checkWradrobe('/users/gejiali/Documents/Game/nikkic/data/wardrobe_fromaojiao1209.xlsx')
export('/users/gejiali/Documents/nikkiup2u3_clothes/public/data/Pattern.js','Pattern')
#updateDesc('/users/gejiali/Documents/Game/nikkic/pic/')
#updatePic('/users/gejiali/Documents/Game/nikkic/pic/add/')
#setNameLength()
#addIcon('/users/gejiali/Documents/Game/nikkic/icon/', '/users/gejiali/Documents/Game/nikkic/extra/')
