/**
 * 单页面框架，只需要requie("aSingle")即可
 * @version 2017/3/6
 * @author antit
 */
define('aSingle', function (require, exports, module) {
    "use strict";
    var _cacheThisModule_;
    var ajax = require("ajax");
    var _aSingle={};
    var debug = window.aSingle_debug||true;
    //exports.init = function(){
    //    return;
        if(window.aSingle&&window.aSingle.jump||window.aSingle_disable) return;
        window.aSingle = _aSingle;
        window.aSingle_maxPage =window.aSingle_maxPage||5;
    //}
    _aSingle.jump = function(url,action){
        if(!url) return;
        if(window.aSingle_disable){
            aLog("aSingle disable,direct jump");
            window.href = url;
            return false;
        }
        _aSingle.locUrl = new LocUrl(url);
        if(!_aSingle.locUrl.action) {
            aLog("location origin,direct jump");
            window.href = url;
            return false;
        }
        action&&(_aSingle.locUrl.action = action);
        httpGet(url,function(datas){
            _aSingle.handleContent = new handleContent(datas);
        });
        return true;
    }
    _aSingle.clearCache = function (key) {
        if(key) delete _aSingle.cache[key];
        else _aSingle.cache={};
    }();

    function LocUrl(url){
        this.curUrl = window.location.href;
        if(!url) return;
        this.getUrl(url);

        if(this.getOrgin(this.newUrl)==this.getOrgin(this.curUrl))
            this.action = 1;
        else this.action = 0;
    }
    LocUrl.prototype.getOrgin = function(url){
        return url?url.split("/", 3).join("/"):"";
    }
    LocUrl.prototype.getUrl= function(t){
        var r;
        r = document.createElement("a"), r.href = t.toString();
        this.newUrl = r.href;
    };
    function httpGet(url,cb){
        var t;
        t = _aSingle.cache[url];
        if(t){
            aLog("get cache "+url);
            cb(t.d);
            return;
        }
        var param={};
        param.url = url;
        param.dataType="html";
        aLog("start http "+url);
        param.success = function(datas){
            if(!datas) return;
            aLog("http success "+url);
            cb(datas);
        };
        param.error = function(ret){
            aLog("http error "+ret+""+url);
        };
        ajax.load(param);
    }
    function aLog(){
        if(debug) console.log.apply(console,arguments);
    }
    function handleContent(html){
        if(typeof html =="string"){
            this.newHtml =new DomParse(html);
        }else{
            this.newHtml = html;
        }
        this.newHead = new HeadParse(this.newHtml.head);
        this.currentHtml =new DomParse(document.documentElement);
        this.curHead = new HeadParse(this.currentHtml.head);

        window.modulejs = null;

        this.cacheCur();
        this.render();
    }
    handleContent.prototype.render = function(){
        this.mergeHead();
        this.replaceBody();
        var self = this;
        requestAnimationFrame(function(){
            try{
                document.body = self.newHtml.body;
            }catch(e){console.log(e)}
            self.removeCurHead("stylesheet");// if don't remove css,change more ,css more
            //self.removeCurHead();
            if(_aSingle.y) window.scroll(0,_aSingle.y);
        });
    }
    function requestAnimationFrame(fn) {
        var raf = window.requestAnimationFrame|| window.webkitRequestAnimationFrame;
        if(raf){
            raf(fn);
        }else{
            setTimeout(fn, 0)
        }
    }
    handleContent.prototype.cacheCur = function(){
        var u=_aSingle.locUrl.curUrl;
        if(_aSingle.cache[u]) return;
        aLog("cached "+u);
        _aSingle.cache[_aSingle.locUrl.curUrl] = {d:{head:this.currentHtml.head.cloneNode(1),body:this.currentHtml.body.cloneNode(1)},t:Date.now()};
        requestAnimationFrame(function(){
            if(Object.keys(_aSingle.cache).length<window.aSingle_maxPage) return;
            var key,i,m=Date.now(),mi;
            for(key in _aSingle.cache){
                i = _aSingle.cache[key];
                if(i.t<m) m = i.t,mi=key;
            }
            mi&&delete _aSingle.cache[mi];
        });
    }
    handleContent.prototype.replaceBody = function(){
        aLog("replaceBody start");
        var s = this.newHtml.body.querySelectorAll("script"),o,t;
        for (var i = [], e = 0, r = s.length; r > e; e++){
            o = s[e], t =this.createScriptElement(o), o.parentNode.replaceChild(t, o);
        }

        aLog("replaceBody end");
    }
    handleContent.prototype.mergeHead = function(){
        aLog("mergeHead start");
        var headContents = this.newHead.getNewTypeContent(this.curHead.elements);
        this.copyNewOther(headContents.o),
        this.copyNewHeadScript(headContents.s);
        aLog("mergeHead end");
    }
    handleContent.prototype.copyNewOther = function(others){
        var t;
        for (var i = 0, l = others.length; i < l; i++){
            t = others[i].cloneNode(1);
            document.head.appendChild(t);
        }
    }
    handleContent.prototype.copyNewHeadScript = function(scripts){
        var t,st;
        for (var i = 0, l = scripts.length; i < l; i++){
            t = scripts[i],st = this.createScriptElement(t),document.head.appendChild(st);
        }
    }
    handleContent.prototype.removeCurHead = function(t){
        var e = this.curHead.elements,el;
        for(var key in e){
            key&&(el = this.curHead.elements[key])&&(!t||el.type!=t)&&document.head.removeChild(el.elements[0]);
        }
    }
    handleContent.prototype.createScriptElement = function(t){
        var e;
        e = document.createElement("script"), e.textContent = t.textContent;
        for (var i = t.attributes, r = 0,s, l = i.length; l> r; r++){
            s = i[r], e.setAttribute(s.name, s.value);
        }
        return e;
    }
    function bindEvent(){
        removeEventListener("click", this.handleEvent,0);
        addEventListener("click", this.handleEvent,0);
        removeEventListener("popstate", this.onPopState, 0);
        addEventListener("popstate", this.onPopState, 0);
    }
    bindEvent.prototype.onPopState = function(){
        _aSingle.jump(window.location.href);
    }
    bindEvent.prototype.handleEvent = function(e){
        var asingle,alink = e.target.closest("a[href]:not([target])");
        if(!alink) return;
        this.url = getAttr(alink,"href");
        if(!/^(http(s)?:)?\/\//.test(this.url)) return;
        this.action = (asingle = getAttr(alink,"data-asingle")) ? asingle : 1;
        _aSingle.y = window.pageYOffset;
        if(_aSingle.jump(this.url,this.action)){
            if(_aSingle.locUrl.action==1){//前进
                history.pushState('','',_aSingle.locUrl.newUrl);
            }else{
                history.replaceState('','',_aSingle.locUrl.newUrl);
            }
            e.preventDefault();
            return true;
        }
    }
    function getAttr(d,k){
        return d?d.getAttribute(k):"";
    }
    function HeadParse(head){
        var c,item,temp,temps,r;
        this.element = head;
        var c = this.element.childNodes;
        this.elements = {};
        for (var i = 0, l = c.length; i<l; i++){
            item = c[i];
            temp = item.outerHTML;
            temps = this.elements;
            item.nodeType === Node.ELEMENT_NODE && ( r = temps[temp] ? temps[temp] : temps[temp] = {
                type: this.getType(item),
                elements: []
            }, r.elements.push(item));
        }
    }
    HeadParse.prototype.getType = function(t){
        var tn = t.tagName.toLowerCase();
        if("style" === tn || "link" === tn&&"stylesheet" === getAttr(t,"rel")){
            return "stylesheet";
        }else if(tn=="script") return tn;
        return void 0;
    }
    HeadParse.prototype.getNewTypeContent = function(e){
        var elTemps, ele, elItem, contents={"s":[],"o":[],"c":[]};
        ele = this.elements;
        for (var n in ele){
            elItem = ele[n];
            elTemps = elItem.elements;
            !this.hasElment(n,e)&&(elItem.type=="script"?contents.s.push(elTemps[0]):contents.o.push(elTemps[0]));
        }
        return contents
    }
    HeadParse.prototype.hasElment = function(key,e){
        if(key in e){
            delete e[key];
            return true;
        }
        return false;
    }
    function DomParse(html){
        var dom;
        typeof html =="string"?(dom = document.createElement("html"),dom.innerHTML = html):dom=html;
        return this.fromHtml(dom);
    }
    DomParse.prototype.fromHtml = function(dom){
        return {
            head: dom.querySelector("head"),
            body: dom.querySelector("body")
        }
    }
    new bindEvent();
});
