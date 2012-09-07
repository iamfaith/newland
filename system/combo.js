define( [ "$hfs"], function(){
    var libs = "mass,lang_fix,lang,support,class,flow,query,data,node,attr,css_fix,css,event_fix,event,ajax,fx"
    var files = [];

    //注意：下面这些代码都是与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
    libs.replace($.rword, function( name ){
        var path = $.path.join( __dirname,"mass", name + ".js" );
        var text = $.readFileSync( path, "utf-8");
        files.push( text )
        var target = $.path.join( $.core.base , "app/public/scripts",name+ ".js");
        $.updateFileSync( target, text, true);
         
    });
    // ===============这里是合并脚本===============
    var merge = function(){
        var define = function(a){
            if(typeof a == "string" && a.indexOf($.core.base) == -1 ){
                arguments[0] = $.core.base + a +".js"
            }
            return $.define.apply($, arguments);
        }

        for( var c = 0, cn ; cn = all[c++];){
            if(cn !== "mass"){
                Module._update($.core.base + cn + ".js", 0, 0, 2);
            }
        }
    }
    var first = files.shift();
    var rbody = /[^{]*\{([\d\D]*)\}$/;
    var rcomments = /\/\*\*([\s\S]+?)\*\//g;
    var replaced = merge.toString()
    .replace(rbody, '$1')
    .replace(/^\s*|\s*$/g, '')

    replaced = replaced + files.join("\n")
    replaced = first.replace("/*combine modules*/", replaced+"\r\n" ).replace(rcomments,"");
    var merge_url = "app/public/scripts/mass_merge.js"
    var trunk = __dirname.indexOf("trunk") !== -1 ? "trunk/" : "";
    $.writeFile( merge_url, replaced,"utf8", function(e){//生成新的js文件！
        if(e) {
            $.log("合并出错 "+e ,"red", 3);
        }else{
            $.log("merge.js 合并成功","green", 7);
            $.updateFile(  "D:/2012/" + trunk+"mass_merge.js", replaced, function(){
                $.log("merge.js 更新成功","green", 7);
            },1);
        }
    });
//到这里为止的代码都与newland项目无关，它们是用于同步rubylouvre.github.com项目的JS文件
//http://www.elmerzhang.com/2011/09/nodejs-module-develop-publish/
//==================================================================
})

