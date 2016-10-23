var storeName;
chrome.runtime.onMessage.addListener(function(message,tab){
          storeName = message;
      });
console.log("message--->"+$("#div_corner_ad_container"));
console.log("storename--->"+storeName);
var productList = $("#tbl_mu_active_tbl_id_b_0").find("tr");
function sendData(message,i){
      $.ajax({
                        url:"https://www.baidu.com/?",
                        type:"POST",
                        data:"",
                        success: function(data){
                          console.log("数据发送"+data);
                        },
                        error: function(message){
                          alert("目标客户端测试异常！"+message);
                        }
                      });
 }	

 setTimeout(function(){
      var alldata=sendData(storeName,0);
 },3000);		
//判断id是纯数字
function checkNumber(theObj) {  
    var reg = /^[0-9]+.?[0-9]*$/;  
    if (reg.test(theObj)) {  
        return true;  
    }  
    return false;  
}  