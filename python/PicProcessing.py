#!/usr/bin/python
# -*- coding: UTF-8 -*-
from PIL import Image
import os
import os.path

from matplotlib import pyplot as plt

cut_box = (0, 110, 640, 736)
txt_box = (378, 205, 606, 258)
desc_box = (325, 215, 600, 435)
name_box = (360, 90, 565, 140)

# 720*1280
# cut_box = (0, 130, 720, 830)
# txt_box = (428, 240, 685, 290)
# desc_box = (400, 400, 705, 638)

#750*1334
# cut_box = (0, 135, 750, 865)
# txt_box = (446, 250, 714, 302)
# desc_box = (417, 415, 735, 650)

tmp_path = '/users/gejiali/Documents/Game/nikkic/tmp.PNG'
res_path = '/users/gejiali/Documents/Game/nikkic/res'


def pic_ocr(img, ocr_type):
    im_ocr = img.save(tmp_path)
    shell_line = 'tesseract ' + tmp_path + ' ' + res_path + ' -l ' + ocr_type
    os.system(shell_line)
    f = file(res_path + '.txt', 'r+')
    res = str(f.read()).strip()
    return res


def pic_cut(filepath, filename, savedir):
    im = Image.open(filepath)
    imb = im.crop(cut_box)
    im_name = im.crop(txt_box)

    im_name.save(tmp_path)
    shell_line = 'tesseract ' + tmp_path + ' ' + res_path + ' -l chi_sim'
    os.system(shell_line)
    f = file(res_path + '.txt', 'r+')
    res = str(f.read()).strip()
    savepath = savedir + res + '.PNG'
    try:
        imb.save(savepath)
    except:
        savepath = savedir + filename + '.PNG'
        imb.save(savepath)
        print filepath, 'failed'


def getName(filepath, filename, savedir):
    im = Image.open(filepath)
    size = (600, 600)
    imb = im.resize(size, Image.ANTIALIAS)
    #imb.show()
    im_name = imb.crop(name_box)
    im_name.save(tmp_path)
    shell_line = 'tesseract ' + tmp_path + ' ' + res_path + ' -l chi_sim'
    os.system(shell_line)
    f = file(res_path + '.txt', 'r+')
    res = str(f.read()).strip()
    savepath = savedir + res + '.PNG'
    try:
        imb.save(savepath)
    except:
        savepath = savedir + filename + '.PNG'
        imb.save(savepath)
        print filepath, 'failed'


def getDesc(filepath):
    im = Image.open(filepath)
    size = (600, 600)
    imb = im.resize(size, Image.ANTIALIAS)
    #imb.show()
    imc = imb.crop(desc_box)

    #imc.show()
    imc.save(tmp_path)
    shell_line = 'tesseract ' + tmp_path + ' ' + res_path + ' -l chi_sim'
    os.system(shell_line)
    f = file(res_path + '.txt', 'r+')
    res = str(f.read()).strip().replace('\n', '')

    #print res
    return resFormat(res)


def resFormat(data):
    return data.replace('_', '一').replace(',', '，').replace('】', '，').replace('`', '') \
        .replace('y', '，').replace('!', '！').replace(') ', '，').replace('′', '') \
        .replace('?', '？').replace('\'', '，').replace(' ', '')


def pic_loop(rootdir, savedir):
    for parent, dirnames, filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG') > 0 or filename.find('png')>0:
                pic_cut(os.path.join(parent, filename), filename, savedir)
                # os.system('cat /proc/cpuinfo')

                # print "the full name of the file is:" + os.path.join(parent,filename)

def cut_pic_loop(rootdir, savedir):
    for parent, dirnames, filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG') > 0 or filename.find('png') > 0:
                getName(os.path.join(parent, filename), filename, savedir)
                # os.system('cat /proc/cpuinfo')



# [13:40, 122:145]
(h, w) = (360, 480)
pic_Cnt = 5


def pic_combine(rootdir):
    # !/bin/env python2.4
    # -*- coding:utf-8 -*-
    # 图片拼接练习
    mw = pic_Cnt * w
    ms = pic_Cnt * h

    toImage = Image.new('L', (mw, ms))
    i = 0
    for parent, dirnames, filenames in os.walk(rootdir):
        for filename in filenames:
            if filename.find('PNG') > 0 and i < pic_Cnt*pic_Cnt:
                fromImage = Image.open(os.path.join(parent, filename))
                x = i % pic_Cnt
                y = i / pic_Cnt
                toImage.paste(fromImage, (x * w, y * h))

                i += 1
                # os.system('cat /proc/cpuinfo')

                # print "the full name of the file is:" + os.path.join(parent,filename

    toImage.save('/users/gejiali/Documents/Game/nikkic/avatar/error/lang.nikkic.number.tif')


#getName('/users/gejiali/Documents/Game/nikkic/pic/none/7ca5d21d58c0dc4e15ee.png')
#  ('/users/gejiali/Documents/Game/nikkic/pic/none/','/users/gejiali/Documents/Game/nikkic/pic/add/')
#pic_combine('/users/gejiali/Documents/Game/nikkic/avatar/error/no/')
# pic_cut('/users/gejiali/Documents/Game/nikkic/pic/none/IMG_1495.PNG')
#getDesc('/users/gejiali/Documents/Game/nikkic/pic/add/燕合佩·粉.PNG')
# resFormat('“姐姐y 你头发为什么是眷的昵? ”“因为姐姐有特异功能吖~训一定是姐姐太久没洗头')
#pic_loop('/users/gejiali/Documents/Game/nikkic/pic/none/','/users/gejiali/Documents/Game/nikkic/pic/add/')
