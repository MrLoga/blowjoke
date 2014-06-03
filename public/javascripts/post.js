$(function(){
	var Post = {};

	Post.input = $("#post__create-input");
	Post.wrap = $(".post__create-submit-wrap");
	Post.submit = $("#post__create-submit");
	Post.parseBlock = $("#post__create-parse");
	Post.parseBlockImg = $("#post__create-parse_img");
	Post.prewTimeOut = setTimeout(Post.prewCreatePost,2000);

	Post.checkLinkImg = function(linkArr){
		var loadedimages = 0, newimages=[];
		var postaction=function(){}
		function imageloadpost(){
	        loadedimages++;
	        if (loadedimages==linkArr.length){
	        	postaction(newimages);
	        }
	    }
		for (var i=0; i<linkArr.length; i++){
	        newimages[i]=new Image();
	        newimages[i].src=linkArr[i];
	        newimages[i].linkid=i;
	        newimages[i].onload=function(_){
	        	$(".post__create-submit-img").append($("<img src='" + $(_.srcElement).prop("src") + "'/>").height(45));
	        	Post.parseBlockImg.append($("<img src='" +$(_.srcElement).prop("src")+ "'/>"));
	        	$(".post_link_parse_"+$(_.srcElement).prop("linkid")).remove();
	            imageloadpost();
	        }
	        newimages[i].onerror=function(_){
	        	$(".post_link_parse_"+$(_.srcElement).prop("linkid")).removeClass("post_link_parse_"+$(_.srcElement).prop("linkid"));
	        	imageloadpost();
	        }
	    }
	    return {
	        done:function(f){
	            postaction=f || postaction
	        }
	    }
	};

	Post.checkLinkYoutube = function(linkArr){
		for (var i=0; i<linkArr.length; i++){
			var url = linkArr[i];
			var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
			if(videoid!=null) {
				$(".post_link_parse_"+i).remove();
				$.getJSON('http://gdata.youtube.com/feeds/api/videos/'+videoid[1]+'?v=2&alt=jsonc',function(data,status,xhr){
				    console.log(data.data);
				    Post.parseBlockImg.html(data.data.title+'<br><br><iframe width="680" height="370" src="//www.youtube.com/embed/'+data.data.id+'" frameborder="0" allowfullscreen></iframe>');
				    $(".post__create-submit-img").append($("<span style='width: 300px;display: inline-block;margin: 5px;'>"+data.data.title+"</span>"));
				    $(".post__create-submit-img").append($("<img src='" + data.data.thumbnail.hqDefault + "' alt='"+data.data.title+"' />").height(45));
				});
			}else{
			   console.log("The youtube url is not valid.");
			}
		}
	};
	Post.checkLinkCoub = function(linkArr){
		for (var i=0; i<linkArr.length; i++){
			var url = linkArr[i];
			// http://coub.com/view/1ibde
			var coubid = url.match(/coub.com\/view\/([^\s&]+)/);
			if(coubid!=null) {
				$.getJSON('http://api.embed.ly/1/oembed?url=http://coub.com/view/'+coubid[1],function(data,status,xhr){
				    Post.parseBlockImg.html(data['html']);
				    $(".post__create-submit-img").append($("<span style='width: 300px;display: inline-block;margin: 5px;'>"+data['title']+"</span>"));
				    $(".post__create-submit-img").append($("<img src='" + data['thumbnail_url'] + "' height='45' />"));
				});
				//Post.parseBlockImg.html('<iframe src="http://coub.com/embed/'+coubid[1]+'?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false" allowfullscreen="true" frameborder="0" width="640" height="480"></iframe>');
			}else{
				console.log("coub fasle");
			}
		}
	};

	Post.parseTextToLink = function(text){
	    var urlRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
		return text.replace(urlRegex, function(url) {
			console.log(url);
	        return '<a href="' + url + '">' + url + '	</a>';
	    });
	};
	Post.parseLinkToImg = function(submit){
		var linkArr = [];
		Post.parseBlock.find("a").each(function(i){
			$(this).addClass("post_link_parse_"+i);
			var link = $(this).prop("href");
			linkArr.push(link);
		});
		if(linkArr.length < 1 && submit){
			var str = Post.parseBlock.html();
			str = str.replace(/\r\n|\r|\n/g,"<br />");
			Post.parseBlock.html(str);
			Post.send(Post.parseBlock.html() +"<br/>"+ Post.parseBlockImg.html());
			Post.parseBlock.html("");
			Post.parseBlockImg.html("");
			$(".post__create-submit-img").html("");
		}else{
			Post.checkLinkYoutube(linkArr);
			Post.checkLinkCoub(linkArr);
			Post.checkLinkImg(linkArr).done(function(x){
				if(submit){
					var str = Post.parseBlock.html();
					str = str.replace(/\r\n|\r|\n/g,"<br />");
					Post.parseBlock.html(str);
					Post.send(Post.parseBlock.html() +"<br/>"+ Post.parseBlockImg.html());
					Post.parseBlock.html("");
					Post.parseBlockImg.html("");
					$(".post__create-submit-img").html("");
				}
			});
		}
	};

	Post.input.blur(function(){
		if($(this).val().length<1){
			Post.wrap.css("visibility", "hidden");
		}
	});

	Post.submit.click(function(){
		Post.parseBlock.html("");
		Post.parseBlockImg.html("");
		$(".post__create-submit-img").html("");
		var postVal = Post.input.val();
		postVal = Post.parseTextToLink(postVal);
		Post.parseBlock.html(postVal);
		Post.parseLinkToImg(true);		
	});

	Post.input.focus(function(){
		clearTimeout(Post.prewTimeOut);
		Post.prewTimeOut = setTimeout(Post.prewCreatePost, 1000);
	});
	Post.input.keyup(function(){
		clearTimeout(Post.prewTimeOut);
		Post.prewTimeOut = setTimeout(Post.prewCreatePost, 1000);
	});
	Post.prewCreatePost = function(){
		Post.parseBlock.html("");
		Post.parseBlockImg.html("");
		$(".post__create-submit-img").html("");
		var postVal = Post.input.val();
		postVal = Post.parseTextToLink(postVal);
		Post.parseBlock.html(postVal);
		Post.parseLinkToImg(false);
	};

	Post.input.focus(function(){
		Post.wrap.css("visibility", "visible");
	});

	$(".post__more").click(function(){
		Post.getMore($(this).data("page"));
	});

    Post.inputHeight = function(){
    	var heightInput = Post.input.outerHeight();
    	Post.wrap.height(heightInput+60);
    };

	Post.input.autoResize({
        onResize: function() {
            setTimeout(Post.inputHeight, 10);
        },
        animate: false,
        extraSpace: 10
    });


	Post.send = function(text){
		$.ajax({
		  url: "/sendpost",
		  method: "get",
		  data: {
		    post: text
		  },
		  success: function(data){
		    var newPost = $("<div/>").addClass("post__list-item post__list-item_new");
		    newPost.append("<p>"+data.post+"</p>");
		    $(".post__list").prepend(newPost);
		    Post.removeNewClass();
			Post.input.val("");
			Post.input.height(48);
			Post.inputHeight();
			Post.input.blur();
		  }
		});
	};
	Post.removeNewClass = function(){
		setTimeout('$(".post__list-item_new").removeClass("post__list-item_new");', 1000)
	};

	Post.getMore = function(page){
		$.ajax({
		  url: "/getmorepost",
		  method: "get",
		  data: {
		    page: page
		  },
		  success: function(data){
		  	$(".post__more").data("page", $(".post__more").data("page")+1);
		  	for(post in data){
			    var newPost = $("<div/>").addClass("post__list-item post__list-item_new");
			    var time = new Date(data[post].date).toUTCString();
			    newPost.append("<i>"+ time +"</i>");
			    newPost.append("<h3>"+data[post].post+"</h3>");
			    $(".post__list").append(newPost);
			    Post.removeNewClass();
		  	}
		  }
		});
	};
});