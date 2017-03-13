###require("aSingle")

单页面框架，多页面开发，引入aSingle即可，
#设置window.aSingle_disable = true，即可关闭单页面，使用多页面跳转。

#缺省属性是data-asingle=1
```<a href="/test/test.html" data-asingle=1>点击跳转</a>
<a href="/test/test.html" data-asingle=2>当前页面replace替换</a>
```
#需要引入ajax，或者直接用zepto
https://github.com/mountainlife/ajax

页面切换，保存了原来的样式文件，并未移除，否则在切入的时候会要样式错乱的闪烁感。

#window.aSingle_maxPage
设置单页面最大缓存数 默认是5