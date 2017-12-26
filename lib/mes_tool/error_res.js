function error404(res){
	res.writeHead(404,{"Content-Type":"text/plain"});
	res.write("404 not found!");
	res.end();
}

exports["error404"] = error404;