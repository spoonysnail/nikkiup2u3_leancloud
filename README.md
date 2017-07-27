# nikkiup2u3_leancloud
具体效果：http://spoonysnail.leanapp.cn

## 本地运行

安装 [Node.js]运行环境和 [LeanCloud 命令行工具]
然后执行下列指令：

```
$ git clone https://github.com/spoonysnail/nikkiup2u3_leancloud.git
$ cd nikkiup2u3_leancloud
```

安装依赖：

```
npm install
```

关联应用：

```
lean app add origin <appId>
```

这里的 appId 填上你在 LeanCloud 上创建的某一应用的 appId 即可。origin 则有点像 Git 里的 remote 名称。

启动项目：

```
lean up
```

应用即可启动运行：[localhost:3000](http://localhost:3000)

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

将预备环境的代码发布到生产环境：
```
lean publish
```
