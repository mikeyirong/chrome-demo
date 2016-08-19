

$(function (){ 
    $("#firstname").focus(function(){
      $("#prompt").css("display","none");
    });
    $("#lastname").focus(function(){
      $("#prompt").css("display","none");
    });
    console.log("======> "+localStorage.username);
    if(localStorage.username&&localStorage.password){
       $("#login").css("display","none");
       login(localStorage.username,localStorage.password);
     }
    else{
        console.log("====当前已经退出=======");                         
               //  console.log("jin");
               // setTimeout(function(){
               //  console.log("jinset");
               //  chrome.tabs.create({url:'https://www.baidu.com/'},function(tab){});
               // },8000);  
        test();

      }
      
      //退出事件
      $("#button_quit").click(function(){
       quitout();
      });
   }); 

 function test(){
    var handler = function() {
        $("#submit1").attr("disabled","disabled").text("Loading...");
        var t = setTimeout(function(){
          var username=$("#firstname").val();
          var password=$("#lastname").val();
          login(username,password);
          clearTimeout(t);
        },1000);
    };
    $("#submit1").on('click',handler);
 }

 function login(username,password){
             $("#innerFrame").html("").hide();
             var url='http://112.74.213.168:9527/login';
             console.log("用户名："+username+",密码:"+password);
             $.ajax({
                  type:'post',
                  url: url,
                  datatype:'json',
                  data : {"username":username,"password":password},
                  error:function(mes){
                      console.log("ERROR -> "+JSON.stringify(mes));
                      $("#submit1").removeAttr("disabled").text("Sign in");
                      $("#prompt").css("display","block");
                      $("#center").text("服务器异常");
                      setTimeout(function(){$("#center").text("");},2000);
                  },
                  //连接成功
                  success:function(data){
                    
                  //判断用户验证是否成功
                      if(data.code==0){
                      localStorage.username=username;
                      localStorage.password=password;
                      console.log(data);
                      records = data.data;
                     
                      $("#login").css("display","none");
                      $("#store").css("display","block");
                      /**
                       * 创建table表
                       */
                      var table = $(document.createElement("table")).attr("id","line_table");
                      $(table).attr("class", "table");
                      $(table).attr("id", "mytable");
                      var thead=$(document.createElement("thead"));
                      var th = $(document.createElement("tr"));
                      thead.append(th);
                      th.append($(document.createElement("th")).text("平台"));
                      th.append($(document.createElement("th")).text("店铺名称"));
                      th.append($(document.createElement("th")).text("线路名称"));
                      th.append($(document.createElement("th")).text("负载"));
                      th.append($(document.createElement("th")).text("操作"));
                      table.append(thead);
                      //var table = '<table><tr><th>平台</th><th>店铺名称</th><th>繁忙状态</th><th>操作</th></tr></table>';
                      // var  store='<tr><th>亚马逊</th><th>繁忙</th><th><button onclick=\'alert(11);\'>切换</button></th></tr></table>';
                      //      table+=store;
                      for(var i=0; i<records.length; i++) {
                        var tr = $(document.createElement("tr"));
                        //$(tr).attr("class", "info");
                        var td_account = $(document.createElement("td")).text(records[i].shop_name);
                        var td_platform = $(document.createElement("td")).text(records[i].platform_remark);
                        var td_linename =$(document.createElement("td")).text(records[i].line_name);
                        var td_status = $(document.createElement("td"));
                        var td_opts = $(document.createElement("td"));

                        //create performance progress
                        var proDiv = $(document.createElement("div")).attr("class","progress");
                        var proBarDiv = $(document.createElement("div")).attr("class","progress-bar progress-bar-success");
                        proBarDiv.attr("role","progressbar").attr("aria-valuenow",records[i].connections);
                        proBarDiv.attr("aria-valuemin","0").attr("aria-valuemax",records[i].total);
                       

                        var performance = (records[i].connections / records[i].total) * 100;
                        
                        if(performance == 0) {
                          proBarDiv.attr("class","progress-bar progress-bar-success");
                          proBarDiv.attr("style","width:100%;");
                        }
                        else {
                          proBarDiv.attr("style","width: "+performance+"%;");
                        }

                        if(performance > 0 && performance <= 50) {
                          proBarDiv.attr("class","progress-bar progress-bar-warning");
                        }
                        if(performance > 50) {
                          proBarDiv.attr("class","progress-bar progress-bar-danger");
                        }
                        desc = $(document.createTextNode(performance + "%"));
                        if(performance == 0) {
                          desc = $(document.createTextNode("空闲"));
                        }
                        proBarDiv.append(desc);
                        proDiv.append(proBarDiv);

                        td_status.append(proDiv);


                        //创建切换按钮并绑定相应的事件
                        var button = $(document.createElement("button")).text("切换").on("click",records[i],function(evt){
                        //切换线路的时候验证改线路是否被同一平台的店铺已占用
                        var remberbutton=$(this);
                        var context=evt.data;
                       console.log(context);

                        //先切换，如果切换成功了才能调用后面的代码
                        //如何判断切换是否成功呢?
                        //访问IP138接口查看对外IP,如果等于代理IP则说明切换成功
                    
                        //第一步：先向服务端申请线路切换权限112.74.213.168
                        var url1="http://112.74.213.168:9527/changeLine";
                        $.ajax({
                               type:'post',
                               url: url1,
                               datatype:'json',
                               data :{"shop_id":context.shop_id,"line_id":context.line_id},
                               error:function(mes){ 
                                    console.log(mes);
                                    create("切换时服务器异常");
                               },success: function(mes) {
                                  if(mes.data){
                                     /* 
                                      * 此刻：本浏览器锁住了2个代理IP，一个是当前正在使用的，另外一个是刚刚申请得到的
                                      */
                                      var lines = context.line_address.split(":");
                                      var proxyHost = lines[0];
                                      var proxyPort=  parseInt(lines[1]);
                                     /*
                                      * 触发浏览器立即切换
                                      */
                                      var config={
                                        mode:"fixed_servers",// 
                                        rules:{
                                            singleProxy: {    //singleProxy  proxyForHttp
                                            scheme:"http", //http, https, quic, socks4, socks5
                                            host: proxyHost,
                                            port: proxyPort
                                            }
                                        }
                                      };


                                    chrome.proxy.settings.set( {value:config},function() {
                                    });

                                    /*
                                     * 向IP138申请验证
                                     */
                                    $.ajax({
                                      url : 'http://ip.chinaz.com/getip.aspx',
                                      success : function(ip) {
                                        var ipInfo = new Function("return "+ip).apply(this,[]);
                                        if(ipInfo.ip != proxyHost) {
                                           //rollback
                                          console.log("验证失败，立即回滚!");
                                          $.ajax({
                                              url : "http://112.74.213.168:9527/unDoLine",
                                              type: "POST",
                                              datatype:'json',
                                              data :{"shop_id":context.shop_id,"line_id":context.line_id},
                                              error:function(mes){
                                                  //回滚失败,请重新登陆
                                                  quitout();
                                                  //LOGOUT
                                              },success : function(R) {
                                                 //切换线路失败，请重新登陆!
                                                  //LOGOUT
                                                  quitout();
                                              }
                                          });
                                          return;
                                        }

                                        /* 验证通过 */
                                        //commit:释放上一次使用过的代理信息
                                       
                                        console.log("验证通过!");
                                        var url2="http://112.74.213.168:9527/unDoLine";
                                        $.ajax({
                                                   type:'post',
                                                   url: url2,
                                                   datatype:'json',
                                                   data : {"shop_id":localStorage.button_id,"line_id":localStorage.line_id},
                                                   error:function(mes){
                                                           create("当前线路释放失败时服务器异常");
                                                   },success:function(mes) {
                                                      ///////////////////////////
                                                      $(":button").attr("class","btn btn-info btn-xs").text("切换");
                                                      $("#button_quit").attr("class","btn btn-block btn-small btn-danger").text("退出登录");
                                                      remberbutton.text("正在使用中");
                                                      localStorage.button_id=context.shop_id;
                                                      localStorage.line_id =context.line_id;
                                                      remberbutton.text("正在使用中");
                                                      remberbutton.attr("class","btn btn-xs btn-danger disabled");
                                                      ///////////////////////////

                                                      //刷新表格

                                                      $("#innerFrame").html("<p>当前线路对外IP</p>:"+ipInfo.ip+",<p>地址:</p>:"+ipInfo.address).show();
                                                      $("#mytable").remove();
                                                      login(localStorage.username,localStorage.password);
                                                      //关闭当前浏览器所有与该店铺有关的标签页
                                                      
                                                      //跳转并模拟登录店铺
                                                      chrome.tabs.query({url:'https://china-merchant.wish.com/*'},function(tabs){  
                                                                       console.log("query");              
                                                                       for(var tab in tabs){
                                                                          var tabid=tabs[tab].id;
                                                                          //先执行登出操作再删除这些Tab
                                                                          chrome.tabs.update(tabid,{url:'https://china-merchant.wish.com/logout'},function(tab2){
                                                                              
                                                                           });
                                                                        }

                                                                        chrome.tabs.create({url:'https://china-merchant.wish.com/login',active:false},function(tab3){
                                                                            var json = {name:context.shop_user, password:context.shop_password};
                                                                            //alert("名字"+json.name);
                                                                            sc = '$(document).ready(function() {' 
                                                                            sc += '$("#username-box").val("'+json.name+'");';
                                                                            sc += '$("#password-box").val("'+json.password+'");';
                                                                            sc += '$("button[class=\'btn btn-large btn-primary btn-block btn-login\']").trigger("click");';
                                                                            sc += '});';
                                                                             
                                                                            //alert("code is :"+sc);

                                                                            
                                                                                /*
                                                                                 * 优先加载JQUERY库
                                                                                 */
                                                                                chrome.tabs.executeScript(tab3.id,{file:'jquery.min.js'},function(){
                                                                                    chrome.tabs.executeScript(tab3.id,{code:sc},function(){
                                                                                        //alert("callback");
                                                                                    });
                                                                                });
                                                                             
                                                                        });
                                                                       
                                                                        

                                                      });
                                                   }
                                        });




                                      },error:function(e) {
                                        alert("出现错误::"+JSON.stringify(e));
                                        console.log("What a fuck with :"+JSON.stringify(e));
                                      }
                                    });
                                  }
                                  else {
                                    create("此线路已被同平台的另一店铺所占用");
                                  }
                               }
                        });
                      });
                         
                        //给按钮设置class
                        var button=$(button).attr("class","btn btn-info btn-xs");
                        //给按钮设置Id
                        var button_id=records[i].shop_id;
                        $(button).attr('id',button_id);
                        td_opts.append(button);

                        tr.append(td_platform);
                        tr.append(td_account);
                        tr.append(td_linename);
                        tr.append(td_status);
                        tr.append(td_opts);
                        

                        table.append(tr);
                      }
                   

                    $("#storetable").append(table);
                    $("#"+localStorage.button_id).text("正在使用中");
                    $("#"+localStorage.button_id).attr("class","btn btn-xs btn-danger disabled");
                    }
                    else{
                      $("#submit1").removeAttr("disabled").text("Sign in");
                      $("#prompt").css("display","block");
                      $("#center").text("用户名或密码输入不正确,请重新输入!");   
                    }

                  }
             });
 }



//创建遮罩窗体
function create(detail){
  // <div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>无法获取登录邮箱! 请关闭浏览器,重新登录</div> 
    var div1=$(document.createElement("div")).attr("class","alert alert-danger alert-dismissable").text(detail);
    $("#promptdetail").append(div1);
    setTimeout(function(){
      div1.remove();
    },5000);
}

//退出登录方法并释放当前线路
function  quitout(){
       var config={
                    mode:"direct" 
                  };
      chrome.proxy.settings.set( {value:config},function(){
      //把当前线路释放掉
      var url3="http://112.74.213.168:9527/unDoLine";
      $.ajax({
               type:'post',
               url: url3,
               datatype:'json',
               data:{"shop_id":localStorage.button_id,"line_id":localStorage.line_id},
               error:function(mes){
                 create("内存中释放时,服务器异常!");
               },
               success:function(mes){

                   /**
                    * 退出wish店铺
                    */
                    chrome.tabs.query({url:'https://china-merchant.wish.com/*'},function(tabs){
                        for(var tab in tabs){
                            var tabid=tabs[tab].id;
                            //先执行登出操作再删除这些Tab
                            chrome.tabs.update(tabid,{url:'https://china-merchant.wish.com/logout'},function(tab2){
                               /* 退出登陆 */
                             });
                        }

                    });
                  

                   delete localStorage.username;
                   delete localStorage.password;
                   delete localStorage.button_id;
                   delete localStorage.line_id;
                   window.close();
               }
             });
     });

}

