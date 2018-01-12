
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
var serverUrl = IPURL +"/userservice/oss/postObjectPolicy"
keys = ''

$("#BtnFirst").bind("click", function () {
  alert("Hello World");
 }).bind("mouseout", function () {
  $("#TestDiv").show("slow");
 });
 
 
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
//	if (filename != '') {
//      suffix = get_suffix(filename)
//      calculate_object_name(filename)
//  }
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
var uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,html4',
	browse_button : 'headimg', 
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
			$('#upda').click(function(){
				
            	return false;
			})
		},
		//上传文件名+进度展示标签
		FilesAdded: function(up, files) {
			set_upload_param(uploader, '', false,serverUrl);
			
		},
		//第一步,初始化,选择完上传文件或图片触发
		BeforeUpload: function(up, file) {
            set_upload_param(up, file.name, true,serverUrl);
        },

		//上传成功后的名字
		FileUploaded: function(up, file, info){
            if (info.status == 200)
            {
            	set_upload_param(uploader, '', false,serverUrl);
            	console.log(file.name)
            	var urls = "https://hdxy-test.oss-cn-beijing.aliyuncs.com/img/" + file.name ;
            	$("#headimg").attr("src",urls)
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








