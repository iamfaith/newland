define( ["$ejs"], function(){
    function getFile(url, type){
        try{
            var temp = $.readFileSync( url,"utf8");
            return $.pagesCache[ url ] = {
                data: temp,
                type: type
            }
        }catch(e){ }
    }
    return function(flow){
        flow.bind("respond_to", function( format,params ){
            var url, res = flow.res
            if(typeof format == "string"){
                url = $.path.join($.core.base, "app/views", flow._cname, flow._aname + "."+ format);
            }else {
                url = $.path.join("app/public/",flow.pathname);
            }
           
            $.log("flow.mime "+ flow.mime, "white", 7)
            if( flow.mime == "*" ){//如果是页面
                var cache = $.pagesCache[ url ];
                var array = this.helper;
             //   var context = array[0];
                var context = {
                    links:[],
                    scripts:[],
                    sign: true
                }
                var helpers = array[1];
                var temp, html //用于保存erb或html
                if(!cache){//如果不存在,先尝试打模板
                    try{
                        temp = $.readFileSync(url.replace(/\.html$/,".erb"),"utf8");
                        temp = $.ejs.compile( temp, helpers );//转换成编译函数
                        cache = $.pagesCache[ url ] = {
                            data: temp,
                            type: "erb"
                        }
                    }catch(e){ }
                }
                if(!cache){//如果再不存在则找静态页面
                    cache = getFile( url, "html" );
                }
                if(!cache){//如果还是没有找到404
                    res.setHeader('Content-Type', "text/plain");
                    res.setHeader('Content-Length', Buffer.byteLength("404"));
                    res.end("404");
                    return
                }else if(typeof cache.data == "function"){
                   //   console.log(context)
                        console.log(context)
                    html = cache.data( context, helpers );//转换成页面
                    console.log("context.layout "+context.layout);
                    console.log(context)
                    if(typeof context.layout == "string"){//如果它还要依赖布局模板才能成为一个完整页面,则找布局模板去
                        context.partial = html;
                        var layout_url = $.path.join("app","views/layout", context.layout );
                        var fn = $.pagesCache[ layout_url ]
                        //    console.log(fn)
                        if( ! fn ){
                            try{
                                temp = $.readFileSync(layout_url,"utf8");
                                fn = $.ejs.compile( temp, helpers );//转换成编译函数
                                $.pagesCache[ layout_url ] = {
                                    data: fn,
                                    type: "erb"
                                }
                            }catch(e){ }//这里不存在应该抛错
                        }
                        html = fn( context, helpers );//这时已是完整页面了
                    }
                    //这时应该调用sendFile
                    cache = {
                        data: html,
                        type: "html"
                    }
                }
            }else{
                cache = $.pagesCache[ url ];
                if(!cache){
                    cache = getFile( url, flow.mime );
                }
                console.log("==================");
                console.log( cache.type );
            }
            var data = cache.data;//要返回给前端的数据
            if(data.type  === "json"){
                data = JSON.stringify(data);
            }
            console.log(cache.type)
            res.setHeader('Content-Type',  flow.contentType(cache.type));
            //不要使用str.length，会导致页面等内容传送不完整
            res.setHeader('Content-Length', Buffer.byteLength(data));
            res.end(data);
        //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，
        //而要用new Date().toGMTString()，因为前者可能出现中文乱码
        //chrome 一定要发送Content-Type 请求头,要不样式表没有效果

        })
    }
})
    //https://github.com/felixge/node-paperboy/blob/master/lib/paperboy.js