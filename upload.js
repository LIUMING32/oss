
accessid = ''
host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
g_object_name = ''
g_object_name_type = ''
now = timestamp = Date.parse(new Date()) / 1000; 
result=-1
var serverUrl = IPURL + "/userservice/oss/postObjectPolicy"
keys = ''
//方式一
function getData(url,data){
	var result = -1;
	$.ajax({
		type:"post",
		url:url,
		async:false,
		data:data,
		success:function(res){
			result =  res;
		},
		error:function(){
			result =  -1;
		}
	});
	
	return result;
}
function set_upload_param(up, filename, ret,url){
	var msg = getData(url,'');
	console.log(msg);
	if (filename != '') {
        suffix = get_suffix(filename)
        calculate_object_name(filename)
    }
	key = 'img/${filename}';
	new_multipart_params = {
        'key' : key,
        'policy': msg.response.policy,
        'OSSAccessKeyId': msg.response.accessid, 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : msg.response.callback,
        'signature': msg.response.signature,
    };
    up.setOption({
        'url': msg.response.host,
        'multipart_params': new_multipart_params
    });
    up.start();
}

//方式二
function set_upload_param0(up, filename, ret,url,data){
	$.ajax({
		type:"post",
		url:url,
		async:true,
		data:data,
		success:function(data){
			var msg= data;
        	if (filename != '') {
		        suffix = get_suffix(filename)
		        calculate_object_name(filename)
		    }
        	key = 'img/' + keys;
        	new_multipart_params = {
		        'key' : key,
		        'policy': msg.response.policy,
		        'OSSAccessKeyId': msg.response.accessid, 
		        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
		        'callback' : msg.response.callback,
		        'signature': msg.response.signature,
		    };
		    up.setOption({
		        'url': msg.response.host,
		        'multipart_params': new_multipart_params
		    });
		    up.start();
		},
		error:function(){
			return -1;
		}
	});
}

function check_object_radio() {
	//单选按钮选择上传本地名，还是随机名
    var tt = document.getElementsByName('myradio');
    for (var i = 0; i < tt.length ; i++ )
    {
        if(tt[i].checked)
        {
            g_object_name_type = tt[i].value;
            break;
        }
    }
}

function get_signature()
{
	//ajax请求的数据，赋值
    //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
    now = timestamp = Date.parse(new Date()) / 1000; 
    if (expire < now + 3)
    {
        body = send_request()
        var obj = eval ("(" + body + ")");
        host = obj['host']
        policyBase64 = obj['policy']
        accessid = obj['accessid']
        signature = obj['signature']
        expire = parseInt(obj['expire'])
        callbackbody = obj['callback'] 
        key = obj['dir']
        return true;
    }
    return false;
};

function random_string(len) {
	//加密秘钥
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
	//去除.,返回文件名
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}

function calculate_object_name(filename)
{
	//是否用秘钥加密名字
    if (g_object_name_type == 'local_name')
    {
        g_object_name += "${filename}"
    }
    else if (g_object_name_type == 'random_name')
    {
        suffix = get_suffix(filename)
        g_object_name = key + random_string(10) + suffix
    }
    return ''
}

function get_uploaded_object_name(filename)
{
	//上传后的名字
    if (g_object_name_type == 'local_name')
    {
        tmp_name = g_object_name
        tmp_name = tmp_name.replace("${filename}", filename);
        return tmp_name
    }
    else if(g_object_name_type == 'random_name')
    {
        return g_object_name
    }
}



var uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,html4',
	browse_button : 'selectfiles', 
    //multi_selection: false,
	container: document.getElementById('container'),
	flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
	silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'http://oss.aliyuncs.com',
    filters: {
        mime_types : [ //只允许上传图片和zip,rar文件
        { title : "Image files", extensions : "jpg,gif,png,bmp" }, 
        { title : "Zip files", extensions : "zip,rar" }
        ],
        max_file_size : '10mb', //最大只能上传10mb的文件
        prevent_duplicates : true //不允许选取重复文件
    },

	init: {
		//第二步,点击上传后触发,
		PostInit: function() {
			$('#ossfile').html('');
			$('#postfiles').click(function(){
				set_upload_param(uploader, '', false,serverUrl);
            	return false;
			})
		},
		//上传文件名+进度展示标签
		FilesAdded: function(up, files) {
			plupload.each(files, function(file) {
				$('#ossfile').html('<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
				+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
				+'</div>');
			});
		},
		//第一步,初始化,选择完上传文件或图片触发
		BeforeUpload: function(up, file) {
            check_object_radio();
            set_upload_param(up, file.name, true,serverUrl);
        },
		//监控上传进度
		UploadProgress: function(up, file) {
			var d =  $('#' + file.id);
			d.children('b').eq(0).html('<span>' + file.percent + '%</span>');
			var prog = d.children('div').eq(0);
			var progBar = prog.children('div').eq(0);
			progBar.css({'width':2*file.percent+'px'});
			progBar.attr('aria-valuenow', file.percent);
		},
		//上传成功后的名字
		FileUploaded: function(up, file, info){
            if (info.status == 200)
            {
            	
            	var d =  $('#' + file.id);
            	var urls = "https://hdxy-test.oss-cn-beijing.aliyuncs.com/img/"+get_uploaded_object_name(file.name);
//          	alert(urls);
            	window.open(urls)
				d.children('b').eq(0).html('upload to oss success, object name:' + get_uploaded_object_name(file.name));
            }
            else
            {
            	var d =  $('#' + file.id);
				d.children('b').eq(0).html(info.response);
            } 
		},

		Error: function(up, err) {
            if (err.code == -600) {
            	var $div = "\n选择的文件太大了,可以根据应用情况，在upload.js 设置一下上传的最大大小";
            	$('#console').append($div);
            }
            else if (err.code == -601) {
            	var $div = "\n选择的文件后缀不对,可以根据应用情况，在upload.js进行设置可允许的上传文件类型";
            	$('#console').append($div);

            }
            else if (err.code == -602) {
            	var $div = "\n这个文件已经上传过一遍了";
            	$('#console').append($div);
            }
            else 
            {
            	var $div = "\nError xml:" + err.response;
            	$('#console').append($div);
            }
		}
	}
});

uploader.init();







	$("#headimg").click(function(){
    	addhead('headurladd');
	});
	function addhead(obj){
	     $("#"+obj).click();
	}
	
	function readFile(obj){
	    var file = obj.files[0]; 
	    //判断类型是不是图片  
	   /*  if(!/image\/\w+/.test(file.type)){     
	            alert("请确保文件为图像类型");   
	            return false;
	    }    */
	    var reader = new FileReader();
	    reader.readAsDataURL(file);
	
	//情况一：对读取到的图片编码
//	    reader.onload = function(e){
//	        var imgBase64Data =encodeURIComponent(e.target.result);   
//	        $("#headimg")[0].src=this.result;
//	         var res = (this.result);
//	         var pos = imgBase64Data.indexOf("4")+4;
//	         imgBase64Data = imgBase64Data.substring(pos);
//	         $('#logo').val(imgBase64Data);
//	    } 
	
	//情况二：对读取的图片没编码
	
	    reader.onload = function(e){
	        var imgBase64Data = e.target.result;
	        $("#headimg")[0].src=this.result;
	         var res = (this.result);
	         var pos = imgBase64Data.indexOf("4")+2;
	         imgBase64Data = imgBase64Data.substring(pos);	         
	         $('#logo').val(imgBase64Data);
	    } 
	}
