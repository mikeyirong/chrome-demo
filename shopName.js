alert("what a fuck!!");
getAccount();
function getAccount(){
   var submit = document.getElementById("switcher_plogin");
    if(submit!=null){
             alert("ok");
             submit.onclick =function(){
                    var account = document.getElementById("u");
                    var password = document.getElementById("p");
                    var message = {account:account};
                    chrome.runtime.sendMessage(message,function(){
                        console.log("发送消息------------");
                    });
                    alert("account is"+account);
             };
    }else{
        console.log(submit);
        setTimeout(function(){getAccount();},3000);
    }
}
function getElementByClassName(TagName,classname){
    var tags=document.getElementsByTagName(TagName);
    var list=[];
    for(var i in tags)
    {
        var tag=tags[i];
        if(tag.className==classname){list.push(tag);}
    }
    return list;
}
