$(function(){
	var Post = {};

	$(".post__create-input").change(function(){
		var val = $(this).val();
		Post.send(val);
	});
	$(".post__more").click(function(){
		Post.getMore($(this).data("page"));
	});
	var formatTime = function(unixTimestamp) {
	    var dt = new Date(unixTimestamp * 1000);

	    var day = dt.getDate();
	    var month = dt.getMonth();

	    var hours = dt.getHours();
	    var minutes = dt.getMinutes();
	    var seconds = dt.getSeconds();

	    if (hours < 10) 
	     hours = '0' + hours;
	    if (minutes < 10) 
	     minutes = '0' + minutes;
	    if (seconds < 10) 
	     seconds = '0' + seconds;
	    return (day+"."+month+" "+hours+":"+minutes+":"+seconds);
	}       


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
			    // var time = formatTime(data[post].date);
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