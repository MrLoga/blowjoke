$(function(){
	var Post = {};

	Post.input = $("#post__create-input");
	Post.wrap = $(".post__create-submit-wrap");
	Post.submit = $("#post__create-submit");
	Post.parseBlock = $("#post__create-parse");
	Post.parseBlockImg = $("#post__create-parse_img");
	Post.prewTimeOut = setTimeout(Post.prewCreatePost,2000);

	Post.checkLink = function(linkArr){
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

	Post.parseText = function(text){
	    var urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.replace(urlRegex, function(url) {
	        return '<a href="' + url + '">' + url + '</a>';
	    });
	};
	Post.parseLinkToImg = function(submit){
		var linkArr = [];
		Post.parseBlock.find("a").each(function(i){
			$(this).addClass("post_link_parse_"+i);
			var link = $(this).prop("href");
			linkArr.push(link);
		});
		Post.checkLink(linkArr).done(function(x){
			if(submit){
				Post.send(Post.parseBlock.html() +"<br/><br/>"+ Post.parseBlockImg.html());
				Post.parseBlock.html("");
				Post.parseBlockImg.html("");
				$(".post__create-submit-img").html("");
			}
		});
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
		postVal = Post.parseText(postVal);
		Post.parseBlock.html(postVal);
		Post.parseLinkToImg(true);		
	});

	Post.input.focus(function(){
		console.log("focus");
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
		postVal = Post.parseText(postVal);
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
		    newPost.append("<i>"+data.date+"</i>");
		    newPost.append("<h3>"+data.post+"</h3>");
		    $(".post__list").prepend(newPost);
		    Post.removeNewClass();
			Post.input.val("");
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